import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Zap, Sparkles } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'all', label: 'All Events' },
    { id: 'technical', label: 'Technical' },
    { id: 'non-technical', label: 'Non-Technical' },
  ];

  const filtered = activeTab === 'all'
    ? events
    : events.filter(e => e.category === activeTab || (activeTab === 'non-technical' && e.category === 'coming-soon'));

  const technical = events.filter(e => e.category === 'technical');
  const nonTechnical = events.filter(e => e.category === 'non-technical' || e.category === 'coming-soon');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b py-16 circuit-bg" style={{ backgroundColor: '#FFFDF2', borderColor: '#E5E5E5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge badge-technical mb-4">TECH FEST '26</span>
            <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-4">
              All <span className="text-gradient-red">Events</span>
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Explore all technical and non-technical events. Register to participate and win exciting prizes.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E5E5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  backgroundColor: activeTab === tab.id ? '#C40001' : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : '#555555',
                  boxShadow: activeTab === tab.id ? '0 2px 8px rgba(196,0,1,0.2)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner size="xl" /></div>
        ) : (
          <>
            {/* Technical Events */}
            {(activeTab === 'all' || activeTab === 'technical') && technical.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff0f0' }}>
                    <Zap size={20} style={{ color: '#C40001' }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold" style={{ color: '#222222' }}>Technical Events</h2>
                    <p className="text-sm" style={{ color: '#555555' }}>Showcase your coding and technical expertise</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {technical.map((event, i) => <EventCard key={event._id} event={event} index={i} />)}
                </div>
              </div>
            )}

            {/* Non-Technical Events */}
            {(activeTab === 'all' || activeTab === 'non-technical') && nonTechnical.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff8f0' }}>
                    <Sparkles size={20} style={{ color: '#8a3000' }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold" style={{ color: '#222222' }}>Non-Technical Events</h2>
                    <p className="text-sm" style={{ color: '#555555' }}>Fun, creative, and team-based challenges</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nonTechnical.map((event, i) => <EventCard key={event._id} event={event} index={i} />)}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-24 text-gray-400">
                <p className="text-lg font-medium">No events found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
