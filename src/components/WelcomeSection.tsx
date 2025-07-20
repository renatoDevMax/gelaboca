'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function WelcomeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const handleVerCardapioClick = () => {
    window.location.href = '/mesa01/cardapio';
  };

  return (
    <section 
      ref={ref}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Imagem de fundo com parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/fundo1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          y
        }}
      />
      
      {/* Overlay escuro para melhorar legibilidade do texto */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Conteúdo centralizado */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Bem-vindo à
            <span className="block text-[#e0007a]">GelaBoca</span>
          </h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            A sorveteria mais deliciosa da cidade! 
            <br />
            Experimente nossos sabores únicos e refrescantes.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <button 
              onClick={handleVerCardapioClick}
              className="bg-[#e0007a] hover:bg-[#c0006a] text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Ver Cardápio
            </button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decoração de fundo sutil */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </section>
  );
} 