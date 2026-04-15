import { X, CheckCircle, AlertCircle, HelpCircle, Info } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '500px',
        animation: 'modalFadeIn 0.25s ease-out forwards',
        padding: 0, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-muted)',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--border-color)',
            display: 'flex', justifyContent: 'flex-end', gap: '12px',
            background: 'var(--bg-muted)',
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);     }
        }
      `}</style>
    </div>
  );
}

/** Convenience helper — renders icon + message inside a Modal */
export function AlertModal({ isOpen, onClose, title, message, type = 'info', showConfirm = false, onConfirm }) {
  const iconMap = {
    success: <CheckCircle size={28} />,
    danger:  <AlertCircle size={28} />,
    warning: <HelpCircle  size={28} />,
    info:    <Info        size={28} />,
  };
  const colorMap = {
    success: { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
    danger:  { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
    info:    { bg: 'rgba(14,165,233,0.1)',  color: '#0ea5e9' },
  };
  const c = colorMap[type] || colorMap.info;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        showConfirm ? (
          <>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
              style={type === 'danger' ? { background: '#ef4444', color: 'white', border: 'none' } : {}}
              onClick={onConfirm}
            >
              Confirm
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={onClose}>Okay</button>
        )
      }
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, color: c.color, flexShrink: 0 }}>
          {iconMap[type]}
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.5 }}>
          {message}
        </div>
      </div>
    </Modal>
  );
}
