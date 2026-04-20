// src/context/AuthContext.jsx
import {
  createContext, useContext,
  useState, useEffect, useMemo, useCallback,
} from 'react';
import {
  loadFromStorage, saveToStorage,
  removeFromStorage, STORAGE_KEYS,
} from '../utils/storage';

const AuthContext = createContext(null);

/*
 * AuthProvider manages:
 *   - user object (name, email, id, phone, address, createdAt)
 *   - token (fake JWT string)
 *   - loading flag (while reading from localStorage)
 *
 * Exposes:
 *   login(user, token)    → store in state + localStorage
 *   logout()              → clear everything
 *   updateUser(partial)   → merge + persist profile changes → REAL-TIME SYNC
 *   register(data)        → create account, then auto-login
 *
 * ✅ CHANGE LOG vs previous version:
 *   1. register() now stores a STRUCTURED address object
 *      (street, city, state, zipCode, country) instead of a flat string.
 *      This allows Checkout to pre-fill individual fields correctly.
 *
 *   2. No other logic changed — updateUser() was already correct.
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Re-hydrate from localStorage on mount ─────────────────────────
  useEffect(() => {
    const savedToken = loadFromStorage(STORAGE_KEYS.TOKEN);
    const savedUser  = loadFromStorage(STORAGE_KEYS.USER);
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  // ── login ──────────────────────────────────────────────────────────
  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    saveToStorage(STORAGE_KEYS.USER,  userData);
    saveToStorage(STORAGE_KEYS.TOKEN, authToken);
  }, []);

  // ── logout ─────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    removeFromStorage(STORAGE_KEYS.TOKEN);
    removeFromStorage(STORAGE_KEYS.USER);
  }, []);

  // ── register ───────────────────────────────────────────────────────
  /*
   * ✅ UPDATED: address is now stored as a structured object so
   * Checkout.jsx can pre-fill street/city/state/zipCode/country
   * individually without needing to parse a flat string.
   *
   * formData.address can be either:
   *   - A string (legacy / guest checkout flat string) → stored as-is in street
   *   - An object { street, city, state, zipCode, country } → stored as-is
   *
   * ProfileSettings saves structured address → updateUser({ address: {...} })
   * Guest checkout passes flat string → stored in address.street
   */
  const register = useCallback((formData) => {
    // Normalize address to structured format
    const addressData = typeof formData.address === 'object' && formData.address !== null
      ? formData.address
      : {
          street:  formData.address || '',
          city:    formData.city    || '',
          state:   formData.state   || '',
          zipCode: formData.zipCode || '',
          country: formData.country || 'US',
        };

    const newUser = {
      id:        `USR-${Date.now()}`,
      name:      formData.name     || '',
      email:     formData.email    || '',
      password:  formData.password || '', // demo only — never do this in production
      phone:     formData.phone    || '',
      address:   addressData,
      createdAt: new Date().toISOString(),
      isGuest:   formData.isGuest  || false,
    };

    const fakeToken = `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    login(newUser, fakeToken);
    return { user: newUser, token: fakeToken };
  }, [login]);

  // ── updateUser ─────────────────────────────────────────────────────
  /*
   * Merges partial changes into the existing user object and persists.
   * Called by ProfileSettings → triggers real-time re-render everywhere
   * useAuth() is consumed (Navbar avatar name, Dashboard banner, etc.)
   *
   * ✅ UNCHANGED — was already correct.
   */
  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...partial };
      saveToStorage(STORAGE_KEYS.USER, merged);
      return merged;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    register,
    updateUser,
  }), [user, token, loading, login, logout, register, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}