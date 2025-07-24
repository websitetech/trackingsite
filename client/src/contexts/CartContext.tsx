import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartAPI } from '../services/api';

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
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_ITEM'; payload: { id: string; item: Partial<CartItem> } };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + item.price, 0),
        loading: false,
        error: null
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price,
        loading: false,
        error: null
      };
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.price, 0),
        loading: false,
        error: null
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        loading: false,
        error: null
      };
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id ? { ...item, ...action.payload.item } : item
      );
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price, 0),
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  updateItem: (id: string, item: Partial<CartItem>) => Promise<void>;
  loadCart: () => Promise<void>;
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
    total: 0,
    loading: false,
    error: null
  });

  // Load cart from database on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadCart();
    }
  }, []);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartData = await cartAPI.getCart();
      
      // Transform database format to local format
      const transformedItems: CartItem[] = cartData.map((item: any) => ({
        id: item.item_id,
        customer: item.customer,
        serviceType: item.service_type,
        serviceTypeLabel: item.service_type_label,
        recipientName: item.recipient_name,
        recipientAddress: item.recipient_address,
        contactNumber: item.contact_number,
        originPostal: item.origin_postal,
        destinationPostal: item.destination_postal,
        weight: item.weight,
        price: item.price
      }));
      
      dispatch({ type: 'SET_CART', payload: transformedItems });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load cart' });
    }
  };

  const addItem = async (item: CartItem) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Transform local format to database format
      const cartItemData = {
        item_id: item.id,
        customer: item.customer,
        service_type: item.serviceType,
        service_type_label: item.serviceTypeLabel || '',
        recipient_name: item.recipientName,
        recipient_address: item.recipientAddress,
        contact_number: item.contactNumber,
        origin_postal: item.originPostal,
        destination_postal: item.destinationPostal,
        weight: item.weight,
        price: item.price
      };

      await cartAPI.addToCart(cartItemData);
      dispatch({ type: 'ADD_ITEM', payload: item });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item to cart' });
    }
  };

  const removeItem = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartAPI.removeFromCart(id);
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove item from cart' });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartAPI.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to clear cart' });
    }
  };

  const updateItem = async (id: string, item: Partial<CartItem>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For now, we'll remove and re-add the item since the API doesn't support updates
      // In a production app, you'd want to add an update endpoint
      const existingItem = state.items.find(cartItem => cartItem.id === id);
      if (existingItem) {
        const updatedItem = { ...existingItem, ...item };
        await cartAPI.removeFromCart(id);
        await addItem(updatedItem);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update item' });
    }
  };

  return (
    <CartContext.Provider value={{ 
      state, 
      addItem, 
      removeItem, 
      clearCart, 
      updateItem, 
      loadCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}; 