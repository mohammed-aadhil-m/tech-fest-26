import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Clock, MapPin, CalendarDays } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Modal from '../../components/Modal';

const categoryClasses = {
  technical: 'badge-technical',
  'non-technical': 'badge-non-technical',
  'coming-soon': 'badge-coming-soon',
};

export default function AdminEvents() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '🎯',
    category: 'technical',
    time: '',
    venue: '',
    description: '',
    rules: '',
    isTeamEvent: false,
    minTeamSize: 1,
    maxTeamSize: 1,
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      setEvents(res.data.data);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleField = async (event, field) => {
    try {
      await api.put(`/admin/events/${event._id}`, { [field]: !event[field] });
      toast.success(`${field === 'registrationOpen' ? 'Registration' : 'Event'} ${!event[field] ? 'opened' : 'closed'}.`);
      fetch();
    } catch { toast.error('Failed to update.'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/events/${deleteTarget._id}`);
      toast.success('Event deleted.');
      setDeleteTarget(null);
      fetch();
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(false); }
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      name: event.name || '',
      slug: event.slug || '',
      icon: event.icon || '🎯',
      category: event.category || 'technical',
      time: event.time || '',
      venue: event.venue || '',
      description: event.description || '',
      rules: event.rules ? event.rules.join('\n') : '',
      isTeamEvent: !!event.isTeamEvent,
      minTeamSize: event.minTeamSize || 1,
      maxTeamSize: event.maxTeamSize || (event.isTeamEvent ? 2 : 1),
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentEvent(null);
    setFormData({
      name: '',
      slug: '',
      icon: '🎯',
      category: 'technical',
      time: '',
      venue: '',
      description: '',
      rules: '',
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      minTeamSize: Number(formData.minTeamSize) || 1,
      maxTeamSize: Number(formData.maxTeamSize) || 1,
      rules: formData.rules.split('\n').map(r => r.trim()).filter(r => r)
    };
    try {
      if (currentEvent) {
        await api.put(`/admin/events/${currentEvent._id}`, payload);
        toast.success('Event updated');
      } else {
        await api.post('/admin/events', payload);
        toast.success('Event created');
      }
      setIsModalOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    }
  };

  return (
    <div className="p-6 md:p-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wide">Event <span className="text-red-500">Management</span></h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">Manage TECH FEST '26 events, times, venues & rules</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/schedule"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase tracking-widest text-xs py-3 px-5 rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            <Clock size={15} className="text-red-400" />
            Manage Event Schedule
          </Link>
          <button
            onClick={handleAdd}
            className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Event
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time & Venue</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Format</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registration Status</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map(event => (
                  <tr key={event._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center text-xl glow-red flex-shrink-0">
                          {event.icon}
                        </div>
                        <div>
                          <p className="font-bold text-white tracking-wide group-hover:text-red-400 transition-colors">{event.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">/events/{event.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        event.category === 'technical' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        event.category === 'non-technical' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/30'
                      }`}>
                        {event.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                          <Clock size={12} className="text-red-400 flex-shrink-0" />
                          <span>{event.time || <span className="text-gray-600 italic">Not set</span>}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <MapPin size={12} className="text-red-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{event.venue || <span className="text-gray-600 italic">Not set</span>}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {event.isTeamEvent ? `Squad (${event.minTeamSize}-${event.maxTeamSize})` : 'Solo'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleField(event, 'registrationOpen')}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                          event.registrationOpen
                            ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 glow-green'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {event.registrationOpen ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        {event.registrationOpen ? 'Online' : 'Offline'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleField(event, 'active')}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                          event.active
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 glow-blue'
                            : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {event.active ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                          title="Edit Event"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(event)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                          title="Delete Event"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated event details will be permanently removed.`}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEvent ? 'Edit Event Details' : 'Create New Event'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#050505]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Event Name</label>
              <input
                type="text"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bug Buster"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">URL Slug</label>
              <input
                type="text"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. bug-buster"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Event Time / Timing</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g. 10:30 AM - 12:30 PM"
                />
                <Clock size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Event Venue / Location</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  value={formData.venue}
                  onChange={e => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Lab 2, CSE Block"
                />
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Visual Icon (Emoji)</label>
              <input
                type="text"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-xl text-center"
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎯"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Category</label>
              <select
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="technical">Technical</option>
                <option value="non-technical">Non-Technical</option>
                <option value="coming-soon">Coming Soon</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Format</label>
              <select
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none"
                value={formData.isTeamEvent ? 'team' : 'solo'}
                onChange={e => {
                  const isTeam = e.target.value === 'team';
                  setFormData({
                    ...formData,
                    isTeamEvent: isTeam,
                    minTeamSize: isTeam ? 1 : 1,
                    maxTeamSize: isTeam ? 2 : 1
                  });
                }}
              >
                <option value="solo">Solo Event (Individual)</option>
                <option value="team">Team Event (Squad)</option>
              </select>
            </div>
            {formData.isTeamEvent && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Min Team</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    value={formData.minTeamSize}
                    onChange={e => setFormData({ ...formData, minTeamSize: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Max Team</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    value={formData.maxTeamSize}
                    onChange={e => setFormData({ ...formData, maxTeamSize: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Description</label>
            <textarea
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all min-h-[100px]"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the event..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Rules & Guidelines (One per line)</label>
            <textarea
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all min-h-[120px] font-mono text-sm"
              value={formData.rules}
              onChange={e => setFormData({ ...formData, rules: e.target.value })}
              placeholder="Rule 1&#10;Rule 2&#10;Rule 3"
            />
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              {currentEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
