import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarDays, FileText, Trophy,
  Settings, LogOut, Menu, X, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Registrations', to: '/admin/registrations', icon: Users },
  { label: 'Teams', to: '/admin/teams', icon: Shield },
  { label: 'Events', to: '/admin/events', icon: CalendarDays },
  { label: 'Paper Submissions', to: '/admin/submissions', icon: FileText },
  { label: 'Winners', to: '/admin/winners', icon: Trophy },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={`flex flex-col h-full bg-black/60 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center justify-center flex-shrink-0 glow-red">
          <span className="text-red-500 font-bold text-xs">TF</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-display font-bold text-sm leading-tight uppercase tracking-wider">TECH FEST '26</p>
            <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute top-4 right-[-12px] w-6 h-6 bg-red-900 border border-red-500 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,42,42,0.5)] transition-all z-50"
      >
        {collapsed ? <ChevronRight size={12} /> : <X size={12} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 mx-2 rounded-xl mb-1 group relative border ${
                isActive
                  ? 'bg-red-500/20 text-red-500 border-red-500/50 glow-red'
                  : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white hover:border-white/10'
              }`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate uppercase tracking-wider text-xs">{item.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-black border border-red-500/30 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(255,42,42,0.3)] opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-white/10 p-4 bg-black/40">
        {!collapsed && admin && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 text-xs font-bold flex-shrink-0 glow-red">
              {admin.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold uppercase tracking-wide truncate">{admin.username}</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">{admin.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all duration-300 text-xs font-bold uppercase tracking-wider w-full px-2 py-2.5 rounded-xl"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
}
