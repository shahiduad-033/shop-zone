// src/components/layout/Header/Header.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate }               from 'react-router-dom';
import {
  FaBars, FaTimes, FaSearch,
  FaHeart, FaShoppingCart,
  FaSignOutAlt, FaTachometerAlt,
  FaAngleDown, FaAngleRight,
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import styles      from './Header.module.css';

// ── ShopZone SVG Logo Icon — UNCHANGED ────────────────────────────────
function ShopZoneIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="13" width="36" height="28" rx="5" ry="5"
            fill="currentColor" opacity="0.95" />
      <path d="M13 13 C13 6.5 27 6.5 27 13"
            stroke="currentColor" strokeWidth="3.2"
            strokeLinecap="round" fill="none" />
      <text x="20" y="33" textAnchor="middle" fontSize="17"
            fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif"
            fill="white" letterSpacing="-0.5">
        S
      </text>
    </svg>
  );
}


const CATEGORIES = [
  {
    name:     'Electronics',
    icon:     '💻',
    apiSlug:  'electronics',
    children: [
      { label: 'All Electronics',  slug: 'electronics'  },
      { label: 'Smart Phones',     slug: 'electronics'  },
      { label: 'Laptops',          slug: 'electronics'  },
      { label: 'Cameras',          slug: 'electronics'  },
      { label: 'Headphones',       slug: 'electronics'  },
    ],
  },
  {
    name:     'Jewelry',
    icon:     '💍',
    apiSlug:  'jewelery',
    children: [
      { label: 'All Jewelry',      slug: 'jewelery'     },
      { label: 'Necklaces',        slug: 'jewelery'     },
      { label: 'Rings',            slug: 'jewelery'     },
      { label: 'Bracelets',        slug: 'jewelery'     },
    ],
  },
  {
    name:     "Men's Fashion",
    icon:     '👔',
    apiSlug:  "men's clothing",
    children: [
      { label: "All Men's Wear",   slug: "men's clothing" },
      { label: 'T-Shirts',         slug: "men's clothing" },
      { label: 'Jackets',          slug: "men's clothing" },
      { label: 'Casual Wear',      slug: "men's clothing" },
    ],
  },
  {
    name:     "Women's Fashion",
    icon:     '👗',
    apiSlug:  "women's clothing",
    children: [
      { label: "All Women's Wear", slug: "women's clothing" },
      { label: 'Dresses',          slug: "women's clothing" },
      { label: 'Tops',             slug: "women's clothing" },
      { label: 'Activewear',       slug: "women's clothing" },
    ],
  },
];

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems }                    = useCart();
  const navigate                          = useNavigate();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchOpen,  setSearchOpen]  = useState(false);
  const searchInputRef                = useRef(null);

  // ── Scroll detection — UNCHANGED ──────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Body scroll lock — UNCHANGED ───────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // ── Auto-focus on search open — UNCHANGED ──────────────────────────
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // ── Escape key close — UNCHANGED ───────────────────────────────────
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchValue('');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [searchOpen]);

  // ── Search submit — UNCHANGED ──────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
    setSearchValue('');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  // ── Toggle search panel — UNCHANGED ───────────────────────────────
  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => {
      if (prev) setSearchValue('');
      return !prev;
    });
  }, []);

  // ── Logout — UNCHANGED ─────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  // ── NavLink class helper — UNCHANGED ──────────────────────────────
  const navLinkClass = ({ isActive }) => {
    if (isActive) {
      return `${styles.navLink} ${styles.navLinkActive} ${scrolled ? styles.navLinkActiveScrolled : ''}`;
    }
    return `${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''}`;
  };

  return (
    <>
      <header
        className={`
          ${styles.header}
          ${scrolled ? styles.headerScrolled : styles.headerTop}
        `}
      >
        <nav className={`container ${styles.navInner}`}>

          {/* ── 1. Brand — UNCHANGED ─────────────────────────────────── */}
          <Link
            to="/"
            className={`${styles.brand} ${scrolled ? styles.brandScrolled : ''}`}
            aria-label="ShopZone — Home"
          >
            <div className={styles.brandLogo}>
              <ShopZoneIcon className={styles.brandSvg} />
              <span className={styles.brandText}>
                Shop<span className={styles.brandHighlight}>Zone</span>
              </span>
            </div>
          </Link>

          {/* ── 2. Desktop Center — UNCHANGED except CATEGORIES update ── */}
          <div className={`d-none d-lg-flex align-items-center gap-3 ${styles.desktopCenter}`}>
            <ul className={styles.navList}>
              <li>
                <NavLink to="/" className={navLinkClass} end>Home</NavLink>
              </li>
              <li>
                <NavLink to="/products" className={navLinkClass}>Products</NavLink>
              </li>

              {/* ✅ UPDATED: Mega menu now uses real FakeStoreAPI slugs */}
              <li className={styles.megaWrapper}>
                <span
                  className={`
                    ${styles.navLink}
                    ${styles.navLinkDropdown}
                    ${scrolled ? styles.navLinkScrolled : ''}
                  `}
                >
                  Categories <FaAngleDown size={11} style={{ marginLeft: 3 }} />
                </span>
                <div className={styles.megaMenu}>
                  <div className={styles.megaGrid}>
                    {CATEGORIES.map((cat) => (
                      <div key={cat.name} className={styles.megaCol}>
                        <p className={styles.megaColTitle}>
                          {cat.icon} {cat.name}
                        </p>
                        <ul className={styles.megaColList}>
                          {/*
                           * ✅ Each child uses its own slug (all pointing to
                           * the parent API category since FakeStoreAPI
                           * doesn't have sub-categories).
                           * The first child is always "All [Category]" for
                           * a clean UX entry point.
                           */}
                          {cat.children.map((child) => (
                            <li key={child.label}>
                              <Link
                                to={`/products?category=${encodeURIComponent(child.slug)}`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              to={`/products?category=${encodeURIComponent(cat.apiSlug)}`}
                              className={styles.megaViewAll}
                            >
                              View all <FaAngleRight size={10} />
                            </Link>
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* ── 3. Right Actions — UNCHANGED ─────────────────────────── */}
          <div className={`d-flex align-items-center ${styles.rightActions}`}>
            <div className="d-none d-lg-flex align-items-center gap-1">

              <button
                onClick={toggleSearch}
                aria-label={searchOpen ? 'Close search' : 'Open search'}
                aria-expanded={searchOpen}
                className={`
                  ${styles.iconBtn}
                  ${styles.searchTrigger}
                  ${scrolled   ? styles.iconBtnScrolled    : ''}
                  ${searchOpen ? styles.searchTriggerActive : ''}
                `}
              >
                {searchOpen ? <FaTimes size={17} /> : <FaSearch size={17} />}
              </button>

              <Link
                to="/cart"
                aria-label={`Cart, ${totalItems} items`}
                className={`${styles.iconBtn} ${styles.cartIcon} ${scrolled ? styles.iconBtnScrolled : ''}`}
              >
                <FaShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className={styles.cartBadge}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className={styles.avatarWrapper}>
                  <button
                    className={`${styles.avatarBtn} ${scrolled ? styles.avatarBtnScrolled : ''}`}
                    aria-label="Account menu"
                  >
                    <img
                      src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name || 'User'}`}
                      alt={user?.name || 'User'}
                      className={styles.avatarImg}
                    />
                    <span className={`d-none d-xl-inline ${styles.avatarName}`}>
                      {user?.name?.split(' ')[0] || 'Account'}
                    </span>
                    <FaAngleDown size={11} />
                  </button>

                  <ul className={styles.profileDropdown}>
                    <li className={styles.profileDropdownHeader}>
                      <img
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name || 'User'}`}
                        alt={user?.name}
                        className={styles.dropdownAvatar}
                      />
                      <div className={styles.dropdownTextBlock}>
                        <p className={styles.dropdownName}>{user?.name || 'My Account'}</p>
                        <p className={styles.dropdownEmail}>{user?.email || ''}</p>
                      </div>
                    </li>
                    <hr className={styles.dropdownDivider} />
                    <li>
                      <Link to="/dashboard">
                        <FaTachometerAlt /> My Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/cart">
                        <FaShoppingCart /> My Cart
                        {totalItems > 0 && (
                          <span className={styles.dropdownBadge}>{totalItems}</span>
                        )}
                      </Link>
                    </li>
                    <hr className={styles.dropdownDivider} />
                    <li>
                      <button onClick={handleLogout} className={styles.logoutBtn}>
                        <FaSignOutAlt /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex gap-2 ms-1">
                  <Link
                    to="/login"
                    className={`${styles.loginBtn} ${scrolled ? styles.loginBtnScrolled : ''}`}
                  >
                    Login
                  </Link>
                  <Link to="/register" className={styles.signupBtn}>Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile right side — UNCHANGED */}
            <Link
              to="/cart"
              className={`d-lg-none ${styles.iconBtn} ${styles.cartIcon} ${scrolled ? styles.iconBtnScrolled : ''}`}
              aria-label={`Cart, ${totalItems} items`}
            >
              <FaShoppingCart size={20} />
              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </Link>

            <button
              className={`d-lg-none ${styles.mobileToggle} ${scrolled ? styles.mobileToggleScrolled : ''}`}
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

        </nav>

        {/* ── Expandable Search Panel — UNCHANGED ──────────────────── */}
        <div
          className={`
            d-none d-lg-block
            ${styles.searchPanel}
            ${searchOpen ? styles.searchPanelOpen : ''}
          `}
          aria-hidden={!searchOpen}
        >
          <div className="container">
            <form onSubmit={handleSearch} className={styles.searchPanelForm}>
              <FaSearch className={styles.searchPanelIcon} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for products, categories, brands..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className={styles.searchPanelInput}
                tabIndex={searchOpen ? 0 : -1}
              />
              {searchValue && (
                <button
                  type="button"
                  className={styles.searchPanelClear}
                  onClick={() => { setSearchValue(''); searchInputRef.current?.focus(); }}
                  aria-label="Clear search"
                >
                  <FaTimes size={13} />
                </button>
              )}
              <button type="submit" className={styles.searchPanelSubmit} aria-label="Search">
                <FaSearch size={14} />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>

      </header>

      {/* ── Search overlay — UNCHANGED ───────────────────────────────── */}
      <div
        className={`${styles.searchOverlay} ${searchOpen ? styles.searchOverlayVisible : ''}`}
        onClick={() => { setSearchOpen(false); setSearchValue(''); }}
        aria-hidden="true"
      />

      {/* ── Mobile Slide-in Menu — UNCHANGED except categories ─────── */}
      <div
        className={`${styles.mobileOverlay} ${mobileOpen ? styles.mobileOverlayVisible : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className={`${styles.mobileDrawer} ${mobileOpen ? styles.mobileDrawerOpen : ''}`}>

        <div className={styles.drawerHeader}>
          <Link to="/" className={styles.drawerBrand} onClick={() => setMobileOpen(false)}>
            <ShopZoneIcon className={styles.drawerBrandSvg} />
            <span>Shop<span className={styles.drawerBrandHighlight}>Zone</span></span>
          </Link>
          <button className={styles.drawerClose} onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSearch} className={styles.drawerSearch}>
          <FaSearch className={styles.drawerSearchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>

        <nav className={styles.drawerNav}>
          <Link to="/"          onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/products"  onClick={() => setMobileOpen(false)}>Products</Link>
          <Link to="/wishlist"  onClick={() => setMobileOpen(false)}>Wishlist</Link>
          {isAuthenticated && (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          )}
        </nav>

        <div className={styles.drawerCategories}>
          <p className={styles.drawerSectionLabel}>Categories</p>
          {/*
           * ✅ UPDATED: Mobile drawer categories now use real API slugs.
           * Matches the desktop mega menu — same slugs, same behavior.
           */}
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.apiSlug)}`}
              className={styles.drawerCatItem}
              onClick={() => setMobileOpen(false)}
            >
              <span>{cat.icon} {cat.name}</span>
              <FaAngleRight size={12} />
            </Link>
          ))}
        </div>

        <div className={styles.drawerFooter}>
          {isAuthenticated ? (
            <div className={styles.drawerUser}>
              <img
                src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name || 'User'}`}
                alt={user?.name}
                className={styles.drawerAvatar}
              />
              <div className={styles.drawerUserTextBlock}>
                <p className={styles.drawerUserName}>{user?.name}</p>
                <p className={styles.drawerUserEmail}>{user?.email}</p>
              </div>
              <button onClick={handleLogout} className={styles.drawerLogout}>
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <div className={styles.drawerAuthBtns}>
              <Link to="/login"    className={styles.drawerLoginBtn}  onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className={styles.drawerSignupBtn} onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}