import { useState }      from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth }       from '../../context/AuthContext';
import { toast }         from 'react-toastify';
import styles            from './Auth.module.css';

export default function Register() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [form,    setForm]    = useState({
    name: '', email: '', password: '', confirm: '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())     errs.name     = 'Full name is required';
    if (!form.email.trim())    errs.email    = 'Email is required';
    if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      login({ name: form.name, email: form.email }, 'fake-jwt-token-456');
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch {
      setErrors({ submit: 'Registration failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full Name',        name: 'name',     type: 'text',     ph: 'John Doe'        },
    { label: 'Email Address',    name: 'email',    type: 'email',    ph: 'you@example.com' },
    { label: 'Password',         name: 'password', type: 'password', ph: '••••••••'        },
    { label: 'Confirm Password', name: 'confirm',  type: 'password', ph: '••••••••'        },
  ];

  return (
    <div className={styles.page}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className={`card border-0 shadow-lg ${styles.card}`}>
              <div className="card-body p-5">

                <div className="text-center mb-4">
                  <div className={styles.logo}>🛍️</div>
                  <h3 className="fw-bold">Create Account</h3>
                  <p className="text-muted small">Join MyStore today — it's free!</p>
                </div>

                {errors.submit && (
                  <div className="alert alert-danger py-2 small">{errors.submit}</div>
                )}

                <form onSubmit={handleSubmit}>
                  {fields.map(({ label, name, type, ph }) => (
                    <div className="mb-3" key={name}>
                      <label className="form-label small fw-semibold">{label}</label>
                      <input
                        type={type} name={name}
                        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
                        placeholder={ph} value={form[name]} onChange={onChange}
                      />
                      {errors[name] && (
                        <div className="invalid-feedback">{errors[name]}</div>
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    className={`btn btn-primary w-100 py-2 fw-bold mt-2 ${styles.submitBtn}`}
                    disabled={loading}
                  >
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</>
                      : 'Create Account'
                    }
                  </button>
                </form>

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-semibold">Sign in →</Link>
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}