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
      <Link to={link} className="block admin-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-gray-900">{value ?? '—'}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
          <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
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
    { icon: <Users size={22} style={{ color: '#C40001' }} />, label: 'Total Registrations', value: stats?.total, color: 'bg-primary-50', link: '/admin/registrations' },
    { icon: <TrendingUp size={22} style={{ color: '#C40001' }} />, label: 'Technical Events', value: stats?.technical, color: 'bg-primary-50', link: '/admin/registrations?category=technical' },
    { icon: <CalendarDays size={22} style={{ color: '#A80000' }} />, label: 'Non-Technical Events', value: stats?.nonTechnical, color: 'bg-primary-50', link: '/admin/registrations?category=non-technical' },
    { icon: <FileText size={22} style={{ color: '#A80000' }} />, label: 'Paper Submissions', value: stats?.submissions, color: 'bg-primary-50', link: '/admin/submissions' },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of TECH FEST '26 registrations and activity</p>
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
              className="admin-card"
            >
              <h2 className="text-base font-display font-semibold text-gray-900 mb-4">Registrations by Event</h2>
              {stats?.byEvent && stats.byEvent.length > 0 ? (
                <div className="space-y-3">
                  {stats.byEvent.map(({ _id, count }) => (
                    <div key={_id} className="flex items-center gap-3">
                      <p className="text-sm text-gray-700 flex-1 min-w-0 truncate">{_id}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className="h-2 rounded-full bg-primary-600"
                          style={{ width: `${Math.min(100, (count / (stats.total || 1)) * 200)}px`, maxWidth: '120px', minWidth: '8px' }}
                        />
                        <span className="text-sm font-bold text-gray-900 w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">No registrations yet</p>
              )}
            </motion.div>

            {/* Recent Registrations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="admin-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-display font-semibold text-gray-900">Recent Registrations</h2>
                <Link to="/admin/registrations" className="text-xs text-primary-700 hover:underline font-medium">
                  View All
                </Link>
              </div>
              {stats?.recent && stats.recent.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent.map(reg => (
                    <Link
                      key={reg._id}
                      to={`/admin/registrations`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {reg.fullName?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{reg.fullName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>{reg.event?.icon}</span>
                          {reg.eventName}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{new Date(reg.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">No registrations yet</p>
              )}
            </motion.div>
          </div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="admin-card"
          >
            <h2 className="text-base font-display font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Manage Registrations', to: '/admin/registrations', color: 'btn-primary text-sm py-2' },
                { label: 'View Submissions', to: '/admin/submissions', color: 'btn-secondary text-sm py-2' },
                { label: 'Manage Events', to: '/admin/events', color: 'btn-secondary text-sm py-2' },
                { label: 'Update Settings', to: '/admin/settings', color: 'btn-secondary text-sm py-2' },
              ].map(a => (
                <Link key={a.to} to={a.to} className={a.color}>{a.label}</Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
