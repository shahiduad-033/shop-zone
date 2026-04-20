import { useState } from 'react';
import { toast }    from 'react-toastify';

export default function Newsletter() {
  const [email,  setEmail]  = useState('');
  const [busy,   setBusy]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    toast.success('🎉 Subscribed! Check your inbox for a welcome gift.');
    setEmail('');
    setBusy(false);
  };

  return (
    <section className="py-5 bg-primary text-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 text-center">
            <h3 className="fw-bold mb-2">Stay in the Loop 📬</h3>
            <p className="text-white-50 mb-4">
              Exclusive deals and new arrivals, straight to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="d-flex gap-2">
              <input
                type="email"
                className="form-control"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-warning fw-bold text-nowrap"
                disabled={busy}
              >
                {busy ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}