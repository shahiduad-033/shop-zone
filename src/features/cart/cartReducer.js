export const initialCartState = {
  cartItems: [], totalItems: 0, totalPrice: 0,
  totalSaved: 0, lastUpdated: null,
};

export function cartReducer(state, action) {
  switch (action.type) {

    case 'ADD_TO_CART': {
      const idx = state.cartItems.findIndex((i) => i.id === action.payload.id);
      const items = idx >= 0
        ? state.cartItems.map((i, n) =>
            n === idx ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.cartItems, { ...action.payload, quantity: 1, addedAt: Date.now() }];
      return { ...state, cartItems: items, lastUpdated: Date.now() };
    }

    case 'INCREASE_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map((i) =>
          i.id === action.payload
            ? { ...i, quantity: Math.min(i.quantity + 1, 99) } : i),
        lastUpdated: Date.now(),
      };

    case 'DECREASE_QUANTITY': {
      const item = state.cartItems.find((i) => i.id === action.payload);
      if (!item) return state;
      if (item.quantity === 1)
        return { ...state, cartItems: state.cartItems.filter((i) => i.id !== action.payload), lastUpdated: Date.now() };
      return {
        ...state,
        cartItems: state.cartItems.map((i) =>
          i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i),
        lastUpdated: Date.now(),
      };
    }

    case 'SET_QUANTITY': {
      const { id, quantity } = action.payload;
      const n = parseInt(quantity, 10);
      if (isNaN(n) || n <= 0)
        return { ...state, cartItems: state.cartItems.filter((i) => i.id !== id), lastUpdated: Date.now() };
      return {
        ...state,
        cartItems: state.cartItems.map((i) =>
          i.id === id ? { ...i, quantity: Math.min(Math.max(n, 1), 99) } : i),
        lastUpdated: Date.now(),
      };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cartItems: state.cartItems.filter((i) => i.id !== action.payload), lastUpdated: Date.now() };

    case 'CALCULATE_TOTALS': {
      const { totalItems, totalPrice } = state.cartItems.reduce(
        (acc, i) => ({
          totalItems: acc.totalItems + i.quantity,
          totalPrice: acc.totalPrice + i.price * i.quantity,
        }),
        { totalItems: 0, totalPrice: 0 }
      );
      return { ...state, totalItems, totalPrice: Math.round(totalPrice * 100) / 100 };
    }

    case 'CLEAR_CART':
      return { ...initialCartState, lastUpdated: Date.now() };

    default:
      return state;
  }
}