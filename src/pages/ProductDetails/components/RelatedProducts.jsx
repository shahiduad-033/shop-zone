import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import ProductCard             from '../../../components/ui/ProductCard/ProductCard';
import productService          from '../../../services/productService';

export default function RelatedProducts({ category, currentId }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await productService.getByCategory(category);
        setItems(data.filter((p) => p.id !== currentId).slice(0, 4));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category, currentId]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-5 pt-4 border-top">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Related Products</h4>
        <Link to={`/products?category=${category}`}
              className="btn btn-outline-primary btn-sm">
          View All →
        </Link>
      </div>
      <div className="row g-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="col-lg-3 col-md-6">
                <div className="rounded-3"
                     style={{ height: 300, background: '#f0f0f0' }} />
              </div>
            ))
          : items.map((p) => (
              <div key={p.id} className="col-lg-3 col-md-6">
                <ProductCard product={p} />
              </div>
            ))
        }
      </div>
    </section>
  );
}