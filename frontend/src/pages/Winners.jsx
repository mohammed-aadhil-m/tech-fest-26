import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const positionColors = {
  '1st': { bg: '#fff0f0', border: '#C40001', badge: { bg: '#C40001', color: '#FFFFFF', border: '#C40001' }, icon: '🥇' },
  '2nd': { bg: '#fff5f5', border: '#ffc1c1', badge: { bg: '#fff0f0', color: '#A80000', border: '#ffc1c1' }, icon: '🥈' },
  '3rd': { bg: '#FFFDF2', border: '#E5E5E5', badge: { bg: '#FFFDF2', color: '#7a5500', border: '#e5d5a0' }, icon: '🥉' },
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
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF2' }}>
      <div className="border-b py-14" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge badge-technical mb-4">TECH FEST '26</span>
            <h1 className="text-4xl font-display font-black text-gray-900 mb-3">
              TECH FEST '26 <span className="text-gradient-red">Winners</span>
            </h1>
            <p className="text-gray-500">Celebrating the champions of TECH FEST '26</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner size="xl" /></div>
        ) : Object.keys(byEvent).length === 0 ? (
          <div className="text-center py-24">
            <Trophy size={60} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Winners Announcement Coming Soon!</h2>
            <p className="text-gray-500">Winners will be announced after the event concludes.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(byEvent).map(([eventName, eventWinners], i) => (
              <motion.div
                key={eventName}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h2 className="text-xl font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Trophy size={20} className="text-primary-700" />
                  {eventName}
                </h2>
                <div className="grid sm:grid-cols-3 gap-5">
                  {['1st', '2nd', '3rd'].map(pos => {
                    const winner = eventWinners.find(w => w.position === pos);
                    const colors = positionColors[pos];
                    if (!winner) return null;
                    return (
                      <div
                        key={pos}
                        className="card p-5"
                        style={{ border: `2px solid ${colors.border}`, backgroundColor: colors.bg }}
                      >
                        <div className="text-center mb-4">
                          <div
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
                            style={{
                              backgroundColor: colors.badge.bg,
                              color: colors.badge.color,
                              border: `1px solid ${colors.badge.border}`,
                            }}
                          >
                            {colors.icon} {pos} Place
                          </div>
                          {winner.photoUrl ? (
                            <img
                              src={winner.photoUrl}
                              alt={winner.participantName}
                              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center text-3xl">
                              {colors.icon}
                            </div>
                          )}
                          <h3 className="font-display font-bold text-gray-900">{winner.participantName}</h3>
                          {winner.teamName && <p className="text-sm text-gray-600 mt-0.5">Team: {winner.teamName}</p>}
                          {winner.college && <p className="text-xs text-gray-500 mt-1">{winner.college}</p>}
                        </div>
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
  );
}
