import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  id: string;
  customer: string;
  serviceType: string;
  recipientName: string;
  recipientAddress: string;
  contactNumber: string;
  price: number;
  originPostal?: string;
  destinationPostal?: string;
  weight?: number;
  serviceTypeLabel?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_ITEM'; payload: { id: string; item: Partial<CartItem> } };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price
      };
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.price, 0)
      };
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id ? { ...item, ...action.payload.item } : item
      );
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price, 0)
      };
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateItem: (id: string, item: Partial<CartItem>) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0
  });

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const updateItem = (id: string, item: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, item } });
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, clearCart, updateItem }}>
      {children}
    </CartContext.Provider>
  );
}; 