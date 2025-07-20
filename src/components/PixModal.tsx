'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FaPix } from 'react-icons/fa6';
import { QRCodeSVG } from 'qrcode.react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PixModal({ isOpen, onClose }: PixModalProps) {
  const pixData = {
    key: '45891816814',
    keyType: 'CPF',
    qrCodeData: '45891816814'
  };

  const handlePayment = () => {
    // Aqui você pode adicionar a lógica para abrir o app de pagamento
    // Por exemplo, copiar a chave PIX para a área de transferência
    navigator.clipboard.writeText(pixData.key);
    alert('Chave PIX copiada para a área de transferência!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
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
            className="bg-white rounded-3xl shadow-2xl max-w-[650px] w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#e0007a] to-[#c0006a] p-6 text-white relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200"
              >
                <IoClose className="text-lg" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaPix className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Pagamento PIX</h2>
                  <p className="text-white/80 text-sm">Escaneie o QR Code ou copie a chave PIX</p>
                </div>
              </div>
            </div>

            {/* Content with Scroll */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* PIX Info - Primeiro */}
              <div className="space-y-4 mb-6">
                {/* PIX Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chave PIX
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaPix className="text-[#e0007a]" />
                        <div>
                          <span className="font-mono text-gray-900 font-medium text-lg">
                            {pixData.key}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            Tipo: {pixData.keyType}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pixData.key);
                          alert('Chave PIX copiada!');
                        }}
                        className="text-[#e0007a] hover:text-[#c0006a] text-sm font-medium transition-colors duration-200"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code - Depois */}
              <div className="text-center mb-6">
                <div className="bg-gray-100 rounded-2xl p-6 inline-block">
                  <div className="w-48 h-48 bg-white rounded-xl shadow-lg flex items-center justify-center p-4">
                    <QRCodeSVG
                      value={pixData.qrCodeData}
                      size={160}
                      level="M"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <div className="text-center mb-6">
                <button
                  onClick={handlePayment}
                  className="bg-[#e0007a] hover:bg-[#c0006a] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Realizar Pagamento
                </button>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Como pagar:</h4>
                <ol className="text-sm text-green-800 space-y-1">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Vá em "PIX" ou "Pagamentos"</li>
                  <li>3. Escolha "Pagar com PIX"</li>
                  <li>4. Escaneie o QR Code ou cole a chave: <span className="font-mono font-medium">45891816814</span></li>
                  <li>5. Digite o valor e confirme o pagamento</li>
                </ol>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 