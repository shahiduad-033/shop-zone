// src/routes/AppRoutes.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense }  from 'react';
import MainLayout          from '../components/layout/MainLayout/MainLayout';
import ProtectedRoute      from '../components/common/ProtectedRoute/ProtectedRoute';

const Home           = lazy(() => import('../pages/Home/Home'));
const Products       = lazy(() => import('../pages/Products/Products'));
const ProductDetails = lazy(() => import('../pages/ProductDetails/ProductDetails'));
const Cart           = lazy(() => import('../pages/Cart/Cart'));
const Checkout       = lazy(() => import('../pages/Checkout/Checkout'));
const Login          = lazy(() => import('../pages/Auth/Login'));
const Register       = lazy(() => import('../pages/Auth/Register'));
const Dashboard      = lazy(() => import('../pages/Dashboard/Dashboard'));
const NotFound       = lazy(() => import('../pages/NotFound/NotFound'));
const ThankYou       = lazy(() => import('../pages/ThankYou/ThankYou'));

function PageLoader() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '60vh' }}
    >
      <div className="text-center">
        <div
          className="spinner-border text-primary mb-3"
          style={{ width: '3rem', height: '3rem' }}
        />
        <p className="text-muted">Loading...</p>
      </div>
    </div>
  );
}

const LazyPage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path:         '/',
    element:      <MainLayout />,
    errorElement: <LazyPage><NotFound /></LazyPage>,
    children: [

      // ── Public ────────────────────────────────────────────────────
      { index: true,
        element: <LazyPage><Home /></LazyPage> },
      { path: 'products',
        element: <LazyPage><Products /></LazyPage> },
      { path: 'products/:id',
        element: <LazyPage><ProductDetails /></LazyPage> },
      { path: 'cart',
        element: <LazyPage><Cart /></LazyPage> },
      { path: 'login',
        element: <LazyPage><Login /></LazyPage> },
      { path: 'register',
        element: <LazyPage><Register /></LazyPage> },
      { path: 'thank-you',
        element: <LazyPage><ThankYou /></LazyPage> },

      // ✅ CHECKOUT — now public (guest checkout supported)
      { path: 'checkout',
        element: <LazyPage><Checkout /></LazyPage> },

      // ── Protected ─────────────────────────────────────────────────
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <LazyPage><Dashboard /></LazyPage>
          </ProtectedRoute>
        ),
      },

      // ── 404 ───────────────────────────────────────────────────────
      { path: '*', element: <LazyPage><NotFound /></LazyPage> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}