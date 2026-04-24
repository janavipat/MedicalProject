import { useState, useEffect, useCallback } from 'react';
import { Clock, PhoneCall, Calendar as CalendarIcon, Search, User, Loader2, RefreshCw, X, AlertCircle, MessageCircle, Plus, Save } from 'lucide-react';
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

// ── Add Follow-up Modal ──────────────────────────────────────────────────────
function AddFollowUpModal({ onClose, onSaved, authFetch }) {
  const [form, setForm] = useState({ patientName: '', phone: '', diagnosis: '', followUpDate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError('');
    if (!form.patientName.trim()) { setError('Patient name is required.'); return; }
    if (!form.followUpDate)       { setError('Follow-up date is required.'); return; }
    setSaving(true);
    try {
      // Try both common endpoint patterns
      let res = await authFetch(`${API}/api/followup`, {
        method: 'POST',
        body: JSON.stringify({ ...form, status: 'Pending' }),
      });
      if (!res.ok) {
        res = await authFetch(`${API}/api/follow-ups`, {
          method: 'POST',
          body: JSON.stringify({ ...form, status: 'Pending' }),
        });
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || e.message || 'Failed to create follow-up.');
      }
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '460px', background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ height: '4px', background: 'linear-gradient(90deg,#16a34a,#22c55e)' }} />
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon size={18} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Add Follow-up</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Schedule a patient follow-up</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Patient Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input className="input-field" autoFocus value={form.patientName} onChange={e => set('patientName', e.target.value)} placeholder="Enter patient name" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Phone Number</label>
            <input className="input-field" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. 9876543210" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Diagnosis / Reason</label>
            <input className="input-field" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} placeholder="e.g. General checkup" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Follow-up Date <span style={{ color: '#ef4444' }}>*</span></label>
            <input className="input-field" type="date" value={form.followUpDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => set('followUpDate', e.target.value)} />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '0.84rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#374151', fontWeight: 500, cursor: 'pointer', fontSize: '0.88rem' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Follow-up</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function FollowUp() {
  const { authFetch } = useAuth();
  const [followups, setFollowups]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [updatingId, setUpdatingId]     = useState(null);
  const [todayFollowups, setTodayFollowups] = useState([]);
  const [showAdd, setShowAdd]           = useState(false);

  // Try both /api/followup and /api/follow-ups endpoint patterns
  const fetchFollowups = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const buildUrl = (base) => {
        let url = `${base}?limit=200`;
        if (filter === 'today')   url += '&today=true';
        if (filter === '7days')   url += '&week=true';
        if (filter === 'overdue') url += '&overdue=true';
        return url;
      };

      let r = await authFetch(buildUrl(`${API}/api/followup`));
      if (!r.ok) r = await authFetch(buildUrl(`${API}/api/follow-ups`));
      if (!r.ok) throw new Error(`API returned ${r.status}`);

      const data = await r.json();

      // Handle every possible response shape
      let list =
        Array.isArray(data)             ? data :
        Array.isArray(data.followups)   ? data.followups :
        Array.isArray(data.followUps)   ? data.followUps :
        Array.isArray(data.data)        ? data.data :
        Array.isArray(data.items)       ? data.items : [];

      setFollowups(list);

      const todayStr = new Date().toISOString().split('T')[0];
      setTodayFollowups(list.filter(f => {
        const d = f.followUpDate || f.date;
        return d && d.slice(0, 10) === todayStr && f.status !== 'Called' && f.status !== 'Completed';
      }));
    } catch (e) {
      setError(`Could not load follow-ups: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [authFetch, filter]);

  useEffect(() => { fetchFollowups(); }, [fetchFollowups]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      let r = await authFetch(`${API}/api/followup/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      if (!r.ok) r = await authFetch(`${API}/api/follow-ups/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      fetchFollowups();
    } catch { alert('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const sendWhatsApp = (f) => {
    const phone = (f.phone || f.contact || '').replace(/\D/g, '');
    if (!phone) { alert('No phone number available for this patient.'); return; }
    const date = new Date(f.followUpDate || f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const msg = `Dear ${f.patientName}, this is a reminder from MediCore Clinic.\n\nYour follow-up appointment is scheduled for today (${date}).\n\nDiagnosis: ${f.diagnosis || '—'}\n\nPlease visit the clinic at your scheduled time.\n\nThank you.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filtered = followups.filter(f =>
    (f.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.diagnosis   || '').toLowerCase().includes(search.toLowerCase())
  );

  const isOverdue = (dateStr) => new Date(dateStr) < new Date();

  return (
    <div className="animate-fade-in">
      {showAdd && (
        <AddFollowUpModal
          authFetch={authFetch}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchFollowups(); }}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-up Management</h1>
          <p className="page-subtitle">Track returning patients and schedule reminder calls</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" style={{ display: 'flex', gap: '6px' }} onClick={fetchFollowups}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', gap: '6px' }} onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Follow-up
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', fontSize: '0.84rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} color="#ef4444" /> {error}
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
                  <button onClick={() => sendWhatsApp(f)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#25D366', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
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
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none', fontSize: '0.9rem' }}>
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
            <div>{search ? 'No results match your search.' : filter !== 'all' ? 'No follow-ups for this filter.' : 'No follow-ups yet.'}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              {!search && filter === 'all' && 'Use "+ Add Follow-up" or save a prescription with a follow-up date.'}
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Diagnosis</th>
                <th>Due Date</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => {
                const due     = f.followUpDate || f.date;
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
