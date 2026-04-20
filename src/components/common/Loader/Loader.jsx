import styles from './Loader.module.css';

/*
 * Reusable skeleton loader component.
 * Renders 'count' shimmer cards while data is being fetched.
 * Used in FeaturedProducts, Products page, RelatedProducts, etc.
 *
 * Props:
 *   count     → number of skeleton cards to show (default: 8)
 *   fullScreen → center loader in full viewport height
 */
export default function Loader({ count = 8, fullScreen = false }) {
  // ── Full screen spinner variant ──────────────────────────────────
  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        <div className={styles.spinner}></div>
        <p className={styles.spinnerText}>Loading...</p>
      </div>
    );
  }

  // ── Skeleton card grid variant ───────────────────────────────────
  return (
    <div className="row g-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="col-xl-3 col-lg-4 col-md-6 col-12">
          <div className={`card h-100 border-0 ${styles.skeletonCard}`}>
            {/* Image placeholder */}
            <div className={styles.skeletonImage}></div>
            <div className="card-body p-3">
              {/* Title lines */}
              <div className={`${styles.skeletonLine} ${styles.lineWide}`}></div>
              <div className={`${styles.skeletonLine} ${styles.lineMid}`}></div>
              {/* Rating */}
              <div className={`${styles.skeletonLine} ${styles.lineShort}`}></div>
              {/* Price */}
              <div className={`${styles.skeletonLine} ${styles.linePrice}`}></div>
              {/* Button */}
              <div className={`${styles.skeletonLine} ${styles.lineButton}`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}