import { Link }         from 'react-router-dom';
import ProductCard      from '../../../components/ui/ProductCard/ProductCard';
import Loader           from '../../../components/common/Loader/Loader';
import ErrorMessage     from '../../../components/common/ErrorMessage/ErrorMessage';
import { useProducts }  from '../../../hooks/useProducts';
import styles           from '../Home.module.css';

export default function FeaturedProducts() {
  // Limit to 8 items for the homepage preview
  const { products, loading, error, refetch } = useProducts(8);

  return (
    <section className="py-5 bg-light">
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className={`fw-bold mb-1 ${styles.sectionTitle}`}>
              Featured Products
            </h2>
            {!loading && !error && (
              <p className="text-muted mb-0 small">
                Showing {products.length} handpicked items
              </p>
            )}
          </div>
          <Link to="/products" className="btn btn-outline-primary btn-sm fw-semibold">
            View All →
          </Link>
        </div>

        {/* States */}
        {loading && <Loader count={8} />}
        {error   && <div className="row"><ErrorMessage message={error} onRetry={refetch} /></div>}

        {/* Grid */}
        {!loading && !error && (
          <div className="row g-4">
            {products.map((product) => (
              <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}