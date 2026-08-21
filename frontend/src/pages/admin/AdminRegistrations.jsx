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
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Registrations</h1>
          <p className="text-sm text-gray-500">{total} total registrations</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchRegistrations} className="btn-ghost gap-2 text-sm border border-gray-200">
            <RefreshCw size={15} />
          </button>
          <button onClick={handleExport} disabled={exportLoading} className="btn-secondary text-sm py-2 disabled:opacity-50">
            {exportLoading ? <LoadingSpinner size="sm" /> : <Download size={15} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, ID, college..."
            className="form-input pl-9 py-2 text-sm"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <input
          type="text"
          placeholder="Filter by event..."
          className="form-input py-2 text-sm sm:w-48"
          value={eventFilter}
          onChange={e => { setEventFilter(e.target.value); setPage(1); }}
        />
        <select
          className="form-input py-2 text-sm sm:w-44"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium text-gray-900">No registrations found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.map(reg => (
                  <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-primary-700">{reg.registrationId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{reg.fullName}</p>
                        <p className="text-xs text-gray-500">{reg.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{reg.eventName}</p>
                      {reg.teamName && <p className="text-xs text-gray-500">Team: {reg.teamName}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-xs">{reg.college}</p>
                      <p className="text-gray-400 text-xs">{reg.department} · {reg.year}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={reg.status}
                        onChange={e => handleStatusUpdate(reg._id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer bg-transparent ${statusClasses[reg.status] || ''}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(reg.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ color: '#C40001' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff0f0'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(reg)}
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* Registration Detail Modal */}
      <Modal isOpen={!!selectedReg} onClose={() => setSelectedReg(null)} title="Registration Details" size="lg">
        {selectedReg && (
          <div className="p-6 space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ['Registration ID', selectedReg.registrationId],
                ['Full Name', selectedReg.fullName],
                ['Email', selectedReg.email],
                ['Mobile', selectedReg.mobile],
                ['College', selectedReg.college],
                ['Department', selectedReg.department],
                ['Year', selectedReg.year],
                ['Food Pref', selectedReg.foodPreference],
                ['Status', selectedReg.status],
                ['Registered', new Date(selectedReg.createdAt).toLocaleString('en-IN')],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                  <p className="text-gray-900 font-medium mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>

            {/* Events registered for */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                Events Registered ({selectedReg.events?.length || 1})
              </p>
              <div className="flex flex-wrap gap-2">
                {(selectedReg.events && selectedReg.events.length > 0)
                  ? selectedReg.events.map((e, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: '#fff0f0', color: '#C40001', border: '1px solid #ffc1c1' }}
                    >
                      {e.eventName}
                    </span>
                  ))
                  : <span className="text-gray-600">{selectedReg.eventName || '—'}</span>
                }
              </div>
            </div>

            {/* Team info for each team event */}
            {selectedReg.events?.filter(e => e.isTeamRegistration).map((e, i) => (
              <div key={i} className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                  Team — {e.eventName}
                </p>
                <p><strong>Team Name:</strong> {e.teamName}</p>
                <p><strong>Team Leader:</strong> {e.teamLeader}</p>
                {e.teamMembers?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-medium">Members:</p>
                    {e.teamMembers.map((m, j) => (
                      <p key={j} className="text-gray-700 text-xs">• {m.name} ({m.email})</p>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Payment Info */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                Payment Details
              </p>
              {paymentLoading ? (
                <div className="py-4 flex justify-center"><LoadingSpinner size="sm" /></div>
              ) : paymentDetails ? (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Transaction ID</p>
                      <p className="text-gray-900 font-mono font-medium mt-0.5">{paymentDetails.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Payment Phone</p>
                      <p className="text-gray-900 font-medium mt-0.5">{paymentDetails.paymentPhone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Screenshot</p>
                    <a href={paymentDetails.screenshotUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={paymentDetails.screenshotUrl}
                        alt="Payment Screenshot"
                        className="max-w-xs w-full h-auto rounded-lg border shadow-sm hover:opacity-90 transition-opacity cursor-zoom-in"
                      />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No payment information submitted yet.</p>
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
        title="Delete Registration"
        message={`Are you sure you want to delete the registration for "${deleteTarget?.fullName}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
