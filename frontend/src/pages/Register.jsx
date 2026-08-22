import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, User, Mail, Phone, Building2, BookOpen, GraduationCap, Users, CheckSquare, Square, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF2' }}>
      {/* Header */}
      <div className="border-b py-12 circuit-bg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge badge-technical mb-4">TECH FEST '26</span>
            <h1 className="text-4xl font-display font-black mb-2" style={{ color: '#222222' }}>
              Event <span className="text-gradient-red">Registration</span>
            </h1>
            <p style={{ color: '#555555' }}>Select up to {MAX_EVENTS} events and fill in your details</p>
            <div className="mt-5 flex justify-center">
              <span className="badge badge-technical text-base px-5 py-2 flex items-center gap-2 shadow-sm">
                Registration Fee: <strong className="text-xl text-gradient-red">₹250</strong> <span className="text-sm">per head</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >
          {/* Participant Details */}
          <div className="card p-6">
            <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2" style={{ color: '#222222' }}>
              <User size={20} style={{ color: '#C40001' }} /> Participant Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="form-label">Full Name *</label>
                <input type="text" id="fullName" className={`form-input ${errors.fullName ? 'border-red-400' : ''}`}
                  placeholder="Enter your full name" value={form.fullName}
                  onChange={e => handleChange('fullName', e.target.value)} />
                {errors.fullName && <p className="form-error">{errors.fullName}</p>}
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <input type="email" id="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="your@email.com" value={form.email}
                  onChange={e => handleChange('email', e.target.value)} />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
              <div>
                <label className="form-label">Mobile Number *</label>
                <input type="tel" id="mobile" className={`form-input ${errors.mobile ? 'border-red-400' : ''}`}
                  placeholder="10-digit mobile number" value={form.mobile}
                  onChange={e => handleChange('mobile', e.target.value)} />
                {errors.mobile && <p className="form-error">{errors.mobile}</p>}
              </div>
              <div>
                <label className="form-label">College Name *</label>
                <input type="text" id="college" className={`form-input ${errors.college ? 'border-red-400' : ''}`}
                  placeholder="College name" value={form.college}
                  onChange={e => handleChange('college', e.target.value)} />
                {errors.college && <p className="form-error">{errors.college}</p>}
              </div>
              <div>
                <label className="form-label">Department *</label>
                <input type="text" id="department" className={`form-input ${errors.department ? 'border-red-400' : ''}`}
                  placeholder="e.g. Computer Science" value={form.department}
                  onChange={e => handleChange('department', e.target.value)} />
                {errors.department && <p className="form-error">{errors.department}</p>}
              </div>
              <div>
                <label className="form-label">Year of Study *</label>
                <select id="year" className={`form-input ${errors.year ? 'border-red-400' : ''}`}
                  value={form.year} onChange={e => handleChange('year', e.target.value)}>
                  <option value="">Select year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.year && <p className="form-error">{errors.year}</p>}
              </div>
              <div>
                <label className="form-label">Food Preference *</label>
                <select id="foodPreference" className={`form-input ${errors.foodPreference ? 'border-red-400' : ''}`}
                  value={form.foodPreference} onChange={e => handleChange('foodPreference', e.target.value)}>
                  <option value="">Select food preference</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
                {errors.foodPreference && <p className="form-error">{errors.foodPreference}</p>}
              </div>
            </div>
          </div>

          {/* Event Selection (multi-select) */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold flex items-center gap-2" style={{ color: '#222222' }}>
                <BookOpen size={20} style={{ color: '#C40001' }} /> Select Events *
              </h2>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: selectedEventSlugs.length >= MAX_EVENTS ? '#C40001' : '#fff0f0',
                  color: selectedEventSlugs.length >= MAX_EVENTS ? '#FFFFFF' : '#C40001',
                }}
              >
                {selectedEventSlugs.length} / {MAX_EVENTS} selected
              </span>
            </div>

            {/* Info note */}
            <div className="rounded-xl px-4 py-3 mb-5 flex items-start gap-2" style={{ backgroundColor: '#fff0f0', border: '1px solid #ffc1c1' }}>
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#C40001' }} />
              <p className="text-xs" style={{ color: '#8a0000' }}>
                You can register for up to <strong>{MAX_EVENTS} events</strong>. At least <strong>1 Technical event</strong> is required.
              </p>
            </div>

            {eventsLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : (
              <div className="space-y-6">
                {/* Selected Events */}
                {selectedEventSlugs.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#222222' }}>
                      <CheckSquare size={16} style={{ color: '#C40001' }} /> Selected Events
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {events.filter(ev => selectedEventSlugs.includes(ev.slug)).map(ev => {
                        const evId = EVENT_MAPPING[ev.slug];
                        const isTech = TECHNICAL_EVENTS.includes(evId);
                        return (
                          <button
                            key={ev.slug}
                            type="button"
                            onClick={() => toggleEvent(ev.slug)}
                            className="p-4 rounded-xl border-2 text-left transition-all duration-150 relative"
                            style={{ borderColor: '#C40001', backgroundColor: '#fff0f0' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fff0f0', border: '1px solid #ffc1c1' }}>
                                <span className="text-xs font-display font-black tracking-tight" style={{ color: '#C40001' }}>{ev.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold" style={{ color: '#C40001' }}>{ev.name}</p>
                                <p className="text-xs capitalize" style={{ color: '#C40001' }}>
                                  {isTech ? 'Technical' : 'Non-Technical'} • {ev.category.replace('-', ' ')}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <CheckSquare size={18} style={{ color: '#C40001' }} />
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
                    <p className="text-sm font-semibold mb-3" style={{ color: '#222222' }}>
                      {selectedEventSlugs.length === 0 ? 'Available Events' : 'Remaining Available Events'}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
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
                            className="p-4 rounded-xl border-2 text-left transition-all duration-150 relative hover:border-red-200"
                            style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fff0f0', border: '1px solid #ffc1c1' }}>
                                <span className="text-xs font-display font-black tracking-tight" style={{ color: '#C40001' }}>{ev.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold" style={{ color: '#222222' }}>{ev.name}</p>
                                <p className="text-xs capitalize" style={{ color: '#555555' }}>
                                  {isTech ? 'Technical' : 'Non-Technical'} • {ev.category.replace('-', ' ')}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <Plus size={18} style={{ color: '#cccccc' }} />
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
            {errors.events && <p className="form-error mt-2">{errors.events}</p>}
          </div>

          {/* Team Details for each selected team event */}
          {selectedEventObjects.filter(ev => ev.isTeamEvent).map(ev => {
            const team = getTeam(ev.slug);
            return (
              <motion.div
                key={ev.slug}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="card p-6"
                style={{ borderLeft: '4px solid #C40001' }}
              >
                <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2" style={{ color: '#222222' }}>
                  <Users size={20} style={{ color: '#C40001' }} /> Team Info — {ev.name}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="form-label">Team Name *</label>
                    <input type="text" className="form-input"
                      placeholder="Enter team name" value={team.teamName}
                      onChange={e => setTeam(ev.slug, { teamName: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Team Leader</label>
                    <input type="text" className="form-input"
                      placeholder="Team leader name" value={team.teamLeader}
                      onChange={e => setTeam(ev.slug, { teamLeader: e.target.value })} />
                  </div>
                </div>

                <p className="text-sm font-semibold mb-3" style={{ color: '#222222' }}>
                  Additional Team Members
                  <span className="text-xs font-normal ml-2" style={{ color: '#555555' }}>
                    (Max {ev.maxTeamSize - 1} additional members)
                  </span>
                </p>
                <div className="space-y-4">
                  {team.teamMembers.map((member, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ backgroundColor: '#FFFDF2', border: '1px solid #E5E5E5' }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium" style={{ color: '#555555' }}>Member {i + 1}</p>
                        {team.teamMembers.length > 1 && (
                          <button type="button" onClick={() => removeMember(ev.slug, i)}
                            className="p-1 rounded-lg transition-all"
                            style={{ color: '#C40001' }}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input type="text" className="form-input text-sm" placeholder="Full name"
                          value={member.name} onChange={e => handleMemberChange(ev.slug, i, 'name', e.target.value)} />
                        <input type="email" className="form-input text-sm" placeholder="Email"
                          value={member.email} onChange={e => handleMemberChange(ev.slug, i, 'email', e.target.value)} />
                        <input type="tel" className="form-input text-sm" placeholder="Mobile"
                          value={member.mobile} onChange={e => handleMemberChange(ev.slug, i, 'mobile', e.target.value)} />
                        <input type="text" className="form-input text-sm" placeholder="College"
                          value={member.college} onChange={e => handleMemberChange(ev.slug, i, 'college', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
                {team.teamMembers.length < (ev.maxTeamSize - 1) && (
                  <button
                    type="button"
                    onClick={() => addMember(ev.slug, ev.maxTeamSize)}
                    className="mt-3 flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: '#C40001' }}
                  >
                    <Plus size={16} />
                    Add Another Member
                  </button>
                )}
              </motion.div>
            );
          })}

          {/* Selected Events Summary */}
          {selectedEventSlugs.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold mb-3" style={{ color: '#222222' }}>Selected Events Summary</p>
              <div className="flex flex-wrap gap-2">
                {selectedEventObjects.map(ev => (
                  <span
                    key={ev.slug}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#fff0f0', color: '#C40001', border: '1px solid #ffc1c1' }}
                  >
                    {ev.icon} {ev.name}
                    <button
                      type="button"
                      onClick={() => toggleEvent(ev.slug)}
                      className="ml-0.5 hover:text-red-800"
                      style={{ color: '#A80000' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            id="submit-registration"
            disabled={isSubmitDisabled}
            className="btn-primary w-full justify-center text-base py-4 shadow-red-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Submitting...
              </>
            ) : (
              `Complete Registration${selectedEventSlugs.length > 1 ? ` (${selectedEventSlugs.length} Events)` : ''}`
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
