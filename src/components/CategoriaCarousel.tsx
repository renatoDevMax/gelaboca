'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { IoChevronForward, IoRemove, IoAdd, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
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

interface CategoriaCarouselProps {
  categoria: string;
  produtos: Produto[];
}

export default function CategoriaCarousel({ categoria, produtos }: CategoriaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps'
  });

  const { addItem, updateQuantity, state, isItemFinalized, isItemCancelled } = useCart();

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleAddToCart = (produto: Produto) => {
    addItem(produto);
  };

  const handleIncreaseQuantity = (produtoId: string) => {
    const currentItem = state.items.find(item => item.id === produtoId);
    if (currentItem) {
      updateQuantity(produtoId, currentItem.quantidade + 1);
    }
  };

  const handleDecreaseQuantity = (produtoId: string) => {
    const currentItem = state.items.find(item => item.id === produtoId);
    if (currentItem) {
      updateQuantity(produtoId, currentItem.quantidade - 1);
    }
  };

  const getItemQuantity = (produtoId: string) => {
    const item = state.items.find(item => item.id === produtoId);
    return item ? item.quantidade : 0;
  };

  const isItemInCart = (produtoId: string) => {
    return state.items.some(item => item.id === produtoId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Título da categoria */}
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {categoria}
        </h2>
        <p className="text-white/80">
          {produtos.length} produto{produtos.length !== 1 ? 's' : ''} disponível{produtos.length !== 1 ? 'is' : ''}
        </p>
      </div>

      {/* Indicador de arraste */}
      <div className="flex justify-end mb-4 pr-4">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <span>Arraste para ver mais</span>
          <IoChevronForward className="text-lg animate-pulse" />
        </div>
      </div>

      {/* Carrossel de produtos */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {produtos.map((produto, index) => {
            const [isActive, setIsActive] = useState(false);
            const isFinalized = isItemFinalized(produto.id);
            const isCancelled = isItemCancelled(produto.id);

            const handleImageClick = () => {
              setIsActive(true);
              // Reset do estado após 150ms para o efeito visual
              setTimeout(() => {
                setIsActive(false);
                const nomeProduto = encodeURIComponent(produto.nome);
                window.location.href = `/mesa01/cardapio/${nomeProduto}`;
              }, 150);
            };

            return (
              <motion.div
                key={produto.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isActive ? { 
                  opacity: 1,
                  scale: 0.95, 
                  y: 2,
                  boxShadow: "inset 0 8px 16px rgba(0,0,0,0.4)"
                } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`flex-[0_0_280px] min-w-0 rounded-xl shadow-2xl overflow-hidden border-2 transition-all duration-300 ${
                  isCancelled 
                    ? 'bg-red-50 border-red-500 shadow-inner shadow-red-200' 
                    : isFinalized 
                      ? 'bg-green-50 border-green-500 shadow-inner shadow-green-200' 
                      : 'bg-[#f8a5c2] border-[#fce4ec] hover:shadow-3xl'
                } ${
                  isActive ? 'shadow-inner' : ''
                }`}
              >
                {/* Imagem do produto */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onClick={handleImageClick}
                  />
                  {produto.promocional && (
                    <div className="absolute top-3 right-3 bg-[#e0007a] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      PROMOÇÃO
                    </div>
                  )}
                  {isFinalized && !isCancelled && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <IoCheckmarkCircle size={12} />
                      REALIZADO
                    </div>
                  )}
                  {isCancelled && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <IoWarning size={12} />
                      CANCELADO
                    </div>
                  )}
                </div>

                {/* Conteúdo do card */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {produto.nome}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {produto.descricao}
                  </p>

                  {/* Preço */}
                  <div className="text-center mb-3">
                    <div className="text-xl font-bold text-[#e0007a]">
                      {formatarPreco(produto.valor)}
                    </div>
                  </div>

                  {/* Botão de ação ou Controle de quantidade */}
                  {isItemInCart(produto.id) ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center gap-3 bg-white border-2 border-[#e0007a] rounded-lg py-2 px-3 shadow-lg"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDecreaseQuantity(produto.id)}
                        disabled={isFinalized || isCancelled}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                          isFinalized || isCancelled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#e0007a] text-white hover:bg-[#c0006a]'
                        }`}
                      >
                        <IoRemove size={16} />
                      </motion.button>
                      
                      <span className="text-[#e0007a] font-bold text-sm min-w-[60px] text-center">
                        Quantidade: {getItemQuantity(produto.id)}
                      </span>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleIncreaseQuantity(produto.id)}
                        disabled={isFinalized || isCancelled}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                          isFinalized || isCancelled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#e0007a] text-white hover:bg-[#c0006a]'
                        }`}
                      >
                        <IoAdd size={16} />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart(produto)}
                      disabled={isFinalized || isCancelled}
                      className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm shadow-lg ${
                        isFinalized || isCancelled
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#e0007a] hover:bg-[#c0006a] text-white'
                      }`}
                    >
                      {isCancelled ? 'Produto Cancelado' : isFinalized ? 'Produto Realizado' : 'Adicionar ao Carrinho'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
} 