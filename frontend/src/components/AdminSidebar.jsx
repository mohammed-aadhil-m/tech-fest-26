import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarDays, FileText, Trophy,
  Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Registrations', to: '/admin/registrations', icon: Users },
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
    <div className={`flex flex-col h-full bg-gray-900 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-red-gradient rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">TF</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-display font-bold text-sm leading-tight">TECH FEST '26</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute top-4 right-[-12px] w-6 h-6 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full flex items-center justify-center shadow-md transition-all"
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
              `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 mx-2 rounded-xl mb-1 group relative ${
                isActive
                  ? 'bg-primary-700 text-white shadow-red-sm'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-gray-800 p-4">
        {!collapsed && admin && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {admin.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{admin.username}</p>
              <p className="text-gray-400 text-xs capitalize">{admin.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm w-full px-2 py-2 rounded-lg hover:bg-gray-800"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
}
