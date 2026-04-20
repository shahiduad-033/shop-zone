// src/pages/Dashboard/components/OrderHistory.jsx
import { useState, useCallback }  from 'react';
import { formatPrice }            from '../../../utils/formatPrice';
import orderService               from '../../../services/orderService';
import {
  FaSync, FaBox, FaChevronDown,
  FaChevronUp, FaTimes, FaMapMarkerAlt,
  FaCreditCard,
} from 'react-icons/fa';
import styles from './OrderHistory.module.css';

const STATUS_CONFIG = {
  processing: { color: 'warning',   label: '⏳ Processing' },
  shipped:    { color: 'primary',   label: '🚚 Shipped'    },
  delivered:  { color: 'success',   label: '✅ Delivered'  },
  cancelled:  { color: 'danger',    label: '❌ Cancelled'  },
  pending:    { color: 'secondary', label: '🕐 Pending'    },
};

/*
 * Orders that can be cancelled (business rule):
 * Only 'processing' and 'pending' orders can be cancelled.
 * Shipped/delivered orders cannot be recalled.
 */
const CANCELLABLE_STATUSES = ['processing', 'pending'];

/*
 * Props:
 *   orders    → array from orderService.getUserOrders()
 *   loading   → boolean
 *   onRefresh → callback to re-fetch orders from Dashboard
 */
