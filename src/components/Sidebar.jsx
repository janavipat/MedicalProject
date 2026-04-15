import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, FileEdit,
  BookOpen, IndianRupee, Pill, Clock, Activity,
  Stethoscope, ClipboardList,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// roles: undefined = visible to all; array = only those roles can see it
const navItems = [
  { path: '/dashboard',   label: 'Dashboard',         icon: LayoutDashboard },
  { path: '/appointments',label: 'Appointments',       icon: Calendar },
  { path: '/patients',    label: 'Patients',           icon: Users },
  { path: '/prescription',label: 'Prescriptions',      icon: FileEdit,   roles: ['Doctor'] },
  { path: '/diseases',    label: 'Disease Manager',    icon: BookOpen,   roles: ['Doctor'] },
  { path: '/inventory',   label: 'Medicine Inventory', icon: Pill },
  { path: '/billing',     label: 'Billing & Payments', icon: IndianRupee },
  { path: '/follow-ups',  label: 'Follow-ups',         icon: Clock },
];

const ROLE_BADGES = {
  Doctor:       { icon: Stethoscope,   color: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
  Receptionist: { icon: ClipboardList, color: '#059669', bg: 'rgba(5,150,105,0.10)' },
};

export default function Sidebar() {
  const { role, userName } = useAuth();
  const badge = ROLE_BADGES[role] || ROLE_BADGES.Receptionist;
  const RoleIcon = badge.icon;

  const visible = navItems.filter(item => !item.roles || item.roles.includes(role));

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-header" style={{ gap: '14px', paddingTop: '20px', paddingBottom: '20px', height: 'auto' }}>
        <div style={{ background: 'rgba(22,163,74,0.10)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={24} color="var(--primary)" strokeWidth={2} />
        </div>
        <span style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '700', letterSpacing: '-0.02em' }}>
          AyurClinic
        </span>
      </div>

      {/* Role badge */}
      {role && (
        <div style={{ margin: '0 16px 12px', padding: '10px 12px', borderRadius: '10px', background: badge.bg, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RoleIcon size={16} color={badge.color} />
          <div>
            <div style={{ fontSize: '0.7rem', color: badge.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{role}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '1px' }}>{userName || 'Staff'}</div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="sidebar-nav">
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
    </aside>
  );
}
