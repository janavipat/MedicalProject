import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, FileEdit,
  BookOpen, IndianRupee, Pill, Clock, Activity,
  Stethoscope, ClipboardList, HeadphonesIcon, UserPlus, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// roles: undefined = visible to all; array = only those roles can see it
const navItems = [
  { path: '/dashboard',   label: 'Dashboard',         icon: LayoutDashboard },
  { path: '/appointments',label: 'Appointments',       icon: Calendar },
  { path: '/patients',    label: 'Patients',           icon: Users },
  { path: '/prescription',label: 'Prescriptions',      icon: FileEdit,   roles: ['Doctor'] },
  { path: '/inventory',   label: 'Medicine Inventory', icon: Pill },
  { path: '/billing',     label: 'Billing & Payments', icon: IndianRupee },
  { path: '/follow-ups',  label: 'Follow-ups',         icon: Clock },
  { path: '/service',     label: 'Help & Support',     icon: HeadphonesIcon },
  { path: '/signup',      label: 'Register Staff',     icon: UserPlus, roles: ['Receptionist'] },
];

const ROLE_BADGES = {
  Doctor:       { icon: Stethoscope,   color: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
  Receptionist: { icon: ClipboardList, color: '#059669', bg: 'rgba(5,150,105,0.10)' },
};

export default function Sidebar() {
  const { role, userName, logout } = useAuth();
  const navigate = useNavigate();
  const badge = ROLE_BADGES[role] || ROLE_BADGES.Receptionist;
  const RoleIcon = badge.icon;

  const visible = navItems.filter(item => !item.roles || item.roles.includes(role));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch { /* ignore */ }
  };

  return (
    <aside className="sidebar">
      {/* Brand + Role Badge aligned in header */}
      <div className="sidebar-header" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '4px', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(22,163,74,0.10)', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="var(--primary)" strokeWidth={2} />
          </div>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '700', letterSpacing: '-0.02em' }}>
            MediCore
          </span>
        </div>
        {role && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '2px' }}>
            <RoleIcon size={12} color={badge.color} />
            <span style={{ fontSize: '0.7rem', color: badge.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{role}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>· {userName || 'Staff'}</span>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {visible.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-container">
              <item.icon size={20} strokeWidth={2.2} />
            </div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fecaca'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <LogOut size={16} strokeWidth={2} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
