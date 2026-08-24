import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Trash2, Eye, Filter, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Modal from '../../components/Modal';

const STATUS_OPTIONS = ['registered', 'confirmed', 'attended', 'disqualified', 'cancelled'];

const statusClasses = {
  registered: 'status-registered',
  confirmed: 'status-confirmed',
  attended: 'status-attended',
  disqualified: 'status-disqualified',
  cancelled: 'status-cancelled',
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
  const [exportLoading, setExportLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch payment info when a registration is selected
  useEffect(() => {
    if (selectedReg) {
      setPaymentLoading(true);
      api.get(`/admin/payments?search=${selectedReg.registrationId}`)
        .then(res => {
          if (res.data.data && res.data.data.length > 0) {
            setPaymentDetails(res.data.data[0]);
          } else {
            setPaymentDetails(null);
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

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventFilter) params.set('event', eventFilter);
      const res = await api.get(`/admin/registrations/export/csv?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'techfest26-registrations.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully!');
    } catch {
      toast.error('Export failed.');
    } finally {
      setExportLoading(false);
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
        <div className="flex gap-3">
          <button onClick={fetchRegistrations} className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 p-2 rounded-xl transition-all">
            <RefreshCw size={18} />
          </button>
          <button onClick={handleExport} disabled={exportLoading} className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-2 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2 disabled:opacity-50">
            {exportLoading ? <LoadingSpinner size="sm" /> : <Download size={15} />}
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
            placeholder="Search by name, email, ID, college..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <input
          type="text"
          placeholder="Filter by event..."
          className="w-full sm:w-48 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
          value={eventFilter}
          onChange={e => { setEventFilter(e.target.value); setPage(1); }}
        />
        <select
          className="w-full sm:w-44 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none font-mono text-sm"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
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
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Profile</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event Designation</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Institution</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map(reg => (
                  <tr key={reg._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/30">{reg.registrationId}</span>
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
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {new Date(reg.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/20"
                          title="View Data"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(reg)}
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
      <Modal isOpen={!!selectedReg} onClose={() => setSelectedReg(null)} title="Registration Details" size="lg">
        {selectedReg && (
          <div className="p-6 space-y-6 text-sm bg-[#050505]">
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                ['Registration ID', selectedReg.registrationId],
                ['Full Name', selectedReg.user?.fullName],
                ['Email', selectedReg.user?.email],
                ['Mobile', selectedReg.user?.mobile],
                ['Institution', selectedReg.user?.college],
                ['Department', selectedReg.user?.department],
                ['Year', selectedReg.user?.year],
                ['Dietary Requirement', selectedReg.user?.foodPreference],
                ['Protocol Status', selectedReg.status],
                ['Transaction Status', selectedReg.paymentStatus],
                ['Timestamp', new Date(selectedReg.createdAt).toLocaleString('en-IN')],
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
                Designated Event
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 glow-red">
                  {selectedReg.event?.name}
                </span>
              </div>
            </div>

            {/* Team info */}
            {selectedReg.team && (
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-4">
                  Squad Details
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Squad Name</p>
                    <p className="text-white font-bold">{selectedReg.team.teamName}</p>
                  </div>
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Squad Code</p>
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
              <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-4">
                Transaction Details
              </p>
              {paymentLoading ? (
                <div className="py-4 flex justify-center"><LoadingSpinner size="sm" /></div>
              ) : paymentDetails ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Transaction ID</p>
                      <p className="text-white font-mono font-bold mt-0.5">{paymentDetails.transactionId}</p>
                    </div>
                    <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Payment Phone</p>
                      <p className="text-white font-bold mt-0.5">{paymentDetails.paymentPhone}</p>
                    </div>
                  </div>
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Screenshot Record</p>
                    <a href={paymentDetails.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block w-fit">
                      <img
                        src={paymentDetails.screenshotUrl}
                        alt="Payment Screenshot"
                        className="max-w-xs w-full h-auto rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,42,42,0.1)] hover:border-red-500/50 transition-all cursor-zoom-in"
                      />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest bg-white/5 border border-dashed border-white/10 rounded-xl p-6 text-center">No transaction records found.</p>
              )}
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
        title="Purge Registration Data"
        message={`Are you sure you want to delete the registration for "${deleteTarget?.user?.fullName}"? This data cannot be recovered.`}
        confirmLabel="Execute Purge"
        variant="danger"
      />
    </div>
  );
}
