import { FaShippingFast, FaLock, FaUndoAlt, FaHeadset } from 'react-icons/fa';

const FEATURES = [
  { icon: <FaShippingFast />, title: 'Free Shipping',   desc: 'On orders over $50', bg: '#eff6ff', color: '#2563eb' },
  { icon: <FaLock />,         title: 'Secure Payment',  desc: '100% safe checkout', bg: '#ecfdf5', color: '#10b981' },
  { icon: <FaUndoAlt />,      title: 'Easy Returns',    desc: '30-day policy',      bg: '#fffbeb', color: '#f59e0b' },
  { icon: <FaHeadset />,      title: '24/7 Support',    desc: 'Always here',        bg: '#f5f3ff', color: '#8b5cf6' },
];

export default function FeaturesStrip() {
  return (
    <section className="py-4 bg-white border-bottom">
      <div className="container">
        <div className="row g-3">
          {FEATURES.map(({ icon, title, desc, bg, color }) => (
            <div key={title} className="col-md-3 col-6">
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-3"
                style={{ backgroundColor: bg }}
              >
                <div
                  className="d-flex align-items-center justify-content-center
                             rounded-3 fs-4"
                  style={{
                    background: color,
                    color: 'white',
                    minWidth: 48,
                    height: 48,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{title}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}