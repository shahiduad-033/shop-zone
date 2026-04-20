import { useState } from 'react';
import { FaTag, FaCheck, FaTimes } from 'react-icons/fa';

const COUPONS = {
  'SAVE10':    { discount: 10,  msg: '10% off applied!'       },
  'WELCOME20': { discount: 20,  msg: '20% off applied!'       },
  'FLASH50':   { discount: 50,  msg: '50% flash deal applied!' },
};

export default function CouponInput({ onApply }) {
  const [code,    setCode]    = useState('');
  const [applied, setApplied] = useState(null);
  const [error,   setError]   = useState('');

  const handleApply = () => {
    const key    = code.trim().toUpperCase();
    const coupon = COUPONS[key];
    if (!key)     { setError('Enter a coupon code.'); return; }
    if (!coupon)  { setError('Invalid code. Try SAVE10.'); onApply(0); return; }
    setApplied({ code: key, ...coupon });
    setError('');
    onApply(coupon.discount);
  };

  const handleRemove = () => {
    setApplied(null); setCode(''); setError(''); onApply(0);
  };

  return (
    <div className="card border-0 shadow-sm p-3">
      <div className="d-flex align-items-center gap-2 mb-2">
        <FaTag className="text-primary" />
        <span className="fw-semibold small">Have a coupon?</span>
      </div>
      {applied ? (
        <div className="d-flex align-items-center justify-content-between
                        p-2 bg-success bg-opacity-10 border border-success rounded-3">
          <span className="text-success small fw-bold">
            <FaCheck className="me-1" />{applied.code} — {applied.msg}
          </span>
          <button className="btn btn-sm btn-outline-danger" onClick={handleRemove}>
            <FaTimes size={12} /> Remove
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex gap-2">
            <input
              className={`form-control form-control-sm ${error ? 'is-invalid' : ''}`}
              placeholder="e.g. SAVE10"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            />
            <button className="btn btn-outline-primary btn-sm text-nowrap"
                    onClick={handleApply} disabled={!code.trim()}>
              Apply
            </button>
          </div>
          {error && <div className="text-danger small mt-1">{error}</div>}
        </>
      )}
    </div>
  );
}