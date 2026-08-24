import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Trash2, Eye, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Modal from '../../components/Modal';

const STATUS_OPTIONS = ['pending', 'selected', 'rejected'];
const statusClasses = {
  pending: 'status-pending',
  selected: 'status-selected',
  rejected: 'status-rejected',
};

export default function AdminSubmissions() {
  const toast = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedSub, setSelectedSub] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/admin/submissions?${params}`);
      setSubmissions(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load submissions'); }
    finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/submissions/${id}`, { status });
      toast.success('Status updated.');
      fetch();
    } catch { toast.error('Failed to update.'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/submissions/${deleteTarget._id}`);
      toast.success('Submission deleted.');
      setDeleteTarget(null);
      fetch();
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="p-6 md:p-8 relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wide">Data <span className="text-red-500">Submissions</span></h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">{total} entries recorded</p>
        </div>
        <button onClick={fetch} className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 p-2 rounded-xl transition-all self-start sm:self-auto">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search entries..."
          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm flex-1"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="w-full sm:w-48 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none font-mono text-sm"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3 opacity-50">📄</p>
            <p className="font-bold text-white uppercase tracking-widest">No entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operator</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data File</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Institution</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map(sub => (
                  <tr key={sub._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white tracking-wide group-hover:text-red-400 transition-colors">{sub.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{sub.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-300 max-w-xs truncate">{sub.paperTitle}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500 truncate max-w-[150px]">{sub.college}</td>
                    <td className="px-6 py-4">
                      <select
                        value={sub.status}
                        onChange={e => updateStatus(sub._id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border cursor-pointer outline-none ${
                          sub.status === 'selected' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          sub.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize bg-black text-white">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {new Date(sub.submittedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => setSelectedSub(sub)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/20" title="View Data">
                          <Eye size={15} />
                        </button>
                        {sub.fileUrl && (
                          <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all border border-transparent hover:border-green-500/30" title="Extract File">
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <button onClick={() => setDeleteTarget(sub)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30" title="Purge File">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 bg-black/60 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/5 hover:text-white transition-all">← Prev</button>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Page <span className="text-red-500">{page}</span> of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 bg-black/60 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/5 hover:text-white transition-all">Next →</button>
        </div>
      )}

      <Modal isOpen={!!selectedSub} onClose={() => setSelectedSub(null)} title="Data Payload Details" size="lg">
        {selectedSub && (
          <div className="p-6 space-y-6 text-sm bg-[#050505]">
            <div className="grid sm:grid-cols-2 gap-6">
              {[['Operator', selectedSub.name], ['Contact', selectedSub.email], ['Comms', selectedSub.mobile],
                ['Institution', selectedSub.college], ['Unit', selectedSub.department], ['Level', selectedSub.year],
                ['Integrity', selectedSub.status], ['Timestamp', new Date(selectedSub.submittedAt).toLocaleString('en-IN')]
              ].map(([l, v]) => (
                <div key={l} className="bg-black/60 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">{l}</p>
                  <p className="text-white font-bold">{v || '—'}</p>
                </div>
              ))}
            </div>
            <div className="bg-black/60 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">File Designation</p>
              <p className="text-white font-bold">{selectedSub.paperTitle}</p>
            </div>
            <div className="bg-black/60 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-3">Data Abstract</p>
              <p className="text-gray-300 text-sm leading-relaxed font-mono">{selectedSub.abstract}</p>
            </div>
            {selectedSub.fileUrl && (
              <a href={selectedSub.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] inline-flex items-center gap-2">
                <ExternalLink size={15} /> Extract Payload
              </a>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Purge Data Entry"
        message={`Delete "${deleteTarget?.paperTitle}"? This operation cannot be reversed.`}
        confirmLabel="Execute Purge"
        variant="danger"
      />
    </div>
  );
}
