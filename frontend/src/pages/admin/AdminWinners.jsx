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
    <div className="p-6 md:p-8 relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wide">Winners <span className="text-red-500">Management</span></h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">Manage TECH FEST '26 event winners</p>
        </div>
        <button onClick={() => setAddModal(true)} className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} /> Add Winner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : Object.keys(byEvent).length === 0 ? (
        <div className="text-center py-20 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <p className="text-4xl mb-3 opacity-50">🏆</p>
          <p className="font-bold text-white uppercase tracking-widest">No winners added yet</p>
          <button onClick={() => setAddModal(true)} className="mt-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold uppercase tracking-widest text-xs py-2 px-6 rounded-xl border border-white/10 transition-all">Add First Winner</button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byEvent).map(([eventName, eventWinners]) => (
            <div key={eventName} className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6">
              <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                {eventName}
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {['1st', '2nd', '3rd'].map(pos => {
                  const winner = eventWinners.find(w => w.position === pos);
                  if (!winner) return null;
                  return (
                    <div key={pos} className="bg-white/5 border border-white/10 rounded-xl p-6 relative group overflow-hidden transition-all hover:bg-white/10 hover:border-red-500/30">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <button
                        onClick={() => setDeleteTarget(winner)}
                        className="absolute top-3 right-3 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="text-center relative z-10">
                        <div className="text-4xl mb-3 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">{pos === '1st' ? '🥇' : pos === '2nd' ? '🥈' : '🥉'}</div>
                        {winner.photoUrl && (
                          <div className="relative w-20 h-20 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full border-2 border-red-500/50 glow-red animate-pulse"></div>
                            <img src={winner.photoUrl} alt={winner.participantName}
                              className="w-full h-full rounded-full object-cover relative z-10 border-2 border-[#050505]" />
                          </div>
                        )}
                        <p className="font-black text-white text-lg tracking-wide">{winner.participantName}</p>
                        {winner.teamName && <p className="text-xs text-red-400 font-bold uppercase tracking-widest mt-1">{winner.teamName}</p>}
                        {winner.college && <p className="text-[10px] text-gray-500 font-mono mt-1">{winner.college}</p>}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#050505]">
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Event *</label>
            <select className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none" value={form.event} onChange={e => handleEventChange(e.target.value)} required>
              <option value="">Select Event</option>
              {events.map(ev => <option key={ev._id} value={ev._id}>{ev.icon} {ev.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Position *</label>
            <select className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
              {POSITION_OPTS.map(p => <option key={p} value={p}>{p} Place</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Participant / Team Name *</label>
            <input type="text" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" placeholder="Enter participant name" value={form.participantName}
              onChange={e => setForm(f => ({ ...f, participantName: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Team Name (Optional)</label>
            <input type="text" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" placeholder="Enter team name" value={form.teamName}
              onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">College</label>
            <input type="text" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" placeholder="Enter college name" value={form.college}
              onChange={e => setForm(f => ({ ...f, college: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Winner Photo (Optional)</label>
            <label className="flex items-center gap-4 border border-dashed border-white/20 bg-white/5 rounded-xl p-5 cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/10 group-hover:border-red-500/50 transition-colors">
                <Upload size={18} className="text-gray-400 group-hover:text-red-500" />
              </div>
              <span className="text-xs text-gray-400 font-mono break-all">{photo ? photo.name : 'Select photo to upload'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files[0])} />
            </label>
          </div>
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setAddModal(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex-1 flex justify-center items-center disabled:opacity-50">
              {saving ? <LoadingSpinner size="sm" /> : 'Save Winner'}
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
        message={`Are you sure you want to remove "${deleteTarget?.participantName}" from winners?`}
        confirmLabel="Remove Winner"
        variant="danger"
      />
    </div>
  );
}
