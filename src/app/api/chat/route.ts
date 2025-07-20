import { NextRequest, NextResponse } from 'next/server';
import { processChatMessage, ChatMessage } from '@/lib/chat-service';

// Armazenamento temporário do histórico de conversa (em produção, use um banco de dados)
const conversationHistories: { [sessionId: string]: ChatMessage[] } = {};

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId = 'default' } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória e deve ser uma string' },
        { status: 400 }
      );
    }

    // Inicializar histórico se não existir
    if (!conversationHistories[sessionId]) {
      conversationHistories[sessionId] = [
        {
          role: 'system',
          content: 'Você é o GelinhIA, assistente virtual da sorveteria GelaBoca. Seja sempre amigável e prestativo!'
        }
      ];
    }

    // Adicionar mensagem do usuário ao histórico
    conversationHistories[sessionId].push({
      role: 'user',
      content: message
    });

    console.log(`💬 Processando mensagem para sessão ${sessionId}:`, message);

    // Processar mensagem usando a nova lógica
    const result = await processChatMessage(message, conversationHistories[sessionId]);

    // Adicionar resposta da IA ao histórico
    conversationHistories[sessionId].push({
      role: 'assistant',
      content: result.message
    });

    // Limitar o histórico para não ficar muito grande (manter últimas 20 mensagens)
    if (conversationHistories[sessionId].length > 20) {
      const systemMessage = conversationHistories[sessionId][0];
      const recentMessages = conversationHistories[sessionId].slice(-19);
      conversationHistories[sessionId] = [systemMessage, ...recentMessages];
    }

    return NextResponse.json({
      message: result.message,
      success: true,
      sessionId,
      productInfo: result.productInfo
    });

  } catch (error) {
    console.error('❌ Erro na API de chat:', error);
    
    return NextResponse.json(
      {
        message: 'Desculpe, tive um probleminha técnico! 😅 Pode tentar novamente?',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Endpoint para limpar histórico de conversa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || 'default';

    if (conversationHistories[sessionId]) {
      delete conversationHistories[sessionId];
    }

    return NextResponse.json({
      message: 'Histórico limpo com sucesso!',
      success: true
    });

  } catch (error) {
    console.error('❌ Erro ao limpar histórico:', error);
    
    return NextResponse.json(
      {
        message: 'Erro ao limpar histórico',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 