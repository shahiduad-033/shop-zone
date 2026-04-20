import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

/*
 * MainLayout is the root wrapper rendered by React Router
 * for ALL routes defined under path: '/'.
 *
 * Structure:
 *   <Header />          ← sticky top nav
 *   <main>
 *     <Outlet />        ← matched child page renders here
 *   </main>
 *   <Footer />          ← site-wide footer
 *
 * The Outlet is React Router's placeholder — it swaps out
 * the page component based on the current URL.
 */
export default function MainLayout() {
  const { pathname } = useLocation();

  // Pages where footer should be hidden
  const hideFooter = ['/checkout'].includes(pathname);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* ── Sticky Header ────────────────────────── */}
      <Header />

      {/* ── Page Content ─────────────────────────── */}
      <main className="flex-grow-1">
        <Outlet />
        {/*
         * Outlet explanation:
         *   URL = /          → renders <Home />
         *   URL = /products  → renders <Products />
         *   URL = /cart      → renders <Cart />
         *   etc.
         */}
      </main>

      {/* ── Footer (hidden on checkout) ───────────── */}
      {!hideFooter && <Footer />}
    </div>
  );
}