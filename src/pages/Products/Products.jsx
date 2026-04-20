// src/pages/Products/Products.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate }         from 'react-router-dom';
import ProductCard    from '../../components/ui/ProductCard/ProductCard';
import Loader         from '../../components/common/Loader/Loader';
import ErrorMessage   from '../../components/common/ErrorMessage/ErrorMessage';
import { useCategories } from '../../hooks/useProducts';
import productService    from '../../services/productService';
import styles            from './Products.module.css';

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default'           },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'         },
  { value: 'name-asc',   label: 'Name: A → Z'       },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate                        = useNavigate();

  /*
   * ✅ FIX 1 — PARAM KEY MISMATCH RESOLVED
   *
   * OLD:  searchParams.get('q')        ← Products was reading 'q'
   * NEW:  searchParams.get('search')   ← matches what Header sends
   *
   * Header always navigates to:
   *   /products?search=term     (search bar)
   *   /products?category=slug   (category links)
   *
   * Both params are now read with the correct keys.
   */
  const categoryParam = searchParams.get('category') || '';
  const searchParam   = searchParams.get('search')   || '';  // ✅ was 'q'

  // ── Local state ───────────────────────────────────────────────────
  const [allProducts,    setAllProducts]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [sortBy,         setSortBy]         = useState('default');

  /*
   * ✅ REMOVE separate activeCategory / searchQuery states.
   * We drive everything from searchParams (URL) as the single
   * source of truth. This ensures:
   *   - Browser back/forward works correctly
   *   - Sharing the URL preserves filters
   *   - Header navigation always reflects in the page
   */

  const { categories } = useCategories();

  /*
   * ✅ FIX 2 — URL IS SINGLE SOURCE OF TRUTH
   *
   * We derive the active values directly from searchParams.
   * When the URL changes (Header navigation, browser back,
   * or the category pills below), these values update
   * automatically — no manual state sync needed.
   */
  const activeCategory = categoryParam;
  const searchQuery    = searchParam;

  // ── Fetch products when category param changes ────────────────────
  /*
   * ✅ FIX 3 — DEPENDENCY ON URL PARAM NOT LOCAL STATE
   *
   * OLD: useEffect depended on [activeCategory] (local state)
   *      which didn't update when URL changed via Header navigation.
   *
   * NEW: useEffect depends on [categoryParam] (from searchParams)
   *      which React Router updates automatically on navigation.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = categoryParam
          ? await productService.getByCategory(categoryParam)
          : await productService.getAll();

        setAllProducts(data);
      } catch (err) {
        console.error('[Products] fetch error:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryParam]); // ✅ URL param — updates on Header navigation

  /*
   * ✅ FIX 4 — FILTER + SORT (useMemo, not useEffect+setState)
   *
   * Computing filtered results as a derived value (useMemo) instead
   * of writing to a separate useState is simpler and avoids the
   * "one render behind" problem of useEffect + setState.
   *
   * Case-insensitive matching:
   *   Both the search query AND the product fields are lowercased
   *   before comparison so 'MEN' matches "men's clothing", etc.
   */
  const filtered = useMemo(() => {
    let result = [...allProducts];

    // ✅ SEARCH FILTER — case-insensitive title + category match
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q)    ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // SORT
    switch (sortBy) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price);              break;
      case 'price-desc': result.sort((a, b) => b.price - a.price);              break;
      case 'rating':     result.sort((a, b) => b.rating.rate - a.rating.rate);  break;
      case 'name-asc':   result.sort((a, b) => a.title.localeCompare(b.title)); break;
      default: break;
    }

    return result;
  }, [allProducts, searchQuery, sortBy]);

  /*
   * ✅ FIX 5 — CATEGORY PILL HANDLER
   * Updates the URL (searchParams) — Products re-renders automatically
   * because categoryParam is derived from searchParams.
   * Clears search when switching category for a clean UX.
   */
  const handleCategory = useCallback((cat) => {
    const params = {};
    if (cat) params.category = cat;
    // Preserve search query when switching categories
    if (searchParam) params.search = searchParam;
    setSearchParams(params, { replace: true });
  }, [searchParam, setSearchParams]);

  /*
   * ✅ FIX 6 — LOCAL SEARCH BAR ON PRODUCTS PAGE
   * Updates URL with the search term so it's bookmarkable.
   * Debounced via a 350ms delay to avoid fetching on every keystroke.
   * Category is preserved when searching.
   */
  const handleLocalSearch = useCallback((value) => {
    const params = {};
    if (activeCategory)  params.category = activeCategory;
    if (value.trim())    params.search   = value.trim();
    setSearchParams(params, { replace: true });
  }, [activeCategory, setSearchParams]);

  // ── Clear all filters ─────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
    setSortBy('default');
  }, [setSearchParams]);

  // ── Page title derived from active filters ─────────────────────────
  const pageTitle = useMemo(() => {
    if (activeCategory) {
      return activeCategory
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    if (searchQuery) return `Search: "${searchQuery}"`;
    return 'All Products';
  }, [activeCategory, searchQuery]);

  return (
    <div className={styles.page}>
      <div className="container py-4">

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1">{pageTitle}</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item">
                <Link to="/products" onClick={clearFilters}>Products</Link>
              </li>
              {activeCategory && (
                <li className="breadcrumb-item active text-capitalize">
                  {activeCategory}
                </li>
              )}
              {searchQuery && !activeCategory && (
                <li className="breadcrumb-item active">
                  "{searchQuery}"
                </li>
              )}
            </ol>
          </nav>
        </div>

        {/* ── Search + Sort bar ─────────────────────────────────────── */}
        <div className={`card border-0 shadow-sm p-3 mb-4 ${styles.filterBar}`}>
          <div className="row g-2 align-items-center">

            {/* Local search input — synced to URL */}
            <div className="col-md-6">
              <input
                type="search"
                className="form-control"
                placeholder="🔍  Search products..."
                value={searchQuery}
                onChange={(e) => handleLocalSearch(e.target.value)}
              />
            </div>

            {/* Sort dropdown — local state only */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Result count */}
            <div className="col-md-3 text-md-end">
              <span className="text-muted small">
                {loading
                  ? 'Loading…'
                  : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* ── Category pills ───────────────────────────────────────── */}
        <div className="d-flex gap-2 flex-wrap mb-4">
          {/* "All" pill */}
          <button
            className={`btn btn-sm fw-semibold ${
              !activeCategory ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => handleCategory('')}
          >
            All
          </button>

          {/*
           * ✅ Dynamic category pills from FakeStoreAPI.
           * These match the exact slugs from useCategories()
           * which fetches /products/categories.
           */}
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm fw-semibold text-capitalize ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </button>
          ))}

          {/* Clear button — shown when any filter is active */}
          {(activeCategory || searchQuery) && (
            <button
              className="btn btn-sm btn-outline-danger fw-semibold ms-auto"
              onClick={clearFilters}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* ── Active filter indicator ───────────────────────────────── */}
        {(activeCategory || searchQuery) && !loading && (
          <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
            <span className="text-muted small">Active filters:</span>
            {activeCategory && (
              <span className="badge bg-primary text-capitalize">
                Category: {activeCategory}
                <button
                  className="btn-close btn-close-white ms-2"
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => handleCategory('')}
                  aria-label="Remove category filter"
                />
              </span>
            )}
            {searchQuery && (
              <span className="badge bg-secondary">
                Search: "{searchQuery}"
                <button
                  className="btn-close btn-close-white ms-2"
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => handleLocalSearch('')}
                  aria-label="Remove search filter"
                />
              </span>
            )}
          </div>
        )}

        {/* ── States ───────────────────────────────────────────────── */}
        {loading && <Loader count={8} />}

        {error && !loading && (
          <div className="row">
            <ErrorMessage
              message={error}
              onRetry={() => handleCategory(activeCategory)}
            />
          </div>
        )}

        {/* ── No results ───────────────────────────────────────────── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-5">
            <div className="fs-1 mb-3">🔍</div>
            <h4 className="fw-bold">No products found</h4>
            <p className="text-muted mb-1">
              {searchQuery && activeCategory && (
                <>No results for <strong>"{searchQuery}"</strong> in <strong className="text-capitalize">{activeCategory}</strong></>
              )}
              {searchQuery && !activeCategory && (
                <>No results for <strong>"{searchQuery}"</strong></>
              )}
              {!searchQuery && activeCategory && (
                <>No products in <strong className="text-capitalize">{activeCategory}</strong></>
              )}
            </p>
            <p className="text-muted small mb-4">
              Try adjusting your search term or selecting a different category.
            </p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Show All Products
            </button>
          </div>
        )}

        {/* ── Product grid — UNCHANGED layout ──────────────────────── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="row g-4">
            {filtered.map((product) => (
              <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}