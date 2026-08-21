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
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Paper Submissions</h1>
          <p className="text-sm text-gray-500">{total} submissions · Deadline: 04/09/2026</p>
        </div>
        <button onClick={fetch} className="btn-ghost border border-gray-200">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name, title, college..."
          className="form-input py-2 text-sm flex-1"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="form-input py-2 text-sm w-44"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📄</p>
            <p className="font-medium text-gray-900">No submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Submitter</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paper Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">College</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map(sub => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{sub.name}</p>
                      <p className="text-xs text-gray-500">{sub.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 max-w-xs truncate">{sub.paperTitle}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{sub.college}</td>
                    <td className="px-4 py-3">
                      <select
                        value={sub.status}
                        onChange={e => updateStatus(sub._id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer bg-transparent ${statusClasses[sub.status] || ''}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(sub.submittedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedSub(sub)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                          <Eye size={15} />
                        </button>
                        {sub.fileUrl && (
                          <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Download Paper">
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <button onClick={() => setDeleteTarget(sub)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
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
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">← Prev</button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next →</button>
        </div>
      )}

      <Modal isOpen={!!selectedSub} onClose={() => setSelectedSub(null)} title="Submission Details" size="lg">
        {selectedSub && (
          <div className="p-6 space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              {[['Name', selectedSub.name], ['Email', selectedSub.email], ['Mobile', selectedSub.mobile],
                ['College', selectedSub.college], ['Department', selectedSub.department], ['Year', selectedSub.year],
                ['Status', selectedSub.status], ['Submitted', new Date(selectedSub.submittedAt).toLocaleString('en-IN')]
              ].map(([l, v]) => (
                <div key={l}><p className="text-xs text-gray-400 uppercase tracking-wide">{l}</p><p className="font-medium mt-0.5">{v || '—'}</p></div>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Paper Title</p>
              <p className="font-semibold text-gray-900">{selectedSub.paperTitle}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Abstract</p>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">{selectedSub.abstract}</p>
            </div>
            {selectedSub.fileUrl && (
              <a href={selectedSub.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm inline-flex">
                <ExternalLink size={15} /> Download Paper File
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
        title="Delete Submission"
        message={`Delete submission "${deleteTarget?.paperTitle}"? This cannot be undone.`}
      />
    </div>
  );
}
