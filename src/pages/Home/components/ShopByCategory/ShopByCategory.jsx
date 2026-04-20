// src/pages/Home/components/ShopByCategory/ShopByCategory.jsx
import { useNavigate }  from 'react-router-dom';
import styles           from './ShopByCategory.module.css';
import homeStyles       from '../../Home.module.css'; // reuse .sectionTitle

// ── Category data ──────────────────────────────────────────────────────
// query: value passed as ?category= in the URL for future filtering
const CATEGORIES = [
  { id: 1,  label: 'Electronics',  emoji: '💻', query: 'electronics',  bg: '#dbeafe', accent: '#2563eb' },
  { id: 2,  label: 'Fashion',      emoji: '👗', query: 'fashion',       bg: '#fce7f3', accent: '#db2777' },
  { id: 3,  label: 'Home Decor',   emoji: '🛋️', query: 'home decor',   bg: '#d1fae5', accent: '#059669' },
  { id: 4,  label: 'Beauty',       emoji: '💄', query: 'beauty',        bg: '#fef3c7', accent: '#d97706' },
  { id: 5,  label: 'Sports',       emoji: '⚽', query: 'sports',        bg: '#ede9fe', accent: '#7c3aed' },
  { id: 6,  label: 'Books',        emoji: '📚', query: 'books',         bg: '#fee2e2', accent: '#dc2626' },
  { id: 7,  label: 'Toys',         emoji: '🧸', query: 'toys',          bg: '#fdf4ff', accent: '#a21caf' },
  { id: 8,  label: 'Groceries',    emoji: '🛒', query: 'groceries',     bg: '#ecfdf5', accent: '#10b981' },
  { id: 9,  label: 'Jewelry',      emoji: '💍', query: 'jewelry',       bg: '#fff7ed', accent: '#ea580c' },
  { id: 10, label: 'Automotive',   emoji: '🚗', query: 'automotive',    bg: '#e0f2fe', accent: '#0284c7' },
];

export default function ShopByCategory() {
  const navigate = useNavigate();

  /*
   * ✅ FILTERED NAVIGATION:
   * Passes the category name as a URL query parameter.
   * e.g. /products?category=electronics
   * The Products page can read this via useSearchParams() to filter.
   */
  const handleCategoryClick = (query) => {
    navigate(`/products?category=${encodeURIComponent(query)}`);
  };

  return (
    <section className={styles.section}>
      <div className="container">

        {/* ── Section Header ─────────────────────────────────── */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={`fw-bold mb-1 ${homeStyles.sectionTitle}`}>
              Shop by Category
            </h2>
            <p className="text-muted small mt-2 mb-0">
              Browse our wide range of product categories
            </p>
          </div>
          <button
            className={styles.viewAllBtn}
            onClick={() => navigate('/products')}
          >
            View All →
          </button>
        </div>

        {/* ── Category Cards Grid ────────────────────────────── */}
        <div className={styles.grid}>
          {CATEGORIES.map((cat, index) => (
            <button
              key={cat.id}
              className={styles.card}
              onClick={() => handleCategoryClick(cat.query)}
              aria-label={`Browse ${cat.label}`}
              /*
               * Staggered entrance animation delay via inline CSS variable.
               * Referenced in CSS as var(--delay).
               */
              style={{ '--delay': `${index * 0.06}s` }}
            >
              {/* Emoji circle */}
              <div
                className={styles.iconCircle}
                style={{
                  background: cat.bg,
                  boxShadow: `0 8px 24px ${cat.accent}28`,
                }}
              >
                <span
                  className={styles.emoji}
                  style={{ filter: `drop-shadow(0 2px 6px ${cat.accent}66)` }}
                >
                  {cat.emoji}
                </span>
              </div>

              {/* Category label */}
              <span className={styles.label}>{cat.label}</span>

              {/* Bottom accent bar — shows on hover */}
              <span
                className={styles.accentBar}
                style={{ background: cat.accent }}
              />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}