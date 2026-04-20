import { createContext, useContext, useReducer,
         useEffect, useCallback, useMemo } from 'react';
import { cartReducer, initialCartState }   from '../features/cart/cartReducer';
import { saveToStorage, loadFromStorage,
         removeFromStorage, STORAGE_KEYS } from '../utils/storage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialCartState,
    (init) => ({ ...init, cartItems: loadFromStorage(STORAGE_KEYS.CART, []) })
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CART, state.cartItems);
    dispatch({ type: 'CALCULATE_TOTALS' });
  }, [state.cartItems]);

  const addToCart       = useCallback((p)     => dispatch({ type: 'ADD_TO_CART',       payload: p }),    []);
  const increaseQuantity= useCallback((id)    => dispatch({ type: 'INCREASE_QUANTITY', payload: id }),   []);
  const decreaseQuantity= useCallback((id)    => dispatch({ type: 'DECREASE_QUANTITY', payload: id }),   []);
  const setQuantity     = useCallback((id, q) => dispatch({ type: 'SET_QUANTITY',      payload:{id,quantity:q} }),[]);
  const removeFromCart  = useCallback((id)    => dispatch({ type: 'REMOVE_FROM_CART',  payload: id }),   []);
  const clearCart       = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    removeFromStorage(STORAGE_KEYS.CART);
  }, []);

  const isInCart       = useCallback((id) => state.cartItems.some((i) => i.id === id),            [state.cartItems]);
  const getItemQuantity= useCallback((id) => state.cartItems.find((i)=>i.id===id)?.quantity ?? 0,[state.cartItems]);

  const value = useMemo(() => ({
    ...state,
    addToCart, increaseQuantity, decreaseQuantity,
    setQuantity, removeFromCart, clearCart,
    isInCart, getItemQuantity,
  }), [state, addToCart, increaseQuantity, decreaseQuantity,
       setQuantity, removeFromCart, clearCart, isInCart, getItemQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside <CartProvider>');
  return ctx;
}