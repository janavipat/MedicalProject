import { Bell, Search, User, LogOut, UserCircle, Phone, History, X, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AVATAR_KEY = (uid) => `ayurclinic_avatar_${uid}`;
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Header() {
  const { user, logout, authFetch } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // ── Global Search ──────────────────────────────────────────────────────────
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const searchRef  = useRef(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSearchInput = (val) => {
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    if (!val.trim() || val.trim().length < 2) { setSearchResults([]); setShowSearch(false); return; }
    setSearchLoading(true);
    setShowSearch(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res  = await authFetch(`${API}/api/patients/search?q=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
  };

  const goToPatient = (p) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    navigate(`/patients/${p._id}/history`);
  };

  const clearSearch = () => { setSearchQuery(''); setSearchResults([]); setShowSearch(false); };

  // Build real notifications from low-stock + overdue follow-ups
  const fetchNotifications = useCallback(async () => {
    const notifs = [];
    try {
      // Low stock medicines
      const invR = await authFetch(`${API}/api/inventory`);
      if (invR.ok) {
        const inv = await invR.json();
        const lowStock = inv.filter(i => i.stockQuantity <= (i.lowStockThreshold || 10) && i.stockQuantity > 0);
        const outStock  = inv.filter(i => i.stockQuantity === 0);
        outStock.slice(0, 2).forEach(i => notifs.push({
          id: `out-${i._id}`, text: `Out of stock: ${i.medicineName}`, time: 'Inventory', type: 'danger'
        }));
        lowStock.slice(0, 3).forEach(i => notifs.push({
          id: `low-${i._id}`, text: `Low stock: ${i.medicineName} (${i.stockQuantity} left)`, time: 'Inventory', type: 'warning'
        }));
      }
    } catch {}
    try {
      // Overdue follow-ups
      const fuR = await authFetch(`${API}/api/followup?overdue=true&limit=3`);
      if (fuR.ok) {
        const fuData = await fuR.json();
        const fus = Array.isArray(fuData.followups) ? fuData.followups : Array.isArray(fuData) ? fuData : [];
        fus.slice(0, 3).forEach(f => notifs.push({
          id: `fu-${f._id}`, text: `Overdue follow-up: ${f.patientName}`, time: 'Follow-up', type: 'info'
        }));
      }
    } catch {}
    setNotifications(notifs);
  }, [authFetch]);

  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => { setNotifications([]); setShowNotifications(false); };
  const handleLogout = async () => { await logout(); navigate('/login'); };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Doctor';

  // Prefer locally uploaded avatar, fall back to Google photoURL
  const localAvatar = user?.uid ? localStorage.getItem(AVATAR_KEY(user.uid)) : null;
  const photoURL = localAvatar || user?.photoURL;

  const notifColor = (type) => type === 'danger' ? '#dc2626' : type === 'warning' ? '#d97706' : '#16a34a';

  return (
    <header className="top-header">
      {/* ── Global Search ── */}
      <div ref={searchRef} style={{ position: 'relative', width: '440px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', background: 'var(--bg-card)',
          padding: '10px 16px', borderRadius: '10px',
          border: showSearch ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'border-color 0.2s',
        }}>
          {searchLoading
            ? <Loader2 size={18} color="var(--primary)" style={{ marginRight: '10px', flexShrink: 0 }} className="animate-spin" />
            : <Search size={18} color="var(--primary)" style={{ marginRight: '10px', flexShrink: 0 }} strokeWidth={2.5} />
          }
          <input
            type="text"
            value={searchQuery}
            placeholder="Search patients by name or phone..."
            onChange={e => handleSearchInput(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowSearch(true); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 500 }}
          />
          {searchQuery && (
            <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, flexShrink: 0 }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {showSearch && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 500,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '14px', boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}>
            {searchResults.length === 0 && !searchLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No patients found for "{searchQuery}"
              </div>
            ) : (
              <>
                <div style={{ padding: '8px 14px 6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>
                  Patients — {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map(p => (
                  <div
                    key={p._id}
                    onClick={() => goToPatient(p)}
                    style={{ padding: '11px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Avatar initial */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
                      {p.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        {p.age && <span>{p.age}y</span>}
                        {p.age && p.gender && <span>·</span>}
                        {p.gender && <span>{p.gender}</span>}
                        {(p.contact || p.phone) && <><span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Phone size={10} />{p.contact || p.phone}</span></>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, flexShrink: 0 }}>
                      <History size={12} /> History
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button style={{ position: 'relative' }} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} color="var(--text-main)" />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--danger)', color: 'white',
                width: '16px', height: '16px', borderRadius: '50%',
                fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', top: '100%', right: '0', marginTop: '12px',
              background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
              borderRadius: '12px', width: '320px', padding: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50,
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              <h3 style={{ margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)', fontSize: '1rem' }}>
                Notifications {notifications.length > 0 && <span style={{ fontSize: '0.75rem', background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '20px', marginLeft: '8px' }}>{notifications.length}</span>}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map(notif => (
                  <div key={notif.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '8px', background: 'var(--bg-muted)', borderRadius: '8px', borderLeft: `3px solid ${notifColor(notif.type)}` }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{notif.text}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{notif.time}</div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    ✅ All clear — no alerts
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <button className="btn btn-outline" style={{ width: '100%', padding: '6px', fontSize: '0.82rem' }} onClick={handleMarkAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{displayName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email || 'Practitioner'}</div>
            </div>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {photoURL
                ? <img src={photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={20} color="#fff" />
              }
            </div>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: '0',
              background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
              borderRadius: '14px', padding: '8px', minWidth: '210px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 50,
            }}>
              {/* Profile preview strip */}
              <div style={{ padding: '10px 14px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {photoURL
                    ? <img src={photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={18} color="#fff" />
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                </div>
              </div>

              {/* View Profile */}
              <button
                onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                style={{
                  width: '100%', padding: '10px 14px', background: 'none',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500',
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <UserCircle size={16} color="var(--primary)" /> View Profile
              </button>

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '10px 14px', background: 'none',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  color: 'var(--danger)', fontSize: '0.9rem', fontWeight: '600',
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
