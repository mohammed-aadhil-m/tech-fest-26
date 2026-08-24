import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Zap, Sparkles } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';

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
    { id: 'all', label: 'All Protocols' },
    { id: 'technical', label: 'Technical' },
    { id: 'non-technical', label: 'Non-Technical' },
  ];

  const filtered = activeTab === 'all'
    ? events
    : events.filter(e => e.category === activeTab || (activeTab === 'non-technical' && e.category === 'coming-soon'));

  const technical = events.filter(e => e.category === 'technical');
  const nonTechnical = events.filter(e => e.category === 'non-technical' || e.category === 'coming-soon');

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white relative overflow-hidden">
      <ThreeBackground />
      
      {/* Page Content */}
      <div className="relative z-10">
        {/* Hero */}
        <div className="relative border-b border-white/5 py-24">
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="badge badge-technical mb-6">TECH FEST '26</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-white mb-6">
              Active <span className="text-gradient-red">Protocols</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-lg font-light leading-relaxed">
              Explore all technical and non-technical events. Initialize your registration to participate and claim victory.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar justify-start sm:justify-center">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(255,42,42,0.6)] border border-red-500/50'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner size="xl" /></div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>
            
            {/* Technical Events */}
            {technical.length > 0 && (
              <div className={`mb-24 relative z-10 transition-opacity duration-500 ${activeTab !== 'all' && activeTab !== 'technical' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-12">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center glow-red flex-shrink-0">
                    <Zap size={24} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Technical Execution</h2>
                    <p className="text-gray-400 font-light text-lg">Showcase your coding and technical mastery</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {technical.map((event, i) => <EventCard key={event._id} event={event} index={i} />)}
                </div>
              </div>
            )}

            {/* Non-Technical Events */}
            {nonTechnical.length > 0 && (
              <div className={`relative z-10 transition-opacity duration-500 ${activeTab !== 'all' && activeTab !== 'non-technical' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-12">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center glow-red flex-shrink-0">
                    <Sparkles size={24} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Non-Technical Engagement</h2>
                    <p className="text-gray-400 font-light text-lg">Fun, creative, and team-based challenges</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {nonTechnical.map((event, i) => <EventCard key={event._id} event={event} index={i} />)}
                </div>
              </div>
            )}

            {events.length === 0 && (
              <div className="text-center py-32 relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6 text-gray-600">
                  <Zap size={32} />
                </div>
                <p className="text-xl font-display font-bold text-gray-400">No protocols found matching this criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
