import { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink, Trash2, Eye, RefreshCw, FileSpreadsheet, Download,
  Users, CheckCircle2, Clock, XCircle, Link as LinkIcon, FileText,
  Search, Shield, Building2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Modal from '../../components/Modal';

const STATUS_OPTIONS = ['pending', 'selected', 'rejected'];

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
  const [exportExcelLoading, setExportExcelLoading] = useState(false);
  const [exportCsvLoading, setExportCsvLoading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/admin/submissions?${params}`);
      setSubmissions(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/submissions/${id}`, { status });
      toast.success(`Submission marked as ${status.toUpperCase()}.`);
      if (selectedSub && selectedSub._id === id) {
        setSelectedSub(prev => ({ ...prev, status }));
      }
      fetchSubmissions();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/submissions/${deleteTarget._id}`);
      toast.success('Submission deleted successfully.');
      setDeleteTarget(null);
      fetchSubmissions();
    } catch {
      toast.error('Failed to delete submission.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportExcel = async () => {
    setExportExcelLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/admin/submissions/export/excel?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `techfest26-paper-submissions-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Excel spreadsheet exported successfully!');
    } catch {
      toast.error('Excel Export failed.');
    } finally {
      setExportExcelLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExportCsvLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/admin/submissions/export/csv?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `techfest26-paper-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully!');
    } catch {
      toast.error('CSV Export failed.');
    } finally {
      setExportCsvLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wide">
            Paper <span className="text-red-500">Submissions</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">
            {total} Research Papers & Abstracts recorded
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchSubmissions}
            className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 p-2.5 rounded-xl transition-all"
            title="Refresh list"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportExcelLoading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs py-2.5 px-5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2 disabled:opacity-50"
            title="Export as Excel Workbook"
          >
            {exportExcelLoading ? <LoadingSpinner size="sm" /> : <FileSpreadsheet size={16} />}
            Export as Excel
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exportCsvLoading}
            className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs py-2.5 px-5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2 disabled:opacity-50"
            title="Export as CSV"
          >
            {exportCsvLoading ? <LoadingSpinner size="sm" /> : <Download size={16} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by topic, team name, team code, author name, email, college..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="w-full sm:w-56 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none font-mono text-sm bg-black"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Review Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s} className="capitalize bg-black text-white">
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3 opacity-50">📄</p>
            <p className="font-bold text-white uppercase tracking-widest">No paper submissions found</p>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Try adjusting search filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paper Topic & Team</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Author / Contact</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">College</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Files / Drive Link</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted Date</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map(sub => {
                  const title = sub.paperTitle || sub.topic || 'Untitled Paper';

                  return (
                    <tr key={sub._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white tracking-wide group-hover:text-red-400 transition-colors max-w-xs line-clamp-2">
                          {title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {sub.teamName ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              <Users size={10} /> Team: {sub.teamName} {sub.teamCode ? `(${sub.teamCode})` : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                              Individual
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{sub.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{sub.email}</p>
                        {sub.mobile && <p className="text-[10px] text-gray-400 font-mono">{sub.mobile}</p>}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-gray-300 truncate max-w-[180px]" title={sub.college}>
                          {sub.college}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                          {sub.department || '—'} {sub.year ? `· ${sub.year}` : ''}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 max-w-[180px]">
                          {sub.driveUrl && (
                            <a
                              href={sub.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/30 transition-all truncate"
                              title={sub.driveUrl}
                            >
                              <LinkIcon size={12} className="flex-shrink-0" />
                              <span className="truncate">Google Drive</span>
                              <ExternalLink size={10} className="flex-shrink-0" />
                            </a>
                          )}
                          {sub.fileUrl ? (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all truncate"
                              title={sub.fileName || 'Download Paper'}
                            >
                              <FileText size={12} className="flex-shrink-0" />
                              <span className="truncate">{sub.fileName || 'Attached Doc'}</span>
                            </a>
                          ) : !sub.driveUrl ? (
                            <span className="text-[10px] text-gray-600 font-bold uppercase">No File</span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={sub.status}
                          onChange={e => updateStatus(sub._id, e.target.value)}
                          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border cursor-pointer outline-none ${
                            sub.status === 'selected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            sub.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          <option value="pending" className="bg-black text-yellow-400">PENDING</option>
                          <option value="selected" className="bg-black text-emerald-400">SELECTED</option>
                          <option value="rejected" className="bg-black text-red-400">REJECTED</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-gray-500">
                        {new Date(sub.submittedAt).toLocaleDateString('en-IN')}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setSelectedSub(sub)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/20"
                            title="View Full Submission Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(sub)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                            title="Delete Submission"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 bg-black/60 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/5 hover:text-white transition-all"
          >
            ← Prev
          </button>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Page <span className="text-red-500">{page}</span> of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 bg-black/60 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/5 hover:text-white transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* Details Modal */}
      <Modal isOpen={!!selectedSub} onClose={() => setSelectedSub(null)} title="Paper Submission Dossier" size="lg">
        {selectedSub && (
          <div className="p-6 space-y-6 text-sm bg-[#050505] max-h-[80vh] overflow-y-auto">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-red-950/40 via-black to-black border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-md border border-red-500/30 self-start">
                  Paper Presentation Submission
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border self-start ${
                  selectedSub.status === 'selected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  selectedSub.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}>
                  Status: {selectedSub.status}
                </span>
              </div>
              <h2 className="text-2xl font-display font-black text-white mt-2">
                {selectedSub.paperTitle || selectedSub.topic}
              </h2>
              {selectedSub.teamName && (
                <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1.5">
                  <Users size={13} /> Team: {selectedSub.teamName} {selectedSub.teamCode ? `(${selectedSub.teamCode})` : ''}
                </p>
              )}
            </div>

            {/* Author Meta Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">Author Name</p>
                <p className="text-white font-bold">{selectedSub.name}</p>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">Email Address</p>
                <p className="text-white font-mono text-xs">{selectedSub.email}</p>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">Mobile Number</p>
                <p className="text-white font-mono text-xs">{selectedSub.mobile || '—'}</p>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-xl p-4 sm:col-span-2">
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">College</p>
                <p className="text-white font-bold">{selectedSub.college}</p>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">Dept & Year</p>
                <p className="text-white font-medium">{selectedSub.department || '—'} {selectedSub.year ? `· ${selectedSub.year}` : ''}</p>
              </div>
            </div>

            {/* Abstract */}
            <div className="bg-black/60 border border-white/5 rounded-2xl p-5">
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={15} /> Abstract
              </p>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-light">
                {selectedSub.abstract}
              </p>
            </div>

            {/* Links & Attachments */}
            <div className="bg-black/60 border border-white/5 rounded-2xl p-5 space-y-4">
              <p className="text-xs font-bold text-white uppercase tracking-widest">
                Document & Presentation Links
              </p>
              <div className="flex flex-wrap gap-4">
                {selectedSub.driveUrl && (
                  <a
                    href={selectedSub.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
                  >
                    <LinkIcon size={16} /> Open Google Drive Link
                    <ExternalLink size={14} />
                  </a>
                )}
                {selectedSub.fileUrl && (
                  <a
                    href={selectedSub.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Download Uploaded File ({selectedSub.fileName || 'Doc'})
                  </a>
                )}
                {!selectedSub.driveUrl && !selectedSub.fileUrl && (
                  <p className="text-xs text-gray-500 font-bold uppercase">No document or drive link attached</p>
                )}
              </div>
            </div>

            {/* Quick Status Action Panel */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Review Decision
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => updateStatus(selectedSub._id, 'selected')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                    selectedSub.status === 'selected'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 size={15} /> Select for Presentation
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(selectedSub._id, 'pending')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                    selectedSub.status === 'pending'
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20'
                  }`}
                >
                  <Clock size={15} /> Mark Under Review
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(selectedSub._id, 'rejected')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                    selectedSub.status === 'rejected'
                      ? 'bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                      : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                  }`}
                >
                  <XCircle size={15} /> Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Paper Submission"
        message={`Are you sure you want to delete the submission "${deleteTarget?.paperTitle}"? This action cannot be undone.`}
        confirmLabel="Delete Submission"
        variant="danger"
      />
    </div>
  );
}
