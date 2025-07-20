import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { openai } from './openai-config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  categoria: string;
  ingredientes: string[];
  adicionais: string[];
  imagem: string;
  codigo: string;
  ativado: boolean;
  promocional: boolean;
  textoEmbedding: number[] | null;
}

// Configuração do Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index('gelaboca');

// Função para gerar embedding usando OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 3072 // Dimensão do Pinecone
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw error;
  }
}

// Função para calcular similaridade de cosseno
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
}

// Estágio 1: Ajustar e contextualizar a mensagem do usuário
async function adjustUserMessage(userMessage: string, conversationHistory: ChatMessage[]): Promise<string> {
  const systemPrompt = `Você é o GelinhIA, assistente virtual da sorveteria GelaBoca. 
  
Sua função é ajustar e contextualizar as mensagens dos usuários para torná-las mais completas e diretas, facilitando a busca por produtos.

Analise a mensagem do usuário e todo o contexto da conversa, e retorne uma versão ajustada que seja:
- Mais específica sobre o que o usuário quer
- Inclua informações relevantes do contexto da conversa
- Seja direta e clara sobre a intenção
- Mantenha a essência da solicitação original

Retorne APENAS a mensagem ajustada, sem explicações adicionais.`;

  const conversationContext = conversationHistory
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  const prompt = `${systemPrompt}

Histórico da conversa:
${conversationContext}

Mensagem atual do usuário: "${userMessage}"

Mensagem ajustada:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content?.trim() || userMessage;
  } catch (error) {
    console.error('Erro ao ajustar mensagem:', error);
    return userMessage; // Fallback para mensagem original
  }
}

// Estágio 2: Buscar produtos por similaridade no Pinecone
async function findSimilarProducts(adjustedMessage: string): Promise<Product[]> {
  try {
    // Gerar embedding da mensagem ajustada
    const messageEmbedding = await generateEmbedding(adjustedMessage);
    
    // Buscar produtos similares no Pinecone
    const queryResponse = await index.query({
      vector: messageEmbedding,
      topK: 8,
      includeMetadata: true,
      filter: {
        ativado: { $eq: true } // Apenas produtos ativados
      }
    });

    // Converter resultados para interface Product
    const products: Product[] = queryResponse.matches
      .filter(match => match.metadata)
      .map(match => {
        const textoEmbedding = match.metadata?.textoEmbedding;
        let embeddingArray: number[] | null = null;
        
        if (Array.isArray(textoEmbedding)) {
          embeddingArray = textoEmbedding.every(item => typeof item === 'number') 
            ? textoEmbedding as number[] 
            : null;
        }

        return {
          id: match.id,
          nome: match.metadata?.nome as string,
          descricao: match.metadata?.descricao as string,
          valor: Number(match.metadata?.valor),
          categoria: match.metadata?.categoria as string,
          ingredientes: match.metadata?.ingredientes as string[] || [],
          adicionais: match.metadata?.adicionais as string[] || [],
          imagem: match.metadata?.imagem as string,
          codigo: match.metadata?.codigo as string,
          ativado: Boolean(match.metadata?.ativado),
          promocional: Boolean(match.metadata?.promocional),
          textoEmbedding: embeddingArray
        };
      });

    console.log(`Encontrados ${products.length} produtos similares no Pinecone`);
    console.log('📋 Produtos encontrados:', products.map(p => p.nome).join(', '));
    return products;
  } catch (error) {
    console.error('Erro ao buscar produtos similares no Pinecone:', error);
    
    // Fallback: buscar todos os produtos ativados
    try {
      const fallbackResponse = await index.query({
        vector: new Array(3072).fill(0), // Vector dummy
        topK: 8,
        includeMetadata: true,
        filter: {
          ativado: { $eq: true }
        }
      });

      const fallbackProducts: Product[] = fallbackResponse.matches
        .filter(match => match.metadata)
        .map(match => ({
          id: match.id,
          nome: match.metadata?.nome as string,
          descricao: match.metadata?.descricao as string,
          valor: Number(match.metadata?.valor),
          categoria: match.metadata?.categoria as string,
          ingredientes: match.metadata?.ingredientes as string[] || [],
          adicionais: match.metadata?.adicionais as string[] || [],
          imagem: match.metadata?.imagem as string,
          codigo: match.metadata?.codigo as string,
          ativado: Boolean(match.metadata?.ativado),
          promocional: Boolean(match.metadata?.promocional),
          textoEmbedding: null
        }));

             console.log(`Fallback: Encontrados ${fallbackProducts.length} produtos ativados`);
       console.log('📋 Produtos fallback:', fallbackProducts.map(p => p.nome).join(', '));
       return fallbackProducts.slice(0, 8);
    } catch (fallbackError) {
      console.error('Erro no fallback de busca:', fallbackError);
      return []; // Retornar array vazio se tudo falhar
    }
  }
}

// Estágio 3: Selecionar o produto mais adequado
async function selectBestProduct(
  userMessage: string, 
  conversationHistory: ChatMessage[], 
  similarProducts: Product[]
): Promise<Product | null> {
  if (similarProducts.length === 0) {
    return null;
  }

  const systemPrompt = `Você é o GelinhIA, assistente virtual da sorveteria GelaBoca.

Analise a mensagem do usuário, o histórico da conversa e a lista de produtos similares fornecida.
Selecione o produto que MELHOR atende à solicitação do usuário.

REGRAS IMPORTANTES:
1. Se o usuário menciona qualquer produto, sabor, ou demonstra interesse em comprar/experimentar algo, SEMPRE selecione um produto da lista
2. Se o usuário pergunta "você tem", "quero", "gostaria de", "tem algum", etc., SEMPRE selecione um produto
3. Só retorne "NENHUM" se a solicitação for sobre horários, localização, pagamento, ou outros assuntos NÃO relacionados a produtos

EXEMPLOS:
- "quero um sorvete" → selecione um sorvete
- "tem chocolate?" → selecione produto com chocolate
- "qual horário vocês abrem?" → retorne "NENHUM"

Retorne APENAS o ID completo do produto escolhido ou "NENHUM".`;

  const conversationContext = conversationHistory
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  const productsList = similarProducts
    .map(p => `ID: ${p.id} - ${p.nome}: ${p.descricao} (R$ ${p.valor.toFixed(2)})`)
    .join('\n');

  const prompt = `${systemPrompt}

Histórico da conversa:
${conversationContext}

Mensagem atual: "${userMessage}"

Produtos similares disponíveis:
${productsList}

ID do produto escolhido:`;

  try {
    console.log('🎯 Prompt enviado para seleção:', prompt);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50, // Aumentado para não cortar o ID
      temperature: 0.1
    });

    const selectedId = response.choices[0]?.message?.content?.trim();
    console.log('🎯 Resposta do GPT para seleção:', selectedId);
    
    if (selectedId === 'NENHUM' || !selectedId) {
      console.log('🎯 Nenhum produto selecionado pelo GPT');
      return null;
    }

    // Buscar produto por ID exato primeiro
    let selectedProduct = similarProducts.find(p => p.id === selectedId);
    
    // Se não encontrou, tentar buscar por ID parcial (caso tenha sido cortado)
    if (!selectedProduct && selectedId && selectedId !== 'NENHUM') {
      selectedProduct = similarProducts.find(p => p.id.startsWith(selectedId));
      console.log('🎯 Tentando busca parcial com:', selectedId);
    }
    
    console.log('🎯 Produto encontrado por ID:', selectedProduct?.nome || 'Não encontrado');
    return selectedProduct || null;
  } catch (error) {
    console.error('Erro ao selecionar produto:', error);
    return similarProducts[0] || null; // Fallback para primeiro produto
  }
}

// Estágio 4: Gerar resposta baseada no produto selecionado
async function generateProductResponse(
  userMessage: string,
  conversationHistory: ChatMessage[],
  selectedProduct: Product
): Promise<string> {
  const systemPrompt = `Você é o GelinhIA, assistente virtual da sorveteria GelaBoca.

Você deve responder de forma BREVE, DIRETA e AMIGÁVEL sobre o produto selecionado.
Sua resposta deve:
- Ser concisa (máximo 2-3 frases)
- Incluir preço e destaque principal do produto
- Manter tom entusiasmado mas direto
- Usar 1-2 emojis no máximo

Exemplo de resposta ideal:
"Ah, o Gela Cone Crocante é uma delícia! 😋 Custa R$ 20,00 e combina sorvete cremoso com casquinha crocante. Posso te ajudar com mais alguma coisa?"

Seja direto e resolva a dúvida do usuário rapidamente.`;

  const conversationContext = conversationHistory
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  const productInfo = `
Produto: ${selectedProduct.nome}
Descrição: ${selectedProduct.descricao}
Preço: R$ ${selectedProduct.valor.toFixed(2)}
Categoria: ${selectedProduct.categoria}
Ingredientes: ${selectedProduct.ingredientes.join(', ')}
Adicionais disponíveis: ${selectedProduct.adicionais.join(', ')}
`;

  const prompt = `${systemPrompt}

Histórico da conversa:
${conversationContext}

Mensagem do usuário: "${userMessage}"

Informações do produto selecionado:
${productInfo}

Resposta do GelinhIA:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150, // Reduzido para respostas mais breves
      temperature: 0.7
    });

    return response.choices[0]?.message?.content?.trim() || 
           `Ah, o ${selectedProduct.nome} é uma delícia! 😋 Custa R$ ${selectedProduct.valor.toFixed(2)}. Posso te ajudar com mais alguma coisa?`;
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    return `Que legal! O ${selectedProduct.nome} é uma excelente opção! 😊 Custa R$ ${selectedProduct.valor.toFixed(2)}. Posso te ajudar com mais alguma coisa?`;
  }
}

