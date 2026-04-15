import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Phone, History, Loader2, X, RefreshCw, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Patients() {
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`${API}/api/patients?limit=500`);
      const data = await res.json();
      // Backend returns { patients: [...], total }
      const list = Array.isArray(data.patients) ? data.patients : Array.isArray(data) ? data : [];
      setPatients(list);
    } catch (err) {
      setError('Could not load patients. Check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // Client-side filter (same as reference)
  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.contact || p.phone || '').includes(searchTerm)
  );

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Patient Resources</h1>
          <p className="page-subtitle">Manage patient records and medical histories</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={fetchPatients}>
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/prescription')}>
            <Plus size={18} /> Register New Patient
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', fontSize: '0.84rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="glass-panel">
        {/* Search bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="input-field" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-muted)', paddingLeft: '16px', position: 'relative' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '10px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search patients by name or phone..."
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none', padding: '12px 0' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0 12px' }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>Patient Info</th>
                <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>Contact</th>
                <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>Last Prescription</th>
                <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">
                    <div className="loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '12px' }}>
                      <Loader2 className="animate-spin" size={40} color="#16a34a" />
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Opening Patient Records...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                    <User size={40} color="#e5e7eb" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: 600 }}>{searchTerm ? 'No patients match your search.' : 'No patients yet.'}</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>Patients are registered when appointments are booked or prescriptions are created.</div>
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p._id || p.id}>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.age ? `${p.age} yrs` : ''}
                        {p.age && p.gender ? ' • ' : ''}
                        {p.gender || ''}
                      </div>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} /> {p.contact || p.phone || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      {p.lastPrescription ? (
                        <>
                          <div style={{ fontWeight: 500 }}>
                            {new Date(p.lastPrescription.createdAt).toLocaleDateString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {p.lastPrescription.diagnosis || '—'}
                          </div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No history</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => navigate(`/patients/${p._id || p.id}/history`)}
                      >
                        <History size={15} /> View History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            {filtered.length} patient{filtered.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
    </div>
  );
}
