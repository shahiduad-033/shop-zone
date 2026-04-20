import { Link }           from 'react-router-dom';
import { useCategories }  from '../../../hooks/useProducts';
import styles             from '../Home.module.css';

const CONFIG = {
  'electronics':      { icon: '💻', bg: '#eff6ff', border: '#2563eb', desc: 'Gadgets & tech'    },
  'jewelery':         { icon: '💎', bg: '#fdf4ff', border: '#9333ea', desc: 'Fine accessories'  },
  "men's clothing":   { icon: '👔', bg: '#ecfdf5', border: '#10b981', desc: 'Style for men'     },
  "women's clothing": { icon: '👗', bg: '#fff1f2', border: '#f43f5e', desc: 'Style for women'   },
};

export default function CategorySection() {
  const { categories, loading } = useCategories();

  return (
    <section className="py-5 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className={`fw-bold ${styles.sectionTitle}`}
              style={{ margin: '0 auto' }}>
            Shop by Category
          </h2>
          <p className="text-muted mt-3">Find exactly what you're looking for</p>
        </div>

        <div className="row g-3 justify-content-center">
          {loading
            // Skeleton placeholders while loading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="col-md-3 col-6">
                  <div className="rounded-3"
                       style={{ height: 140, background: '#f0f0f0' }} />
                </div>
              ))
            : categories.map((cat) => {
                const cfg = CONFIG[cat] || { icon: '🛍️', bg: '#f9fafb', border: '#6b7280', desc: 'Explore' };
                return (
                  <div key={cat} className="col-md-3 col-6">
                    <Link
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      className={styles.catCard}
                    >
                      <div
                        className="p-4 rounded-3 text-center h-100"
                        style={{
                          background: cfg.bg,
                          border: `2px solid ${cfg.border}20`,
                        }}
                      >
                        <div className="fs-1 mb-2">{cfg.icon}</div>
                        <div className="fw-bold small text-capitalize text-dark">{cat}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{cfg.desc}</div>
                      </div>
                    </Link>
                  </div>
                );
              })
          }
        </div>
      </div>
    </section>
  );
}