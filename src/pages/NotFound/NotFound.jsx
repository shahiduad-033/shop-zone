import { Link, useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className="container py-5 text-center">
        <div className={styles.code}>404</div>
        <div className={styles.emoji}>😕</div>
        <h2 className="fw-bold mb-2">Page Not Found</h2>
        <p className="text-muted mb-5">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <button
            className="btn btn-outline-secondary px-4"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
          <Link to="/" className="btn btn-primary px-4">
            🏠 Back to Home
          </Link>
          <Link to="/products" className="btn btn-outline-primary px-4">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}