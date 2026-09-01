import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Sparkles } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ThreeBackground from '../components/ThreeBackground';

const positionConfig = {
  '1st': {
    label: '1st Place',
    icon: '🥇',
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.25)]',
    cardBorder: 'border-yellow-500/30 hover:border-yellow-500/60 shadow-[0_0_25px_rgba(234,179,8,0.1)]',
    ringColor: 'border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
  },
  '2nd': {
    label: '2nd Place',
    icon: '🥈',
    badgeClass: 'bg-slate-400/15 text-slate-200 border-slate-400/40 shadow-[0_0_15px_rgba(148,163,184,0.25)]',
    cardBorder: 'border-slate-400/30 hover:border-slate-400/60 shadow-[0_0_25px_rgba(148,163,184,0.1)]',
    ringColor: 'border-slate-300/60 shadow-[0_0_20px_rgba(148,163,184,0.4)]'
  },
  '3rd': {
    label: '3rd Place',
    icon: '🥉',
    badgeClass: 'bg-amber-600/15 text-amber-400 border-amber-600/40 shadow-[0_0_15px_rgba(217,119,6,0.25)]',
    cardBorder: 'border-amber-600/30 hover:border-amber-600/60 shadow-[0_0_25px_rgba(217,119,6,0.1)]',
    ringColor: 'border-amber-600/60 shadow-[0_0_20px_rgba(217,119,6,0.4)]'
  },
};

export default function Winners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/winners')
      .then(res => setWinners(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group winners by event
  const byEvent = winners.reduce((acc, w) => {
    const key = w.eventName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white relative overflow-hidden">
      <ThreeBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="relative border-b border-white/5 py-20 sm:py-24">
          <div className="absolute inset-0 circuit-bg opacity-30"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <span className="badge badge-technical mb-6">
                Hall of Champions
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black mb-4 text-white tracking-tight">
                Event <span className="text-gradient-red">Winners</span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg font-light max-w-2xl mx-auto">
                Celebrating the champions, innovators, and top performers of TECH FEST '26
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

          {loading ? (
            <div className="flex justify-center py-24 relative z-10">
              <LoadingSpinner size="xl" />
            </div>
          ) : Object.keys(byEvent).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 relative z-10 card bg-black/60 border border-white/10 p-12 backdrop-blur-xl max-w-2xl mx-auto rounded-3xl"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-red-500/10 border border-red-500/30 glow-red">
                <Trophy size={36} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-3">
                Winners Announcement Coming Soon!
              </h2>
              <p className="text-gray-400 font-light text-sm sm:text-base leading-relaxed">
                The competition is underway. Winners and prize distributions will be announced right after evaluation and valedictory ceremonies.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-16 relative z-10">
              {Object.entries(byEvent).map(([eventName, eventWinners], i) => (
                <motion.div
                  key={eventName}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 glow-red flex-shrink-0">
                      <Award size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-white tracking-wide">
                        {eventName}
                      </h2>
                      <p className="text-xs text-red-400 uppercase tracking-widest font-semibold mt-0.5">
                        Award Recipients
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['1st', '2nd', '3rd'].map((pos) => {
                      const winner = eventWinners.find((w) => w.position === pos);
                      const config = positionConfig[pos];
                      if (!winner) return null;

                      return (
                        <div
                          key={pos}
                          className={`card bg-black/60 border ${config.cardBorder} p-6 rounded-2xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center transition-all duration-300 hover:scale-102`}
                        >
                          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-5 border ${config.badgeClass}`}>
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </span>

                          {winner.photoUrl ? (
                            <div className="relative mb-4">
                              <img
                                src={winner.photoUrl}
                                alt={winner.participantName}
                                className={`w-24 h-24 rounded-full object-cover border-2 ${config.ringColor}`}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className={`w-24 h-24 rounded-full bg-white/5 border ${config.ringColor} mb-4 flex items-center justify-center text-4xl`}>
                              {config.icon}
                            </div>
                          )}

                          <h3 className="font-display font-bold text-lg text-white mb-1">
                            {winner.participantName}
                          </h3>

                          {winner.teamName && (
                            <p className="text-xs text-red-400 font-semibold mb-1">
                              Team: {winner.teamName}
                            </p>
                          )}

                          {winner.college && (
                            <p className="text-xs text-gray-400 font-light mt-1 max-w-[200px] truncate">
                              {winner.college}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
