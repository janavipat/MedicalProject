import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Stethoscope, ClipboardList } from 'lucide-react';

const ROLES = [
  {
    value: 'Doctor',
    label: 'Doctor',
    desc: 'Can view & create prescriptions, diagnose patients',
    icon: Stethoscope,
    color: '#16a34a',
  },
  {
    value: 'Receptionist',
    label: 'Receptionist',
    desc: 'Can book appointments & manage patient info',
    icon: ClipboardList,
    color: '#059669',
  },
];

export default function Signup() {
  const { signupWithEmail, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!isFirebaseConfigured) { setError('Firebase is not configured. Add your .env file and restart.'); return; }
    if (!form.name.trim()) { setError('Full name is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await signupWithEmail(form.name.trim(), form.email, form.password, selectedRole);
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 12px 11px 40px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '0.95rem', color: '#111827',
    outline: 'none', transition: 'border-color 0.2s',
    background: 'white',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        width: '100%', maxWidth: '480px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #16a34a, #059669)', padding: '28px 40px 24px', textAlign: 'center' }}>
          <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>🌿</div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Create Staff Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontSize: '0.85rem' }}>Apollo Clinic — Authorized staff registration</p>
        </div>

        <div style={{ padding: '28px 36px 32px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input type="text" required value={form.name} onChange={update('name')} placeholder="Enter your full name" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input type="email" required value={form.email} onChange={update('email')} placeholder="doctor@clinic.com" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            </div>

            {/* Password + Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={update('password')} placeholder="Min 6 chars" style={{ ...inputStyle, paddingRight: '36px' }}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Confirm</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input type={showConfirm ? 'text' : 'password'} required value={form.confirm} onChange={update('confirm')} placeholder="Re-enter" style={{ ...inputStyle, paddingRight: '36px' }}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Select Role</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ROLES.map(({ value, label, desc, icon: Icon, color }) => (
                  <label key={value} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                    border: selectedRole === value ? `2px solid ${color}` : '2px solid #e5e7eb',
                    background: selectedRole === value ? `${color}12` : 'white',
                    transition: 'all 0.15s',
                  }}>
                    <input type="radio" name="role" value={value} checked={selectedRole === value} onChange={() => setSelectedRole(value)} style={{ display: 'none' }} />
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: selectedRole === value ? color : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      <Icon size={18} color={selectedRole === value ? '#fff' : '#6b7280'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedRole === value ? color : '#111827' }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1px' }}>{desc}</div>
                    </div>
                    {selectedRole === value && (
                      <div style={{ marginLeft: 'auto', width: '18px', height: '18px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" /></svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white', border: 'none', borderRadius: '10px',
              padding: '12px', fontSize: '1rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px',
            }}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.875rem', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
  };
  return map[code] || 'Sign-up failed. Please try again.';
}
