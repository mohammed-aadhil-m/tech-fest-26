import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Modal from '../../components/Modal';

const EVENTS_OPTS = [
  { label: 'Overall Event', value: 'overall' },
  { label: 'Paper Presentation', value: 'paper-presentation' },
  { label: 'Dev & Deploy', value: 'dev-deploy' },
  { label: 'Bug Buster', value: 'bug-buster' },
  { label: 'Treasure Hunt 2.0', value: 'treasure-hunt' },
  { label: 'Connect & Sketch', value: 'connect-sketch' },
];

const POSITION_OPTS = ['1st', '2nd', '3rd'];

export default function AdminWinners() {
  const toast = useToast();
  const [winners, setWinners] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    event: '', eventName: '', position: '1st',
    participantName: '', teamName: '', college: ''
  });
  const [photo, setPhoto] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, eRes] = await Promise.all([
        api.get('/admin/winners'),
        api.get('/admin/events')
      ]);
      setWinners(wRes.data.data);
      setEvents(eRes.data.data.filter(e => e.category !== 'coming-soon'));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleEventChange = (id) => {
    const ev = events.find(e => e._id === id);
    setForm(f => ({ ...f, event: id, eventName: ev?.name || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.event || !form.participantName) {
      toast.error('Event and participant name are required.'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      await api.post('/admin/winners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Winner added!');
      setAddModal(false);
      setForm({ event: '', eventName: '', position: '1st', participantName: '', teamName: '', college: '' });
      setPhoto(null);
      fetch();
    } catch { toast.error('Failed to add winner.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/winners/${deleteTarget._id}`);
      toast.success('Winner removed.');
      setDeleteTarget(null);
      fetch();
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(false); }
  };

  const byEvent = winners.reduce((acc, w) => {
    if (!acc[w.eventName]) acc[w.eventName] = [];
    acc[w.eventName].push(w);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Winners</h1>
          <p className="text-sm text-gray-500">Manage TECH FEST '26 winners</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary text-sm">
          <Plus size={16} /> Add Winner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : Object.keys(byEvent).length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium text-gray-900">No winners added yet</p>
          <button onClick={() => setAddModal(true)} className="btn-primary text-sm mt-4">Add First Winner</button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byEvent).map(([eventName, eventWinners]) => (
            <div key={eventName} className="admin-card">
              <h2 className="text-lg font-display font-bold text-gray-900 mb-4">{eventName}</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {['1st', '2nd', '3rd'].map(pos => {
                  const winner = eventWinners.find(w => w.position === pos);
                  if (!winner) return null;
                  return (
                    <div key={pos} className="bg-gray-50 rounded-xl p-4 relative group">
                      <button
                        onClick={() => setDeleteTarget(winner)}
                        className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="text-center">
                        <div className="text-2xl mb-1">{pos === '1st' ? '🥇' : pos === '2nd' ? '🥈' : '🥉'}</div>
                        {winner.photoUrl && (
                          <img src={winner.photoUrl} alt={winner.participantName}
                            className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-white shadow" />
                        )}
                        <p className="font-semibold text-gray-900 text-sm">{winner.participantName}</p>
                        {winner.teamName && <p className="text-xs text-gray-500">{winner.teamName}</p>}
                        {winner.college && <p className="text-xs text-gray-400">{winner.college}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Winner Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Winner" size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Event *</label>
            <select className="form-input" value={form.event} onChange={e => handleEventChange(e.target.value)} required>
              <option value="">Select event</option>
              {events.map(ev => <option key={ev._id} value={ev._id}>{ev.icon} {ev.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Position *</label>
            <select className="form-input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
              {POSITION_OPTS.map(p => <option key={p} value={p}>{p} Place</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Participant / Team Name *</label>
            <input type="text" className="form-input" placeholder="Winner name" value={form.participantName}
              onChange={e => setForm(f => ({ ...f, participantName: e.target.value }))} required />
          </div>
          <div>
            <label className="form-label">Team Name (if team event)</label>
            <input type="text" className="form-input" placeholder="Team name" value={form.teamName}
              onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">College</label>
            <input type="text" className="form-input" placeholder="College name" value={form.college}
              onChange={e => setForm(f => ({ ...f, college: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Photo (optional)</label>
            <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-primary-500 transition-all">
              <Upload size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600">{photo ? photo.name : 'Upload winner photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files[0])} />
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary flex-1 justify-center text-sm py-2.5">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center text-sm py-2.5 disabled:opacity-50">
              {saving ? <LoadingSpinner size="sm" /> : 'Add Winner'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Winner"
        message={`Remove "${deleteTarget?.participantName}" from winners?`}
      />
    </div>
  );
}
