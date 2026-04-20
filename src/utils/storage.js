// src/utils/storage.js

export const STORAGE_KEYS = {
  CART:     'mystore_cart',
  USER:     'mystore_user',
  TOKEN:    'mystore_token',
  ORDERS:   'mystore_orders',   // ✅ NEW — persists order history
  WISHLIST: 'mystore_wishlist',
  THEME:    'mystore_theme',
};

/**
 * Safely write any value to localStorage as JSON.
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[storage] write failed — key: "${key}"`, err);
  }
}

/**
 * Safely read a value from localStorage.
 * Returns `fallback` if the key is missing or JSON is corrupt.
 */
export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Remove a single key from localStorage.
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[storage] remove failed — key: "${key}"`, err);
  }
}

/**
 * Wipe ALL mystore_* keys (used on logout).
 */
export function clearAllStorage() {
  Object.values(STORAGE_KEYS).forEach(removeFromStorage);
}

/**
 * Returns approximate localStorage usage in KB.
 */
export function getStorageSize() {
  let bytes = 0;
  for (const k in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, k)) {
      bytes += (localStorage[k].length + k.length) * 2; // UTF-16
    }
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}