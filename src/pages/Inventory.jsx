import { useState, useEffect, useCallback, useRef } from 'react';
import { Pill, AlertTriangle, Search, PlusCircle, Loader2, RefreshCw, X, Save, IndianRupee, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import MedicalLoader from '../components/MedicalLoader.jsx';

const API = 'https://medical-project-h6yc.vercel.app';

function stockStatus(item) {
  if (item.stockQuantity === 0) return 'Out of Stock';
  if (item.stockQuantity <= (item.lowStockThreshold || 10)) return 'Low Stock';
  return 'In Stock';
}

function AddMedicineModal({ onClose, onSaved }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState({ medicineName: '', brand: '', formulation: '', stockQuantity: '', price: '', expiryDate: '', lowStockThreshold: 10 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError('');
    if (!form.medicineName.trim()) { setError('Medicine name is required.'); return; }
    if (!form.stockQuantity) { setError('Stock quantity is required.'); return; }
    if (!form.price) { setError('Price is required.'); return; }
    setSaving(true);
    try {
      const r = await authFetch(`${API}/api/inventory`, {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          stockQuantity: Number(form.stockQuantity),
          price: Number(form.price),
          lowStockThreshold: Number(form.lowStockThreshold),
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to add medicine.');
      }
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '520px', maxHeight: '90vh', background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top accent bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #16a34a, #22c55e)', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Pill size={18} color="#16a34a" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Add New Medicine</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Add to inventory for tracking & prescriptions</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          ><X size={16} /></button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* Group: MEDICINE DETAILS */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
            Medicine Details
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div className="input-group" style={{ marginBottom: '12px' }}>
              <label className="input-label">Medicine Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input className="input-field" value={form.medicineName} onChange={e => set('medicineName', e.target.value)} placeholder="e.g. Triphala Churna" autoFocus style={{ marginBottom: 0 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Brand</label>
                <input className="input-field" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Baidyanath" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Formulation</label>
                <input className="input-field" value={form.formulation} onChange={e => set('formulation', e.target.value)} placeholder="e.g. Churna, Vati" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: '#f1f5f9', margin: '0 0 24px' }} />

          {/* Group: STOCK & PRICING */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
            Stock & Pricing
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Stock Quantity <span style={{ color: '#ef4444' }}>*</span></label>
              <input className="input-field" type="number" min="0" value={form.stockQuantity} onChange={e => set('stockQuantity', e.target.value)} placeholder="0" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Price (₹) <span style={{ color: '#ef4444' }}>*</span></label>
              <input className="input-field" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: '#f1f5f9', margin: '0 0 24px' }} />

          {/* Group: EXPIRY & ALERTS */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
            Expiry & Alerts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: error ? '24px' : 0 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Expiry Date</label>
              <input className="input-field" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Low Stock Alert Level</label>
              <input className="input-field" type="number" min="1" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} /> {error}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, padding: '16px 28px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#374151', fontWeight: 500, cursor: 'pointer', fontSize: '0.88rem' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(22,163,74,0.25)', cursor: 'pointer' }}
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Add Medicine</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { authFetch } = useAuth();
  const [stock, setStock]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  // qty editing: { [id]: { value, saving, saved } }
  const [qtyEdit, setQtyEdit]     = useState({});
  const saveTimers = useRef({});

  // Lock background scroll when modal is open
  useEffect(() => {
    const el = document.querySelector('.main-content');
    if (el) el.style.overflow = showAdd ? 'hidden' : '';
    return () => { if (el) el.style.overflow = ''; };
  }, [showAdd]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/inventory`);
      const data = await r.json();
      setStock(Array.isArray(data) ? data : []);
    } catch { setStock([]); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // Auto-save qty on blur
  const handleQtyBlur = async (item) => {
    const entry = qtyEdit[item._id];
    if (!entry) return;
    const newQty = Number(entry.value);
    if (isNaN(newQty) || newQty < 0 || newQty === item.stockQuantity) {
      setQtyEdit(p => { const n = { ...p }; delete n[item._id]; return n; });
      return;
    }
    setQtyEdit(p => ({ ...p, [item._id]: { ...p[item._id], saving: true } }));
    try {
      await authFetch(`${API}/api/inventory/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({ stockQuantity: newQty }),
      });
      // Update local state immediately
      setStock(prev => prev.map(s => s._id === item._id ? { ...s, stockQuantity: newQty } : s));
      setQtyEdit(p => ({ ...p, [item._id]: { value: String(newQty), saving: false, saved: true } }));
      // Clear saved indicator after 1.5s
      saveTimers.current[item._id] = setTimeout(() => {
        setQtyEdit(p => { const n = { ...p }; delete n[item._id]; return n; });
      }, 1500);
    } catch {
      setQtyEdit(p => { const n = { ...p }; delete n[item._id]; return n; });
      alert('Failed to update quantity');
    }
  };

  const filtered = stock.filter(item =>
    item.medicineName?.toLowerCase().includes(search.toLowerCase()) ||
    item.brand?.toLowerCase().includes(search.toLowerCase()) ||
    item.formulation?.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems    = stock.length;
  const lowStockCount = stock.filter(i => stockStatus(i) !== 'In Stock').length;
  const stockValue    = stock.reduce((s, i) => s + (i.stockQuantity || 0) * (i.price || 0), 0);

  return (
    <div className="animate-fade-in">
      {showAdd && <AddMedicineModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); fetchInventory(); }} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Medicine Inventory</h1>
          <p className="page-subtitle">Track stock levels, expiries, and usage for in-clinic dispensing</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ display: 'flex', gap: '8px' }} onClick={fetchInventory}><RefreshCw size={16} /> Refresh</button>
          <button className="btn btn-primary" style={{ display: 'flex', gap: '8px' }} onClick={() => setShowAdd(true)}><PlusCircle size={18} /> Add Medicine</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-info">
            <div className="stat-label">Total Items Tracked</div>
            <div className="stat-value">{loading ? '—' : totalItems}</div>
          </div>
          <Pill size={40} color="var(--primary)" style={{ position: 'absolute', right: '20px', opacity: 0.2 }} />
        </div>
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="stat-info">
            <div className="stat-label">Low / Critical Stock</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{loading ? '—' : lowStockCount}</div>
          </div>
          <AlertTriangle size={40} color="var(--danger)" style={{ position: 'absolute', right: '20px', opacity: 0.2 }} />
        </div>
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="stat-info">
            <div className="stat-label">Total Stock Value</div>
            <div className="stat-value">{loading ? '—' : `₹${stockValue.toLocaleString('en-IN')}`}</div>
          </div>
          <IndianRupee size={40} color="var(--warning)" style={{ position: 'absolute', right: '20px', opacity: 0.2 }} />
        </div>
      </div>

      <div className="glass-panel">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="input-field" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-input)' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search by medicine name, brand or formulation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
            />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}><X size={15} /></button>}
          </div>
        </div>

        {loading ? (
          <MedicalLoader text="Loading inventory…" />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <Pill size={40} color="#e5e7eb" style={{ marginBottom: '10px' }} />
            <div>{search ? 'No medicines match your search.' : 'No medicines in inventory. Add one or run the seed script.'}</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine Name & Brand</th>
                <th>Formulation</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const status = stockStatus(item);
                const editing = qtyEdit[item._id];
                return (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.medicineName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.brand || '—'}</div>
                    </td>
                    <td>{item.formulation || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min="0"
                          value={editing ? editing.value : item.stockQuantity}
                          onChange={e => setQtyEdit(p => ({ ...p, [item._id]: { value: e.target.value, saving: false, saved: false } }))}
                          onBlur={() => handleQtyBlur(item)}
                          onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                          style={{
                            width: '70px', padding: '4px 8px', borderRadius: '6px',
                            border: editing ? '1.5px solid #16a34a' : '1px solid var(--border-color)',
                            background: 'var(--bg-input)', color: editing ? '#16a34a' : (status === 'Out of Stock' ? '#ef4444' : status === 'Low Stock' ? '#f59e0b' : 'inherit'),
                            fontWeight: 700, fontSize: '0.9rem', outline: 'none', textAlign: 'center',
                          }}
                        />
                        {editing?.saving && <Loader2 size={13} className="animate-spin" color="#16a34a" />}
                        {editing?.saved  && <Check size={13} color="#16a34a" />}
                      </div>
                    </td>
                    <td>₹{item.price?.toLocaleString('en-IN') || '—'}</td>
                    <td style={{ fontSize: '0.85rem', color: item.expiryDate && new Date(item.expiryDate) < new Date() ? '#ef4444' : 'inherit' }}>
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${status === 'In Stock' ? 'badge-success' : status === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`}>
                        {status}
                      </span>
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
