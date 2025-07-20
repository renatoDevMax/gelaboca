'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FaWifi } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

interface WifiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WifiModal({ isOpen, onClose }: WifiModalProps) {
  const wifiData = {
    ssid: 'Internet GelaBoca',
    password: 'gelaboca123',
    qrCodeData: `WIFI:S:Internet GelaBoca;T:WPA;P:gelaboca123;;`
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
                  <FaWifi className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Conectar ao WiFi</h2>
                  <p className="text-white/80 text-sm">Escaneie o QR Code ou conecte manualmente</p>
                </div>
              </div>
            </div>

            {/* Content with Scroll */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* WiFi Info - Primeiro */}
              <div className="space-y-4 mb-6">
                {/* Network Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Rede
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FaWifi className="text-[#e0007a]" />
                      <span className="font-medium text-gray-900">{wifiData.ssid}</span>
                    </div>
                  </div>
                </div>

                {/* Password - Sempre visível */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-gray-900 font-medium text-lg">
                        {wifiData.password}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code - Depois */}
              <div className="text-center mb-6">
                <div className="bg-gray-100 rounded-2xl p-6 inline-block">
                  <div className="w-48 h-48 bg-white rounded-xl shadow-lg flex items-center justify-center p-4">
                    <QRCodeSVG
                      value={wifiData.qrCodeData}
                      size={160}
                      level="M"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Como conectar:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Abra as configurações do seu celular</li>
                  <li>2. Vá em "WiFi" ou "Rede"</li>
                  <li>3. Procure por "Internet GelaBoca"</li>
                  <li>4. Digite a senha: <span className="font-mono font-medium">gelaboca123</span></li>
                </ol>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 