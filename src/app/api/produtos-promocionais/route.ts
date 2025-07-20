import { Pinecone } from '@pinecone-database/pinecone';
import { NextResponse } from 'next/server';

interface Produto {
  id: string;
  nome: string;
  imagem: string;
  categoria: string;
  codigo: string;
  valor: number;
  descricao: string;
  ingredientes: string[];
  adicionais: string[];
  ativado: boolean;
  promocional: boolean;
  textoEmbedding: number[] | null;
}

export async function GET() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const index = pinecone.index('gelaboca');

    // Buscar todos os produtos usando fetchAll
    const fetchResponse = await index.fetch(['dummy-id']); // Busca vazia para obter estrutura
    
    // Como alternativa, vamos usar uma query simples
    const queryResponse = await index.query({
      vector: new Array(3072).fill(0), // Vector dummy com dimensão correta
      topK: 1000, // Buscar mais produtos para ter chance de encontrar promocionais
      includeMetadata: true
    });

    // Filtrar apenas produtos promocionais e ativados
    const produtos: Produto[] = queryResponse.matches
      .filter(match => match.metadata)
      .filter(match => 
        match.metadata?.promocional === true && 
        match.metadata?.ativado === true
      )
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
          imagem: match.metadata?.imagem as string,
          categoria: match.metadata?.categoria as string,
          codigo: match.metadata?.codigo as string,
          valor: Number(match.metadata?.valor),
          descricao: match.metadata?.descricao as string,
          ingredientes: match.metadata?.ingredientes as string[] || [],
          adicionais: match.metadata?.adicionais as string[] || [],
          ativado: Boolean(match.metadata?.ativado),
          promocional: Boolean(match.metadata?.promocional),
          textoEmbedding: embeddingArray
        };
      })
      .slice(0, 10); // Limitar a 10 produtos para o carrossel

    console.log(`Encontrados ${produtos.length} produtos promocionais`);
    
    return NextResponse.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos promocionais:', error);
    
    // Retornar dados de exemplo para desenvolvimento
    const produtosExemplo: Produto[] = [
      {
        id: '1',
        nome: 'Sorvete de Chocolate Especial',
        imagem: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
        categoria: 'Sorvetes',
        codigo: 'CHOC001',
        valor: 12.90,
        descricao: 'Delicioso sorvete de chocolate belga com raspas de chocolate e calda especial',
        ingredientes: ['Chocolate belga', 'Leite integral', 'Creme de leite', 'Açúcar'],
        adicionais: ['Calda de chocolate', 'Raspas de chocolate', 'Chantilly'],
        ativado: true,
        promocional: true,
        textoEmbedding: null
      },
      {
        id: '2',
        nome: 'Sundae de Morango',
        imagem: 'https://images.unsplash.com/photo-1579959947562-22c2a0b49a16?w=400&h=300&fit=crop',
        categoria: 'Sundaes',
        codigo: 'MORANGO002',
        valor: 15.50,
        descricao: 'Sundae cremoso de morango com frutas frescas e calda de morango',
        ingredientes: ['Sorvete de morango', 'Morangos frescos', 'Calda de morango', 'Chantilly'],
        adicionais: ['Granola', 'Mel', 'Frutas vermelhas'],
        ativado: true,
        promocional: true,
        textoEmbedding: null
      }
    ];
    
    return NextResponse.json(produtosExemplo);
  }
} 