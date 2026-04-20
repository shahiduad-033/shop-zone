// src/pages/Home/components/HeroBanner.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link }                             from 'react-router-dom';
import styles                               from '../Home.module.css';

const SLIDES = [
  {
    id:       1,
    tag:      'Best Sellers',
    headline: 'SMART ACCESSORIES',
    subline:  'SAVE ON ELECTRONIC ITEMS',
    offer:    'Up to 60% Off',
    gradient: 'linear-gradient(135deg, #4a1080 0%, #9b23c8 50%, #c026d3 100%)',
    accent:   '#f0abfc',
    products: [
      { emoji: '📷', name: 'Camera',      price: '$299', glow: '#fde68a' },
      { emoji: '⌚', name: 'Smart Watch',  price: '$129', glow: '#a5f3fc' },
      { emoji: '🎮', name: 'Controller',  price: '$59',  glow: '#fbcfe8' },
    ],
  },
  {
    id:       2,
    tag:      'Flash Sale',
    headline: 'HOME & LIFESTYLE',
    subline:  'PREMIUM PICKS FOR YOUR SPACE',
    offer:    'Up to 50% Off',
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)',
    accent:   '#bae6fd',
    products: [
      { emoji: '🛋️', name: 'Sofa',       price: '$499', glow: '#fde68a' },
      { emoji: '💡', name: 'Smart Lamp',  price: '$39',  glow: '#bbf7d0' },
      { emoji: '🪴', name: 'Plant Pot',   price: '$19',  glow: '#fbcfe8' },
    ],
  },
  {
    id:       3,
    tag:      'New Arrivals',
    headline: 'FASHION & STYLE',
    subline:  'TRENDING LOOKS THIS SEASON',
    offer:    'Up to 70% Off',
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f97316 100%)',
    accent:   '#fed7aa',
    products: [
      { emoji: '👟', name: 'Sneakers',    price: '$89',  glow: '#fde68a' },
      { emoji: '👜', name: 'Handbag',     price: '$149', glow: '#f5d0fe' },
      { emoji: '🕶️', name: 'Sunglasses', price: '$49',  glow: '#a5f3fc' },
    ],
  },
];

const AUTOPLAY_MS = 4000;

export default function HeroBanner() {
  const [current,   setCurrent]   = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused,    setPaused]    = useState(false);

  const total = SLIDES.length;

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 500);
  }, [animating]);

  const goNext = useCallback(() => goTo((current + 1) % total), [current, goTo, total]);
  const goPrev = useCallback(() => goTo((current - 1 + total) % total), [current, goTo, total]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [goNext, paused]);

  const slide = SLIDES[current];

  return (
    <section className={styles.hero}>
      <div className="container-fluid px-0">
        <div className="row g-0 align-items-stretch" style={{ minHeight: '520px' }}>

          {/* ── LEFT: Full-width Daraz Slider ──────────────────────── */}
          <div
            className={`col-lg-12 ${styles.sliderCol}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className={styles.slideTrack}
              style={{ background: slide.gradient }}
            >
              <Link to="/products" className={styles.fullSlideLink} aria-label="View Products" />

              <span className={styles.bgCircle1} />
              <span className={styles.bgCircle2} />
              <span className={styles.bgCircle3} />

              <div className={`${styles.slideContent} ${animating ? styles.slideEnter : ''}`}>
                <span
                  className={styles.slideTag}
                  style={{ color: slide.accent, borderColor: slide.accent }}
                >
                  🔥 {slide.tag}
                </span>

                <h2 className={styles.slideHeadline}>
                  {slide.headline}
                </h2>

                <p className={styles.slideSubline} style={{ color: slide.accent }}>
                  {slide.subline}
                </p>

                <div className={styles.slideOffer}>
                  {slide.offer}
                </div>

                <div className={styles.slideProductRow}>
                  {slide.products.map((p, i) => (
                    <div
                      key={i}
                      className={styles.slideProductCard}
                      style={{ animationDelay: `${i * 0.12}s`, '--glow': p.glow }}
                    >
                      <span
                        className={styles.slideProductEmoji}
                        style={{ filter: `drop-shadow(0 0 10px ${p.glow})` }}
                      >
                        {p.emoji}
                      </span>
                      <span className={styles.slideProductName}>{p.name}</span>
                      <span className={styles.slideProductPrice}>{p.price}</span>
                    </div>
                  ))}
                </div>

                <Link to="/products" className={`btn btn-lg fw-bold px-5 mt-2 ${styles.slideBtn}`}>
                  Shop Now →
                </Link>
              </div>

              <button
                className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
                onClick={goPrev}
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
                onClick={goNext}
                aria-label="Next slide"
              >
                ›
              </button>

              <div className={styles.sliderDots}>
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {!paused && (
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    key={current}
                    style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/*
           * ── RIGHT: Cart Icon + Stats ────────────────────────────────
           *
           * ✅ THE ONE JSX CHANGE:
           *
           * BEFORE:
           *   className="position-absolute d-flex..."
           *   style={{ right: '10%', top: '50%', transform: '...', width: '30%' }}
           *
           * AFTER:
           *   className={styles.heroRightPanel}
           *   (NO inline style)
           *
           * The desktop positioning (right: 10%, absolute) is now
           * defined in .heroRightPanel in CSS — identical visual result.
           * But now media queries CAN override it on mobile/tablet
           * because CSS classes lose to inline styles but
           * CSS classes CAN override other CSS classes.
           *
           * Everything INSIDE this div is 100% untouched.
           */}
          <div className={styles.heroRightPanel}>

            {/* ✅ PRESERVED — animated cart icon + glow wrap */}
            <div className={styles.heroImageWrap}>
              <div className={styles.heroImage}>🛒</div>

              <span className={`${styles.floatBadge} ${styles.floatBadge1}`}>
                🔥 Hot Deal
              </span>
              <span className={`${styles.floatBadge} ${styles.floatBadge2}`}>
                ✅ Verified
              </span>
              <span className={`${styles.floatBadge} ${styles.floatBadge3}`}>
                🚚 Free Ship
              </span>
            </div>

            {/* ✅ PRESERVED — Quick stats row */}
            <div className={`d-flex gap-4 mt-5 ${styles.statsRow}`}>
              {[
                { number: '10K+', label: 'Products'  },
                { number: '50K+', label: 'Customers' },
                { number: '4.9★', label: 'Rating'    },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="fs-4 fw-bold text-warning">{stat.number}</div>
                  <small className="text-white-50">{stat.label}</small>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}