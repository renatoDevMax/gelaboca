'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoAdd, IoRemove, IoTrash, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import { useCart } from '../contexts/CartContext';
import { useEffect } from 'react';

export default function CartModal() {
  const { 
    state, 
    closeModal, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    finalizeOrder, 
    hideSuccessModal,
    requestCancellation,
    hideCancelModal,
    startNewOrder,
    isItemFinalized,
    isItemCancelled
  } = useCart();

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleCheckout = () => {
    if (state.isOrderCompleted) {
      startNewOrder();
    } else {
      finalizeOrder();
    }
  };

  const handleCancelProduct = (itemId: string) => {
    requestCancellation(itemId);
  };

  // Auto-hide do modal de sucesso após 5 segundos
  useEffect(() => {
    if (state.showSuccessModal) {
      const timer = setTimeout(() => {
        hideSuccessModal();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [state.showSuccessModal, hideSuccessModal]);

  return (
    <>
      <AnimatePresence>
        {state.isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.3 
              }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#e0007a] to-[#c0006a] p-6 text-white relative flex-shrink-0">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200"
                >
                  <IoClose className="text-lg" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Meu Pedido</h2>
                    <p className="text-white/80 text-sm">
                      {state.items.length} item{state.items.length !== 1 ? 's' : ''} no carrinho
                    </p>
                  </div>
                </div>
              </div>

              {/* Content with Scroll */}
              <div className="p-6 overflow-y-auto flex-1">
                {state.items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Carrinho vazio</h3>
                    <p className="text-gray-500">Adicione produtos do cardápio para começar seu pedido</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.items.map((item) => {
                      const isFinalized = isItemFinalized(item.id);
                      const isCancelled = isItemCancelled(item.id);
                      
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`bg-gray-50 rounded-xl p-4 border transition-all duration-300 ${
                            isCancelled 
                              ? 'border-red-500 shadow-inner shadow-red-200 bg-red-50' 
                              : isFinalized 
                                ? 'border-green-500 shadow-inner shadow-green-200 bg-green-50' 
                                : 'border-gray-200'
                          }`}
                        >
                          {/* Primeira linha: Imagem e informações do produto */}
                          <div className="flex items-center gap-4 mb-4">
                            {/* Imagem do produto */}
                            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.imagem}
                                alt={item.nome}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Informações do produto */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-lg">{item.nome}</h3>
                              <p className="text-lg font-bold text-[#e0007a] mt-2">
                                {formatarPreco(item.valor)}
                              </p>
                              {isFinalized && !isCancelled && (
                                <div className="flex items-center gap-2 mt-2">
                                  <IoCheckmarkCircle className="text-green-500 text-lg" />
                                  <span className="text-green-600 text-sm font-medium">Pedido Realizado</span>
                                </div>
                              )}
                              {isCancelled && (
                                <div className="flex items-center gap-2 mt-2">
                                  <IoWarning className="text-red-500 text-lg" />
                                  <span className="text-red-600 text-sm font-medium">Cancelamento Solicitado</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Segunda linha: Controles de quantidade e ações */}
                          <div className="flex items-center justify-between">
                            {isFinalized ? (
                              /* Botão único para produtos finalizados */
                              <button
                                onClick={() => handleCancelProduct(item.id)}
                                disabled={isCancelled}
                                className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm ${
                                  isCancelled 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                              >
                                {isCancelled ? 'Cancelamento Solicitado' : 'Cancelar Produto do Pedido'}
                              </button>
                            ) : (
                              <>
                                {/* Controles de quantidade */}
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-gray-700">Quantidade:</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                                      className="w-8 h-8 rounded-full bg-[#e0007a] text-white flex items-center justify-center hover:bg-[#c0006a] transition-colors duration-200"
                                    >
                                      <IoRemove className="w-4 h-4" />
                                    </button>
                                    
                                    <span className="w-8 text-center font-semibold text-gray-900 text-lg">
                                      {item.quantidade}
                                    </span>
                                    
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                                      className="w-8 h-8 rounded-full bg-[#e0007a] text-white flex items-center justify-center hover:bg-[#c0006a] transition-colors duration-200"
                                    >
                                      <IoAdd className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Botão remover */}
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors duration-200"
                                >
                                  <IoTrash className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* Subtotal do item */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Subtotal ({item.quantidade}x)
                              </span>
                              <span className="font-semibold text-gray-900 text-lg">
                                {formatarPreco(item.valor * item.quantidade)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer com total e ações */}
              {state.items.length > 0 && (
                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-[#e0007a]">
                      {formatarPreco(getTotalPrice())}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                    >
                      Limpar Carrinho
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="flex-1 bg-[#e0007a] hover:bg-[#c0006a] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {state.isOrderCompleted ? 'Realizar Novo Pedido' : 'Finalizar Pedido'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Sucesso */}
      <AnimatePresence>
        {state.showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.3 
              }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <IoCheckmarkCircle className="w-12 h-12 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Pedido Finalizado!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Seu pedido foi realizado com sucesso. Em breve você receberá sua deliciosa sobremesa!
              </p>
              
              <div className="w-16 h-8 bg-green-500 rounded-full mx-auto animate-pulse"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Cancelamento */}
      <AnimatePresence>
        {state.showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.3 
              }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <IoWarning className="w-12 h-12 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cancelamento Solicitado
              </h2>
              
              <p className="text-gray-600 mb-6">
                Seu pedido de cancelamento foi registrado e será avaliado pela nossa equipe, pois o produto já pode ter sido preparado.
              </p>
              
              <button
                onClick={hideCancelModal}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Entendi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 