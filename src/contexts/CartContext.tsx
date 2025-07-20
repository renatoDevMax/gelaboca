'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

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

interface CartItem extends Produto {
  quantidade: number;
}

interface CartState {
  items: CartItem[];
  isModalOpen: boolean;
  finalizedItems: string[]; // IDs dos produtos finalizados
  showSuccessModal: boolean;
  cancelledItems: string[]; // IDs dos produtos com cancelamento solicitado
  showCancelModal: boolean;
  isOrderCompleted: boolean; // Estado de pedido realizado
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Produto }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantidade: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'LOAD_CART_STATE'; payload: { items: CartItem[]; finalizedItems: string[]; cancelledItems: string[]; isOrderCompleted: boolean } }
  | { type: 'FINALIZE_ORDER' }
  | { type: 'HIDE_SUCCESS_MODAL' }
  | { type: 'REQUEST_CANCELLATION'; payload: string }
  | { type: 'HIDE_CANCEL_MODAL' }
  | { type: 'START_NEW_ORDER' };

const initialState: CartState = {
  items: [],
  isModalOpen: false,
  finalizedItems: [],
  showSuccessModal: false,
  cancelledItems: [],
  showCancelModal: false,
  isOrderCompleted: false,
};

// Função para carregar o carrinho do localStorage
const loadCartFromStorage = (): { items: CartItem[]; finalizedItems: string[]; cancelledItems: string[]; isOrderCompleted: boolean } => {
  if (typeof window === 'undefined') return { items: [], finalizedItems: [], cancelledItems: [], isOrderCompleted: false };
  
  try {
    const savedCart = localStorage.getItem('gelaboca-cart');
    const savedFinalized = localStorage.getItem('gelaboca-finalized');
    const savedCancelled = localStorage.getItem('gelaboca-cancelled');
    const savedOrderCompleted = localStorage.getItem('gelaboca-order-completed');
    
    return {
      items: savedCart ? JSON.parse(savedCart) : [],
      finalizedItems: savedFinalized ? JSON.parse(savedFinalized) : [],
      cancelledItems: savedCancelled ? JSON.parse(savedCancelled) : [],
      isOrderCompleted: savedOrderCompleted ? JSON.parse(savedOrderCompleted) : false
    };
  } catch (error) {
    console.error('Erro ao carregar carrinho do localStorage:', error);
    return { items: [], finalizedItems: [], cancelledItems: [], isOrderCompleted: false };
  }
};

// Função para salvar o carrinho no localStorage
const saveCartToStorage = (items: CartItem[], finalizedItems: string[], cancelledItems: string[], isOrderCompleted: boolean) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('gelaboca-cart', JSON.stringify(items));
    localStorage.setItem('gelaboca-finalized', JSON.stringify(finalizedItems));
    localStorage.setItem('gelaboca-cancelled', JSON.stringify(cancelledItems));
    localStorage.setItem('gelaboca-order-completed', JSON.stringify(isOrderCompleted));
  } catch (error) {
    console.error('Erro ao salvar carrinho no localStorage:', error);
  }
};

