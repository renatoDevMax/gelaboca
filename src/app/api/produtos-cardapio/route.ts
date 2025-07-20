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

    // Buscar todos os produtos ativados
    const queryResponse = await index.query({
      vector: new Array(3072).fill(0), // Vector dummy com dimensão correta
      topK: 1000, // Buscar muitos produtos
      includeMetadata: true
    });

    // Filtrar apenas produtos ativados
    const produtos: Produto[] = queryResponse.matches
      .filter(match => match.metadata)
      .filter(match => match.metadata?.ativado === true)
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
      });

    console.log(`Encontrados ${produtos.length} produtos ativados`);
    
    return NextResponse.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos do cardápio:', error);
    
    // Retornar dados de exemplo para desenvolvimento
    const produtosExemplo: Produto[] = [
      {
        id: '1',
        nome: 'Sorvete de Chocolate',
        imagem: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
        categoria: 'Sorvetes',
        codigo: 'CHOC001',
        valor: 8.90,
        descricao: 'Delicioso sorvete de chocolate belga',
        ingredientes: ['Chocolate belga', 'Leite integral', 'Creme de leite'],
        adicionais: ['Calda de chocolate', 'Raspas de chocolate'],
        ativado: true,
        promocional: false,
        textoEmbedding: null
      },
      {
        id: '2',
        nome: 'Sorvete de Morango',
        imagem: 'https://images.unsplash.com/photo-1579959947562-22c2a0b49a16?w=400&h=300&fit=crop',
        categoria: 'Sorvetes',
        codigo: 'MORANGO001',
        valor: 8.90,
        descricao: 'Sorvete cremoso de morango natural',
        ingredientes: ['Morangos frescos', 'Leite integral', 'Creme de leite'],
        adicionais: ['Calda de morango', 'Frutas vermelhas'],
        ativado: true,
        promocional: false,
        textoEmbedding: null
      },
      {
        id: '3',
        nome: 'Sundae de Chocolate',
        imagem: 'https://images.unsplash.com/photo-1579959947562-22c2a0b49a16?w=400&h=300&fit=crop',
        categoria: 'Sundaes',
        codigo: 'SUNDAE001',
        valor: 12.90,
        descricao: 'Sundae especial de chocolate com calda',
        ingredientes: ['Sorvete de chocolate', 'Calda de chocolate', 'Chantilly'],
        adicionais: ['Raspas de chocolate', 'Cerejas'],
        ativado: true,
        promocional: false,
        textoEmbedding: null
      },
      {
        id: '4',
        nome: 'Sundae de Morango',
        imagem: 'https://images.unsplash.com/photo-1579959947562-22c2a0b49a16?w=400&h=300&fit=crop',
        categoria: 'Sundaes',
        codigo: 'SUNDAE002',
        valor: 13.90,
        descricao: 'Sundae de morango com frutas frescas',
        ingredientes: ['Sorvete de morango', 'Morangos frescos', 'Chantilly'],
        adicionais: ['Calda de morango', 'Granola'],
        ativado: true,
        promocional: false,
        textoEmbedding: null
      },
      {
        id: '5',
        nome: 'Milkshake de Chocolate',
        imagem: 'https://images.unsplash.com/photo-1579959947562-22c2a0b49a16?w=400&h=300&fit=crop',
        categoria: 'Milkshakes',
        codigo: 'SHAKE001',
        valor: 10.90,
        descricao: 'Milkshake cremoso de chocolate',
        ingredientes: ['Sorvete de chocolate', 'Leite', 'Chocolate em pó'],
        adicionais: ['Chantilly', 'Raspas de chocolate'],
        ativado: true,
        promocional: false,
        textoEmbedding: null
      },
      {
        id: '6',
        nome: 'Milkshake de Morango',
        imagem: 'https://images.unsplash.com/photo-1579959947562-22c2a0b49a16?w=400&h=300&fit=crop',
        categoria: 'Milkshakes',
        codigo: 'SHAKE002',
        valor: 10.90,
        descricao: 'Milkshake refrescante de morango',
        ingredientes: ['Sorvete de morango', 'Leite', 'Morangos'],
        adicionais: ['Chantilly', 'Frutas vermelhas'],
        ativado: true,
        promocional: false,
        textoEmbedding: null
      }
    ];
    
    return NextResponse.json(produtosExemplo);
  }
} 