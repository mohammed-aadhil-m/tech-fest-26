import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Clock, MapPin, CalendarDays, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Modal from '../../components/Modal';

export default function AdminSchedule() {
  const toast = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [formData, setFormData] = useState({
    time: '',
    title: '',
    description: '',
    venue: '',
    order: 1,
    active: true,
  });

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/schedule');
      setSchedules(res.data.data || []);
    } catch {
      toast.error('Failed to load schedule timeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const toggleActive = async (item) => {
    try {
      await api.put(`/admin/schedule/${item._id}`, { active: !item.active });
      toast.success(`Schedule item ${!item.active ? 'activated' : 'hidden'}`);
      fetchSchedule();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/schedule/${deleteTarget._id}`);
      toast.success('Schedule item deleted');
      setDeleteTarget(null);
      fetchSchedule();
    } catch {
      toast.error('Failed to delete schedule item');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (item) => {
    setCurrentSchedule(item);
    setFormData({
      time: item.time || '',
      title: item.title || '',
      description: item.description || '',
      venue: item.venue || '',
      order: item.order ?? 1,
      active: item.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentSchedule(null);
    const nextOrder = schedules.length > 0
      ? Math.max(...schedules.map(s => s.order || 0)) + 1
      : 1;
    setFormData({
      time: '',
      title: '',
      description: '',
      venue: '',
      order: nextOrder,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      order: Number(formData.order) || 0,
    };
    try {
      if (currentSchedule) {
        await api.put(`/admin/schedule/${currentSchedule._id}`, payload);
        toast.success('Schedule updated');
      } else {
        await api.post('/admin/schedule', payload);
        toast.success('Schedule item added');
      }
      setIsModalOpen(false);
      fetchSchedule();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  return (
    <div className="p-6 md:p-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wide">
            Event <span className="text-red-500">Schedule</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">
            Manage Timeline, Slot Timings & Venues for TECH FEST '26
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/events"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase tracking-widest text-xs py-3 px-5 rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            <CalendarDays size={15} className="text-red-400" />
            Manage Events
          </Link>
          <button
            onClick={handleAdd}
            className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2"
          >
            <Plus size={16} />
            Add Schedule Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Time Slot
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Event / Program Title
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Venue / Location
                  </th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Visibility
                  </th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      No schedule items found. Click "Add Schedule Item" to create one.
                    </td>
                  </tr>
                ) : (
                  schedules.map((item) => (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <span className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-gray-300">
                          {item.order}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white font-mono font-bold text-xs bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg w-fit">
                          <Clock size={13} className="text-red-400 flex-shrink-0" />
                          <span>{item.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-white tracking-wide group-hover:text-red-400 transition-colors">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-md font-light">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.venue ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <MapPin size={13} className="text-red-400 flex-shrink-0" />
                            <span>{item.venue}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs italic">Not specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleActive(item)}
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                            item.active
                              ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 glow-green'
                              : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {item.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                          {item.active ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                            title="Edit Schedule Item"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                            title="Delete Schedule Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Schedule Item"
        message={`Are you sure you want to delete "${deleteTarget?.title}" (${deleteTarget?.time}) from the schedule?`}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentSchedule ? 'Edit Schedule Item' : 'Add New Schedule Item'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#050505]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                Time Slot
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g. 09:30 AM or 10:30 AM - 12:30 PM"
                />
                <Clock size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
              Program / Event Title
            </label>
            <input
              type="text"
              required
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Technical Events Begin"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
              Venue / Location (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Auditorium or Lab 2, CSE Block"
              />
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all min-h-[90px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Paper Presentation, Dev & Deploy, Bug Buster."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="schedule-active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded text-red-600 bg-black/60 border-white/20 focus:ring-red-500"
            />
            <label htmlFor="schedule-active" className="text-xs text-gray-300 font-medium cursor-pointer">
              Show this item publicly on the website schedule
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              {currentSchedule ? 'Save Changes' : 'Create Schedule Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