function cartReducer(state: CartState, action: CartAction): CartState {
  let newState: CartState;

  switch (action.type) {
    case 'LOAD_CART_STATE': {
      return {
        ...state,
        items: action.payload.items,
        finalizedItems: action.payload.finalizedItems,
        cancelledItems: action.payload.cancelledItems,
        isOrderCompleted: action.payload.isOrderCompleted,
      };
    }

    case 'START_NEW_ORDER': {
      newState = {
        ...state,
        items: [],
        finalizedItems: [],
        cancelledItems: [],
        isOrderCompleted: false,
      };
      
      // Limpar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gelaboca-cart');
        localStorage.removeItem('gelaboca-finalized');
        localStorage.removeItem('gelaboca-cancelled');
        localStorage.removeItem('gelaboca-order-completed');
      }
      return newState;
    }

    case 'REQUEST_CANCELLATION': {
      const cancelledIds = [...state.cancelledItems, action.payload];
      newState = {
        ...state,
        cancelledItems: cancelledIds,
        showCancelModal: true,
      };
      
      // Salvar no localStorage
      saveCartToStorage(state.items, state.finalizedItems, cancelledIds, state.isOrderCompleted);
      return newState;
    }

    case 'HIDE_CANCEL_MODAL': {
      return {
        ...state,
        showCancelModal: false,
      };
    }

    case 'FINALIZE_ORDER': {
      const finalizedIds = state.items.map(item => item.id);
      newState = {
        ...state,
        finalizedItems: finalizedIds,
        showSuccessModal: true,
        isOrderCompleted: true,
      };
      
      // Salvar no localStorage
      saveCartToStorage(state.items, finalizedIds, state.cancelledItems, true);
      return newState;
    }

    case 'HIDE_SUCCESS_MODAL': {
      return {
        ...state,
        showSuccessModal: false,
      };
    }

    case 'ADD_ITEM': {
      // Não permitir adicionar se o item já foi finalizado
      if (state.finalizedItems.includes(action.payload.id)) {
        return state;
      }

      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          ),
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, quantidade: 1 }],
        };
      }
      
      // Salvar no localStorage após adicionar item
      saveCartToStorage(newState.items, state.finalizedItems, state.cancelledItems, state.isOrderCompleted);
      return newState;
    }
    
    case 'REMOVE_ITEM': {
      // Não permitir remover se o item foi finalizado
      if (state.finalizedItems.includes(action.payload)) {
        return state;
      }

      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        cancelledItems: state.cancelledItems.filter(id => id !== action.payload),
      };
      
      // Salvar no localStorage após remover item
      saveCartToStorage(newState.items, state.finalizedItems, newState.cancelledItems, state.isOrderCompleted);
      return newState;
    }
    
    case 'UPDATE_QUANTITY': {
      // Não permitir alterar se o item foi finalizado
      if (state.finalizedItems.includes(action.payload.id)) {
        return state;
      }

      if (action.payload.quantidade <= 0) {
        newState = {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
          cancelledItems: state.cancelledItems.filter(id => id !== action.payload.id),
        };
      } else {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantidade: action.payload.quantidade }
              : item
          ),
        };
      }
      
      // Salvar no localStorage após atualizar quantidade
      saveCartToStorage(newState.items, state.finalizedItems, state.cancelledItems, state.isOrderCompleted);
      return newState;
    }
    
    case 'CLEAR_CART': {
      // Remove apenas produtos que não foram finalizados
      const remainingItems = state.items.filter(item => 
        state.finalizedItems.includes(item.id) || state.cancelledItems.includes(item.id)
      );
      
      newState = {
        ...state,
        items: remainingItems,
        // Mantém os arrays de finalizados e cancelados
        finalizedItems: state.finalizedItems,
        cancelledItems: state.cancelledItems,
      };
      
      // Salvar no localStorage apenas os itens restantes
      saveCartToStorage(remainingItems, state.finalizedItems, state.cancelledItems, state.isOrderCompleted);
      return newState;
    }
    
    case 'OPEN_MODAL': {
      return {
        ...state,
        isModalOpen: true,
      };
    }
    
    case 'CLOSE_MODAL': {
      return {
        ...state,
        isModalOpen: false,
      };
    }
    
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (produto: Produto) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantidade: number) => void;
  clearCart: () => void;
  openModal: () => void;
  closeModal: () => void;
  finalizeOrder: () => void;
  hideSuccessModal: () => void;
  requestCancellation: (id: string) => void;
  hideCancelModal: () => void;
  startNewOrder: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isItemFinalized: (id: string) => boolean;
  isItemCancelled: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    const savedData = loadCartFromStorage();
    
    // Carregar todos os estados de uma vez
    if (savedData.items.length > 0 || savedData.finalizedItems.length > 0 || savedData.cancelledItems.length > 0 || savedData.isOrderCompleted) {
      dispatch({ 
        type: 'LOAD_CART_STATE', 
        payload: {
          items: savedData.items,
          finalizedItems: savedData.finalizedItems,
          cancelledItems: savedData.cancelledItems,
          isOrderCompleted: savedData.isOrderCompleted
        }
      });
    }
  }, []);

  const addItem = (produto: Produto) => {
    dispatch({ type: 'ADD_ITEM', payload: produto });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantidade: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantidade } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const openModal = () => {
    dispatch({ type: 'OPEN_MODAL' });
  };

  const closeModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const finalizeOrder = () => {
    dispatch({ type: 'FINALIZE_ORDER' });
  };

  const hideSuccessModal = () => {
    dispatch({ type: 'HIDE_SUCCESS_MODAL' });
  };

  const requestCancellation = (id: string) => {
    dispatch({ type: 'REQUEST_CANCELLATION', payload: id });
  };

  const hideCancelModal = () => {
    dispatch({ type: 'HIDE_CANCEL_MODAL' });
  };

  const startNewOrder = () => {
    dispatch({ type: 'START_NEW_ORDER' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantidade, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.valor * item.quantidade), 0);
  };

  const isItemFinalized = (id: string) => {
    return state.finalizedItems.includes(id);
  };

  const isItemCancelled = (id: string) => {
    return state.cancelledItems.includes(id);
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openModal,
    closeModal,
    finalizeOrder,
    hideSuccessModal,
    requestCancellation,
    hideCancelModal,
    startNewOrder,
    getTotalItems,
    getTotalPrice,
    isItemFinalized,
    isItemCancelled,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 