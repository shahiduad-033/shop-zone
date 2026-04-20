// src/pages/Checkout/Checkout.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate }                       from 'react-router-dom';
import { useCart }                           from '../../context/CartContext';
import { useAuth }                           from '../../context/AuthContext';
import orderService                          from '../../services/orderService';
import { formatPrice }                       from '../../utils/formatPrice';
import {
  FaLock, FaMapMarkerAlt, FaEdit,
  FaCreditCard, FaUserPlus,
  FaSignInAlt, FaInfoCircle,
  FaMoneyBillWave, FaUniversity,
  FaPaypal, FaCheckCircle,
  FaShieldAlt, FaClock, FaTimes,
} from 'react-icons/fa';
import styles from './Checkout.module.css';

// ── Constants ──────────────────────────────────────────────────────────
const TAX     = 0.08;
const SHIP    = 9.99;
const FREE_AT = 50;
const round   = (n) => Math.round(n * 100) / 100;

// ── Payment method definitions ─────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id:          'card',
    label:       'Credit / Debit Card',
    icon:        FaCreditCard,
    description: 'Visa, Mastercard, Amex',
    badge:       null,
    badgeColor:  null,
    bullet:      'Your details are encrypted end-to-end',
  },
  {
    id:          'paypal',
    label:       'PayPal / Wallet',
    icon:        FaPaypal,
    description: 'Fast & secure digital payment',
    badge:       'Popular',
    badgeColor:  'primary',
    bullet:      'Redirected to PayPal after placing order',
  },
  {
    id:          'bank',
    label:       'Bank Transfer',
    icon:        FaUniversity,
    description: 'Direct deposit to our account',
    badge:       null,
    badgeColor:  null,
    bullet:      'Order activates within 3–5 business days',
  },
  {
    id:          'cod',
    label:       'Cash on Delivery',
    icon:        FaMoneyBillWave,
    description: 'Pay when your order arrives',
    badge:       'No Fees',
    badgeColor:  'success',
    bullet:      'Have exact change ready at delivery',
  },
];

// ── Country list ───────────────────────────────────────────────────────
const COUNTRIES = [
  { v: 'PK', l: '🇵🇰 Pakistan'             },
  { v: 'CA', l: '🇨🇦 Canada'               },
  { v: 'GB', l: '🇬🇧 United Kingdom'       },
  { v: 'AU', l: '🇦🇺 Australia'            },
  { v: 'US', l: '🇺🇸 United States'        },
  { v: 'IN', l: '🇮🇳 India'                },
  { v: 'DE', l: '🇩🇪 Germany'              },
  { v: 'FR', l: '🇫🇷 France'               },
  { v: 'IT', l: '🇮🇹 Italy'                },
  { v: 'ES', l: '🇪🇸 Spain'                },
  { v: 'BR', l: '🇧🇷 Brazil'               },
  { v: 'RU', l: '🇷🇺 Russia'               },
  { v: 'JP', l: '🇯🇵 Japan'                },
  { v: 'KR', l: '🇰🇷 South Korea'          },
  { v: 'CN', l: '🇨🇳 China'                },
  { v: 'SA', l: '🇸🇦 Saudi Arabia'         },
  { v: 'AE', l: '🇦🇪 United Arab Emirates' },
];

// ── Helper: extract structured address from user.address ───────────────
function extractAddress(user) {
  if (!user) return { address: '', city: '', state: '', zipCode: '', country: 'PK' };

  if (typeof user.address === 'object' && user.address !== null) {
    return {
      address: user.address.street  || '',
      city:    user.address.city    || '',
      state:   user.address.state   || '',
      zipCode: user.address.zipCode || '',
      country: user.address.country || 'PK',
    };
  }

  return {
    address: user.address || '',
    city:    '',
    state:   '',
    zipCode: '',
    country: 'PK',
  };
}

