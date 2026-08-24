import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CalendarDays, FileText, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function StatCard({ icon, label, value, color, link, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link to={link} className="block bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-red-500/50 hover:bg-white/5 transition-all duration-300 group shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 glow-red`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-white group-hover:text-red-400 transition-colors">{value ?? '—'}</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{label}</p>
          </div>
          <ChevronRight size={16} className="ml-auto text-gray-600 group-hover:text-red-500 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: <Users size={22} />, label: 'Total Registrations', value: stats?.totalRegistrations, color: 'text-red-500', link: '/admin/registrations' },
    { icon: <TrendingUp size={22} />, label: 'Total Users', value: stats?.totalUsers, color: 'text-red-500', link: '/admin/registrations' },
    { icon: <CalendarDays size={22} />, label: 'Total Teams', value: stats?.totalTeams, color: 'text-red-500', link: '/admin/registrations' },
    { icon: <FileText size={22} />, label: 'Paper Submissions', value: stats?.submissions || 0, color: 'text-red-500', link: '/admin/submissions' },
  ];

  return (
    <div className="p-6 md:p-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-white tracking-wide">Terminal <span className="text-red-500">Overview</span></h1>
        <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-bold">System metrics and live analytics</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {statCards.map((card, i) => (
              <StatCard key={card.label} {...card} index={i} />
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* By Event */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-sm font-display font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Registrations by Protocol</h2>
              {stats?.byEvent && stats.byEvent.length > 0 ? (
                <div className="space-y-4">
                  {stats.byEvent.map(({ _id, count }) => (
                    <div key={_id} className="flex items-center gap-3">
                      <p className="text-sm text-gray-400 flex-1 min-w-0 truncate font-bold">{_id}</p>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div
                          className="h-1.5 rounded-full bg-red-500 glow-red"
                          style={{ width: `${Math.min(100, (count / (stats.totalRegistrations || 1)) * 200)}px`, maxWidth: '120px', minWidth: '8px' }}
                        />
                        <span className="text-xs font-bold text-white w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/5">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No data available</p>
                </div>
              )}
            </motion.div>

            {/* Recent Registrations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <h2 className="text-sm font-display font-bold text-white uppercase tracking-widest">Recent Initializations</h2>
                <Link to="/admin/registrations" className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest border border-red-500/30 px-3 py-1 rounded-full hover:bg-red-500/10 transition-colors">
                  View All
                </Link>
              </div>
              {stats?.recent && stats.recent.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent.map(reg => (
                    <Link
                      key={reg._id}
                      to={`/admin/registrations`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold flex items-center justify-center flex-shrink-0 glow-red group-hover:bg-red-500/20">
                        {reg.user?.fullName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{reg.user?.fullName || 'Unknown User'}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 truncate">
                          {reg.event?.name || 'Unknown Event'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-gray-600 font-bold">{new Date(reg.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/5">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No recent initializations</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <h2 className="text-sm font-display font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">System Commands</h2>
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Manage Registrations', to: '/admin/registrations', primary: true },
                { label: 'View Submissions', to: '/admin/submissions', primary: false },
                { label: 'Manage Events', to: '/admin/events', primary: false },
                { label: 'Update Settings', to: '/admin/settings', primary: false },
              ].map(a => (
                <Link 
                  key={a.to} 
                  to={a.to} 
                  className={`text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 flex-1 text-center sm:flex-none ${
                    a.primary 
                      ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
