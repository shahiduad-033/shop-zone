import { useMemo }        from 'react';
import { FaLock, FaTruck,
         FaUndo, FaTag } from 'react-icons/fa';
import { formatPrice }   from '../../../utils/formatPrice';
import styles            from './OrderSummary.module.css';

const FREE_AT    = 50;
const SHIP_FEE   = 9.99;
const TAX_RATE   = 0.08;

export default function OrderSummary({
  subtotal, couponDiscount = 0, onCheckout, isSubmitting = false,
}) {
  const calc = useMemo(() => {
    const disc       = subtotal * (couponDiscount / 100);
    const afterDisc  = subtotal - disc;
    const ship       = subtotal >= FREE_AT ? 0 : SHIP_FEE;
    const tax        = afterDisc * TAX_RATE;
    const total      = afterDisc + ship + tax;
    const toFree     = Math.max(FREE_AT - subtotal, 0);
    const progress   = Math.min((subtotal / FREE_AT) * 100, 100);
    return {
      disc: round(disc), afterDisc: round(afterDisc),
      ship, tax: round(tax), total: round(total),
      toFree: round(toFree), progress, isFree: ship === 0,
    };
  }, [subtotal, couponDiscount]);

  return (
    <div className={`card border-0 shadow-sm ${styles.card}`}>
      <div className="card-header bg-white py-3">
        <h5 className="fw-bold mb-0">Order Summary</h5>
      </div>
      <div className="card-body p-4">

        {/* Free shipping bar */}
        <div className={styles.shipBar}>
          <p className="small mb-2">
            {calc.isFree
              ? <span className="text-success fw-semibold">🎉 You have FREE shipping!</span>
              : <>Add <strong className="text-primary">{formatPrice(calc.toFree)}</strong> more for free shipping</>
            }
          </p>
          <div className="progress" style={{ height: 7, borderRadius: 10 }}>
            <div
              className={`progress-bar ${calc.isFree ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${calc.progress}%`, transition: 'width .5s ease', borderRadius: 10 }}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-3">
          <Row label="Subtotal"  value={formatPrice(subtotal)} />
          {couponDiscount > 0 && (
            <Row
              label={`Coupon (-${couponDiscount}%)`}
              value={`-${formatPrice(calc.disc)}`}
              vc="text-success"
            />
          )}
          <Row
            label="Shipping"
            value={calc.isFree ? <span className="text-success fw-semibold">FREE</span> : formatPrice(calc.ship)}
          />
          <Row label={`Tax (${TAX_RATE*100}%)`} value={formatPrice(calc.tax)} />
          <hr />
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold fs-5">Total</span>
            <span className={`fw-bold fs-3 ${styles.total}`}>{formatPrice(calc.total)}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          className={`btn btn-primary w-100 py-3 mt-4 fw-bold fs-5 ${styles.cta}`}
          onClick={onCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
            : <><FaLock className="me-2" />Checkout — {formatPrice(calc.total)}</>
          }
        </button>

        {/* Guarantees */}
        <div className="mt-3 pt-3 border-top">
          {[
            [<FaTruck />, '#2563eb', `Free shipping over $${FREE_AT}`],
            [<FaUndo />,  '#10b981', '30-day returns'],
            [<FaTag />,   '#f59e0b', 'Best price guarantee'],
          ].map(([icon, color, text]) => (
            <div key={text} className="d-flex align-items-center gap-2 mb-1">
              <span style={{ color }}>{icon}</span>
              <small className="text-muted">{text}</small>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const round = (n) => Math.round(n * 100) / 100;
function Row({ label, value, vc = '' }) {
  return (
    <div className="d-flex justify-content-between mb-2 small">
      <span className="text-muted">{label}</span>
      <span className={`fw-semibold ${vc}`}>{value}</span>
    </div>
  );
}