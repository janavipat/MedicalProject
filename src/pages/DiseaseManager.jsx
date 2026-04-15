import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen, Search, Edit, Plus, Loader2, RefreshCw, X, Save,
  ChevronDown, ChevronUp, Pill, Trash2, Stethoscope, Activity, Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const API = 'https://medical-project-h6yc.vercel.app';

/* ── Dosha styles ─────────────────────────────────────────────────────────── */
const DOSHA_STYLE = {
  'Pitta':       { bg: 'rgba(239,68,68,0.1)',    color: '#ef4444' },
  'Vata':        { bg: 'rgba(59,130,246,0.1)',   color: '#3b82f6' },
  'Kapha':       { bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b' },
  'Tridosha':    { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a' },
  'Vata-Pitta':  { bg: 'rgba(139,92,246,0.1)',   color: '#8b5cf6' },
  'Kapha-Vata':  { bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b' },
  'Pitta-Vata':  { bg: 'rgba(239,68,68,0.1)',    color: '#ef4444' },
  'Kapha-Pitta': { bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b' },
  'Pitta-Kapha': { bg: 'rgba(239,68,68,0.1)',    color: '#ef4444' },
};
const doshaStyle = (d) => DOSHA_STYLE[d] || { bg: 'rgba(22,163,74,0.1)', color: '#16a34a' };

/* ── Disease Card ─────────────────────────────────────────────────────────── */
function DiseaseCard({ d, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const ds = doshaStyle(d.mainDosha);

  return (
    <div style={{
      padding: '20px', background: 'var(--bg-card)', borderRadius: '16px',
      border: '1px solid var(--border-color)', transition: 'box-shadow 0.2s',
      display: 'flex', flexDirection: 'column', gap: '14px',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={16} color="#16a34a" />
            </div>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>{d.name}</h3>
          </div>
          {d.localName && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '40px' }}>{d.localName}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
          {d.mainDosha && (
            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: ds.bg, color: ds.color }}>
              {d.mainDosha}
            </span>
          )}
          <button
            onClick={() => onEdit(d)}
            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-muted)'}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.querySelector('svg').style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.querySelector('svg').style.color = 'var(--text-muted)'; }}
          >
            <Edit size={14} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* System type */}
      {d.type && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Activity size={13} /> {d.type} System
        </div>
      )}

      {/* Medicines */}
      {d.commonMedicines?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Pill size={12} /> Standard Medicines
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {d.commonMedicines.map(m => (
              <span key={m} style={{ padding: '3px 10px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '20px', fontSize: '0.78rem', color: '#16a34a', fontWeight: 500 }}>{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* Pathya / Apathya toggle */}
      {(d.pathya || d.apathya) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', padding: 0, alignSelf: 'flex-start' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide' : 'Show'} Pathya / Apathya
          </button>
          {expanded && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
              {d.pathya && (
                <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Check size={13} /> Pathya (Do's)
                  </div>
                  <div style={{ color: '#374151', lineHeight: 1.5 }}>{d.pathya}</div>
                </div>
              )}
              {d.apathya && (
                <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '12px', border: '1px solid #fecaca' }}>
                  <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <X size={13} /> Apathya (Don'ts)
                  </div>
                  <div style={{ color: '#374151', lineHeight: 1.5 }}>{d.apathya}</div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Disease Modal (Add / Edit) ──────────────────────────────────────────── */
function DiseaseModal({ disease, onClose, onSave }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState(
    disease
      ? { ...disease }
      : { name: '', localName: '', type: '', mainDosha: '', commonMedicines: [], pathya: '', apathya: '', description: '' }
  );
  const [medInput, setMedInput]     = useState('');
  const [medSuggestions, setMedSuggestions] = useState([]);
  const [showMedSug, setShowMedSug] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const medRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* Medicine autocomplete from inventory */
  const fetchMedSuggestions = async (q) => {
    if (!q || q.length < 2) { setMedSuggestions([]); setShowMedSug(false); return; }
    try {
      const res  = await authFetch(`${API}/api/inventory/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setMedSuggestions(Array.isArray(data) ? data : []);
      setShowMedSug(true);
    } catch { setMedSuggestions([]); }
  };

  const addMedFromSuggestion = (name) => {
    if (name && !form.commonMedicines.includes(name)) {
      set('commonMedicines', [...form.commonMedicines, name]);
    }
    setMedInput('');
    setMedSuggestions([]);
    setShowMedSug(false);
    medRef.current?.focus();
  };

  const addMedManual = () => {
    const v = medInput.trim();
    if (v && !form.commonMedicines.includes(v)) {
      set('commonMedicines', [...form.commonMedicines, v]);
    }
    setMedInput('');
    setMedSuggestions([]);
    setShowMedSug(false);
  };

  const removeMed = (m) => set('commonMedicines', form.commonMedicines.filter(x => x !== m));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Disease name is required.'); return; }
    setError('');
    setSaving(true);
    try {
      const method = disease ? 'PUT' : 'POST';
      const url    = disease ? `${API}/api/diseases/${disease._id}` : `${API}/api/diseases`;
      const r = await authFetch(url, { method, body: JSON.stringify(form) });
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.error || 'Save failed');
      }
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const ds = doshaStyle(form.mainDosha);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div className="glass-panel" style={{ width: '660px', maxHeight: '90vh', overflowY: 'auto', padding: 0, borderRadius: '20px' }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-muted)', borderRadius: '20px 20px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={18} color="#16a34a" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                {disease ? 'Edit Disease Protocol' : 'Add New Disease Protocol'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {disease ? 'Update Ayurvedic treatment protocol' : 'Define medicines, pathya and apathya'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Section: Basic Info */}
          <section>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={12} /> Basic Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Disease Name (Ayurvedic) <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Amlapitta" autoFocus />
              </div>
              <div className="input-group">
                <label className="input-label">Local / Common Name</label>
                <input className="input-field" value={form.localName} onChange={e => set('localName', e.target.value)} placeholder="e.g. Hyperacidity / GERD" />
              </div>
              <div className="input-group">
                <label className="input-label">System / Type</label>
                <input className="input-field" value={form.type} onChange={e => set('type', e.target.value)} placeholder="e.g. Digestive, Respiratory" />
              </div>
              <div className="input-group">
                <label className="input-label">Main Dosha</label>
                <select className="input-field" value={form.mainDosha} onChange={e => set('mainDosha', e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="">Select Dosha</option>
                  {['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Kapha-Vata', 'Pitta-Kapha', 'Tridosha'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {form.mainDosha && (
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: ds.bg, color: ds.color }}>{form.mainDosha}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section: Medicines */}
          <section>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pill size={12} /> Standard Medicines (from Inventory)
            </div>

            {/* Autocomplete input */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    ref={medRef}
                    className="input-field"
                    value={medInput}
                    onChange={e => { setMedInput(e.target.value); fetchMedSuggestions(e.target.value); }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMedManual(); } }}
                    onBlur={() => setTimeout(() => setShowMedSug(false), 160)}
                    placeholder="Search inventory or type medicine name..."
                    autoComplete="off"
                  />
                  {showMedSug && medSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300,
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      marginTop: '4px', maxHeight: '200px', overflowY: 'auto',
                    }}>
                      {medSuggestions.map(s => {
                        const qty = s.stockQuantity ?? 0;
                        const alreadyAdded = form.commonMedicines.includes(s.medicineName);
                        const stockColor = qty === 0 ? '#ef4444' : qty <= (s.lowStockThreshold || 10) ? '#f59e0b' : '#16a34a';
                        return (
                          <div
                            key={s._id}
                            onMouseDown={() => addMedFromSuggestion(s.medicineName)}
                            style={{
                              padding: '9px 14px', cursor: alreadyAdded ? 'default' : 'pointer',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              borderBottom: '1px solid var(--border-color)',
                              opacity: alreadyAdded ? 0.5 : 1,
                            }}
                            onMouseEnter={e => !alreadyAdded && (e.currentTarget.style.background = 'var(--bg-muted)')}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {s.medicineName}
                                {alreadyAdded && <span style={{ fontSize: '0.7rem', color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '1px 6px', borderRadius: '8px' }}>Added</span>}
                              </div>
                              {s.formulation && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>{s.formulation}{s.brand ? ` · ${s.brand}` : ''}</div>}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: stockColor, background: `${stockColor}18`, padding: '2px 8px', borderRadius: '10px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {qty === 0 ? 'Out' : `${qty} left`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addMedManual}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <Plus size={15} /> Add
                </button>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', margin: '6px 0 0' }}>
                Type to search from inventory · Press Enter or click Add to add manually
              </p>
            </div>

            {/* Medicine chips */}
            {form.commonMedicines.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: 'var(--bg-muted)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {form.commonMedicines.map(m => (
                  <span key={m} style={{
                    padding: '5px 12px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)',
                    borderRadius: '20px', fontSize: '0.8rem', color: '#16a34a', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Pill size={11} /> {m}
                    <button
                      onClick={() => removeMed(m)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#6b7280', display: 'flex', alignItems: 'center', lineHeight: 1 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Section: Pathya / Apathya */}
          <section>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Lifestyle Guidance
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label" style={{ color: '#16a34a' }}>✓ Pathya — Do's / Recommended</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={form.pathya}
                  onChange={e => set('pathya', e.target.value)}
                  placeholder="e.g. Light easily digestible food, rest..."
                  style={{ resize: 'vertical', borderColor: 'rgba(22,163,74,0.2)' }}
                />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ color: '#dc2626' }}>✗ Apathya — Don'ts / Avoid</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={form.apathya}
                  onChange={e => set('apathya', e.target.value)}
                  placeholder="e.g. Spicy food, heavy meals, cold drinks..."
                  style={{ resize: 'vertical', borderColor: 'rgba(220,38,38,0.2)' }}
                />
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {disease ? 'Update Protocol' : 'Save Protocol'}</>}
            </button>
            <button className="btn btn-outline" onClick={onClose} style={{ minWidth: '100px' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function DiseaseManager() {
  const { authFetch } = useAuth();
  const [diseases, setDiseases]     = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [showModal, setShowModal]   = useState(false);

  const fetchDiseases = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/diseases`);
      const data = await r.json();
      setDiseases(Array.isArray(data) ? data : []);
    } catch { setDiseases([]); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { fetchDiseases(); }, [fetchDiseases]);

  const filtered = diseases.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.localName?.toLowerCase().includes(search.toLowerCase()) ||
    d.type?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (d) => { setEditTarget(d); setShowModal(true); };
  const closeModal  = () => { setShowModal(false); setEditTarget(null); };
  const handleSaved = () => { closeModal(); fetchDiseases(); };

  return (
    <div className="animate-fade-in">
      {showModal && <DiseaseModal disease={editTarget} onClose={closeModal} onSave={handleSaved} />}

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Smart Disease Manager</h1>
          <p className="page-subtitle">Configure protocols, pathya-apathya, and standard medicines</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={fetchDiseases}>
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openAdd}>
            <Plus size={18} /> Add Disease
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel" style={{ marginBottom: '20px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by disease name, local name, or body system..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none', fontSize: '0.9rem' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: '12px', color: '#9ca3af' }}>
          <Loader2 size={36} className="animate-spin" color="#16a34a" />
          <span>Loading disease protocols...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          <BookOpen size={48} color="#e5e7eb" style={{ marginBottom: '14px' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>No diseases found</div>
          <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
            {search ? 'Try a different search term.' : 'Click "Add Disease" to create a new protocol.'}
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {filtered.length} protocol{filtered.length !== 1 ? 's' : ''} found
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
            {filtered.map(d => <DiseaseCard key={d._id} d={d} onEdit={openEdit} />)}
          </div>
        </>
      )}
    </div>
  );
}
