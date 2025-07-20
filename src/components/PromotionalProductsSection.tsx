'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

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

export default function PromotionalProductsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const { state, addItem, removeItem, isItemFinalized, isItemCancelled } = useCart();

  useEffect(() => {
    const fetchProdutosPromocionais = async () => {
      try {
        const response = await fetch('/api/produtos-promocionais');
        if (response.ok) {
          const data = await response.json();
          setProdutos(data);
        } else {
          console.error('Erro ao buscar produtos promocionais');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutosPromocionais();
  }, []);

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getItemQuantity = (produtoId: string) => {
    const item = state.items.find((item: any) => item.id === produtoId);
    return item ? item.quantidade : 0;
  };

  const handleQuantityChange = (produto: Produto, increment: boolean) => {
    if (increment) {
      addItem(produto);
    } else {
      removeItem(produto.id);
    }
  };

  if (loading) {
    return (
      <section ref={ref} className="w-full py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-[#e0007a] mb-4">
              Produtos em Promoção
            </h2>
            <div className="w-16 h-16 border-4 border-[#e0007a] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (produtos.length === 0) {
    return (
      <section ref={ref} className="w-full py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-[#e0007a] mb-4">
              Produtos em Promoção
            </h2>
            <p className="text-gray-600 text-lg">
              Nenhum produto promocional disponível no momento.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="w-full py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[#e0007a] mb-4">
            Produtos em Promoção
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Aproveite nossas ofertas especiais e saboreie o melhor da GelaBoca!
          </p>
        </motion.div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {produtos.map((produto, index) => (
              <motion.div
                key={produto.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex-[0_0_100%] min-w-0 pl-4"
              >
                <div className="max-w-md mx-auto">
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#e0007a]/20">
                    {/* Imagem do produto */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={produto.imagem}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-[#e0007a] text-white px-3 py-1 rounded-full text-sm font-bold">
                        PROMOÇÃO
                      </div>
                      <div className="absolute top-4 left-4 bg-white/90 text-[#e0007a] px-3 py-1 rounded-full text-sm font-semibold">
                        {produto.categoria}
                      </div>
                    </div>

                    {/* Conteúdo do card */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {produto.nome}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {produto.descricao}
                      </p>

                      {/* Preço */}
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-[#e0007a]">
                          {formatarPreco(produto.valor)}
                        </div>
                      </div>

                      {/* Botão de ação */}
                      <div className="text-center">
                        {getItemQuantity(produto.id) === 0 ? (
                          <button 
                            onClick={() => addItem(produto)}
                            disabled={isItemFinalized(produto.id) || isItemCancelled(produto.id)}
                            className={`font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg w-full ${
                              isItemFinalized(produto.id) || isItemCancelled(produto.id)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#e0007a] hover:bg-[#c0006a] text-white'
                            }`}
                          >
                            Pedir Agora
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleQuantityChange(produto, false)}
                              disabled={isItemFinalized(produto.id) || isItemCancelled(produto.id)}
                              className={`p-2 rounded-full transition-all duration-300 ${
                                isItemFinalized(produto.id) || isItemCancelled(produto.id)
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-[#e0007a] hover:bg-[#c0006a] text-white'
                              }`}
                            >
                              <FaMinus className="w-4 h-4" />
                            </button>
                            
                            <span className="text-xl font-bold text-[#e0007a] min-w-[2rem] text-center">
                              {getItemQuantity(produto.id)}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(produto, true)}
                              disabled={isItemFinalized(produto.id) || isItemCancelled(produto.id)}
                              className={`p-2 rounded-full transition-all duration-300 ${
                                isItemFinalized(produto.id) || isItemCancelled(produto.id)
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-[#e0007a] hover:bg-[#c0006a] text-white'
                              }`}
                            >
                              <FaPlus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Indicadores de navegação */}
        <div className="flex justify-center mt-8 gap-2">
          {produtos.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className="w-3 h-3 rounded-full bg-[#e0007a]/30 hover:bg-[#e0007a] transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  );
} 