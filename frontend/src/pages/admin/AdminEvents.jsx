import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
    description: '',
    rules: '',
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
      description: event.description || '',
      rules: event.rules ? event.rules.join('\n') : '',
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
      description: '',
      rules: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
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
          <h1 className="text-3xl font-display font-black text-white tracking-wide">Event <span className="text-red-500">Protocols</span></h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">Manage all TECH FEST '26 events</p>
        </div>
        <button onClick={handleAdd} className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2">
          <Plus size={16} />
          Initialize Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event Protocol</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Classification</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Format</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registration Status</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map(event => (
                  <tr key={event._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center text-xl glow-red">
                          {event.icon}
                        </div>
                        <div>
                          <p className="font-bold text-white tracking-wide group-hover:text-red-400 transition-colors">{event.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">/sys/{event.slug}</p>
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
                          title="Modify Protocol"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(event)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                          title="Delete Protocol"
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
        title="Terminate Event Protocol"
        message={`Delete "${deleteTarget?.name}"? All associated data will be purged from the system.`}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEvent ? 'Modify Event Protocol' : 'Initialize Event Protocol'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#050505]">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Event Designation</label>
              <input
                type="text"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">System Slug</label>
              <input
                type="text"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Visual Identifier</label>
              <input
                type="text"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-xl text-center"
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Classification</label>
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
          </div>
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Protocol Description</label>
            <textarea
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all min-h-[100px]"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Operating Parameters (One per line)</label>
            <textarea
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all min-h-[120px] font-mono text-sm"
              value={formData.rules}
              onChange={e => setFormData({ ...formData, rules: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              Abort
            </button>
            <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              {currentEvent ? 'Update Protocol' : 'Execute Creation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
