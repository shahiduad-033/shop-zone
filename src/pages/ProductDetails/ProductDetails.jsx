import { useParams, useLocation,
         useNavigate, Link }        from 'react-router-dom';
import { useState, useEffect }      from 'react';
import { FaShoppingCart, FaHeart,
         FaArrowLeft, FaShare,
         FaCheck, FaShieldAlt,
         FaTruck, FaUndo }          from 'react-icons/fa';
import { useCart }                  from '../../context/CartContext';
import productService               from '../../services/productService';
import QuantityControl              from '../../components/ui/QuantityControl/QuantityControl';
import StarRating                   from '../../components/common/StarRating/StarRating';
import RelatedProducts              from './components/RelatedProducts';
import { formatPrice }              from '../../utils/formatPrice';
import { toast }                    from 'react-toastify';
import styles                       from './ProductDetails.module.css';

export default function ProductDetails() {
  const { id }      = useParams();
  const location    = useLocation();
  const navigate    = useNavigate();
  const { addToCart, increaseQuantity, decreaseQuantity,
          setQuantity, isInCart } = useCart();

  // ── State ─────────────────────────────────────────────────────────
  // Pre-populate from route state if navigated from ProductCard
  const [product,     setProduct]     = useState(location.state?.product || null);
  const [loading,     setLoading]     = useState(!location.state?.product);
  const [error,       setError]       = useState(null);
  const [qty,         setQty]         = useState(1);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('description');
  const [justAdded,   setJustAdded]   = useState(false);

  // ── Fetch fresh data (even if we have state) ───────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetch = async () => {
      try {
        setLoading(true);
        const data = await productService.getById(id);
        setProduct(data);
      } catch {
        if (!location.state?.product) setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setJustAdded(true);
    toast.success(`${qty}× "${product.title.substring(0, 28)}..." added!`);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.info('Link copied to clipboard!');
    }
  };

  // ── Render states ─────────────────────────────────────────────────
  if (loading && !product) return <SkeletonLoader />;
  if (error   && !product) return (
    <div className="container py-5 text-center">
      <p className="text-danger">{error}</p>
      <button className="btn btn-primary" onClick={() => navigate('/products')}>
        <FaArrowLeft className="me-2" />Back to Products
      </button>
    </div>
  );
  if (!product) return null;

  const { title, price, image, description,
          category, rating: { rate, count } = {} } = product;

  return (
    <div className={styles.page}>
      <div className="container py-4">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/products">Products</Link></li>
            <li className="breadcrumb-item text-capitalize">
              <Link to={`/products?category=${category}`}>{category}</Link>
            </li>
            <li className="breadcrumb-item active text-truncate"
                style={{ maxWidth: 180 }}>{title}</li>
          </ol>
        </nav>

        {/* ── Main row ──────────────────────────────────────────────── */}
        <div className="row g-5">

          {/* Image */}
          <div className="col-lg-5">
            <div className={styles.imgBox}>
              <button className={`btn ${styles.floatBtn} ${wishlisted ? styles.wishlisted : ''}`}
                      style={{ top: 14, right: 56 }}
                      onClick={() => { setWishlisted(!wishlisted); toast.info(wishlisted ? 'Removed from wishlist' : '❤️ Wishlisted!'); }}>
                <FaHeart />
              </button>
              <button className={`btn ${styles.floatBtn}`}
                      style={{ top: 14, right: 14 }}
                      onClick={handleShare}>
                <FaShare />
              </button>
              <img src={image} alt={title} className={styles.img} />
            </div>
          </div>

          {/* Info */}
          <div className="col-lg-7">
            <span className={styles.catBadge}>{category}</span>
            <h1 className={styles.title}>{title}</h1>

            <StarRating rating={rate} count={count} size={18} />

            {/* Price */}
            <div className="my-3 d-flex align-items-center gap-3">
              <span className={styles.price}>{formatPrice(price)}</span>
              <span className={styles.originalPrice}>{formatPrice(price * 1.2)}</span>
              <span className="badge bg-danger">-20%</span>
            </div>

            <p className="text-muted" style={{ fontSize: '0.92rem', lineHeight: 1.7 }}>
              {description?.substring(0, 130)}...
            </p>

            <hr />

            {/* Quantity */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="fw-semibold">Quantity:</span>
              <QuantityControl
                quantity={qty}
                onIncrease={() => setQty((q) => Math.min(q + 1, 99))}
                onDecrease={() => setQty((q) => Math.max(q - 1, 1))}
                onSet={(v) => setQty(v)}
                showTrash={false}
                size="md"
              />
            </div>

            {/* Buttons */}
            <div className="d-flex gap-3 mb-4 flex-wrap">
              <button
                className={`btn flex-grow-1 py-3 fw-bold ${
                  justAdded ? 'btn-success' : 'btn-primary'
                } ${styles.actionBtn}`}
                onClick={handleAddToCart}
              >
                {justAdded
                  ? <><FaCheck className="me-2" />Added!</>
                  : <><FaShoppingCart className="me-2" />Add to Cart</>
                }
              </button>
              <button
                className={`btn btn-warning flex-grow-1 py-3 fw-bold ${styles.actionBtn}`}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="row g-2">
              {[
                { icon: <FaTruck />,     color: '#2563eb', text: 'Free shipping over $50' },
                { icon: <FaUndo />,      color: '#10b981', text: '30-day free returns'    },
                { icon: <FaShieldAlt />, color: '#8b5cf6', text: '2-year warranty'        },
              ].map(({ icon, color, text }) => (
                <div key={text} className="col-4">
                  <div className={styles.trustBadge}>
                    <span style={{ color }}>{icon}</span>
                    <small>{text}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div className={`mt-5 ${styles.tabsWrap}`}>
          <ul className="nav nav-tabs border-0">
            {['description', 'details', 'reviews'].map((tab) => (
              <li key={tab} className="nav-item">
                <button
                  className={`nav-link text-capitalize fw-semibold
                    ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
          <div className="p-4 bg-white border border-top-0 rounded-bottom">
            {activeTab === 'description' && <p className="lh-lg mb-0">{description}</p>}
            {activeTab === 'details' && (
              <table className="table table-bordered mb-0">
                <tbody>
                  {[
                    ['Category', category],
                    ['Rating', `${rate} / 5`],
                    ['Reviews', count],
                    ['Price', formatPrice(price)],
                    ['SKU', `SKU-${String(id).padStart(6, '0')}`],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="fw-semibold text-muted w-25">{k}</td>
                      <td className="text-capitalize">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === 'reviews' && (
              <div className="text-center py-3 text-muted">
                <StarRating rating={rate} count={count} size={20} />
                <p className="mt-2">Based on {count} customer reviews.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        <RelatedProducts category={category} currentId={Number(id)} />

      </div>
    </div>
  );
}

function SkeletonLoader() {
  const s = {
    background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 8,
  };
  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-lg-5"><div style={{ ...s, height: 400 }} /></div>
        <div className="col-lg-7">
          {[30, 90, 70, 50, 40, 100, 100].map((w, i) => (
            <div key={i} style={{ ...s, height: i === 0 ? 14 : i === 1 ? 30 : 14,
              width: `${w}%`, marginBottom: 14 }} />
          ))}
          <div style={{ ...s, height: 50, width: '100%', marginTop: 30 }} />
        </div>
      </div>
    </div>
  );
}