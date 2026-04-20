// src/pages/Dashboard/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth }     from '../../context/AuthContext';
import { useCart }     from '../../context/CartContext';
import { Link }        from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import orderService    from '../../services/orderService';
import OrderHistory    from './components/OrderHistory';
import ProfileSettings from './components/ProfileSettings';
import {
  FaUser, FaBox, FaHeart,
  FaCog, FaShoppingBag,
  FaSync, FaDollarSign,
} from 'react-icons/fa';
import styles from './Dashboard.module.css';

const TABS = [
  { id: 'orders',   label: 'My Orders',  icon: <FaBox />        },
  { id: 'profile',  label: 'Profile',    icon: <FaUser />       },
  { id: 'wishlist', label: 'Wishlist',   icon: <FaHeart />      },
  { id: 'settings', label: 'Settings',   icon: <FaCog />        },
];

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const { totalItems }               = useCart();

  const [activeTab, setActiveTab] = useState('orders');

  /*
   * ✅ REAL-TIME ORDER STATE
   *
   * orders   → fetched from localStorage via orderService
   * stats    → aggregated from orders (totals, counts)
   * loading  → shown during initial fetch
   * lastSync → timestamp of last refresh
   */
  const [orders,   setOrders]   = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [lastSync, setLastSync] = useState(null);

  // ── Fetch orders from localStorage ──────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    // Simulate async data fetch (replace with API call in production)
    await new Promise((r) => setTimeout(r, 400));

    /*
     * ✅ Pull REAL orders from localStorage.
     * Matches by userId OR email to handle guest→member transitions.
     */
    const userOrders = orderService.getUserOrders(user.id, user.email);
    const userStats  = orderService.getUserStats(user.id, user.email);

    setOrders(userOrders);
    setStats(userStats);
    setLastSync(new Date());
    setLoading(false);
  }, [user]);

  // Fetch on mount and whenever user changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Stats cards config ───────────────────────────────────────────
  const statCards = stats ? [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon:  <FaBox />,
      color: '#2563eb',
      bg:    '#eff6ff',
    },
    {
      label: 'Total Spent',
      value: formatPrice(stats.totalSpent),
      icon:  <FaDollarSign />,
      color: '#10b981',
      bg:    '#ecfdf5',
    },
    {
      label: 'Items Purchased',
      value: stats.totalItems,
      icon:  <FaShoppingBag />,
      color: '#f59e0b',
      bg:    '#fffbeb',
    },
    {
      label: 'Cart Items',
      value: totalItems,
      icon:  <FaShoppingBag />,
      color: '#8b5cf6',
      bg:    '#f5f3ff',
    },
  ] : [];

  return (
    <div className={styles.page}>
      <div className="container py-4">

        {/* ── Welcome banner ──────────────────────────────────────── */}
        <div className={`${styles.banner} mb-4`}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              {/* Avatar */}
              <div className={styles.avatar}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-white">
                  Hello, {user?.name?.split(' ')[0] || 'User'}! 👋
                </h4>
                <p className="mb-0 small text-white-50">
                  {user?.email}
                  {user?.isGuest && (
                    <span className="badge bg-warning text-dark ms-2">
                      Guest Account
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Sync button */}
            <button
              className="btn btn-sm btn-outline-light d-flex align-items-center gap-2"
              onClick={fetchOrders}
              disabled={loading}
            >
              <FaSync className={loading ? styles.spinning : ''} />
              {loading ? 'Syncing…' : 'Refresh'}
            </button>
          </div>

          {/* Last sync timestamp */}
          {lastSync && (
            <p className="text-white-50 mb-0 mt-2"
               style={{ fontSize: '0.75rem' }}>
              Last updated: {lastSync.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* ── Stats cards ─────────────────────────────────────────── */}
        {!loading && stats && (
          <div className="row g-3 mb-4">
            {statCards.map(({ label, value, icon, color, bg }) => (
              <div key={label} className="col-md-3 col-6">
                <div
                  className={`card border-0 shadow-sm p-3 ${styles.statCard}`}
                  style={{ background: bg }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center
                                 justify-content-center"
                      style={{
                        background: color, color: 'white',
                        width: 44, height: 44, fontSize: '1.1rem',
                      }}
                    >
                      {icon}
                    </div>
                    <div>
                      <div className="fw-bold fs-5">{value}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Guest upgrade prompt ─────────────────────────────────── */}
        {user?.isGuest && (
          <div className="alert alert-warning d-flex align-items-center gap-3 mb-4">
            <FaUser size={20} />
            <div>
              <strong>Complete your profile!</strong>
              {' '}Update your password and details in the Profile tab to secure your account.
            </div>
            <button
              className="btn btn-sm btn-warning ms-auto text-nowrap"
              onClick={() => setActiveTab('profile')}
            >
              Complete Profile
            </button>
          </div>
        )}

        <div className="row g-4">

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="col-lg-3">
            <div className={`card border-0 shadow-sm ${styles.sidebar}`}>
              <div className="card-body p-2">
                {TABS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    className={`
                      btn w-100 text-start d-flex align-items-center
                      gap-2 mb-1 px-3 py-2 ${styles.tabBtn}
                      ${activeTab === id ? styles.tabBtnActive : ''}
                    `}
                    onClick={() => setActiveTab(id)}
                  >
                    {icon}
                    <span>{label}</span>
                    {id === 'orders' && stats?.totalOrders > 0 && (
                      <span className="badge bg-primary ms-auto">
                        {stats.totalOrders}
                      </span>
                    )}
                  </button>
                ))}
                <hr />
                <Link to="/products" className="btn btn-outline-primary w-100 btn-sm mb-2">
                  Browse Products
                </Link>
                <button className="btn btn-outline-danger w-100 btn-sm" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* ── Tab content ─────────────────────────────────────────── */}
          <div className="col-lg-9">
            {activeTab === 'orders' && (
              <OrderHistory
                orders={orders}
                loading={loading}
                onRefresh={fetchOrders}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileSettings
                user={user}
                onUpdate={updateUser}
              />
            )}
            {activeTab === 'wishlist' && <WishlistPlaceholder />}
            {activeTab === 'settings' && <SettingsPlaceholder />}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Placeholder tabs ──────────────────────────────────────────────────
function WishlistPlaceholder() {
  return (
    <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: 14 }}>
      <div className="fs-1 mb-3">❤️</div>
      <h5 className="fw-bold">Your Wishlist is Empty</h5>
      <p className="text-muted">Save items you love for later.</p>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 14 }}>
      <h5 className="fw-bold mb-4">⚙️ Account Settings</h5>
      {['Email Notifications','SMS Alerts','Two-Factor Auth'].map((s) => (
        <div key={s} className="d-flex justify-content-between align-items-center
                                p-3 bg-light rounded-3 mb-2">
          <span className="fw-semibold small">{s}</span>
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" defaultChecked />
          </div>
        </div>
      ))}
    </div>
  );
}