// src/pages/ThankYou/ThankYou.jsx
import { useEffect, useRef }        from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  FaCheckCircle, FaHome, FaShoppingBag,
  FaEnvelope, FaTruck, FaKey,
  FaUserPlus, FaTachometerAlt,
} from 'react-icons/fa';
import { formatPrice }              from '../../utils/formatPrice';
import { toast }                    from 'react-toastify';
import styles                       from './ThankYou.module.css';

export default function ThankYou() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const guard     = useRef(false);

  /* ── Guard: no order data → redirect home ─────────────────── */
  useEffect(() => {
    if (!state?.orderNumber && !guard.current) {
      guard.current = true;
      setTimeout(() => navigate('/'), 3000);
    }
  }, [state, navigate]);

  /* ── Redirect fallback UI ──────────────────────────────────── */
  if (!state?.orderNumber) {
    return (
      <div className={styles.redirectWrap}>
        <div className="spinner-border text-primary mb-3" />
        <p className="text-muted small">No order found. Redirecting…</p>
      </div>
    );
  }

  const {
    orderNumber,
    orderTotal,
    shippingInfo,
    itemCount,
    estimatedDelivery,
    isNewAccount,
    autoPassword,
  } = state;

  const copyPassword = () => {
    navigator.clipboard.writeText(autoPassword);
    toast.success('Password copied!');
  };

  /* ── Detail tiles data ─────────────────────────────────────── */
  const details = [
    {
      icon  : <FaEnvelope  size={18} color="#2563eb" />,
      label : 'Confirmation sent to',
      value : shippingInfo.email,
    },
    {
      icon  : <FaTruck     size={18} color="#10b981" />,
      label : 'Est. Delivery',
      value : estimatedDelivery,
    },
    {
      icon  : <FaShoppingBag size={18} color="#f59e0b" />,
      label : 'Items ordered',
      value : `${itemCount} item${itemCount > 1 ? 's' : ''}`,
    },
    {
      icon  : <span style={{ fontSize: '1rem' }}>💳</span>,
      label : 'Total charged',
      value : formatPrice(orderTotal),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Animated success check ───────────────────────────── */}
        <div className={styles.checkWrap}>
          <FaCheckCircle className={styles.checkIcon} size={52} />
        </div>

        {/* ── Heading block ────────────────────────────────────── */}
        <h2 className={styles.heading}>Order Confirmed! 🎉</h2>
        <p className={styles.subheading}>
          Thank you, <strong>{shippingInfo.firstName}</strong>! Your order
          has been placed successfully.
        </p>

        {/* ── Order number badge ───────────────────────────────── */}
        <div className={styles.orderBadge}>
          <span className={styles.orderBadgeLabel}>Order&nbsp;#</span>
          <span className={styles.orderBadgeValue}>{orderNumber}</span>
        </div>

        {/* ── New account alert (guests only) ─────────────────── */}
        {isNewAccount && autoPassword && (
          <div className={styles.newAccountAlert}>
            <FaUserPlus size={18} className={styles.alertIcon} />

            <div className={styles.alertBody}>
              <p className={styles.alertTitle}>
                🎉 Account created — save your credentials!
              </p>

              <div className={styles.credRow}>
                <span className={styles.credLabel}>Email</span>
                <code className={styles.credValue}>{shippingInfo.email}</code>
              </div>

              <div className={styles.credRow}>
                <span className={styles.credLabel}>Password</span>
                <code className={styles.credValue}>{autoPassword}</code>
                <button
                  className={styles.copyBtn}
                  onClick={copyPassword}
                  title="Copy password"
                >
                  <FaKey size={10} />
                </button>
              </div>

              <p className={styles.alertFooter}>
                ⚠️ Save this password — you can change it in your dashboard.
              </p>
            </div>
          </div>
        )}

        {/* ── Details grid (2 × 2) ─────────────────────────────── */}
        <div className={styles.detailsGrid}>
          {details.map(({ icon, label, value }) => (
            <div key={label} className={styles.detailTile}>
              <span className={styles.tileIcon}>{icon}</span>
              <span className={styles.tileLabel}>{label}</span>
              <span className={styles.tileValue}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Shipping address ─────────────────────────────────── */}
        <div className={styles.addrBox}>
          <p className={styles.addrTitle}>📦 Shipping to</p>
          <p className={styles.addrBody}>
            {shippingInfo.firstName} {shippingInfo.lastName}
            &nbsp;·&nbsp;
            {shippingInfo.address}, {shippingInfo.city},&nbsp;
            {shippingInfo.state} {shippingInfo.zipCode}, {shippingInfo.country}
          </p>
        </div>

        {/* ── CTA buttons ──────────────────────────────────────── */}
        <div className={styles.ctaRow}>
          <Link to="/" className={styles.btnOutline}>
            <FaHome size={13} />
            Home
          </Link>

          <Link to="/dashboard" className={styles.btnPrimary}>
            <FaTachometerAlt size={13} />
            Dashboard
          </Link>

          <Link to="/products" className={styles.btnOutlineGreen}>
            <FaShoppingBag size={13} />
            Keep Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}