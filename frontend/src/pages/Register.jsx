import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, User, Mail, Phone, Building2, BookOpen, GraduationCap, Users, CheckSquare, Square, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const EVENT_MAPPING = {
  'paper-presentation': 'E1',
  'dev-deploy': 'E2',
  'treasure-hunt': 'E3',
  'bug-buster': 'E4',
  'connect-sketch': 'E5',
  'adaptune': 'E6'
};

const COMPATIBILITY_MATRIX = {
  'E1': ['E4', 'E5', 'E6'],
  'E2': ['E4', 'E5', 'E6'],
  'E3': ['E4', 'E5', 'E6'],
  'E4': ['E1', 'E2', 'E3', 'E6'],
  'E5': ['E1', 'E2', 'E3', 'E6'],
  'E6': ['E1', 'E2', 'E3', 'E4', 'E5']
};

const TECHNICAL_EVENTS = ['E1', 'E2', 'E4'];
const MAX_EVENTS = 3;

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  // selectedEvents: [{ eventSlug, teamName, teamLeader, teamMembers: [] }]
  const initialSlug = searchParams.get('event') || '';
  const [selectedEventSlugs, setSelectedEventSlugs] = useState(initialSlug ? [initialSlug] : []);
  const [teamDetails, setTeamDetails] = useState({}); // keyed by eventSlug

  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '',
    college: '', department: '', year: '', foodPreference: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get('/events')
      .then(res => {
        const openEvents = (res.data.data || []).filter(e => e.category !== 'coming-soon' && e.registrationOpen);
        setEvents(openEvents);
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setEventsLoading(false));
  }, []);

  const toggleEvent = (slug) => {
    setSelectedEventSlugs(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug);
      }
      if (prev.length >= MAX_EVENTS) {
        toast.error(`You can select a maximum of ${MAX_EVENTS} events.`);
        return prev;
      }

      const evId = EVENT_MAPPING[slug];
      const selectedIds = prev.map(s => EVENT_MAPPING[s]).filter(Boolean);
      const isCompatible = selectedIds.every(id => COMPATIBILITY_MATRIX[id]?.includes(evId));

      if (!isCompatible) {
        toast.error('This event is not compatible with your currently selected events.');
        return prev;
      }

      return [...prev, slug];
    });
    if (errors.events) setErrors(e => ({ ...e, events: '' }));
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const getTeam = (slug) => teamDetails[slug] || { action: 'create', teamName: '', teamCode: '', verifiedTeam: null, verificationError: '', isVerifying: false };

  const setTeam = (slug, update) => {
    setTeamDetails(prev => ({
      ...prev,
      [slug]: { ...getTeam(slug), ...update }
    }));
  };

  const handleVerifyTeamCode = async (slug, teamCode) => {
    if (!teamCode) {
      setTeam(slug, { verificationError: 'Please enter a team code.', verifiedTeam: null });
      return;
    }
    setTeam(slug, { isVerifying: true, verificationError: '', verifiedTeam: null });
    try {
      const res = await api.get(`/teams/verify/${teamCode}?eventSlug=${slug}`);
      setTeam(slug, { verifiedTeam: res.data.data, isVerifying: false });
      toast.success('Team verified successfully!');
    } catch (err) {
      setTeam(slug, { verificationError: err.response?.data?.message || 'Invalid team code.', isVerifying: false });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Valid email is required';
    if (!form.mobile.trim() || !/^[6-9]\d{9}$/.test(form.mobile)) newErrors.mobile = 'Valid 10-digit mobile is required';
    if (!form.college.trim()) newErrors.college = 'College name is required';
    if (!form.department.trim()) newErrors.department = 'Department is required';
    if (!form.year) newErrors.year = 'Year of study is required';
    if (!form.foodPreference) newErrors.foodPreference = 'Food preference is required';
    if (selectedEventSlugs.length === 0) {
      newErrors.events = 'Please select at least one event';
    } else {
      const selectedIds = selectedEventSlugs.map(s => EVENT_MAPPING[s]).filter(Boolean);
      const techCount = selectedIds.filter(id => TECHNICAL_EVENTS.includes(id)).length;
      if (techCount === 0) {
        newErrors.events = 'You must select at least one technical event';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill all required fields correctly.');
      return;
    }
    setLoading(true);
    try {
      const selectedEventsPayload = selectedEventSlugs.map(slug => {
        const ev = events.find(e => e.slug === slug);
        const team = getTeam(slug);
        const entry = { eventSlug: slug };
        if (ev?.isTeamEvent) {
          entry.action = team.action;
          if (team.action === 'create') {
            entry.teamName = team.teamName;
          } else {
            entry.teamCode = team.teamCode;
          }
        }
        return entry;
      });

      const res = await api.post('/registrations', {
        ...form,
        selectedEvents: selectedEventsPayload,
      });
      navigate(`/payment/${res.data.registrationId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedEventObjects = events.filter(e => selectedEventSlugs.includes(e.slug));

  const selectedIds = selectedEventSlugs.map(s => EVENT_MAPPING[s]).filter(Boolean);
  const techCount = selectedIds.filter(id => TECHNICAL_EVENTS.includes(id)).length;
  const isSubmitDisabled = loading || selectedEventSlugs.length === 0 || techCount === 0;

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white">
      {/* Header */}
      <div className="relative border-b border-white/5 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0c]"></div>
        <div className="absolute inset-0 circuit-bg opacity-30"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="badge badge-technical mb-6">TECH FEST '26</span>
            <h1 className="text-5xl md:text-6xl font-display font-black mb-4 text-white">
              Event <span className="text-gradient-red">REGISTRATION</span>
            </h1>
            <p className="text-gray-400 text-lg font-light">Select up to {MAX_EVENTS} events and fill in your details</p>
            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/50 glow-red shadow-[0_0_20px_rgba(255,42,42,0.3)]">
                <Sparkles size={20} className="text-red-500" />
                <span className="text-white font-medium tracking-wide">Registration Fee:</span>
                <strong className="text-2xl text-white font-display font-black tracking-widest bg-red-600 px-3 py-1 rounded-lg shadow-[0_0_15px_rgba(255,42,42,0.6)]">₹250</strong>
                <span className="text-xs text-red-300 font-bold uppercase tracking-widest bg-red-900/40 px-2 py-1 rounded-md">/ Per Head</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="space-y-8 relative z-10"
          noValidate
        >
          {/* Registration Instructions */}
          <div className="card bg-black/60 border border-red-500/30 p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 glow-red"></div>
            <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center glow-red text-red-500">
                <AlertCircle size={18} />
              </div>
              How to Register
            </h2>
            <div className="text-gray-300 space-y-4 text-sm leading-relaxed pl-11">
              <div>
                <strong className="text-white">For Individual Events:</strong>
                <p className="text-gray-400 mt-1">Simply select your desired events and complete the form below.</p>
              </div>
              <div>
                <strong className="text-white">For Team Events:</strong>
                <ul className="list-[square] list-inside mt-2 space-y-2 text-gray-400 ml-2">
                  <li><strong>Team Leader:</strong> Choose "Create New Team". A unique Team Code will be generated after successful registration.</li>
                  <li><strong>Team Members:</strong> Choose "Join Existing Team" and enter the unique Team Code generated by your leader.</li>
                </ul>
              </div>
              <div className="pt-4 mt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-gray-400">
                    <strong className="text-white">Any Doubts?</strong> <a href="tel:6382323556" className="text-red-400 hover:text-red-300">6382323556</a>, <a href="tel:9344170263" className="text-red-400 hover:text-red-300">93441 70263</a>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-gray-400">
                    <strong className="text-white">Email:</strong> <a href="mailto:techfest.official2026@gmail.com" className="text-red-400 hover:text-red-300">techfest.official2026@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participant Details */}
          <div className="card bg-black/60 border border-white/10 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center glow-red text-red-500">
                <User size={20} />
              </div>
              Participant Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name *</label>
                <input type="text" id="fullName" className={`w-full bg-white/5 border ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="Enter your full name" value={form.fullName}
                  onChange={e => handleChange('fullName', e.target.value)} />
                {errors.fullName && <p className="text-xs text-red-500 mt-2 font-medium">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address *</label>
                <input type="email" id="email" className={`w-full bg-white/5 border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="yourname@gmail.com" value={form.email}
                  onChange={e => handleChange('email', e.target.value)} />
                {errors.email && <p className="text-xs text-red-500 mt-2 font-medium">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mobile Number *</label>
                <input type="tel" id="mobile" className={`w-full bg-white/5 border ${errors.mobile ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="10-digit mobile number" value={form.mobile}
                  onChange={e => handleChange('mobile', e.target.value)} />
                {errors.mobile && <p className="text-xs text-red-500 mt-2 font-medium">{errors.mobile}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">College *</label>
                <input type="text" id="college" className={`w-full bg-white/5 border ${errors.college ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="College Name" value={form.college}
                  onChange={e => handleChange('college', e.target.value)} />
                {errors.college && <p className="text-xs text-red-500 mt-2 font-medium">{errors.college}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Department *</label>
                <input type="text" id="department" className={`w-full bg-white/5 border ${errors.department ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="e.g. Computer Science" value={form.department}
                  onChange={e => handleChange('department', e.target.value)} />
                {errors.department && <p className="text-xs text-red-500 mt-2 font-medium">{errors.department}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Year *</label>
                <select id="year" className={`w-full bg-white/5 border ${errors.year ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-[#111] transition-all appearance-none`}
                  value={form.year} onChange={e => handleChange('year', e.target.value)}>
                  <option value="" className="bg-black text-gray-500">Select Year</option>
                  {years.map(y => <option key={y} value={y} className="bg-black text-white">{y}</option>)}
                </select>
                {errors.year && <p className="text-xs text-red-500 mt-2 font-medium">{errors.year}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Food Preference *</label>
                <select id="foodPreference" className={`w-full bg-white/5 border ${errors.foodPreference ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-[#111] transition-all appearance-none`}
                  value={form.foodPreference} onChange={e => handleChange('foodPreference', e.target.value)}>
                  <option value="" className="bg-black text-gray-500">Select Food Preference</option>
                  <option value="Veg" className="bg-black text-white">Veg</option>
                  <option value="Non-Veg" className="bg-black text-white">Non-Veg</option>
                </select>
                {errors.foodPreference && <p className="text-xs text-red-500 mt-2 font-medium">{errors.foodPreference}</p>}
              </div>
            </div>
          </div>

          {/* Event Selection (multi-select) */}
          <div className="card bg-black/60 border border-white/10 p-8 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-display font-bold flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center glow-red text-red-500">
                  <BookOpen size={20} />
                </div>
                Select Events *
              </h2>
              <span
                className="text-xs font-bold px-4 py-2 rounded-lg border uppercase tracking-wider whitespace-nowrap"
                style={{
                  backgroundColor: selectedEventSlugs.length >= MAX_EVENTS ? 'rgba(255,42,42,0.1)' : 'rgba(255,255,255,0.05)',
                  color: selectedEventSlugs.length >= MAX_EVENTS ? '#ff2a2a' : '#888',
                  borderColor: selectedEventSlugs.length >= MAX_EVENTS ? 'rgba(255,42,42,0.3)' : 'rgba(255,255,255,0.1)'
                }}
              >
                {selectedEventSlugs.length} / {MAX_EVENTS} Selected
              </span>
            </div>

            {/* Info note */}
            <div className="rounded-xl px-5 py-4 mb-8 flex items-start gap-3 bg-red-500/5 border border-red-500/20">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm font-light leading-relaxed text-gray-300">
                You can select up to <strong className="text-white">{MAX_EVENTS} events</strong>. At least <strong className="text-white">1 Technical event</strong> is required to proceed.
              </p>
            </div>

            {eventsLoading ? (
              <div className="flex justify-center py-12"><LoadingSpinner /></div>
            ) : (
              <div className="space-y-8">
                {/* Selected Events */}
                {selectedEventSlugs.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-white">
                      <CheckSquare size={14} className="text-red-500" /> Selected Events ({selectedEventSlugs.length})
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {events.filter(ev => selectedEventSlugs.includes(ev.slug)).map(ev => {
                        const evId = EVENT_MAPPING[ev.slug];
                        const isTech = TECHNICAL_EVENTS.includes(evId);
                        return (
                          <button
                            key={ev.slug}
                            type="button"
                            onClick={() => toggleEvent(ev.slug)}
                            className="p-5 rounded-2xl border text-left transition-all duration-300 relative bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(255,42,42,0.15)] overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                            <div className="flex items-center gap-4 relative z-10">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-black/50 border border-red-500/30">
                                <span className="text-2xl font-display text-red-500">{ev.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-white mb-1">{ev.name}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                                   {isTech ? 'Technical Event' : 'Non-Technical Event'}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <CheckSquare size={20} className="text-red-500" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conflict Guidance Notice */}
                {selectedEventSlugs.length > 0 && selectedEventSlugs.length < MAX_EVENTS && (
                  <div className="rounded-xl px-4 py-3 bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/90 leading-relaxed font-light">
                      <strong className="text-white font-medium">Schedule Note:</strong> Events scheduled in the same time slot as your selection cannot be chosen together. Choose from other non-clashing events below.
                    </p>
                  </div>
                )}

                {/* Available Events */}
                {selectedEventSlugs.length < MAX_EVENTS && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4 text-gray-500 flex items-center justify-between">
                      <span>{selectedEventSlugs.length === 0 ? 'Available Events' : 'Add More Events'}</span>
                      <span className="text-[10px] text-gray-500">Pick up to {MAX_EVENTS - selectedEventSlugs.length} more</span>
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {events.filter(ev => !selectedEventSlugs.includes(ev.slug)).map(ev => {
                        const evId = EVENT_MAPPING[ev.slug];
                        const isTech = TECHNICAL_EVENTS.includes(evId);

                        const selectedIds = selectedEventSlugs.map(s => EVENT_MAPPING[s]).filter(Boolean);
                        const isConflicting = evId ? !selectedIds.every(id => COMPATIBILITY_MATRIX[id]?.includes(evId)) : false;

                        // Find names of selected events this clashes with
                        const conflictingWith = isConflicting
                          ? selectedEventSlugs.filter(s => {
                              const sId = EVENT_MAPPING[s];
                              return sId && COMPATIBILITY_MATRIX[sId] && !COMPATIBILITY_MATRIX[sId].includes(evId);
                            }).map(s => events.find(e => e.slug === s)?.name).filter(Boolean)
                          : [];

                        return (
                          <button
                            key={ev.slug}
                            type="button"
                            onClick={() => {
                              if (isConflicting) {
                                toast.error(`"${ev.name}" is scheduled at the same time as "${conflictingWith.join(', ')}". Please select another event.`);
                              } else {
                                toggleEvent(ev.slug);
                              }
                            }}
                            className={`p-5 rounded-2xl border text-left transition-all duration-300 relative ${
                              isConflicting
                                ? 'bg-black/40 border-red-500/20 hover:border-red-500/40 cursor-pointer group/conflict'
                                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 group'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-black/50 border ${
                                isConflicting ? 'border-red-500/20' : 'border-white/10 group-hover:border-white/30'
                              } transition-colors`}>
                                <span className={`text-2xl font-display ${
                                  isConflicting ? 'opacity-40 grayscale' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'
                                } transition-all duration-500`}>
                                  {ev.icon}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-base font-bold ${
                                  isConflicting ? 'text-gray-400 group-hover/conflict:text-red-300' : 'text-gray-300 group-hover:text-white'
                                } transition-colors mb-1 truncate`}>
                                  {ev.name}
                                </p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${
                                  isConflicting ? 'text-red-400/80' : 'text-gray-500 group-hover:text-gray-400'
                                } transition-colors`}>
                                  {isConflicting ? 'Same Time Slot' : (isTech ? 'Technical Event' : 'Non-Technical Event')}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                {isConflicting ? (
                                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                                    Clashes
                                  </span>
                                ) : (
                                  <Plus size={20} className="text-gray-600 group-hover:text-white transition-colors" />
                                )}
                              </div>
                            </div>

                            {/* Informative message for conflicting slot */}
                            {isConflicting && (
                              <div className="mt-3 pt-2.5 border-t border-red-500/15 text-[11px] text-gray-400 flex items-start gap-1.5 leading-snug">
                                <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                                <span>
                                  Clashes with <strong className="text-white font-medium">{conflictingWith.join(', ')}</strong>. Try selecting other available events.
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.events && <p className="text-xs text-red-500 mt-4 font-medium">{errors.events}</p>}
          </div>

          {/* Team Details for each selected team event */}
          {selectedEventObjects.filter(ev => ev.isTeamEvent).map(ev => {
            const team = getTeam(ev.slug);
            return (
              <motion.div
                key={ev.slug}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="card bg-black/60 border border-white/10 p-8 backdrop-blur-xl relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 glow-red"></div>

                <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center glow-red text-red-500">
                    <Users size={20} />
                  </div>
                  Team Details — <span className="text-gray-400 font-light">{ev.name}</span>
                </h2>

                <div className="flex gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setTeam(ev.slug, { action: 'create', verifiedTeam: null, verificationError: '' })}
                    className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all border ${team.action === 'create' ? 'bg-red-500/20 text-red-500 border-red-500/50 glow-red' : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'}`}
                  >
                    Create New Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeam(ev.slug, { action: 'join', teamCode: '', verifiedTeam: null, verificationError: '' })}
                    className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all border ${team.action === 'join' ? 'bg-red-500/20 text-red-500 border-red-500/50 glow-red' : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'}`}
                  >
                    Join Existing Team
                  </button>
                </div>

                {team.action === 'create' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Team Name *</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all"
                      placeholder="Enter team name" value={team.teamName}
                      onChange={e => setTeam(ev.slug, { teamName: e.target.value })} />
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                      <AlertCircle size={14} /> A unique Team Code will be generated after registration for your teammates to join.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Team Code *</label>
                    <div className="flex gap-3">
                      <input type="text" className="flex-1 bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all uppercase"
                        placeholder="e.g. CW4821" value={team.teamCode}
                        onChange={e => setTeam(ev.slug, { teamCode: e.target.value, verifiedTeam: null, verificationError: '' })} />
                      <button
                        type="button"
                        onClick={() => handleVerifyTeamCode(ev.slug, team.teamCode)}
                        disabled={team.isVerifying || !team.teamCode}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-50"
                      >
                        {team.isVerifying ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    {team.verificationError && <p className="text-xs text-red-500 mt-2 font-medium">{team.verificationError}</p>}

                    {team.verifiedTeam && (
                      <div className="mt-6 p-5 rounded-xl bg-white/5 border border-green-500/30">
                        <div className="flex items-center gap-2 text-green-500 font-bold mb-3">
                          <CheckSquare size={18} /> Team Found
                        </div>
                        <p className="text-sm text-gray-300 mb-1"><strong className="text-white">Name:</strong> {team.verifiedTeam.teamName}</p>
                        <p className="text-sm text-gray-300 mb-1"><strong className="text-white">Leader:</strong> {team.verifiedTeam.leader}</p>
                        <p className="text-sm text-gray-300"><strong className="text-white">Members:</strong> {team.verifiedTeam.memberCount} / {team.verifiedTeam.maxSize}</p>
                        <ul className="mt-2 text-xs text-gray-400 list-disc list-inside">
                          {team.verifiedTeam.members.map((m, idx) => <li key={idx}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          <button
            type="submit"
            id="submit-registration"
            disabled={isSubmitDisabled}
            className="w-full relative group overflow-hidden rounded-2xl p-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
            <div className="relative bg-black px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-black/40">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="text-white font-bold tracking-wider uppercase">Processing...</span>
                </>
              ) : (
                <span className="text-white font-bold tracking-wider uppercase text-lg">
                  Proceed to Payment{selectedEventSlugs.length > 1 ? ` (${selectedEventSlugs.length} Events)` : ''}
                </span>
              )}
            </div>
          </button>
        </motion.form>
      </div>
    </div>
  );
}
