import { useState, useEffect, useCallback } from 'react';
import { Clock, PhoneCall, Calendar as CalendarIcon, Search, User, Loader2, RefreshCw, X, AlertCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import MedicalLoader from '../components/MedicalLoader.jsx';

const API = 'https://medical-project-h6yc.vercel.app';

const STATUS_CLASS = {
  Pending:   'badge-warning',
  Called:    'badge-success',
  Overdue:   'badge-danger',
  Scheduled: 'badge-primary',
  Completed: 'badge-success',
};

export default function FollowUp() {
  const { authFetch } = useAuth();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [todayFollowups, setTodayFollowups] = useState([]);

  const fetchFollowups = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url = `${API}/api/followup?limit=100`;
      if (filter === 'today')   url += '&today=true';
      if (filter === '7days')   url += '&week=true';
      if (filter === 'overdue') url += '&overdue=true';
      const r = await authFetch(url);
      if (!r.ok) throw new Error();
      const data = await r.json();
      const list = Array.isArray(data.followups) ? data.followups : Array.isArray(data) ? data : [];
      setFollowups(list);
      // Detect today's follow-ups
      const todayStr = new Date().toISOString().split('T')[0];
      setTodayFollowups(list.filter(f => {
        const d = f.followUpDate || f.date;
        return d && d.slice(0, 10) === todayStr && f.status !== 'Called' && f.status !== 'Completed';
      }));
    } catch {
      setError('Could not load follow-ups. Check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, filter]);

  useEffect(() => { fetchFollowups(); }, [fetchFollowups]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await authFetch(`${API}/api/followup/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      fetchFollowups();
    } catch { alert('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const filtered = followups.filter(f =>
    (f.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.diagnosis || '').toLowerCase().includes(search.toLowerCase())
  );

  const isOverdue = (dateStr) => new Date(dateStr) < new Date() && true;

  const sendWhatsApp = (f) => {
    const phone = (f.phone || f.contact || '').replace(/\D/g, '');
    if (!phone) { alert('No phone number available for this patient.'); return; }
    const date = new Date(f.followUpDate || f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const msg = `Dear ${f.patientName}, this is a reminder from MediCore Clinic.\n\nYour follow-up appointment is scheduled for today (${date}).\n\nDiagnosis: ${f.diagnosis || '—'}\n\nPlease visit the clinic at your scheduled time.\n\nThank you.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-up Management</h1>
          <p className="page-subtitle">Track returning patients and schedule reminder calls</p>
        </div>
        <button className="btn btn-outline" style={{ display: 'flex', gap: '6px' }} onClick={fetchFollowups}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', fontSize: '0.84rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} color="#f59e0b" /> {error}
        </div>
      )}

      {/* Today's follow-up alert banner */}
      {todayFollowups.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', border: '1px solid #86efac', borderRadius: '12px', padding: '14px 18px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <CalendarIcon size={18} color="#16a34a" />
            <span style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>
              {todayFollowups.length} follow-up{todayFollowups.length > 1 ? 's' : ''} due today
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {todayFollowups.map(f => (
              <div key={f._id} style={{ background: 'white', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1a2e25' }}>{f.patientName}</span>
                {(f.phone || f.contact) && (
                  <button
                    onClick={() => sendWhatsApp(f)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#25D366', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <MessageCircle size={13} /> WhatsApp
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="input-field" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-input)', position: 'relative' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search by patient name or diagnosis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
            />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}><X size={15} /></button>}
          </div>
          <div className="input-field" style={{ display: 'flex', alignItems: 'center', width: '200px', background: 'var(--bg-input)' }}>
            <CalendarIcon size={18} color="var(--text-muted)" style={{ marginRight: '10px', flexShrink: 0 }} />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none', fontSize: '0.9rem' }}
            >
              <option value="all">All Follow-ups</option>
              <option value="today">Due Today</option>
              <option value="7days">Next 7 Days</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <MedicalLoader text="Loading follow-ups…" />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <CalendarIcon size={40} color="#e5e7eb" style={{ marginBottom: '10px' }} />
            <div>{search ? 'No results match your search.' : 'No follow-ups scheduled.'}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>Follow-ups are created when saving prescriptions.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Primary Diagnosis</th>
                <th>Due Date</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => {
                const due = f.followUpDate || f.date;
                const overdue = due && isOverdue(due) && f.status !== 'Called' && f.status !== 'Completed';
                return (
                  <tr key={f._id || i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} />
                        </div>
                        <span style={{ fontWeight: '600' }}>{f.patientName}</span>
                      </div>
                    </td>
                    <td>{f.diagnosis || f.notes || '—'}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: overdue ? 'var(--danger)' : 'inherit' }}>
                        <Clock size={14} />
                        {due ? new Date(due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        {overdue && <span style={{ fontSize: '0.7rem', background: '#fef2f2', color: '#ef4444', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>OVERDUE</span>}
                      </span>
                    </td>
                    <td>{f.phone || f.contact || '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[f.status] || 'badge-warning'}`}>{f.status || 'Pending'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                          onClick={() => updateStatus(f._id, 'Called')}
                          disabled={updatingId === f._id || f.status === 'Called'}
                        >
                          {updatingId === f._id ? <Loader2 size={13} className="animate-spin" /> : <PhoneCall size={13} />} Call Log
                        </button>
                        {(f.phone || f.contact) && (
                          <button
                            style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => sendWhatsApp(f)}
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </button>
                        )}
                        {f.status !== 'Completed' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                            onClick={() => updateStatus(f._id, 'Completed')}
                            disabled={updatingId === f._id}
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
