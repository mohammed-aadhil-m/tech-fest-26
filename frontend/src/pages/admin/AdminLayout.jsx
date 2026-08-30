import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import { FullPageLoader } from '../../components/LoadingSpinner';

export default function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white overflow-hidden relative">
      <div className="absolute inset-0 circuit-bg opacity-10 pointer-events-none"></div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex relative flex-shrink-0 z-20">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 z-10 border-r border-white/10 shadow-[4px_0_24px_rgba(255,42,42,0.1)]">
            <AdminSidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md border-b border-white/10">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center justify-center glow-red">
              <span className="text-red-500 font-bold text-xs">TF</span>
            </div>
            <span className="font-display font-bold text-sm text-white">Admin Panel</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
