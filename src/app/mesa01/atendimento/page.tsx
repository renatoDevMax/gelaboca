'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { IoMdSend } from 'react-icons/io';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  productInfo?: {
    name: string;
    slug: string;
  };
}

function AtendimentoContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o GelinhIA, seu assistente virtual da GelaBoca! 😊 Como posso te ajudar hoje?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const searchParams = useSearchParams();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verificar se há mensagem pré-preenchida na URL
  useEffect(() => {
    const mensagemParam = searchParams.get('mensagem');
    if (mensagemParam) {
      const mensagemDecodificada = decodeURIComponent(mensagemParam);
      setInputMessage(mensagemDecodificada);
      
      // Enviar a mensagem automaticamente após um pequeno delay
      setTimeout(() => {
        handleSendMessage(mensagemDecodificada);
      }, 500);
    }
  }, [searchParams]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          sessionId: sessionId
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isUser: false,
          timestamp: new Date(),
          productInfo: data.productInfo
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Erro ao processar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, tive um probleminha técnico! 😅 Pode tentar novamente?',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`/api/chat?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      
      setMessages([
        {
          id: '1',
          text: 'Olá! Sou o GelinhIA, seu assistente virtual da GelaBoca! 😊 Como posso te ajudar hoje?',
          isUser: false,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Erro ao limpar chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <img 
                src="/gela-sorriso.png" 
                alt="GelinhIA" 
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">GelinhIA</h1>
              <p className="text-white/80 text-sm">Assistente Virtual</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.history.back()}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded-full transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <button
              onClick={clearChat}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded-full transition-colors"
            >
              Limpar Chat
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                {!message.isUser && (
                  <div className="flex-shrink-0">
                    <img 
                      src="/gela-sorriso.png" 
                      alt="GelinhIA" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-white text-gray-800 rounded-br-md'
                      : 'bg-white/20 backdrop-blur-md text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  
                  {/* Botão Ver Produto */}
                  {!message.isUser && message.productInfo && (
                    <div className="mt-3">
                      <button
                        onClick={() => window.location.href = `/mesa01/cardapio/${encodeURIComponent(message.productInfo!.slug)}`}
                        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Produto
                      </button>
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-gray-500' : 'text-white/60'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-end space-x-2">
              <div className="flex-shrink-0">
                <img 
                  src="/gela-sorriso.png" 
                  alt="GelinhIA" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div className="bg-white/20 backdrop-blur-md text-white rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20 p-4">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-md text-white placeholder-white/60 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-white text-pink-600 rounded-2xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            <IoMdSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Carregando GelinhIA...</p>
      </div>
    </div>
  );
}

export default function AtendimentoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AtendimentoContent />
    </Suspense>
  );
} 