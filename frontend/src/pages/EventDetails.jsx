import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Mail, Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';

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
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Events
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Banner Image */}
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8 bg-gray-100 relative shadow-sm border border-gray-200">
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
                 className="hidden absolute inset-0 bg-primary-50 items-center justify-center text-7xl md:text-9xl opacity-30"
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
                <h1 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-2">
                  {event.name}
                </h1>
                {event.tagline && (
                  <p className="text-primary-700 font-medium italic">{event.tagline}</p>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-6 flex flex-wrap gap-4">
              {event.submissionDeadline && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Calendar size={15} className="text-primary-700" />
                  <span>Deadline: <strong>{new Date(event.submissionDeadline).toLocaleDateString('en-IN')}</strong></span>
                </div>
              )}
              {event.submissionEmail && (
                <a
                  href={`mailto:${event.submissionEmail}`}
                  className="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 hover:bg-primary-100 transition-colors"
                >
                  <Mail size={15} />
                  {event.submissionEmail}
                </a>
              )}
              {event.isTeamEvent && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Users size={15} className="text-primary-700" />
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
              className="card p-6"
            >
              <h2 className="text-xl font-display font-bold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-600 leading-relaxed mb-3">{event.description}</p>
              {event.fullDescription && event.fullDescription !== event.description && (
                <p className="text-gray-600 leading-relaxed">{event.fullDescription}</p>
              )}
            </motion.div>

            {/* Rounds */}
            {event.rounds && event.rounds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Event Rounds</h2>
                <div className="space-y-6">
                  {event.rounds.map((round, i) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center font-bold">
                        {round.roundNumber}
                      </div>
                      <h3 className="font-display font-bold text-gray-900 mb-1">
                        Round {round.roundNumber}: {round.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{round.description}</p>
                      {round.rules && round.rules.length > 0 && (
                        <ul className="space-y-1.5">
                          {round.rules.map((rule, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle size={14} className="text-primary-600 mt-0.5 flex-shrink-0" />
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
                className="card p-6"
              >
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Evaluation Criteria</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {event.evaluationCriteria.map((crit, i) => (
                    <div key={i} className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                      <h4 className="font-display font-semibold text-primary-700 mb-1">{crit.title}</h4>
                      <p className="text-sm text-gray-600">{crit.description}</p>
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
                className="card p-6"
              >
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Rules & Guidelines</h2>
                <ul className="space-y-2">
                  {event.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
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
                className="card p-6"
              >
                <h3 className="font-display font-bold text-gray-900 mb-3">Ready to Participate?</h3>
                <p className="text-sm text-gray-500 mb-4">Register for {event.name} and compete for exciting prizes!</p>
                <Link
                  to={`/register?event=${event.slug}`}
                  className="btn-primary w-full justify-center mb-3"
                >
                  Register Now
                  <ChevronRight size={16} />
                </Link>
                <Link to="/events" className="btn-secondary w-full justify-center text-sm">
                  View All Events
                </Link>
              </motion.div>
            ) : isComingSoon ? (
              <div className="card p-6 border-2 border-dashed border-yellow-300 text-center">
                <div className="text-4xl mb-3">⏳</div>
                <h3 className="font-display font-bold text-gray-900 mb-2">Coming Soon!</h3>
                <p className="text-sm text-gray-500">Stay tuned for the event announcement.</p>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-gray-500 text-sm">Registration is currently closed for this event.</p>
              </div>
            )}

            {/* Quick info */}
            <div className="card p-6">
              <h3 className="font-display font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Event Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900 capitalize">{event.category.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Format</span>
                  <span className="font-medium text-gray-900">{event.isTeamEvent ? 'Team' : 'Individual'}</span>
                </div>
                {event.isTeamEvent && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Team Size</span>
                    <span className="font-medium text-gray-900">{event.minTeamSize}–{event.maxTeamSize}</span>
                  </div>
                )}
                {event.rounds && event.rounds.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rounds</span>
                    <span className="font-medium text-gray-900">{event.rounds.length}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Registration</span>
                  <span
                    className="font-medium"
                    style={{ color: event.registrationOpen && !isComingSoon ? '#C40001' : '#aaaaaa' }}
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
  );
}
