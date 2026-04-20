import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../Loader/Loader';

/*
 * Wraps any route that requires authentication.
 * If the user is NOT logged in → redirect to /login.
 * Passes the attempted route in location.state so Login
 * can redirect back after successful authentication.
 *
 * Usage in AppRoutes:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Still checking auth state (e.g. reading from localStorage)
  if (loading) {
    return <Loader fullScreen />;
  }

  // Not authenticated → send to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }} // ← Remember where they came from
        replace                    // ← Don't add /login to history
      />
    );
  }

  // Authenticated → render the protected page
  return children;
}