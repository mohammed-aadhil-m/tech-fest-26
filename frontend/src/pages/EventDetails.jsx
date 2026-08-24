import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Mail, Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import ThreeBackground from '../components/ThreeBackground';

const categoryBadge = {
  technical: 'badge-technical',
  'non-technical': 'badge-non-technical',
  'coming-soon': 'badge-coming-soon'
};

export default function EventDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/events/${slug}`)
      .then(res => setEvent(res.data.data))
      .catch(() => setError('Event not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-16"><PageLoader /></div>;
  if (error || !event) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Event Not Found</h1>
        <p className="text-gray-500 mb-6">The event you're looking for doesn't exist.</p>
        <Link to="/events" className="btn-primary">Back to Events</Link>
      </div>
    );
  }

  const isComingSoon = event.category === 'coming-soon';

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white relative overflow-hidden">
      <ThreeBackground />
      <div className="relative z-10">
      
      {/* Back button */}
      <div className="bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Events
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Banner Image */}
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8 bg-[#0a0a0c] relative shadow-[0_0_30px_rgba(255,42,42,0.1)] border border-white/10">
               <img 
                 src={`/images/events/${event.slug}.jpg`} 
                 alt={event.name} 
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   e.target.onerror = null;
                   e.target.style.display = 'none';
                   document.getElementById(`fallback-icon-${event.slug}`).style.display = 'flex';
                 }}
               />
               <div 
                 id={`fallback-icon-${event.slug}`} 
                 className="hidden absolute inset-0 bg-red-900/10 items-center justify-center text-7xl md:text-9xl opacity-30 text-red-500"
               >
                 {event.icon}
               </div>
            </div>

            <div className="flex items-start gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${categoryBadge[event.category] || 'badge-technical'}`}>
                    {event.category === 'technical' ? 'Technical Event' : event.category === 'non-technical' ? 'Non-Technical Event' : 'Coming Soon'}
                  </span>
                  {event.isTeamEvent && (
                    <span
                      className="badge"
                      style={{ backgroundColor: '#fff0f0', color: '#C40001', border: '1px solid #ffc1c1' }}
                    >
                      <Users size={11} /> Team Event
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2 group-hover:text-red-400 transition-colors">
                  {event.name}
                </h1>
                {event.tagline && (
                  <p className="text-gray-400 font-medium italic">{event.tagline}</p>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-6 flex flex-wrap gap-4">
              {event.submissionDeadline && (
                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <Calendar size={15} className="text-red-500" />
                  <span>Deadline: <strong>{new Date(event.submissionDeadline).toLocaleDateString('en-IN')}</strong></span>
                </div>
              )}
              {event.submissionEmail && (
                <a
                  href={`mailto:${event.submissionEmail}`}
                  className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 hover:bg-red-500/20 transition-colors"
                >
                  <Mail size={15} />
                  {event.submissionEmail}
                </a>
              )}
              {event.isTeamEvent && (
                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <Users size={15} className="text-red-500" />
                  <span>Team size: {event.minTeamSize}–{event.maxTeamSize} members</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-xl font-display font-bold text-white mb-4">About This Event</h2>
              <p className="text-gray-400 leading-relaxed mb-3">{event.description}</p>
              {event.fullDescription && event.fullDescription !== event.description && (
                <p className="text-gray-400 leading-relaxed">{event.fullDescription}</p>
              )}
            </motion.div>

            {/* Rounds */}
            {event.rounds && event.rounds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              >
                <h2 className="text-xl font-display font-bold text-white mb-6">Event Rounds</h2>
                <div className="space-y-8">
                  {event.rounds.map((round, i) => (
                    <div key={i} className="relative pl-8">
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 text-xs flex items-center justify-center font-bold">
                        {round.roundNumber}
                      </div>
                      <h3 className="font-display font-bold text-white mb-2">
                        Round {round.roundNumber}: {round.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">{round.description}</p>
                      {round.rules && round.rules.length > 0 && (
                        <ul className="space-y-2">
                          {round.rules.map((rule, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-gray-400">
                              <CheckCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Evaluation Criteria */}
            {event.evaluationCriteria && event.evaluationCriteria.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              >
                <h2 className="text-xl font-display font-bold text-white mb-4">Evaluation Criteria</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {event.evaluationCriteria.map((crit, i) => (
                    <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <h4 className="font-display font-semibold text-red-400 mb-1">{crit.title}</h4>
                      <p className="text-sm text-gray-400">{crit.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* General Rules */}
            {event.rules && event.rules.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              >
                <h2 className="text-xl font-display font-bold text-white mb-4">Rules & Guidelines</h2>
                <ul className="space-y-3">
                  {event.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-4 text-sm text-gray-400">
                      <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/20">
                        {i + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sticky top-24">
            {/* Register */}
            {!isComingSoon && event.registrationOpen ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              >
                <h3 className="font-display font-bold text-white mb-3">Ready to Participate?</h3>
                <p className="text-sm text-gray-400 mb-4">Register for {event.name} and compete for exciting prizes!</p>
                <Link
                  to={`/register?event=${event.slug}`}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] mb-3"
                >
                  Register Now
                  <ChevronRight size={16} />
                </Link>
                <Link to="/events" className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 border border-white/20 text-sm">
                  View All Events
                </Link>
              </motion.div>
            ) : isComingSoon ? (
              <div className="p-6 rounded-2xl bg-white/5 border-2 border-dashed border-red-500/50 backdrop-blur-md text-center">
                <div className="text-4xl mb-3">⏳</div>
                <h3 className="font-display font-bold text-white mb-2">Coming Soon!</h3>
                <p className="text-sm text-gray-400">Stay tuned for the event announcement.</p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <p className="text-gray-400 text-sm">Registration is currently closed for this event.</p>
              </div>
            )}

            {/* Quick info */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wide">Event Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className="font-medium text-white capitalize">{event.category.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Format</span>
                  <span className="font-medium text-white">{event.isTeamEvent ? 'Team' : 'Individual'}</span>
                </div>
                {event.isTeamEvent && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Team Size</span>
                    <span className="font-medium text-white">{event.minTeamSize}–{event.maxTeamSize}</span>
                  </div>
                )}
                {event.rounds && event.rounds.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rounds</span>
                    <span className="font-medium text-white">{event.rounds.length}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Registration</span>
                  <span
                    className="font-medium"
                    style={{ color: event.registrationOpen && !isComingSoon ? '#ef4444' : '#aaaaaa' }}
                  >
                    {event.registrationOpen && !isComingSoon ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
