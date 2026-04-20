import { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService';

export function useProducts(limit = null) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = limit
        ? await productService.getLimited(limit)
        : await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(
        err.response
          ? `Server error ${err.response.status}`
          : err.request
            ? 'Network error — check your connection.'
            : err.message
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    productService.getCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}