'use client';

import { useState, useEffect } from 'react';
import CardapioCarousel from '../../../components/CardapioCarousel';
import StarField from '../../../components/StarField';
import CartModal from '../../../components/CartModal';
import { IoIceCreamSharp } from 'react-icons/io5';
import { IoReturnDownBack } from 'react-icons/io5';
import { RiRobot3Line } from 'react-icons/ri';
import { FaCartArrowDown } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../../contexts/CartContext';

export default function CardapioPage() {
  const { openModal, getTotalItems } = useCart();

  const handleMeuPedidoClick = () => {
    openModal();
  };

  const handleAtendimentoClick = () => {
    window.location.href = '/mesa01/atendimento';
  };

  const handleFloatingCartClick = () => {
    openModal();
  };

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

      {/* background */}
      <div className='fundoAnimado relative'>
        <StarField />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-16 px-6">
        {/* Botões de ação no topo */}
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={handleMeuPedidoClick}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30 hover:scale-105"
          >
            <IoIceCreamSharp className="text-xl" />
            Meu Pedido
            {getTotalItems() > 0 && (
              <span className="bg-[#e0007a] text-white text-xs font-bold px-2 py-1 rounded-full">
                {getTotalItems()}
              </span>
            )}
          </button>
          <button 
            onClick={handleAtendimentoClick}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30 hover:scale-105"
          >
            <RiRobot3Line className="text-xl" />
            Atendimento
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Cardápio
          </h1>
          <p className="text-white/90 text-xl max-w-2xl mx-auto">
            Explore nossos deliciosos sabores organizados por categoria
          </p>
        </div>
        
        <CardapioCarousel />
      </div>

      {/* Cart Modal */}
      <CartModal />
    </div>
  );
} 