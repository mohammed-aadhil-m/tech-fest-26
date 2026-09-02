import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Trash2, Eye, Filter, RefreshCw, FileSpreadsheet, ExternalLink, X, Maximize2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Modal from '../../components/Modal';

const STATUS_OPTIONS = ['registered', 'confirmed', 'attended', 'disqualified', 'cancelled'];
const PAYMENT_STATUS_OPTIONS = ['unpaid', 'pending', 'paid', 'rejected'];

const formatImageUrl = (url) => {
  if (!url) return '';
  const clean = url.replace(/\\/g, '/');
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  return clean.startsWith('/') ? clean : `/${clean}`;
};

export default function AdminRegistrations() {
  const toast = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReg, setSelectedReg] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exportCsvLoading, setExportCsvLoading] = useState(false);
  const [exportExcelLoading, setExportExcelLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [previewScreenshot, setPreviewScreenshot] = useState(null);

  // Fetch payment info when a registration is selected
  useEffect(() => {
    if (selectedReg) {
      setPaymentLoading(true);
      const userId = selectedReg.user?._id || selectedReg.user;
      const regId = selectedReg.registrationId;
      const query = userId 
        ? `/admin/payments?userId=${userId}&registrationId=${regId}`
        : `/admin/payments?search=${regId}`;

      api.get(query)
        .then(res => {
          if (res.data.data && res.data.data.length > 0) {
            setPaymentDetails(res.data.data[0]);
          } else {
            // Secondary fallback search by regId directly
            return api.get(`/admin/payments?search=${regId}`).then(fallbackRes => {
              if (fallbackRes.data.data && fallbackRes.data.data.length > 0) {
                setPaymentDetails(fallbackRes.data.data[0]);
              } else {
                setPaymentDetails(null);
              }
            });
          }
        })
        .catch(() => setPaymentDetails(null))
        .finally(() => setPaymentLoading(false));
    } else {
      setPaymentDetails(null);
    }
  }, [selectedReg]);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (eventFilter) params.set('event', eventFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/admin/registrations?${params}`);
      setRegistrations(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, [page, search, eventFilter, statusFilter]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/registrations/${deleteTarget._id}`);
      toast.success('Registration deleted.');
      setDeleteTarget(null);
      fetchRegistrations();
    } catch {
      toast.error('Failed to delete registration.');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/admin/registrations/${id}`, { status });
      toast.success('Status updated.');
      fetchRegistrations();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handlePaymentStatusUpdate = async (newStatus) => {
    if (!paymentDetails) return;
    setUpdatingPayment(true);
    try {
      const res = await api.put(`/admin/payments/${paymentDetails._id}`, { status: newStatus });
      setPaymentDetails(res.data.data);
      toast.success(`Payment marked as ${newStatus}`);
      fetchRegistrations();
      if (selectedReg) {
        setSelectedReg(prev => ({
          ...prev,
          paymentStatus: newStatus === 'verified' ? 'paid' : (newStatus === 'rejected' ? 'rejected' : 'pending')
        }));
      }
    } catch {
      toast.error('Failed to update payment status.');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleExportCSV = async () => {
    setExportCsvLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventFilter) params.set('event', eventFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/admin/registrations/export/csv?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `techfest26-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully!');
    } catch {
      toast.error('CSV Export failed.');
    } finally {
      setExportCsvLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportExcelLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventFilter) params.set('event', eventFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/admin/registrations/export/excel?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `techfest26-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Excel spreadsheet exported successfully!');
    } catch {
      toast.error('Excel Export failed.');
    } finally {
      setExportExcelLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wide">User <span className="text-red-500">Registrations</span></h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">{total} total registrations</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchRegistrations}
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
            placeholder="Search by name, email, registration ID, college, mobile..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <input
          type="text"
          placeholder="Filter by event slug/name..."
          className="w-full sm:w-52 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
          value={eventFilter}
          onChange={e => { setEventFilter(e.target.value); setPage(1); }}
        />
        <select
          className="w-full sm:w-44 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none font-mono text-sm"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize bg-black text-white">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3 opacity-50">📋</p>
            <p className="font-bold text-white uppercase tracking-widest">No registrations found</p>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registration ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Participant</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">College</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reg Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map(reg => (
                  <tr key={reg._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/30">{reg.registrationId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-white tracking-wide group-hover:text-red-400 transition-colors">{reg.user?.fullName}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{reg.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-300">{reg.event?.name}</p>
                      {reg.team && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-0.5">Team: {reg.team.teamName}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-xs font-bold truncate max-w-[200px]">{reg.user?.college}</p>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-0.5">{reg.user?.department} · {reg.user?.year}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={reg.status}
                        onChange={e => handleStatusUpdate(reg._id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border cursor-pointer outline-none ${
                          reg.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          reg.status === 'registered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          reg.status === 'cancelled' || reg.status === 'disqualified' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          'bg-white/5 text-gray-400 border-white/10'
                        }`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize bg-black text-white">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        reg.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        reg.paymentStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                        reg.paymentStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        {reg.paymentStatus === 'paid' && <CheckCircle2 size={11} />}
                        {reg.paymentStatus === 'pending' && <Clock size={11} />}
                        {reg.paymentStatus === 'rejected' && <XCircle size={11} />}
                        {reg.paymentStatus || 'unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {new Date(reg.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/20"
                          title="View Details & Screenshot"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(reg)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                          title="Delete Registration"
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
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Page <span className="text-red-500">{page}</span> of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 bg-black/60 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/5 hover:text-white transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* Registration Detail Modal */}
      <Modal isOpen={!!selectedReg} onClose={() => setSelectedReg(null)} title="Registration & Payment Details" size="lg">
        {selectedReg && (
          <div className="p-6 space-y-6 text-sm bg-[#050505] max-h-[80vh] overflow-y-auto">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ['Registration ID', selectedReg.registrationId],
                ['Full Name', selectedReg.user?.fullName],
                ['Email', selectedReg.user?.email],
                ['Mobile', selectedReg.user?.mobile],
                ['College', selectedReg.user?.college],
                ['Department', selectedReg.user?.department],
                ['Year', selectedReg.user?.year],
                ['Food Preference', selectedReg.user?.foodPreference],
                ['Registration Status', selectedReg.status],
                ['Payment Status', selectedReg.paymentStatus || 'unpaid'],
                ['Registration Date', new Date(selectedReg.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
              ].map(([label, value]) => (
                <div key={label} className="bg-black/60 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">{label}</p>
                  <p className="text-white font-bold">{value || '—'}</p>
                </div>
              ))}
            </div>

            {/* Event Info */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-3">
                Registered Event
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 glow-red">
                  {selectedReg.event?.name} ({selectedReg.registrationType || 'INDIVIDUAL'})
                </span>
              </div>
            </div>

            {/* Team info */}
            {selectedReg.team && (
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-4">
                  Team Details
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Team Name</p>
                    <p className="text-white font-bold">{selectedReg.team.teamName}</p>
                  </div>
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Team Code</p>
                    <p className="text-red-400 font-mono font-bold">{selectedReg.team.teamCode}</p>
                  </div>
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Members</p>
                    <p className="text-white font-bold">{selectedReg.team.members?.length} / {selectedReg.event?.maxTeamSize}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">
                  Payment Verification & Screenshot
                </p>
                {paymentDetails && (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    paymentDetails.status === 'verified' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    paymentDetails.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                  }`}>
                    Status: {paymentDetails.status}
                  </span>
                )}
              </div>

              {paymentLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Loading Payment Record...</span>
                </div>
              ) : paymentDetails ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Transaction ID / UTR</p>
                      <p className="text-white font-mono font-bold mt-0.5 text-base tracking-wider">{paymentDetails.transactionId}</p>
                    </div>
                    <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">UPI Mobile Number</p>
                      <p className="text-white font-bold mt-0.5 text-base">{paymentDetails.paymentPhone}</p>
                    </div>
                  </div>

                  {/* Screenshot Card with View & Zoom */}
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Uploaded Screenshot</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewScreenshot(formatImageUrl(paymentDetails.screenshotUrl))}
                          className="px-3 py-1 bg-white/5 hover:bg-white/15 text-white border border-white/10 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all"
                        >
                          <Maximize2 size={13} /> Zoom / Fullscreen
                        </button>
                        <a
                          href={formatImageUrl(paymentDetails.screenshotUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all"
                        >
                          <ExternalLink size={13} /> Open Tab
                        </a>
                      </div>
                    </div>

                    <div
                      onClick={() => setPreviewScreenshot(formatImageUrl(paymentDetails.screenshotUrl))}
                      className="group relative cursor-zoom-in rounded-xl overflow-hidden border border-white/10 hover:border-red-500/50 transition-all bg-black/80 max-w-sm"
                    >
                      <img
                        src={formatImageUrl(paymentDetails.screenshotUrl)}
                        alt="Payment Screenshot"
                        className="w-full h-auto max-h-72 object-contain group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x300/111/999?text=Screenshot+Preview+Unavailable';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
                        <Maximize2 size={18} /> Click to View Full Size
                      </div>
                    </div>
                  </div>

                  {/* Verification Actions */}
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Update Payment Status</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Syncs payment confirmation across all registered events for this user</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={updatingPayment || paymentDetails.status === 'verified'}
                        onClick={() => handlePaymentStatusUpdate('verified')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40"
                      >
                        Verify / Approve
                      </button>
                      <button
                        type="button"
                        disabled={updatingPayment || paymentDetails.status === 'rejected'}
                        onClick={() => handlePaymentStatusUpdate('rejected')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest bg-white/5 border border-dashed border-white/10 rounded-xl p-6 text-center">
                  <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No payment submission recorded for this participant yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Fullscreen Screenshot Lightbox */}
      <AnimatePresence>
        {previewScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4"
            onClick={() => setPreviewScreenshot(null)}
          >
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
              <div>
                <p className="text-white font-bold tracking-widest text-lg font-display">PAYMENT SCREENSHOT</p>
                <p className="text-red-500 text-xs font-mono uppercase tracking-widest">
                  Reg ID: {selectedReg?.registrationId} • {selectedReg?.user?.fullName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={previewScreenshot}
                  download
                  onClick={e => e.stopPropagation()}
                  className="p-3 text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all flex items-center gap-2 text-xs font-bold tracking-wider"
                  title="Download Screenshot"
                >
                  <Download size={18} />
                </a>
                <button
                  className="p-3 text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-red-500/50 rounded-full transition-all"
                  onClick={() => setPreviewScreenshot(null)}
                  title="Close Preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              src={previewScreenshot}
              alt="Payment Screenshot Fullscreen"
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-white/10"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Registration"
        message={`Are you sure you want to delete the registration for "${deleteTarget?.user?.fullName}"? This action cannot be undone.`}
        confirmLabel="Delete Registration"
        variant="danger"
      />
    </div>
  );
}

