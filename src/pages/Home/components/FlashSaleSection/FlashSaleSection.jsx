// src/pages/Home/components/FlashSaleSection/FlashSaleSection.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate }                       from 'react-router-dom';
import {
  FaBolt, FaShoppingCart, FaStar,
  FaStarHalfAlt, FaRegStar, FaArrowRight,
  FaFire, FaClock,
} from 'react-icons/fa';
import styles from './FlashSaleSection.module.css';

// ── Flash sale product data ────────────────────────────────────────────
/*
 * Each product has:
 *   originalPrice → shown with strikethrough
 *   salePrice     → prominent red price
 *   discount      → computed badge (e.g. "35% OFF")
 *   rating        → 0-5, used to render star icons
 *   reviews       → count shown in brackets
 */
const FLASH_SALE_PRODUCTS = [
 {
    id: 1,
    name: 'Premium Wireless Headphones — Noise Cancellation',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    originalPrice: 199.99,
    salePrice: 129.99,
    rating: 4.8,
    reviews: 1234,
  },
  {
    id: 2,
    name: 'Smart Watch Fitness Tracker with Heart Rate Monitor',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    originalPrice: 249.99,
    salePrice: 179.99,
    rating: 4.6,
    reviews: 856,
  },
  {
    id: 3,
    name: 'Ultra-Thin Aluminium Laptop Stand',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    originalPrice: 49.99,
    salePrice: 29.99,
    rating: 4.9,
    reviews: 2341,
  },
  {
    id: 4,
    name: 'Mechanical Gaming Keyboard RGB Backlit',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
    originalPrice: 89.99,
    salePrice: 59.99,
    rating: 4.7,
    reviews: 967,
  },
  {
    id: 5,
    name: 'Portable Bluetooth Speaker — Waterproof IPX7',
    image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=400&h=400&fit=crop',
    originalPrice: 79.99,
    salePrice: 45.00,
    rating: 4.5,
    reviews: 542,
  },
  {
    id: 6,
    name: 'Professional DSLR Camera Lens 50mm f/1.8',
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=500&auto=format&fit=crop',
    originalPrice: 299.99,
    salePrice: 199.00,
    rating: 4.9,
    reviews: 312,
  },
  {
    id: 7,
    name: 'Minimalist Ceramic Coffee Mug Set (4pcs)',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    originalPrice: 35.00,
    salePrice: 24.99,
    rating: 4.7,
    reviews: 189,
  },
  {
    id: 8,
    name: 'Ergonomic Mesh Office Chair',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&h=400&fit=crop',
    originalPrice: 180.00,
    salePrice: 149.99,
    rating: 4.4,
    reviews: 720,
  },
  {
    id: 9,
    name: 'Fast Charging Power Bank 20000mAh',
    // Ye link har browser mein chalta hai kyunki ye simple placeholder hai
    image: 'https://placehold.co/400x400/2563eb/white?text=Power+Bank',
    originalPrice: 55.00,
    salePrice: 38.50,
    rating: 4.8,
    reviews: 1105,
  },
  {
    id: 10,
    name: 'Smart LED Light Bulb (Compatible with Alexa)',
    // Alternative high-quality source
    image: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 25.00,
    salePrice: 15.99,
    rating: 4.6,
    reviews: 243,
  }
];

// ── Discount badge helper ──────────────────────────────────────────────
function discountPct(original, sale) {
  return Math.round(((original - sale) / original) * 100);
}

// ── Star rating renderer ───────────────────────────────────────────────
/*
 * ✅ FIX: removed Bootstrap Icons (bi bi-star-fill).
 * Uses react-icons/fa throughout — consistent with rest of project.
 */
function StarRow({ rating, reviews }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} className={styles.starFull} />);
    } else if (i - rating < 1) {
      stars.push(<FaStarHalfAlt key={i} className={styles.starHalf} />);
    } else {
      stars.push(<FaRegStar key={i} className={styles.starEmpty} />);
    }
  }
  return (
    <div className={styles.starRow}>
      <div className={styles.stars}>{stars}</div>
      <span className={styles.reviewCount}>({reviews.toLocaleString()})</span>
    </div>
  );
}

// ── Countdown timer hook ───────────────────────────────────────────────
/*
 * Sets a fixed end time 8 hours from first render.
 * Persists to sessionStorage so it doesn't reset on re-renders.
 */
