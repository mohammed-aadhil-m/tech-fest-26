import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, User, Mail, Phone, Building2, BookOpen, GraduationCap, Users, CheckSquare, Square, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const emptyParticipant = { name: '', email: '', mobile: '', college: '' };

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
    college: 'V V College of Engineering', department: '', year: '', foodPreference: '',
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

  const getTeam = (slug) => teamDetails[slug] || { teamName: '', teamLeader: '', teamMembers: [{ ...emptyParticipant }] };

  const setTeam = (slug, update) => {
    setTeamDetails(prev => ({
      ...prev,
      [slug]: { ...getTeam(slug), ...update }
    }));
  };

  const addMember = (slug, maxSize) => {
    const team = getTeam(slug);
    if (team.teamMembers.length < maxSize - 1) {
      setTeam(slug, { teamMembers: [...team.teamMembers, { ...emptyParticipant }] });
    }
  };

  const removeMember = (slug, index) => {
    const team = getTeam(slug);
    if (team.teamMembers.length > 1) {
      setTeam(slug, { teamMembers: team.teamMembers.filter((_, i) => i !== index) });
    }
  };

  const handleMemberChange = (slug, index, field, value) => {
    const team = getTeam(slug);
    const members = [...team.teamMembers];
    members[index] = { ...members[index], [field]: value };
    setTeam(slug, { teamMembers: members });
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
          entry.teamName = team.teamName;
          entry.teamLeader = team.teamLeader;
          entry.teamMembers = team.teamMembers;
        }
        return entry;
      });

      const res = await api.post('/registrations', {
        ...form,
        selectedEvents: selectedEventsPayload,
      });
      navigate(`/payment/${res.data.data.registrationId}`);
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
              Event <span className="text-gradient-red">Initialization</span>
            </h1>
            <p className="text-gray-400 text-lg font-light">Select up to {MAX_EVENTS} protocols and encrypt your data</p>
            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 glow-red">
                <Sparkles size={20} className="text-red-500" />
                <span className="text-white font-medium tracking-wide">Processing Fee:</span>
                <strong className="text-2xl text-red-500 font-display font-black tracking-widest">₹250</strong>
                <span className="text-xs text-red-400 uppercase tracking-widest">/ Node</span>
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
          {/* Participant Details */}
          <div className="card bg-black/60 border border-white/10 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center glow-red text-red-500">
                <User size={20} />
              </div>
              Operative Profile
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Designation (Full Name) *</label>
                <input type="text" id="fullName" className={`w-full bg-white/5 border ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="Enter your full name" value={form.fullName}
                  onChange={e => handleChange('fullName', e.target.value)} />
                {errors.fullName && <p className="text-xs text-red-500 mt-2 font-medium">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comm Link (Email) *</label>
                <input type="email" id="email" className={`w-full bg-white/5 border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="operative@network.com" value={form.email}
                  onChange={e => handleChange('email', e.target.value)} />
                {errors.email && <p className="text-xs text-red-500 mt-2 font-medium">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comlink ID (Mobile) *</label>
                <input type="tel" id="mobile" className={`w-full bg-white/5 border ${errors.mobile ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="10-digit sequence" value={form.mobile}
                  onChange={e => handleChange('mobile', e.target.value)} />
                {errors.mobile && <p className="text-xs text-red-500 mt-2 font-medium">{errors.mobile}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Base of Operations (College) *</label>
                <input type="text" id="college" className={`w-full bg-white/5 border ${errors.college ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="Academy Name" value={form.college}
                  onChange={e => handleChange('college', e.target.value)} />
                {errors.college && <p className="text-xs text-red-500 mt-2 font-medium">{errors.college}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Division (Department) *</label>
                <input type="text" id="department" className={`w-full bg-white/5 border ${errors.department ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="e.g. Computer Science" value={form.department}
                  onChange={e => handleChange('department', e.target.value)} />
                {errors.department && <p className="text-xs text-red-500 mt-2 font-medium">{errors.department}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Experience Level (Year) *</label>
                <select id="year" className={`w-full bg-white/5 border ${errors.year ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-[#111] transition-all appearance-none`}
                  value={form.year} onChange={e => handleChange('year', e.target.value)}>
                  <option value="" className="bg-black text-gray-500">Select parameter</option>
                  {years.map(y => <option key={y} value={y} className="bg-black text-white">{y}</option>)}
                </select>
                {errors.year && <p className="text-xs text-red-500 mt-2 font-medium">{errors.year}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fuel Type (Diet) *</label>
                <select id="foodPreference" className={`w-full bg-white/5 border ${errors.foodPreference ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-[#111] transition-all appearance-none`}
                  value={form.foodPreference} onChange={e => handleChange('foodPreference', e.target.value)}>
                  <option value="" className="bg-black text-gray-500">Select parameter</option>
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
                Protocol Selection *
              </h2>
              <span
                className="text-xs font-bold px-4 py-2 rounded-lg border uppercase tracking-wider whitespace-nowrap"
                style={{
                  backgroundColor: selectedEventSlugs.length >= MAX_EVENTS ? 'rgba(255,42,42,0.1)' : 'rgba(255,255,255,0.05)',
                  color: selectedEventSlugs.length >= MAX_EVENTS ? '#ff2a2a' : '#888',
                  borderColor: selectedEventSlugs.length >= MAX_EVENTS ? 'rgba(255,42,42,0.3)' : 'rgba(255,255,255,0.1)'
                }}
              >
                {selectedEventSlugs.length} / {MAX_EVENTS} Active
              </span>
            </div>

            {/* Info note */}
            <div className="rounded-xl px-5 py-4 mb-8 flex items-start gap-3 bg-red-500/5 border border-red-500/20">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm font-light leading-relaxed text-gray-300">
                You can initialize up to <strong className="text-white">{MAX_EVENTS} protocols</strong>. At least <strong className="text-white">1 Technical execution</strong> is required to proceed.
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
                      <CheckSquare size={14} className="text-red-500" /> Active Executions
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
                                  {isTech ? 'Technical' : 'Non-Technical'}
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

                {/* Available Events */}
                {selectedEventSlugs.length < MAX_EVENTS && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4 text-gray-500">
                      {selectedEventSlugs.length === 0 ? 'Available Protocols' : 'Remaining Protocols'}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {events.filter(ev => {
                        if (selectedEventSlugs.includes(ev.slug)) return false;
                        const evId = EVENT_MAPPING[ev.slug];
                        if (!evId) return false;
                        const selectedIds = selectedEventSlugs.map(s => EVENT_MAPPING[s]).filter(Boolean);
                        return selectedIds.every(id => COMPATIBILITY_MATRIX[id].includes(evId));
                      }).map(ev => {
                        const evId = EVENT_MAPPING[ev.slug];
                        const isTech = TECHNICAL_EVENTS.includes(evId);
                        return (
                          <button
                            key={ev.slug}
                            type="button"
                            onClick={() => toggleEvent(ev.slug)}
                            className="p-5 rounded-2xl border text-left transition-all duration-300 relative bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-black/50 border border-white/10 group-hover:border-white/30 transition-colors">
                                <span className="text-2xl font-display grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">{ev.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-gray-300 group-hover:text-white transition-colors mb-1">{ev.name}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors">
                                  {isTech ? 'Technical' : 'Non-Technical'}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <Plus size={20} className="text-gray-600 group-hover:text-white transition-colors" />
                              </div>
                            </div>
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
                  Squad Configuration — <span className="text-gray-400 font-light">{ev.name}</span>
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Squad Designation *</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all"
                      placeholder="Enter team name" value={team.teamName}
                      onChange={e => setTeam(ev.slug, { teamName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Squad Leader</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all"
                      placeholder="Team leader name" value={team.teamLeader}
                      onChange={e => setTeam(ev.slug, { teamLeader: e.target.value })} />
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-white">
                    Additional Operatives
                  </p>
                  <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded-md text-gray-400">
                    Max {ev.maxTeamSize - 1} Units
                  </span>
                </div>
                
                <div className="space-y-6">
                  {team.teamMembers.map((member, i) => (
                    <div key={i} className="rounded-2xl p-6 bg-black/40 border border-white/5 relative group">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Unit 0{i + 1}</p>
                        {team.teamMembers.length > 1 && (
                          <button type="button" onClick={() => removeMember(ev.slug, i)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input type="text" className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all text-sm" placeholder="Full name"
                          value={member.name} onChange={e => handleMemberChange(ev.slug, i, 'name', e.target.value)} />
                        <input type="email" className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all text-sm" placeholder="Email"
                          value={member.email} onChange={e => handleMemberChange(ev.slug, i, 'email', e.target.value)} />
                        <input type="tel" className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all text-sm" placeholder="Mobile"
                          value={member.mobile} onChange={e => handleMemberChange(ev.slug, i, 'mobile', e.target.value)} />
                        <input type="text" className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all text-sm" placeholder="College"
                          value={member.college} onChange={e => handleMemberChange(ev.slug, i, 'college', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
                {team.teamMembers.length < (ev.maxTeamSize - 1) && (
                  <button
                    type="button"
                    onClick={() => addMember(ev.slug, ev.maxTeamSize)}
                    className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white/5 border border-white/10 border-dashed text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Plus size={16} />
                    Add Operative Unit
                  </button>
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
                  Execute Initialization{selectedEventSlugs.length > 1 ? ` [${selectedEventSlugs.length} Protocols]` : ''}
                </span>
              )}
            </div>
          </button>
        </motion.form>
      </div>
    </div>
  );
}
