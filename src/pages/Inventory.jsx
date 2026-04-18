import { useState, useEffect, useCallback } from 'react';
import { Pill, AlertTriangle, Search, PlusCircle, ArrowDown, ArrowUp, Loader2, RefreshCw, X, Save, IndianRupee } from 'lucide-react';
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
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.medicineName.trim()) { alert('Medicine name required'); return; }
    if (!form.stockQuantity || !form.price) { alert('Stock quantity and price are required'); return; }
    setSaving(true);
    try {
      const r = await authFetch(`${API}/api/inventory`, { method: 'POST', body: JSON.stringify({ ...form, stockQuantity: Number(form.stockQuantity), price: Number(form.price), lowStockThreshold: Number(form.lowStockThreshold) }) });
      if (!r.ok) throw new Error();
      onSaved();
    } catch { alert('Failed to add medicine.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '500px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Add New Medicine</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-group">
            <label className="input-label">Medicine Name *</label>
            <input className="input-field" value={form.medicineName} onChange={e => set('medicineName', e.target.value)} placeholder="e.g. Triphala Churna" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Brand</label>
              <input className="input-field" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Baidyanath" />
            </div>
            <div className="input-group">
              <label className="input-label">Formulation</label>
              <input className="input-field" value={form.formulation} onChange={e => set('formulation', e.target.value)} placeholder="e.g. Churna, Vati, Tablet" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Stock Quantity *</label>
              <input className="input-field" type="number" min="0" value={form.stockQuantity} onChange={e => set('stockQuantity', e.target.value)} placeholder="0" />
            </div>
            <div className="input-group">
              <label className="input-label">Price (₹) *</label>
              <input className="input-field" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Expiry Date</label>
              <input className="input-field" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Low Stock Alert Level</label>
              <input className="input-field" type="number" min="1" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            <button className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Save size={16} />Add Medicine</>}
            </button>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
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
  const [consumingId, setConsumingId] = useState(null);

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

  const consumeOne = async (id) => {
    setConsumingId(id);
    try {
      await authFetch(`${API}/api/inventory/${id}/consume`, { method: 'PATCH', body: JSON.stringify({ quantity: 1 }) });
      fetchInventory();
    } catch { alert('Failed to update stock'); }
    finally { setConsumingId(null); }
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const status = stockStatus(item);
                return (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.medicineName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.brand || '—'}</div>
                    </td>
                    <td>{item.formulation || '—'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: status === 'Out of Stock' ? '#ef4444' : status === 'Low Stock' ? '#f59e0b' : 'inherit' }}>
                        {item.stockQuantity}
                      </span>
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
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => consumeOne(item._id)}
                        disabled={consumingId === item._id || item.stockQuantity === 0}
                      >
                        {consumingId === item._id ? <Loader2 size={13} className="animate-spin" /> : <ArrowDown size={13} />} Use 1
                      </button>
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