// Função principal que orquestra todos os estágios
export async function processChatMessage(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<{ message: string; productInfo?: { name: string; slug: string } }> {
  try {
    console.log('🔄 Processando mensagem:', userMessage);

    // Estágio 1: Ajustar mensagem do usuário
    console.log('📝 Estágio 1: Ajustando mensagem...');
    const adjustedMessage = await adjustUserMessage(userMessage, conversationHistory);
    console.log('✅ Mensagem ajustada:', adjustedMessage);

    // Estágio 2: Buscar produtos similares no Pinecone
    console.log('🔍 Estágio 2: Buscando produtos similares no Pinecone...');
    const similarProducts = await findSimilarProducts(adjustedMessage);
    console.log('✅ Produtos encontrados:', similarProducts.length);

    // Estágio 3: Selecionar melhor produto
    console.log('🎯 Estágio 3: Selecionando melhor produto...');
    const selectedProduct = await selectBestProduct(userMessage, conversationHistory, similarProducts);
    console.log('✅ Produto selecionado:', selectedProduct?.nome || 'Nenhum');

    // Estágio 4: Gerar resposta
    console.log('💬 Estágio 4: Gerando resposta...');
    let response: string;

    if (selectedProduct) {
      response = await generateProductResponse(userMessage, conversationHistory, selectedProduct);
    } else {
      // Resposta genérica quando nenhum produto é selecionado
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é o GelinhIA, assistente virtual da sorveteria GelaBoca. 
            Responda de forma amigável e ajude o cliente com informações sobre a sorveteria, 
            horários, localização, ou qualquer outra dúvida. Seja sempre simpático e prestativo.`
          },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 200,
        temperature: 0.7
      }).then(res => res.choices[0]?.message?.content?.trim() || 
        'Olá! Sou o GelinhIA, seu assistente virtual da GelaBoca! 😊 Como posso te ajudar hoje?');
    }

    console.log('✅ Resposta gerada com sucesso!');
    
    // Se um produto foi selecionado, retornar informações dele
    if (selectedProduct) {
      return {
        message: response,
        productInfo: {
          name: selectedProduct.nome,
          slug: selectedProduct.nome // Usar o nome original para a URL
        }
      };
    }
    
    return { message: response };

  } catch (error) {
    console.error('❌ Erro no processamento da mensagem:', error);
    return { message: 'Desculpe, tive um probleminha técnico aqui! 😅 Pode tentar novamente? Estou aqui para te ajudar!' };
  }
} 