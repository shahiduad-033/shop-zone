import { Link }  from 'react-router-dom';
import styles    from './EmptyCart.module.css';

export default function EmptyCart() {
  return (
    <div className={`container py-5 text-center ${styles.wrap}`}>
      <div className={styles.icon}>🛒</div>
      <h3 className="fw-bold mb-2">Your cart is empty</h3>
      <p className="text-muted mb-4">Start shopping to add items to your cart.</p>
      <Link to="/products" className="btn btn-primary btn-lg px-5">
        Browse Products
      </Link>
      <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
        {[['💻','electronics'],['💎','jewelery'],['👔',"men's clothing"],['👗',"women's clothing"]].map(([e,c]) => (
          <Link key={c} to={`/products?category=${c}`}
                className="btn btn-outline-secondary btn-sm text-capitalize">
            {e} {c}
          </Link>
        ))}
      </div>
    </div>
  );
}