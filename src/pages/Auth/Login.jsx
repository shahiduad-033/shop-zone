import { useState }           from 'react';
import { Link, useNavigate,
         useLocation }        from 'react-router-dom';
import { useAuth }            from '../../context/AuthContext';
import { toast }              from 'react-toastify';
import styles                 from './Auth.module.css';

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  // Redirect back to where the user came from, or home
  const from = location.state?.from?.pathname || '/';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim())    errs.email    = 'Email is required';
    if (!form.password.trim()) errs.password = 'Password is required';
    if (form.password.length < 6 && form.password)
      errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1000));
      // Fake user — replace with real auth API
      login(
        { name: 'John Doe', email: form.email },
        'fake-jwt-token-123'
      );
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch {
      setErrors({ submit: 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className={`card border-0 shadow-lg ${styles.card}`}>
              <div className="card-body p-5">

                {/* Header */}
                <div className="text-center mb-4">
                  <div className={styles.logo}>🛍️</div>
                  <h3 className="fw-bold">Welcome Back</h3>
                  <p className="text-muted small">Sign in to your MyStore account</p>
                </div>

                {errors.submit && (
                  <div className="alert alert-danger py-2 small">{errors.submit}</div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <input
                      type="email" name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="you@example.com"
                      value={form.email} onChange={onChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <label className="form-label small fw-semibold">Password</label>
                      <Link to="#" className="small text-primary">Forgot password?</Link>
                    </div>
                    <input
                      type="password" name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="••••••••"
                      value={form.password} onChange={onChange}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary w-100 py-2 fw-bold mt-2 ${styles.submitBtn}`}
                    disabled={loading}
                  >
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
                      : 'Sign In'
                    }
                  </button>
                </form>

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary fw-semibold">
                    Create one →
                  </Link>
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}