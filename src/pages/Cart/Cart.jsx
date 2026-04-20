// src/pages/Cart/Cart.jsx
import { useState }          from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import { useCart }           from '../../context/CartContext';
import CartItem              from './components/CartItem';
import OrderSummary          from './components/OrderSummary';
import EmptyCart             from './components/EmptyCart';
import CouponInput           from './components/CouponInput';
import styles                from './Cart.module.css';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();

  const [couponDiscount,  setCouponDiscount]  = useState(0);
  const [confirmingClear, setConfirmingClear] = useState(false);

  if (cartItems.length === 0) return <EmptyCart />;

  // ✅ Everyone goes to /checkout — no login check here
  const handleCheckout = () => navigate('/checkout');

  return (
    <div className={styles.page}>
      <div className="container py-4">

        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="fw-bold mb-0">Shopping Cart</h2>
            <small className="text-muted">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </small>
          </div>
        </div>

        <div className="row g-4">

          {/* Items */}
          <div className="col-lg-8">
            <div className={`card border-0 shadow-sm ${styles.cartCard}`}>
              <div className="card-header bg-white py-3 d-flex
                              justify-content-between align-items-center">
                <span className="fw-semibold">
                  <FaShoppingBag className="text-primary me-2" />
                  Your Items
                </span>
                {!confirmingClear ? (
                  <button className="btn btn-sm btn-outline-danger"
                          onClick={() => setConfirmingClear(true)}>
                    <FaTrash className="me-1" />Clear All
                  </button>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-danger fw-semibold">Sure?</small>
                    <button className="btn btn-sm btn-danger"
                            onClick={() => { clearCart(); setConfirmingClear(false); }}>
                      Yes
                    </button>
                    <button className="btn btn-sm btn-outline-secondary"
                            onClick={() => setConfirmingClear(false)}>
                      No
                    </button>
                  </div>
                )}
              </div>

              <div className="card-body p-0">
                {cartItems.map((item, idx) => (
                  <div key={item.id}>
                    <CartItem item={item} />
                    {idx < cartItems.length - 1 && <hr className="m-0" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <CouponInput onApply={setCouponDiscount} />
            </div>

            <Link to="/products" className="btn btn-outline-primary mt-3">
              <FaArrowLeft className="me-2" />Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="col-lg-4">
            <div className={styles.sticky}>
              <OrderSummary
                subtotal={totalPrice}
                couponDiscount={couponDiscount}
                onCheckout={handleCheckout}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}