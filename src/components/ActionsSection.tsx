'use client';

import { motion, useInView } from 'framer-motion';
import { FaPix, FaWifi, FaGoogle, FaCartArrowDown } from 'react-icons/fa6';
import { useRef, useState } from 'react';
import WifiModal from './WifiModal';
import PixModal from './PixModal';
import CartModal from './CartModal';
import { useCart } from '../contexts/CartContext';

export default function ActionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [isCardapioActive, setIsCardapioActive] = useState(false);
  const [isAtendimentoActive, setIsAtendimentoActive] = useState(false);
  const [isMeuPedidoActive, setIsMeuPedidoActive] = useState(false);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const { openModal, getTotalItems } = useCart();

  const handleCardapioClick = () => {
    setIsCardapioActive(true);
    setTimeout(() => {
      setIsCardapioActive(false);
      window.location.href = '/mesa01/cardapio';
    }, 150);
  };

  const handleAtendimentoClick = () => {
    setIsAtendimentoActive(true);
    setTimeout(() => {
      setIsAtendimentoActive(false);
      window.location.href = '/mesa01/atendimento';
    }, 150);
  };

  const handleMeuPedidoClick = () => {
    setIsMeuPedidoActive(true);
    setTimeout(() => {
      setIsMeuPedidoActive(false);
      openModal();
    }, 150);
  };

  const handleWifiClick = () => {
    setIsWifiModalOpen(true);
  };

  const handlePixClick = () => {
    setIsPixModalOpen(true);
  };

  const handleAvaliacaoClick = () => {
    const googleReviewUrl = 'https://www.google.com/search?sca_esv=ba28415142d5cdfa&hl=pt-BR&sxsrf=AE3TifMygTSL-yNrmiwk2I0zqqPJ6M2NoA:1752658671469&q=Gela+Boca+-+Matinhos&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E4HtyHAQV0ZlVbq3WGqwfogvnvHJL8XbkT-GGzDkcb0qDN2Vrm48kp51QDbsp7FgFkl-kwFnlMk1s83JWVrB5tz22psys27m1vdDk8jLCogCYK-88A%3D%3D&sa=X&ved=2ahUKEwjx65msisGOAxUpLLkGHTtrAocQrrQLegQIGhAA&biw=1920&bih=919&dpr=1';
    window.open(googleReviewUrl, '_blank');
  };

  return (
    <section ref={ref} className="w-full py-16 px-6 bg-[#e0007a]">
      <div className="max-w-6xl mx-auto">
        {/* Botões de ícones */}
        <div className="flex justify-center items-center gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.button
              onClick={handleWifiClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-transparent border-2 border-white text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaWifi size={28} />
            </motion.button>
            <span className="text-white font-medium text-sm">WiFi</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.button
              onClick={handlePixClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-transparent border-2 border-white text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaPix size={24} />
            </motion.button>
            <span className="text-white font-medium text-sm">PIX</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.button
              onClick={handleAvaliacaoClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-transparent border-2 border-white text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaGoogle size={24} />
            </motion.button>
            <span className="text-white font-medium text-sm">Avaliação</span>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          {/* Card do Cardápio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -5 }}
            className="w-full max-w-md"
          >
            <motion.button 
              onClick={handleCardapioClick}
              animate={isCardapioActive ? { 
                scale: 0.95, 
                y: 2,
                boxShadow: "inset 0 8px 16px rgba(0, 0, 0, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              } : { scale: 1, y: 0 }}
              className="w-full bg-white border-2 border-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden relative"
              style={{
                backgroundImage: 'url(/cardapio.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Gradiente rosa sobre a imagem - opacidade reduzida */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#e0007a]/40 to-[#c0006a]/50"></div>
              
              {/* Conteúdo do card */}
              <div className="relative z-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg 
                    className="w-10 h-10 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">
                  Cardápio
                </h3>
                
                <p className="text-white/90 text-sm">
                  Confira nossos deliciosos sabores
                </p>
              </div>
            </motion.button>
          </motion.div>

          {/* Card do Atendimento */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ y: -5 }}
            className="w-full max-w-md"
          >
            <motion.button 
              onClick={handleAtendimentoClick}
              animate={isAtendimentoActive ? { 
                scale: 0.95, 
                y: 2,
                boxShadow: "inset 0 8px 16px rgba(0, 0, 0, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              } : { scale: 1, y: 0 }}
              className="w-full bg-white border-2 border-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden relative"
              style={{
                backgroundImage: 'url(/atendimento.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Gradiente rosa sobre a imagem - opacidade reduzida */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#e0007a]/40 to-[#c0006a]/50"></div>
              
              {/* Conteúdo do card */}
              <div className="relative z-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg 
                    className="w-10 h-10 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                    />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">
                  Atendimento
                </h3>
                
                <p className="text-white/90 text-sm">
                  Fale conosco agora mesmo
                </p>
              </div>
            </motion.button>
          </motion.div>

          {/* Card do Meu Pedido */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ y: -5 }}
            className="w-full max-w-md"
          >
            <motion.button 
              onClick={handleMeuPedidoClick}
              animate={isMeuPedidoActive ? { 
                scale: 0.95, 
                y: 2,
                boxShadow: "inset 0 8px 16px rgba(0, 0, 0, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              } : { scale: 1, y: 0 }}
              className="w-full bg-white border-2 border-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden relative"
              style={{
                backgroundImage: 'url(/pedido.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Gradiente rosa sobre a imagem - opacidade reduzida */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#e0007a]/40 to-[#c0006a]/50"></div>
              
              {/* Bolinha com quantidade de produtos */}
              {getTotalItems() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 z-20 bg-white text-[#e0007a] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#e0007a] shadow-lg"
                >
                  {getTotalItems() > 9 ? '9+' : getTotalItems()}
                </motion.div>
              )}
              
              {/* Conteúdo do card */}
              <div className="relative z-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <FaCartArrowDown size={40} className="text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-2">
                  Meu Pedido
                </h3>
                
                <p className="text-white/90 text-sm">
                  Visualize seu carrinho
                </p>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* WiFi Modal */}
      <WifiModal 
        isOpen={isWifiModalOpen} 
        onClose={() => setIsWifiModalOpen(false)} 
      />

      {/* PIX Modal */}
      <PixModal 
        isOpen={isPixModalOpen} 
        onClose={() => setIsPixModalOpen(false)} 
      />

      {/* Cart Modal */}
      <CartModal />
    </section>
  );
} 