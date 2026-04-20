// src/pages/ThankYou/ThankYou.jsx
import { useEffect, useRef }   from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaShoppingBag,
         FaEnvelope, FaTruck, FaKey,
         FaUserPlus, FaTachometerAlt } from 'react-icons/fa';
import { formatPrice }         from '../../utils/formatPrice';
import { toast }               from 'react-toastify';
import styles                  from './ThankYou.module.css';

export default function ThankYou() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const guard     = useRef(false);

  // Guard: no order data → redirect home
  useEffect(() => {
    if (!state?.orderNumber && !guard.current) {
      guard.current = true;
      setTimeout(() => navigate('/'), 3000);
    }
  }, [state, navigate]);

  if (!state?.orderNumber) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-muted">No order found. Redirecting…</p>
        </div>
      </div>
    );
  }

  const {
    orderNumber, orderTotal, shippingInfo,
    itemCount, estimatedDelivery,
    isNewAccount, autoPassword,    // ✅ Guest auto-registration data
  } = state;

  const copyPassword = () => {
    navigator.clipboard.writeText(autoPassword);
    toast.success('Password copied to clipboard!');
  };

  return (
    <div className={styles.page}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className={`card border-0 shadow-lg text-center ${styles.card}`}>
              <div className="card-body p-5">

                {/* Animated check */}
                <div className={styles.checkWrap}>
                  <FaCheckCircle className={styles.check} size={80} />
                </div>

                <h2 className="fw-bold mt-4 mb-2">Order Confirmed! 🎉</h2>
                <p className="text-muted mb-0">
                  Thank you, <strong>{shippingInfo.firstName}</strong>!
                  Your order has been placed successfully.
                </p>

                {/* Order ID */}
                <div className={styles.orderNum}>
                  <small className="text-muted d-block">Order Number</small>
                  <span className="fw-bold fs-5">{orderNumber}</span>
                </div>

                {/*
                 * ✅ NEW ACCOUNT ALERT
                 * Only shown to guests who were auto-registered.
                 * Displays their auto-generated password prominently.
                 */}
                {isNewAccount && autoPassword && (
                  <div className={styles.newAccountAlert}>
                    <FaUserPlus size={20} className="me-2 text-success" />
                    <div className="flex-grow-1 text-start">
                      <p className="fw-bold mb-1 small">
                        🎉 Your account has been created!
                      </p>
                      <p className="text-muted mb-2 small">
                        Use these credentials to log in and track your order:
                      </p>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-muted small">Email:</span>
                        <code className="bg-light px-2 py-1 rounded small">
                          {shippingInfo.email}
                        </code>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Password:</span>
                        <code className="bg-light px-2 py-1 rounded small">
                          {autoPassword}
                        </code>
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          onClick={copyPassword}
                          title="Copy password"
                        >
                          <FaKey size={11} />
                        </button>
                      </div>
                      <p className="text-muted mt-2 mb-0"
                         style={{ fontSize: '0.72rem' }}>
                        ⚠️ Save this password. You can change it in your dashboard.
                      </p>
                    </div>
                  </div>
                )}

                {/* Details grid */}
                <div className={styles.grid}>
                  {[
                    { icon: <FaEnvelope color="#2563eb" size={22} />, label: 'Confirmation', value: shippingInfo.email },
                    { icon: <FaTruck    color="#10b981" size={22} />, label: 'Est. Delivery', value: estimatedDelivery  },
                    { icon: <FaShoppingBag color="#f59e0b" size={22}/>, label: 'Items', value: `${itemCount} item${itemCount>1?'s':''}` },
                    { icon: <span className="fs-5">💳</span>,         label: 'Charged',  value: formatPrice(orderTotal) },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className={styles.detailCard}>
                      {icon}
                      <div className="small fw-bold mt-1">{label}</div>
                      <div className="small text-muted" style={{ wordBreak: 'break-all' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                <div className={styles.addrBox}>
                  <p className="small fw-bold mb-1">📦 Shipping to:</p>
                  <p className="small text-muted mb-0">
                    {shippingInfo.firstName} {shippingInfo.lastName}<br />
                    {shippingInfo.address}, {shippingInfo.city}<br />
                    {shippingInfo.state} {shippingInfo.zipCode}, {shippingInfo.country}
                  </p>
                </div>

                {/* CTAs */}
                <div className="d-flex gap-3 mt-4 justify-content-center flex-wrap">
                  <Link to="/" className="btn btn-outline-primary px-4 fw-semibold">
                    <FaHome className="me-2" />Home
                  </Link>
                  {/* ✅ Show dashboard link — user is now logged in */}
                  <Link to="/dashboard" className="btn btn-primary px-4 fw-semibold">
                    <FaTachometerAlt className="me-2" />View Dashboard
                  </Link>
                  <Link to="/products" className="btn btn-outline-success px-4 fw-semibold">
                    <FaShoppingBag className="me-2" />Keep Shopping
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}