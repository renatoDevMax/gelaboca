'use client';

import { useEffect, useState } from 'react';
import CategoriaCarousel from './CategoriaCarousel';

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

interface CategoriaProdutos {
  categoria: string;
  produtos: Produto[];
}

export default function CardapioCarousel() {
  const [categorias, setCategorias] = useState<CategoriaProdutos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch('/api/produtos-cardapio');
        if (response.ok) {
          const produtos: Produto[] = await response.json();
          
          console.log('Produtos recebidos:', produtos);
          
          // Agrupar produtos por categoria
          const produtosPorCategoria = produtos.reduce((acc, produto) => {
            const categoria = produto.categoria;
            if (!acc[categoria]) {
              acc[categoria] = [];
            }
            acc[categoria].push(produto);
            return acc;
          }, {} as Record<string, Produto[]>);

          console.log('Produtos agrupados:', produtosPorCategoria);

          // Converter para array de categorias
          const categoriasArray: CategoriaProdutos[] = Object.entries(produtosPorCategoria)
            .map(([categoria, produtos]) => ({
              categoria,
              produtos
            }))
            .sort((a, b) => a.categoria.localeCompare(b.categoria));

          console.log('Categorias finais:', categoriasArray);
          setCategorias(categoriasArray);
        } else {
          console.error('Erro ao buscar produtos do cardápio');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white/90 mt-4">Carregando cardápio...</p>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="text-center">
        <p className="text-white/90 text-lg">
          Nenhum produto disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categorias.map((categoriaData, index) => (
        <CategoriaCarousel
          key={categoriaData.categoria}
          categoria={categoriaData.categoria}
          produtos={categoriaData.produtos}
        />
      ))}
    </div>
  );
} 