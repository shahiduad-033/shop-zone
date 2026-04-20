// src/pages/Dashboard/components/ProfileSettings.jsx
import { useState, useEffect } from 'react';
import {
  FaUser, FaEnvelope, FaPhone,
  FaMapMarkerAlt, FaLock, FaEdit,
  FaCheck, FaTimes,
} from 'react-icons/fa';
import styles from './ProfileSettings.module.css';

/*
 * Props:
 *   user      → current user object from AuthContext
 *   onUpdate  → AuthContext.updateUser(partial) — triggers real-time sync
 *
 * ✅ FIXES vs previous version:
 *   1. handleSave() now calls onUpdate(payload) → real-time Navbar/Dashboard sync
 *   2. Address field added (street, city, state, zipCode, country)
 *   3. Form initializes from structured user.address object
 *   4. Success/error feedback without react-toastify dependency
 *   5. Password change section added
 */
export default function ProfileSettings({ user, onUpdate }) {

  // ── Form state — initialized from user object ──────────────────────
  const [form, setForm] = useState({
    name:     '',
    email:    '',
    phone:    '',
    bio:      '',
    // Structured address fields
    street:   '',
    city:     '',
    state:    '',
    zipCode:  '',
    country:  'US',
  });

  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }
  const [editAddr, setEditAddr] = useState(false); // toggle address edit mode

  /*
   * ✅ Sync form with user object on mount and when user changes.
   * user.address is now a structured object: { street, city, state, zipCode, country }
   * For legacy flat-string addresses, fall back gracefully.
   */
  useEffect(() => {
    if (!user) return;

    const addr = typeof user.address === 'object' && user.address !== null
      ? user.address
      : { street: user.address || '', city: '', state: '', zipCode: '', country: 'US' };

    setForm({
      name:    user.name    || '',
      email:   user.email   || '',
      phone:   user.phone   || '',
      bio:     user.bio     || '',
      street:  addr.street  || '',
      city:    addr.city    || '',
      state:   addr.state   || '',
      zipCode: addr.zipCode || '',
      country: addr.country || 'US',
    });
  }, [user]);

  // ── Field change handler ───────────────────────────────────────────
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    // Clear feedback on any change
    if (feedback) setFeedback(null);
  };

  // ── Save handler ───────────────────────────────────────────────────
  /*
   * ✅ THE CORE FIX:
   * Previously this function only set saving state and showed a toast.
   * It never called onUpdate(), so profile changes were lost on refresh
   * and never reflected in Navbar or Dashboard banner.
   *
   * Now it:
   *  1. Builds a structured payload
   *  2. Calls onUpdate(payload) → AuthContext.updateUser() →
   *     setUser() → triggers re-render everywhere useAuth() is consumed
   *  3. Persists to localStorage automatically (updateUser does this)
   */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 700));

      // Build the structured update payload
      const payload = {
        name:    form.name.trim(),
        email:   form.email.trim(),
        phone:   form.phone.trim(),
        bio:     form.bio.trim(),
        // ✅ Address stored as structured object for Checkout pre-fill
        address: {
          street:  form.street.trim(),
          city:    form.city.trim(),
          state:   form.state.trim(),
          zipCode: form.zipCode.trim(),
          country: form.country,
        },
      };

      // ✅ This is the real-time sync call
      // updateUser() merges + saves to localStorage + triggers React re-render
      onUpdate(payload);

      setFeedback({ type: 'success', msg: '✅ Profile updated successfully!' });
      setEditAddr(false); // collapse address section after save
    } catch (err) {
      console.error('[ProfileSettings] save failed:', err);
      setFeedback({ type: 'error', msg: '❌ Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Derived: formatted address for display ─────────────────────────
  const hasAddress = form.street || form.city || form.state;
  const formattedAddress = hasAddress
    ? [form.street, form.city, form.state, form.zipCode, form.country]
        .filter(Boolean)
        .join(', ')
    : null;

  // ── Country options ────────────────────────────────────────────────
  const COUNTRIES = [
    { v: 'PK', l: '🇵🇰 Pakistan'         },
    { v: 'US', l: '🇺🇸 United States'    },
    { v: 'GB', l: '🇬🇧 United Kingdom'   },
    { v: 'CA', l: '🇨🇦 Canada'           },
    { v: 'AU', l: '🇦🇺 Australia'        },
    { v: 'IN', l: '🇮🇳 India'            },
    { v: 'DE', l: '🇩🇪 Germany'          },
    { v: 'FR', l: '🇫🇷 France'           },
    { v: 'SA', l: '🇸🇦 Saudi Arabia'     },
    { v: 'AE', l: '🇦🇪 UAE'              },
  ];

  return (
    <div className={styles.wrapper}>

      {/* ── Feedback banner ─────────────────────────────────────────── */}
      {feedback && (
        <div className={`alert ${
          feedback.type === 'success' ? 'alert-success' : 'alert-danger'
        } py-2 small mb-3 d-flex align-items-center gap-2`}>
          {feedback.type === 'success' ? <FaCheck /> : <FaTimes />}
          {feedback.msg}
        </div>
      )}

      <form onSubmit={handleSave}>

        {/* ══════════════════════════════════════════════════════════
            CARD 1: Personal Information
        ══════════════════════════════════════════════════════════ */}
        <div className={`card border-0 shadow-sm mb-3 ${styles.card}`}>
          <div className="card-header bg-white py-3 fw-bold">
            <FaUser className="me-2 text-primary" />
            Personal Information
          </div>
          <div className="card-body p-4">
            <div className="row g-3">

              {/* Full Name */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  <FaUser className="me-1 text-muted" size={11} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={onChange}
                  required
                />
                <div className={styles.fieldHint}>
                  Displayed in Navbar and across the app
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  <FaEnvelope className="me-1 text-muted" size={11} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  <FaPhone className="me-1 text-muted" size={11} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="+92 300 1234567"
                  value={form.phone}
                  onChange={onChange}
                />
              </div>

              {/* Bio */}
              <div className="col-12">
                <label className="form-label small fw-semibold">Bio</label>
                <textarea
                  name="bio"
                  className="form-control"
                  rows={2}
                  placeholder="Tell us about yourself..."
                  value={form.bio}
                  onChange={onChange}
                />
              </div>

            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CARD 2: Location / Address
            ✅ NEW SECTION — viewable + editable + persisted
        ══════════════════════════════════════════════════════════ */}
        <div className={`card border-0 shadow-sm mb-3 ${styles.card}`}>
          <div className="card-header bg-white py-3 fw-bold d-flex
                          align-items-center justify-content-between">
            <span>
              <FaMapMarkerAlt className="me-2 text-primary" />
              Location & Address
            </span>
            <button
              type="button"
              className={`btn btn-sm ${editAddr ? 'btn-outline-danger' : 'btn-outline-primary'}`}
              onClick={() => setEditAddr((p) => !p)}
            >
              {editAddr
                ? <><FaTimes className="me-1" size={11} /> Cancel</>
                : <><FaEdit  className="me-1" size={11} /> Edit Address</>
              }
            </button>
          </div>
          <div className="card-body p-4">

            {/* ── View mode: formatted address display ─────────────── */}
            {!editAddr && (
              <div className={styles.addressDisplay}>
                {formattedAddress ? (
                  <>
                    <FaMapMarkerAlt className={styles.addressPin} />
                    <div>
                      <p className={styles.addressText}>{formattedAddress}</p>
                      <p className={styles.addressHint}>
                        This address will be pre-filled on your next checkout.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className={styles.addressEmpty}>
                    <FaMapMarkerAlt className={styles.addressEmptyIcon} />
                    <div>
                      <p className="fw-semibold mb-1 small">No address saved yet</p>
                      <p className="text-muted small mb-0">
                        Click "Edit Address" to add your delivery location.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Edit mode: address form fields ───────────────────── */}
            {editAddr && (
              <div className={`row g-3 ${styles.addressFields}`}>
                {/* Street */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    className="form-control"
                    placeholder="123 Main Street, Apartment 4B"
                    value={form.street}
                    onChange={onChange}
                  />
                </div>

                {/* City */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="Karachi"
                    value={form.city}
                    onChange={onChange}
                  />
                </div>

                {/* State / Province */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    State / Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    placeholder="Sindh"
                    value={form.state}
                    onChange={onChange}
                  />
                </div>

                {/* ZIP */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="form-control"
                    placeholder="75600"
                    value={form.zipCode}
                    onChange={onChange}
                  />
                </div>

                {/* Country */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Country</label>
                  <select
                    name="country"
                    className="form-select"
                    value={form.country}
                    onChange={onChange}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.v} value={c.v}>{c.l}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CARD 3: Security / Password (placeholder for completeness)
        ══════════════════════════════════════════════════════════ */}
        <div className={`card border-0 shadow-sm mb-4 ${styles.card}`}>
          <div className="card-header bg-white py-3 fw-bold">
            <FaLock className="me-2 text-primary" />
            Security
          </div>
          <div className="card-body p-4">
            <div className={styles.securityRow}>
              <div>
                <p className="fw-semibold small mb-1">Password</p>
                <p className="text-muted small mb-0">
                  Last changed: {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </p>
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm">
                Change Password
              </button>
            </div>
            {user?.isGuest && (
              <div className="alert alert-warning small mt-3 mb-0 py-2">
                🔐 You signed up as a guest. Set a permanent password to secure
                your account.
              </div>
            )}
          </div>
        </div>

        {/* ── Save button ───────────────────────────────────────────── */}
        <button
          type="submit"
          className="btn btn-primary px-5 py-2 fw-bold"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </button>

      </form>
    </div>
  );
}