export default function OrderHistory({ orders, loading, onRefresh }) {
  const [expanded,   setExpanded]   = useState(null);  // order id being expanded
  const [cancelling, setCancelling] = useState(null);  // order id being cancelled
  const [localOrders, setLocalOrders] = useState(null); // override for instant UI update

  /*
   * ✅ ORDER CANCELLATION LOGIC
   *
   * Flow:
   *  1. User clicks "Cancel Order"
   *  2. We set cancelling = order.id (shows spinner on that button)
   *  3. Call orderService.updateOrderStatus(orderId, 'cancelled')
   *     → writes to localStorage immediately
   *  4. Update local state optimistically so UI reflects instantly
   *     without waiting for parent to re-fetch
   *  5. Call onRefresh() to sync parent Dashboard state too
   *
   * Why localOrders?
   *  Dashboard passes `orders` as a prop — we can't mutate it directly.
   *  localOrders shadows the prop after cancellation so the UI
   *  updates immediately (optimistic update) before the parent re-renders.
   */
  const handleCancel = useCallback(async (orderId, e) => {
    e.stopPropagation(); // prevent expanding/collapsing the row

    setCancelling(orderId);

    try {
      // Simulate brief processing delay
      await new Promise((r) => setTimeout(r, 600));

      // ✅ Write to localStorage via orderService
      orderService.updateOrderStatus(orderId, 'cancelled');

      // ✅ Optimistic local update — instant UI feedback
      const baseOrders = localOrders || orders;
      setLocalOrders(
        baseOrders.map((o) =>
          o.id === orderId
            ? { ...o, status: 'cancelled', updatedAt: new Date().toISOString() }
            : o
        )
      );

      // ✅ Sync parent Dashboard state (re-fetches from localStorage)
      onRefresh();

    } catch (err) {
      console.error('[OrderHistory] cancel failed:', err);
    } finally {
      setCancelling(null);
    }
  }, [orders, localOrders, onRefresh]);

  // Use local override if available (post-cancellation), else use prop
  const displayOrders = localOrders || orders;

  if (loading) {
    return (
      <div className="card border-0 shadow-sm p-5 text-center"
           style={{ borderRadius: 14 }}>
        <div className="spinner-border text-primary mx-auto mb-3" />
        <p className="text-muted mb-0">Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="card-header bg-white py-3 d-flex
                      justify-content-between align-items-center"
           style={{ borderRadius: '14px 14px 0 0' }}>
        <h5 className="mb-0 fw-bold">
          <FaBox className="me-2 text-primary" />
          My Orders
          {displayOrders.length > 0 && (
            <span className="badge bg-primary ms-2">{displayOrders.length}</span>
          )}
        </h5>
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          onClick={onRefresh}
        >
          <FaSync size={12} /> Refresh
        </button>
      </div>

      <div className="card-body p-0">

        {/* ── Empty state ──────────────────────────────────────────── */}
        {displayOrders.length === 0 ? (
          <div className="text-center py-5 px-4">
            <div className="fs-1 mb-3">📦</div>
            <h5 className="fw-bold">No orders yet</h5>
            <p className="text-muted">
              Your order history will appear here after your first purchase.
            </p>
          </div>
        ) : (
          displayOrders.map((order) => {
            const cfg        = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isOpen     = expanded === order.id;
            const isCancellable = CANCELLABLE_STATUSES.includes(order.status);
            const isCancelling  = cancelling === order.id;

            return (
              <div key={order.id} className={styles.orderRow}>

                {/* ── Order summary row ─────────────────────────── */}
                <div
                  className={`d-flex align-items-center gap-3 p-3
                              flex-wrap ${styles.orderHeader}`}
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  role="button"
                  aria-expanded={isOpen}
                >
                  {/* Order ID + date */}
                  <div className="flex-grow-1 min-width-0">
                    <div className="fw-bold small">{order.id}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Item count */}
                  <div className="text-center d-none d-md-block">
                    <div className="fw-semibold small">{order.itemCount}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>items</div>
                  </div>

                  {/* Grand total */}
                  <div className="text-end">
                    <div className="fw-bold text-primary">
                      {formatPrice(order.grandTotal)}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      incl. tax & shipping
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`badge bg-${cfg.color}`}>
                    {cfg.label}
                  </span>

                  {/*
                   * ✅ CANCEL BUTTON
                   * Only shown for cancellable statuses (processing / pending)
                   * Stops click propagation so it doesn't toggle expand
                   */}
                  {isCancellable && (
                    <button
                      className={`btn btn-sm btn-outline-danger d-flex
                                  align-items-center gap-1 ${styles.cancelBtn}`}
                      onClick={(e) => handleCancel(order.id, e)}
                      disabled={isCancelling}
                      title="Cancel this order"
                    >
                      {isCancelling ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <><FaTimes size={11} /> Cancel</>
                      )}
                    </button>
                  )}

                  {/* Expand toggle */}
                  <span className="text-muted ms-1">
                    {isOpen
                      ? <FaChevronUp size={13} />
                      : <FaChevronDown size={13} />
                    }
                  </span>
                </div>

                {/* ── Expanded order detail ─────────────────────── */}
                {isOpen && (
                  <div className={styles.orderDetail}>

                    {/* Items list */}
                    <div className="p-3 pt-0">
                      <h6 className="fw-bold small text-muted mb-3 text-uppercase">
                        Items Ordered
                      </h6>
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className={`d-flex align-items-center gap-3
                                      mb-2 ${styles.orderItem}`}
                        >
                          <div className={styles.itemThumb}>
                            <img src={item.image} alt={item.title} />
                          </div>
                          <div className="flex-grow-1">
                            <div className="small fw-semibold lh-sm">
                              {item.title.substring(0, 50)}…
                            </div>
                            <div className="text-muted"
                                 style={{ fontSize: '0.75rem' }}>
                              {item.quantity} × {formatPrice(item.price)}
                            </div>
                          </div>
                          <div className="fw-bold small text-nowrap">
                            {formatPrice(item.subtotal)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price breakdown + shipping + payment */}
                    <div className={`p-3 border-top ${styles.orderFooter}`}>
                      <div className="row g-3">

                        {/* Financials */}
                        <div className="col-md-4">
                          <h6 className="fw-bold small text-muted mb-2 text-uppercase">
                            Payment Breakdown
                          </h6>
                          {[
                            ['Subtotal', formatPrice(order.subtotal)],
                            ['Shipping', order.isFreeShipping ? 'FREE' : formatPrice(order.shippingCost)],
                            ['Tax',      formatPrice(order.tax)],
                          ].map(([k, v]) => (
                            <div key={k} className="d-flex justify-content-between small mb-1">
                              <span className="text-muted">{k}</span>
                              <span className="fw-semibold">{v}</span>
                            </div>
                          ))}
                          <div className="d-flex justify-content-between fw-bold
                                          pt-2 mt-1 border-top">
                            <span>Total</span>
                            <span className="text-primary">
                              {formatPrice(order.grandTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Shipping address */}
                        <div className="col-md-4">
                          <h6 className="fw-bold small text-muted mb-2 text-uppercase">
                            <FaMapMarkerAlt className="me-1" />
                            Shipping To
                          </h6>
                          <div className="small text-muted lh-lg">
                            {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}<br />
                            {order.shippingInfo?.address}<br />
                            {order.shippingInfo?.city}, {order.shippingInfo?.state}{' '}
                            {order.shippingInfo?.zipCode}<br />
                            <strong>Est. delivery:</strong> {order.estimatedDelivery}
                          </div>
                        </div>

                        {/* ✅ Payment method display */}
                        <div className="col-md-4">
                          <h6 className="fw-bold small text-muted mb-2 text-uppercase">
                            <FaCreditCard className="me-1" />
                            Payment Method
                          </h6>
                          <span className={`badge ${styles.payMethodBadge}`}>
                            {order.paymentMethod === 'card'   && '💳 Credit / Debit Card'}
                            {order.paymentMethod === 'paypal' && '🅿️ PayPal / Wallet'}
                            {order.paymentMethod === 'bank'   && '🏦 Bank Transfer'}
                            {order.paymentMethod === 'cod'    && '💵 Cash on Delivery'}
                            {!order.paymentMethod             && '—'}
                          </span>

                          {/* Cancellation notice */}
                          {order.status === 'cancelled' && (
                            <div className="alert alert-danger py-1 px-2 mt-2 small mb-0">
                              ❌ This order was cancelled.
                              {order.updatedAt && (
                                <span className="d-block text-muted mt-1"
                                      style={{ fontSize: '0.7rem' }}>
                                  on {new Date(order.updatedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}

      </div>
    </div>
  );
}