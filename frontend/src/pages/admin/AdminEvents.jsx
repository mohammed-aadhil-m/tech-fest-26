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
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500">Manage all TECH FEST '26 events</p>
        </div>
        <button onClick={handleAdd} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Registration</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Active</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map(event => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{event.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{event.name}</p>
                          <p className="text-xs text-gray-400">/events/{event.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={categoryClasses[event.category] || ''}>
                        {event.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600">
                      {event.isTeamEvent ? `${event.minTeamSize}–${event.maxTeamSize}` : 'Individual'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleField(event, 'registrationOpen')}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                          event.registrationOpen
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {event.registrationOpen ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        {event.registrationOpen ? 'Open' : 'Closed'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleField(event, 'active')}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                          event.active
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-400 border-gray-200'
                        }`}
                      >
                        {event.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(event)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
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
        message={`Delete "${deleteTarget?.name}"? All associated data may be affected.`}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEvent ? 'Edit Event' : 'Add Event'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
              <input
                type="text"
                className="input-field"
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="input-field"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="input-field min-h-[80px]"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rules (One per line)</label>
            <textarea
              className="input-field min-h-[120px]"
              value={formData.rules}
              onChange={e => setFormData({ ...formData, rules: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2 px-6">
              {currentEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
