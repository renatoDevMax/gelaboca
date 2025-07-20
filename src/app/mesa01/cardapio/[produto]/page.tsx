'use client';

import { useEffect, useState, use } from 'react';
import { IoReturnDownBack, IoRemove, IoAdd } from 'react-icons/io5';
import { FaShoppingCart, FaRobot } from 'react-icons/fa';
import { FaCartArrowDown } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { useCart } from '../../../../contexts/CartContext';
import CartModal from '../../../../components/CartModal';

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

export default function ProdutoPage({ params }: { params: Promise<{ produto: string }> }) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, updateQuantity, openModal, getTotalItems, state, isItemFinalized, isItemCancelled } = useCart();
  
  // Desempacotar os params usando React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        // Decodificar o nome do produto da URL
        const nomeProduto = decodeURIComponent(resolvedParams.produto);
        
        // Buscar todos os produtos e encontrar o que corresponde
        const response = await fetch('/api/produtos-cardapio');
        if (response.ok) {
          const produtos: Produto[] = await response.json();
          const produtoEncontrado = produtos.find(p => p.nome === nomeProduto);
          
          if (produtoEncontrado) {
            setProduto(produtoEncontrado);
          } else {
            console.error('Produto não encontrado');
          }
        } else {
          console.error('Erro ao buscar produto');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [resolvedParams.produto]);

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleAddToCart = () => {
    if (produto) {
      addItem(produto);
    }
  };

  const handleIncreaseQuantity = () => {
    if (produto) {
      const currentItem = state.items.find(item => item.id === produto.id);
      if (currentItem) {
        updateQuantity(produto.id, currentItem.quantidade + 1);
      }
    }
  };

  const handleDecreaseQuantity = () => {
    if (produto) {
      const currentItem = state.items.find(item => item.id === produto.id);
      if (currentItem) {
        updateQuantity(produto.id, currentItem.quantidade - 1);
      }
    }
  };

  const getItemQuantity = () => {
    if (!produto) return 0;
    const item = state.items.find(item => item.id === produto.id);
    return item ? item.quantidade : 0;
  };

  const isItemInCart = () => {
    if (!produto) return false;
    return state.items.some(item => item.id === produto.id);
  };

  const handleFloatingCartClick = () => {
    openModal();
  };

  const handleAtendimentoClick = () => {
    if (produto) {
      const mensagem = `GelinhIA, me fale sobre o produto ${produto.nome}.`;
      const mensagemCodificada = encodeURIComponent(mensagem);
      window.location.href = `/mesa01/atendimento?mensagem=${mensagemCodificada}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e0007a] to-[#c0006a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/90 mt-4">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e0007a] to-[#c0006a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/90 text-lg">Produto não encontrado.</p>
        </div>
      </div>
    );
  }

  const isFinalized = isItemFinalized(produto.id);
  const isCancelled = isItemCancelled(produto.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0007a] to-[#c0006a] relative overflow-hidden">
      {/* Botão Voltar */}
      <button 
        onClick={() => window.history.back()}
        className="absolute top-3 left-6 z-20 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30 hover:scale-105 active:scale-95 active:bg-white/40"
      >
        <IoReturnDownBack className="text-lg" />
        Voltar
      </button>

      {/* Botão Flutuante do Carrinho - Sempre visível */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 300,
          duration: 0.3 
        }}
        onClick={handleFloatingCartClick}
        className="fixed top-4 right-4 z-30 w-14 h-14 bg-[#e0007a] hover:bg-[#c0006a] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-2 border-white/20 backdrop-blur-sm"
      >
        <div className="relative">
          <FaCartArrowDown size={24} />
          {getTotalItems() > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-white text-[#e0007a] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#e0007a]"
            >
              {getTotalItems() > 9 ? '9+' : getTotalItems()}
            </motion.span>
          )}
        </div>
      </motion.button>

      <div className="relative z-10 max-w-4xl mx-auto py-16 px-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Imagem do produto */}
          <div className="relative h-80 md:h-96 overflow-hidden">
            <img
              src={produto.imagem}
              alt={produto.nome}
              className="w-full h-full object-contain"
            />
            {produto.promocional && (
              <div className="absolute top-4 right-4 bg-[#e0007a] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                PROMOÇÃO
              </div>
            )}
            {isFinalized && !isCancelled && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                <span>✓</span>
                REALIZADO
              </div>
            )}
            {isCancelled && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                <span>⚠</span>
                CANCELADO
              </div>
            )}
          </div>

          {/* Informações do produto */}
          <div className="p-8">
            {/* Cabeçalho */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {produto.nome}
              </h1>
              <p className="text-gray-600 text-lg">
                {produto.categoria}
              </p>
              <div className="text-2xl font-bold text-[#e0007a] mt-2">
                {formatarPreco(produto.valor)}
              </div>
            </div>

            {/* Descrição */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Descrição</h2>
              <p className="text-gray-600 leading-relaxed">
                {produto.descricao}
              </p>
            </div>

            {/* Ingredientes */}
            {produto.ingredientes && produto.ingredientes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Ingredientes</h2>
                <div className="flex flex-wrap gap-2">
                  {produto.ingredientes.map((ingrediente, index) => (
                    <span
                      key={index}
                      className="bg-[#e0007a]/10 text-[#e0007a] px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {ingrediente}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionais */}
            {produto.adicionais && produto.adicionais.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Adicionais Disponíveis</h2>
                <div className="flex flex-wrap gap-2">
                  {produto.adicionais.map((adicional, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {adicional}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Botão de adicionar ao carrinho ou controle de quantidade */}
              {isItemInCart() ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex items-center justify-center gap-4 bg-white border-2 border-[#e0007a] rounded-xl py-4 px-6 shadow-lg"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecreaseQuantity}
                    disabled={isFinalized || isCancelled}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isFinalized || isCancelled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#e0007a] text-white hover:bg-[#c0006a]'
                    }`}
                  >
                    <IoRemove size={20} />
                  </motion.button>
                  
                  <span className="text-[#e0007a] font-bold text-lg min-w-[80px] text-center">
                    Quantidade: {getItemQuantity()}
                  </span>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleIncreaseQuantity}
                    disabled={isFinalized || isCancelled}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isFinalized || isCancelled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#e0007a] text-white hover:bg-[#c0006a]'
                    }`}
                  >
                    <IoAdd size={20} />
                  </motion.button>
                </motion.div>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  disabled={isFinalized || isCancelled}
                  className={`flex-1 flex items-center justify-center gap-3 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                    isFinalized || isCancelled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#e0007a] hover:bg-[#c0006a] text-white'
                  }`}
                >
                  <FaShoppingCart className="text-xl" />
                  {isCancelled ? 'Produto Cancelado' : isFinalized ? 'Produto Realizado' : 'Adicionar ao Carrinho'}
                </button>
              )}

              <button 
                onClick={handleAtendimentoClick}
                className="flex-1 flex items-center justify-center gap-3 bg-[#e0007a] hover:bg-[#c0006a] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <FaRobot className="text-xl" />
                Atendimento sobre o Produto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal />
    </div>
  );
} 