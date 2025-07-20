'use client';

import { motion, useInView } from 'framer-motion';
import { FaGooglePlay, FaWhatsapp } from 'react-icons/fa';
import { useRef } from 'react';

export default function DeliverySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const handleGooglePlayClick = () => {
    window.open('https://play.google.com/store/apps/details?id=marketplace.gelaboca.obrashow&hl=pt_BR', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5541985167773', '_blank');
  };

  return (
    <section ref={ref} className="w-full py-16 px-6 bg-gradient-to-br from-[#e0007a] to-[#c0006a]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Entregas Rápidas
          </h2>
          <p className="text-white/90 text-xl max-w-3xl mx-auto leading-relaxed">
            Peça pelo nosso app e receba seus sorvetes fresquinhos em até 30 minutos! 
            <br />
            Ou entre em contato pelo WhatsApp para pedidos especiais.
          </p>
        </motion.div>

        

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          {/* Botão Play Store */}
          <motion.button
            onClick={handleGooglePlayClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 bg-white text-[#e0007a] font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <FaGooglePlay size={24} />
            <div className="text-left">
              <div className="text-xs">Baixe nosso app</div>
              <div className="text-sm">Google Play</div>
            </div>
          </motion.button>

          {/* Botão WhatsApp */}
          <motion.button
            onClick={handleWhatsAppClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 bg-green-500 text-white font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <FaWhatsapp size={24} />
            <div className="text-left">
              <div className="text-xs">Fale conosco</div>
              <div className="text-sm">WhatsApp</div>
            </div>
          </motion.button>
        </motion.div>

        {/* Informações adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="grid md:grid-cols-3 gap-6 text-white/80">
            <div>
              <h4 className="font-semibold text-white mb-2">Horário de Funcionamento</h4>
              <p>Segunda a Domingo<br />10:30 às 22:30</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Taxa de Entrega</h4>
              <p>R$ 10,00<br />Grátis acima de R$ 80</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Formas de Pagamento</h4>
              <p>PIX, Cartão, Dinheiro<br />Pagamento na entrega</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 