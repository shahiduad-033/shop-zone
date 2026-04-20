// src/components/layout/Footer/Footer.jsx
import { Link } from 'react-router-dom';
import {
  FaFacebookF, FaTwitter,
  FaInstagram, FaLinkedinIn,
} from 'react-icons/fa';
import styles from './Footer.module.css';

const QUICK_LINKS = [
  { to: '/',         label: 'Home'     },
  { to: '/products', label: 'Products' },
  { to: '/cart',     label: 'Cart'     },
  { to: '/login',    label: 'Login'    },
];

const SOCIAL = [
  { icon: <FaFacebookF />,  href: '#', label: 'Facebook'  },
  { icon: <FaTwitter />,    href: '#', label: 'Twitter'   },
  { icon: <FaInstagram />,  href: '#', label: 'Instagram' },
  { icon: <FaLinkedinIn />, href: '#', label: 'LinkedIn'  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row g-4 py-5">

          {/* ── Brand column ─────────────────────────────────────────── */}
          <div className="col-lg-4 col-md-6">
            {/*
             * ✅ UPDATED: "MyStore" → "ShopZone"
             * Matches the header highlight color system:
             * "Shop" = white, "Zone" = text-warning (amber)
             */}
            <h5 className="fw-bold text-white mb-3" style={{ letterSpacing: '-0.3px' }}>
              <span style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                borderRadius: '6px',
                padding: '2px 8px 2px 6px',
                marginRight: '6px',
                fontSize: '1rem',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '0.02em',
              }}>
                S
              </span>
              Shop<span className="text-warning">Zone</span>
            </h5>
            <p className={styles.tagline}>
              Your one-stop shop for everything you love.
              Quality products, fast delivery, easy returns.
            </p>
            <div className="d-flex gap-2 mt-3">
              {SOCIAL.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={styles.socialBtn}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick links — UNCHANGED ──────────────────────────────── */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className={styles.colTitle}>Quick Links</h6>
            <ul className="list-unstyled mb-0">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={label} className="mb-2">
                  <Link to={to} className={styles.footerLink}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support — email updated ─────────────────────────────── */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className={styles.colTitle}>Support</h6>
            <ul className={`list-unstyled mb-0 ${styles.contactList}`}>
              {/* ✅ UPDATED: mystore.com → shopzone.com */}
              <li>📧 support@shopzone.com</li>
              <li>📞 +1 (234) 567-8900</li>
              <li>🕐 Mon–Fri, 9am–6pm</li>
              <li>📍 123 Main St, D-I-Khan, KPK</li>
            </ul>
          </div>

          {/* ── Newsletter — UNCHANGED ───────────────────────────────── */}
          <div className="col-lg-3 col-md-6">
            <h6 className={styles.colTitle}>Stay Updated</h6>
            <p className={styles.tagline}>
              Get exclusive deals straight to your inbox.
            </p>
            <div className="input-group">
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="your@email.com"
              />
              <button className="btn btn-warning btn-sm fw-semibold">
                Go
              </button>
            </div>
          </div>

        </div>

        {/* ── Bottom bar — UPDATED copyright ──────────────────────────── */}
        <div className={`border-top pt-3 pb-2 ${styles.bottomBar}`}>
          {/* ✅ UPDATED: "MyStore" → "ShopZone" */}
          <p className="mb-0 text-center">
            © {new Date().getFullYear()} ShopZone — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}