function useCountdown() {
  const getEndTime = useCallback(() => {
    const saved = sessionStorage.getItem('flashSaleEnd');
    if (saved) return parseInt(saved, 10);
    const end = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
    sessionStorage.setItem('flashSaleEnd', String(end));
    return end;
  }, []);

  const [timeLeft, setTimeLeft] = useState(() => {
    const end  = getEndTime();
    const diff = Math.max(0, end - Date.now());
    return diff;
  });

  useEffect(() => {
    const tick = setInterval(() => {
      const end  = getEndTime();
      const diff = Math.max(0, end - Date.now());
      setTimeLeft(diff);
      if (diff === 0) clearInterval(tick);
    }, 1000);
    return () => clearInterval(tick);
  }, [getEndTime]);

  const totalSec = Math.floor(timeLeft / 1000);
  const hh       = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const mm       = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const ss       = String(totalSec % 60).padStart(2, '0');

  return { hh, mm, ss };
}

// ── Component ──────────────────────────────────────────────────────────
export default function FlashSaleSection() {
  /*
   * ✅ FIX: use useNavigate() instead of window.location.href
   * Keeps navigation inside React Router — no full page reload.
   */
  const navigate = useNavigate();
  const { hh, mm, ss } = useCountdown();

  const goToProducts = () => navigate('/products');

  return (
    <section className={styles.flashSaleSection}>
      <div className="container">

        {/* ── Section Header ───────────────────────────────────────── */}
        <div className={styles.sectionHeader}>

          {/* Left: badge + title + subtitle */}
          <div className={styles.sectionHeaderLeft}>
            <div className={styles.badgeRow}>
              <span className={styles.flashBadge}>
                <FaBolt className={styles.flashBadgeIcon} /> Flash Sale
              </span>
              {/* Countdown timer */}
              <div className={styles.countdown}>
                <FaClock className={styles.clockIcon} />
                <span className={styles.countdownLabel}>Ends in</span>
                <div className={styles.countdownBlocks}>
                  <span className={styles.countdownBlock}>{hh}</span>
                  <span className={styles.countdownSep}>:</span>
                  <span className={styles.countdownBlock}>{mm}</span>
                  <span className={styles.countdownSep}>:</span>
                  <span className={styles.countdownBlock}>{ss}</span>
                </div>
              </div>
            </div>

            <h2 className={styles.sectionTitle}>
              Today's <span className={styles.sectionTitleAccent}>Hot Deals</span>
            </h2>
            <p className={styles.sectionDesc}>
              Limited stock available · Up to <strong>50% Off</strong>
            </p>
          </div>

          {/* Right: View All button */}
          <button
            className={styles.viewAllBtn}
            onClick={goToProducts}
          >
            View All Deals <FaArrowRight className={styles.viewAllArrow} />
          </button>
        </div>

        {/* ── Product Grid ─────────────────────────────────────────── */}
        <div className={styles.flashSaleGrid}>
          {FLASH_SALE_PRODUCTS.map((product, index) => {
            const pct = discountPct(product.originalPrice, product.salePrice);
            return (
              <div
                key={product.id}
                className={styles.flashSaleCard}
                onClick={goToProducts}
                role="button"
                aria-label={`View ${product.name}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >

                {/* ── Discount ribbon ───────────────────────────── */}
                <div className={styles.discountRibbon}>
                  <FaFire className={styles.ribbonIcon} />
                  {pct}% OFF
                </div>

                {/* ── Product image ─────────────────────────────── */}
                <div className={styles.flashSaleImageWrap}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.flashSaleImage}
                    loading="lazy"
                  />
                  {/* Image overlay on hover */}
                  <div className={styles.imageOverlay}>
                    <span className={styles.overlayText}>View Products</span>
                  </div>
                </div>

                {/* ── Card body ─────────────────────────────────── */}
                <div className={styles.flashSaleBody}>

                  {/* Product name — 2 line clamp */}
                  <h6 className={styles.flashSaleProductName}>
                    {product.name}
                  </h6>

                  {/* Star rating */}
                  <StarRow rating={product.rating} reviews={product.reviews} />

                  {/* Price row */}
                  <div className={styles.flashSalePriceWrap}>
                    <span className={styles.flashSaleOriginalPrice}>
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className={styles.flashSaleSalePrice}>
                      ${product.salePrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Buy Now button */}
                  <button
                    className={styles.flashSaleAddBtn}
                    onClick={(e) => {
                      e.stopPropagation(); // prevent double navigate
                      goToProducts();
                    }}
                  >
                    <FaShoppingCart className={styles.btnIcon} />
                    Buy Now
                  </button>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}