// ─────────────────────────────────────────────────────────────────────
// ✅ FIX #1: F (FormField) is defined at MODULE LEVEL — outside Checkout.
//
// WHY THIS FIXES THE BUG:
//   Before: const F = () => ... was inside Checkout(), so React got a
//   brand-new component type on every render → unmount + remount → lost focus.
//
//   Now: F is a stable reference that never changes between renders.
//   React correctly reuses the existing DOM input and focus is preserved.
// ─────────────────────────────────────────────────────────────────────
function F({ label, name, type = 'text', value, onChange, ph, half, opts, errors, req = true }) {
  return (
    <div className={half ? 'col-md-6' : 'col-12'}>
      <label className="form-label small fw-semibold">
        {label} {req && <span className="text-danger">*</span>}
      </label>

      {opts ? (
        <select
          name={name}
          className={`form-select ${errors[name] ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
        >
          {opts.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
          placeholder={ph}
          value={value}
          onChange={onChange}
        />
      )}

      {errors[name] && (
        <div className="invalid-feedback">{errors[name]}</div>
      )}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart }          = useCart();
  const { user, isAuthenticated, register, login, updateUser } = useAuth();

  const [step,         setStep]         = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors,       setErrors]       = useState({});

  const [authMode, setAuthMode] = useState(
    isAuthenticated ? 'existing' : 'guest'
  );

  const [paymentMethod, setPaymentMethod] = useState('card');

  const [ship, setShip] = useState(() => {
    const addr = extractAddress(user);
    return {
      firstName: user?.name?.split(' ')[0]                || '',
      lastName:  user?.name?.split(' ').slice(1).join(' ') || '',
      email:     user?.email   || '',
      phone:     user?.phone   || '',
      address:   addr.address,
      city:      addr.city,
      state:     addr.state,
      zipCode:   addr.zipCode,
      country:   addr.country,
    };
  });

  const [editAddress, setEditAddress] = useState(false);

  const [pay, setPay] = useState({
    cardName: '', cardNumber: '', expiry: '', cvv: '',
  });

  const [autoPassword, setAutoPassword] = useState('');

  useEffect(() => {
    const pwd = `Guest@${Math.random().toString(36).slice(2, 8)}`;
    setAutoPassword(pwd);
  }, []);

  // ── Price calculations ─────────────────────────────────────────────
  const shipping   = totalPrice >= FREE_AT ? 0 : SHIP;
  const tax        = round(totalPrice * TAX);
  const grandTotal = round(totalPrice + shipping + tax);

  // ── Field handlers ─────────────────────────────────────────────────
  const onShipChange = useCallback((e) => {
    const { name, value } = e.target;
    setShip((p) => ({ ...p, [name]: value }));
    setErrors((p) => (p[name] ? { ...p, [name]: '' } : p));
  }, []);

  const onPayChange = useCallback((e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber')
      value = value.replace(/\D/g, '').slice(0, 16)
                   .replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiry')
      value = value.replace(/\D/g, '').slice(0, 4)
                   .replace(/(\d{2})(\d)/, '$1/$2');
    if (name === 'cvv')
      value = value.replace(/\D/g, '').slice(0, 4);
    setPay((p) => ({ ...p, [name]: value }));
    setErrors((p) => (p[name] ? { ...p, [name]: '' } : p));
  }, []);

  // ── Validation ─────────────────────────────────────────────────────
  const validateStep1 = () => {
    const req  = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    const errs = {};
    req.forEach((f) => { if (!ship[f].trim()) errs[f] = 'This field is required'; });
    if (ship.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ship.email))
      errs.email = 'Please enter a valid email';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const validateStep2 = () => {
    const errs = {};
    if (paymentMethod === 'card') {
      if (!pay.cardName.trim())
        errs.cardName = 'Required';
      if (pay.cardNumber.replace(/\s/g, '').length < 16)
        errs.cardNumber = 'Enter 16-digit number';
      if (pay.expiry.length < 5)
        errs.expiry = 'Enter MM/YY';
      if (pay.cvv.length < 3)
        errs.cvv = 'Enter 3-4 digits';
    }
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  // ── Handle place order ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await new Promise((r) => setTimeout(r, 1800));

      let currentUser = user;

      if (!isAuthenticated && authMode === 'guest') {
        const { user: newUser } = register({
          name:     `${ship.firstName} ${ship.lastName}`,
          email:    ship.email,
          password: autoPassword,
          phone:    ship.phone,
          address: {
            street:  ship.address,
            city:    ship.city,
            state:   ship.state,
            zipCode: ship.zipCode,
            country: ship.country,
          },
          isGuest: true,
        });
        currentUser = newUser;
      }

      if (isAuthenticated && editAddress) {
        updateUser({
          address: {
            street:  ship.address,
            city:    ship.city,
            state:   ship.state,
            zipCode: ship.zipCode,
            country: ship.country,
          },
        });
      }

      const isFreeShipping = shipping === 0;

      const savedOrder = orderService.createOrder({
        userId:       currentUser?.id    || 'guest',
        userEmail:    currentUser?.email || ship.email,
        userName:     currentUser?.name  || `${ship.firstName} ${ship.lastName}`,
        items: cartItems.map((item) => ({
          id:       item.id,
          title:    item.title,
          price:    item.price,
          image:    item.image,
          quantity: item.quantity,
          category: item.category,
          subtotal: round(item.price * item.quantity),
        })),
        itemCount:         cartItems.length,
        shippingInfo:      ship,
        isFreeShipping,
        subtotal:          totalPrice,
        shippingCost:      shipping,
        tax,
        grandTotal,
        paymentMethod,
        estimatedDelivery: orderService.getEstimatedDelivery(isFreeShipping),
      });

      clearCart();

      navigate('/thank-you', {
        state: {
          orderNumber:       savedOrder.id,
          orderTotal:        grandTotal,
          shippingInfo:      ship,
          itemCount:         cartItems.length,
          estimatedDelivery: savedOrder.estimatedDelivery,
          paymentMethod,
          isNewAccount:      !isAuthenticated && authMode === 'guest',
          autoPassword:      !isAuthenticated ? autoPassword : null,
        },
        replace: true,
      });

    } catch (err) {
      console.error('[checkout] order failed:', err);
      setErrors({ submit: 'Payment failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // ✅ FIX #2: useCallback stabilises onSuccess so InlineLogin does
  //    not receive a new prop reference on every Checkout re-render.
  // ─────────────────────────────────────────────────────────────────
  const handleLoginSuccess = useCallback((u, t) => {
    login(u, t);
    setAuthMode('existing');
    const addr = extractAddress(u);
    setShip((prev) => ({
      ...prev,
      firstName: u.name?.split(' ')[0]                || prev.firstName,
      lastName:  u.name?.split(' ').slice(1).join(' ') || prev.lastName,
      email:     u.email   || prev.email,
      phone:     u.phone   || prev.phone,
      address:   addr.address || prev.address,
      city:      addr.city    || prev.city,
      state:     addr.state   || prev.state,
      zipCode:   addr.zipCode || prev.zipCode,
      country:   addr.country || prev.country,
    }));
  }, [login]);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className="container py-4">

        <h2 className="fw-bold mb-1">Checkout</h2>
        <p className="text-muted small mb-4">
          <FaLock className="me-1" />Secure, encrypted checkout
        </p>

        {/* ── Step indicator ───────────────────────────────────────── */}
        <div className={styles.steps}>
          {[
            { n: 1, label: 'Your Info' },
            { n: 2, label: 'Payment'   },
          ].map(({ n, label }) => (
            <div key={n} className={`${styles.step} ${step >= n ? styles.stepOn : ''}`}>
              <div className={styles.circle}>{step > n ? '✓' : n}</div>
              <span className="small fw-semibold">{label}</span>
              {n < 2 && (
                <div className={`${styles.line} ${step > n ? styles.lineOn : ''}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4 mt-1">

            {/* ── LEFT — Form ──────────────────────────────────────── */}
            <div className="col-lg-7">

              {/* ══════════════════════════════════════════════════════
                  STEP 1 : Contact & Shipping Info
              ══════════════════════════════════════════════════════ */}
              {step === 1 && (
                <div className={`card border-0 shadow-sm ${styles.formCard}`}>
                  <div className="card-header bg-white py-3 fw-bold">
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    Contact & Shipping
                  </div>
                  <div className="card-body">

                    {/* Auth mode selector — guests only */}
                    {!isAuthenticated && (
                      <div className={`mb-4 ${styles.authModeBox}`}>
                        <p className="fw-semibold small mb-2">
                          <FaInfoCircle className="text-primary me-2" />
                          How would you like to proceed?
                        </p>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className={`btn btn-sm flex-grow-1 ${
                              authMode === 'guest'
                                ? 'btn-primary'
                                : 'btn-outline-secondary'
                            }`}
                            onClick={() => setAuthMode('guest')}
                          >
                            <FaUserPlus className="me-2" />
                            Guest Checkout
                            <span className="badge bg-success ms-2">Auto Account</span>
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm flex-grow-1 ${
                              authMode === 'login'
                                ? 'btn-primary'
                                : 'btn-outline-secondary'
                            }`}
                            onClick={() => setAuthMode('login')}
                          >
                            <FaSignInAlt className="me-2" />
                            Sign In
                          </button>
                        </div>

                        {authMode === 'guest' && (
                          <div className="alert alert-info py-2 small mt-3 mb-0">
                            <FaUserPlus className="me-2" />
                            We'll <strong>automatically create a free account</strong> using
                            your details. Your password will be shown after checkout.
                          </div>
                        )}

                        {/* ✅ FIX #2 applied here — stable callback reference */}
                        {authMode === 'login' && (
                          <InlineLogin onSuccess={handleLoginSuccess} />
                        )}
                      </div>
                    )}

                    {/* Contact fields */}
                    <div className="row g-3">
                      <F label="First Name" name="firstName" value={ship.firstName}
                         onChange={onShipChange} ph="First Name" half errors={errors} />
                      <F label="Last Name"  name="lastName"  value={ship.lastName}
                         onChange={onShipChange} ph="Last Name"  half errors={errors} />
                      <F label="Email"      name="email"     value={ship.email}
                         onChange={onShipChange} ph="you@example.com"
                         type="email" errors={errors} />
                      <F label="Phone"      name="phone"     value={ship.phone}
                         onChange={onShipChange} ph="+92 300 1234567"
                         type="tel" req={false} errors={errors} />
                    </div>

                    {/* Address section */}
                    <div className="mt-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <label className="form-label small fw-semibold mb-0">
                          <FaMapMarkerAlt className="me-1 text-primary" />
                          Shipping Address <span className="text-danger">*</span>
                        </label>

                        {isAuthenticated && (
                          <button
                            type="button"
                            className={`btn btn-xs btn-sm ${
                              editAddress
                                ? 'btn-outline-danger'
                                : 'btn-outline-primary'
                            } ${styles.editAddrBtn}`}
                            onClick={() => setEditAddress((p) => !p)}
                          >
                            {editAddress
                              ? <><FaTimes size={11} className="me-1" />Cancel Edit</>
                              : <><FaEdit  size={11} className="me-1" />Edit Address</>
                            }
                          </button>
                        )}
                      </div>

                      {/* Locked address view */}
                      {isAuthenticated && !editAddress && (
                        <div className={styles.addressLocked}>
                          <FaMapMarkerAlt className={styles.addressLockedPin} />
                          <div className="flex-grow-1">
                            {ship.address || ship.city ? (
                              <p className="mb-0 small fw-semibold lh-sm">
                                {[ship.address, ship.city, ship.state,
                                  ship.zipCode, ship.country]
                                  .filter(Boolean).join(', ')}
                              </p>
                            ) : (
                              <p className="mb-0 small text-muted">
                                No address saved — click Edit Address to add one.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Editable address fields */}
                      {(!isAuthenticated || editAddress) && (
                        <div className={`row g-3 ${styles.addressEditFields}`}>
                          <F label="Street Address" name="address" value={ship.address}
                             onChange={onShipChange} ph="123 Main Street" errors={errors} />
                          <F label="City"     name="city"    value={ship.city}
                             onChange={onShipChange} ph="City"     half errors={errors} />
                          <F label="State"    name="state"   value={ship.state}
                             onChange={onShipChange} ph="State"    half errors={errors} />
                          <F label="ZIP Code" name="zipCode" value={ship.zipCode}
                             onChange={onShipChange} ph="ZIP Code" half errors={errors} />
                          <F label="Country"  name="country" value={ship.country}
                             onChange={onShipChange} half opts={COUNTRIES} errors={errors} />

                          {isAuthenticated && editAddress && (
                            <div className="col-12">
                              <p className={styles.addrSaveNotice}>
                                💡 This address will be saved to your profile after ordering.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary mt-4 fw-bold justify-content-center"
                      onClick={() => validateStep1() && setStep(2)}
                      disabled={authMode === 'login' && !isAuthenticated}
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════
                  STEP 2 : Payment
              ══════════════════════════════════════════════════════ */}
              {step === 2 && (
                <div className={`card border-0 shadow-sm ${styles.formCard}`}>
                  <div className="card-header bg-white py-3 fw-bold d-flex
                                  justify-content-between align-items-center">
                    <span>
                      <FaCreditCard className="me-2 text-primary" />
                      Payment Details
                    </span>
                    <FaLock className="text-success" />
                  </div>

                  <div className="card-body">
                    {errors.submit && (
                      <div className="alert alert-danger py-2 small mb-3">
                        {errors.submit}
                      </div>
                    )}

                    <p className={styles.paySectionLabel}>
                      Choose a payment method
                    </p>

                    <div className={styles.payCardList}>
                      {PAYMENT_METHODS.map(({
                        id, label, icon: Icon,
                        description, badge, badgeColor, bullet,
                      }) => {
                        const isSelected = paymentMethod === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setPaymentMethod(id);
                              setErrors((prev) => {
                                const {
                                  cardName, cardNumber, expiry, cvv, ...rest
                                } = prev;
                                return rest;
                              });
                            }}
                            className={`${styles.payCard} ${
                              isSelected ? styles.payCardSelected : ''
                            }`}
                            aria-pressed={isSelected}
                          >
                            <div className={`${styles.payCardIconZone} ${
                              isSelected ? styles.payCardIconZoneSelected : ''
                            }`}>
                              <Icon className={styles.payCardIcon} />
                            </div>
                            <div className={styles.payCardBody}>
                              <div className={styles.payCardTitleRow}>
                                <span className={styles.payCardTitle}>{label}</span>
                                {badge && (
                                  <span className={`${styles.payCardBadge} ${
                                    styles[`payCardBadge_${badgeColor}`]
                                  }`}>
                                    {badge}
                                  </span>
                                )}
                              </div>
                              <span className={styles.payCardDesc}>{description}</span>
                              <span className={styles.payCardBullet}>
                                {id === 'card'   && <FaShieldAlt  className={styles.bulletIcon} />}
                                {id === 'paypal' && <FaPaypal      className={styles.bulletIcon} />}
                                {id === 'bank'   && <FaClock       className={styles.bulletIcon} />}
                                {id === 'cod'    && <FaCheckCircle className={styles.bulletIcon} />}
                                {bullet}
                              </span>
                            </div>
                            <div className={styles.payCardCheck}>
                              {isSelected
                                ? <FaCheckCircle className={styles.payCardCheckActive} />
                                : <span          className={styles.payCardCheckEmpty} />
                              }
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Card fields */}
                    {paymentMethod === 'card' && (
                      <div className={`row g-3 mt-1 ${styles.cardFields}`}>
                        <F label="Name on Card"   name="cardName"
                           value={pay.cardName}   onChange={onPayChange}
                           ph="John Doe"          errors={errors} />
                        <F label="Card Number"    name="cardNumber"
                           value={pay.cardNumber} onChange={onPayChange}
                           ph="1234 5678 9012 3456" errors={errors} />
                        <F label="Expiry (MM/YY)" name="expiry"
                           value={pay.expiry}     onChange={onPayChange}
                           ph="MM/YY" half        errors={errors} />
                        <F label="CVV"            name="cvv"
                           value={pay.cvv}        onChange={onPayChange}
                           ph="•••" half type="password" errors={errors} />
                        <div className="col-12">
                          <p className="text-muted small mb-0">
                            🔒 Your card details are encrypted and never stored.
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'paypal' && (
                      <div className={`alert alert-info mt-3 mb-0 ${styles.methodInfo}`}>
                        <FaPaypal className="me-2 fs-5 flex-shrink-0" />
                        <div>
                          <strong>PayPal / Digital Wallet</strong>
                          <p className="small mb-0 mt-1">
                            You will be redirected to PayPal to complete your
                            payment securely after placing your order.
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'bank' && (
                      <div className={`alert alert-warning mt-3 mb-0 ${styles.methodInfo}`}>
                        <FaUniversity className="me-2 fs-5 flex-shrink-0" />
                        <div>
                          <strong>Bank Transfer Details</strong>
                          <p className="small mb-1 mt-1">Transfer the exact order amount to:</p>
                          <ul className="small mb-0 ps-3">
                            <li><strong>Bank:</strong> First National Bank</li>
                            <li><strong>Account Name:</strong> MyStore Inc.</li>
                            <li><strong>Account No:</strong> 1234-5678-9012</li>
                            <li><strong>Reference:</strong> Your order ID (shown after placing)</li>
                          </ul>
                          <p className="small mt-2 mb-0 text-muted">
                            ⏳ Orders activate within 3–5 business days after payment clears.
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className={`alert alert-success mt-3 mb-0 ${styles.methodInfo}`}>
                        <FaMoneyBillWave className="me-2 fs-5 flex-shrink-0" />
                        <div>
                          <strong>Cash on Delivery</strong>
                          <p className="small mb-0 mt-1">
                            Pay <strong>{formatPrice(grandTotal)}</strong> in cash
                            when your order arrives. Please have the exact amount ready.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="d-flex gap-3 mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary fw-bold"
                        style={{ width: '20%', height: '40px' }}
                        onClick={() => setStep(1)}
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className={`btn btn-success fw-bold ${styles.placeBtn}`}
                        style={{ width: '40%', height: '40px' }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            {paymentMethod === 'paypal' ? 'Redirecting…' : 'Processing…'}
                          </>
                        ) : (
                          <>
                            <FaLock className="me-2" />
                            {paymentMethod === 'cod'
                              ? 'Pay on Delivery'
                              : paymentMethod === 'bank'
                              ? 'Pay via Bank Transfer'
                              : paymentMethod === 'paypal'
                              ? 'Continue to PayPal'
                              : formatPrice(grandTotal)
                            }
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT — Order Review ──────────────────────────────── */}
            <div className="col-lg-5">
              <div className={`card border-0 shadow-sm ${styles.reviewCard}`}>
                <div className="card-header bg-white py-3 fw-bold">
                  Order Review ({cartItems.length} items)
                </div>
                <div className="card-body">

                  {cartItems.map((item) => (
                    <div key={item.id} className="d-flex gap-3 align-items-center mb-3">
                      <div className={styles.thumb}>
                        <img src={item.image} alt={item.title} />
                        <span className={styles.qBadge}>{item.quantity}</span>
                      </div>
                      <p className="small mb-0 flex-grow-1 lh-sm">
                        {item.title.substring(0, 45)}…
                      </p>
                      <span className="small fw-bold text-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}

                  <hr />

                  {[
                    ['Subtotal',            formatPrice(totalPrice)],
                    ['Shipping',            shipping === 0 ? 'FREE' : formatPrice(shipping)],
                    [`Tax (${TAX * 100}%)`, formatPrice(tax)],
                  ].map(([k, v]) => (
                    <div key={k} className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">{k}</span>
                      <span className="fw-semibold">{v}</span>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-3 border-top">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(grandTotal)}</span>
                  </div>

                  {step === 2 && (
                    <div className="mt-3 pt-3 border-top">
                      <p className="small text-muted mb-1">Payment via</p>
                      <span className={styles.paymentBadge}>
                        {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                      </span>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

// ── Inline Login ───────────────────────────────────────────────────────
// ✅ Already correctly defined outside Checkout — no change needed here.
function InlineLogin({ onSuccess }) {
  const { login } = useAuth();
  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 800));
      const { loadFromStorage, STORAGE_KEYS } = await import('../../utils/storage');
      const savedUser = loadFromStorage(STORAGE_KEYS.USER);
      if (
        savedUser &&
        savedUser.email    === form.email &&
        savedUser.password === form.password
      ) {
        const fakeToken = `token-${Date.now()}`;
        login(savedUser, fakeToken);
        onSuccess(savedUser, fakeToken);
      } else {
        setError('Invalid email or password.');
      }
    } catch {
      setError('Login failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="mt-3 p-3 bg-light rounded-3">
      <p className="fw-semibold small mb-2">Sign in to your account:</p>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <div className="mb-2">
        <input
          type="email"
          className="form-control form-control-sm"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
        />
      </div>
      <div className="mb-2">
        <input
          type="password"
          className="form-control form-control-sm"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary btn-sm w-100" disabled={busy}>
        {busy ? <span className="spinner-border spinner-border-sm" /> : 'Sign In'}
      </button>
    </form>
  );
}