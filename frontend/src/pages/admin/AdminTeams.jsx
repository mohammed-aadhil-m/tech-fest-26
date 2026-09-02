import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Download, Trash2, Eye, RefreshCw, FileSpreadsheet,
  Copy, Check, ShieldCheck, UserCheck, CheckCircle2, Clock, XCircle,
  Sparkles, AlertCircle, Hash, Mail, Phone, Building2, GraduationCap
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Modal from '../../components/Modal';

export default function AdminTeams() {
  const toast = useToast();
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exportExcelLoading, setExportExcelLoading] = useState(false);
  const [exportCsvLoading, setExportCsvLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  // Load team events for filter dropdown
  useEffect(() => {
    api.get('/events')
      .then(res => {
        const teamEvs = (res.data.data || []).filter(e => e.isTeamEvent);
        setEvents(teamEvs);
      })
      .catch(() => {});
  }, []);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (eventFilter) params.set('event', eventFilter);
      const res = await api.get(`/admin/teams?${params}`);
      setTeams(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [page, search, eventFilter]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/teams/${deleteTarget._id}`);
      toast.success('Team deleted successfully.');
      setDeleteTarget(null);
      fetchTeams();
    } catch {
      toast.error('Failed to delete team.');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text, type = 'Code') => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleExportExcel = async () => {
    setExportExcelLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventFilter) params.set('event', eventFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/admin/teams/export/excel?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `techfest26-teams-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Teams Excel spreadsheet exported!');
    } catch {
      toast.error('Excel export failed.');
    } finally {
      setExportExcelLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExportCsvLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventFilter) params.set('event', eventFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/admin/teams/export/csv?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `techfest26-teams-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Teams CSV exported!');
    } catch {
      toast.error('CSV export failed.');
    } finally {
      setExportCsvLoading(false);
    }
  };

  // Calculate total members across visible teams
  const totalParticipants = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

  return (
    <div className="p-6 md:p-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-wide">
            Registered <span className="text-red-500">Teams & Squads</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">
            {total} Teams registered • {totalParticipants} Team Participants
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchTeams}
            className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 p-2.5 rounded-xl transition-all"
            title="Refresh Teams"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportExcelLoading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs py-2.5 px-5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2 disabled:opacity-50"
            title="Export Teams as Excel Workbook"
          >
            {exportExcelLoading ? <LoadingSpinner size="sm" /> : <FileSpreadsheet size={16} />}
            Export as Excel
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exportCsvLoading}
            className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs py-2.5 px-5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2 disabled:opacity-50"
            title="Export Teams as CSV"
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
            placeholder="Search by team name, team code, leader name, member, college..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="w-full sm:w-60 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none font-mono text-sm"
          value={eventFilter}
          onChange={e => { setEventFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Team Events</option>
          {events.map(ev => (
            <option key={ev.slug} value={ev.slug} className="bg-black text-white">
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      {/* Teams Table */}
      <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : teams.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3 opacity-50">🛡️</p>
            <p className="font-bold text-white uppercase tracking-widest">No teams found</p>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Info</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Leader</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Members</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Capacity</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created Date</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teams.map(team => {
                  const maxCap = team.event?.maxTeamSize || 4;
                  const memberCount = team.members?.length || 0;
                  const isFull = memberCount >= maxCap;

                  return (
                    <tr key={team._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-bold flex items-center justify-center text-xs flex-shrink-0 glow-red">
                            {team.teamName?.[0]?.toUpperCase() || 'T'}
                          </div>
                          <div>
                            <p className="font-bold text-white tracking-wide group-hover:text-red-400 transition-colors">
                              {team.teamName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                {team.teamCode}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(team.teamCode, 'Team Code')}
                                className="text-gray-500 hover:text-white transition-colors"
                                title="Copy Team Code"
                              >
                                {copiedCode === team.teamCode ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-white">
                            <span>{team.event?.icon || '🎯'}</span>
                            <span>{team.event?.name || 'N/A'}</span>
                          </span>
                          <div>
                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              team.event?.category === 'non-technical'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {team.event?.category === 'non-technical' ? 'Non-Technical' : 'Technical'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-red-500" />
                            {team.leader?.fullName || 'Unknown Leader'}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{team.leader?.email}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">{team.leader?.college}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 max-w-xs">
                          {(team.members || []).slice(0, 3).map((m, idx) => (
                            <p key={idx} className="text-xs text-gray-300 truncate flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500/60"></span>
                              <span className="font-medium text-white">{m.fullName}</span>
                              <span className="text-[10px] text-gray-500 font-mono">({m.registrationId || 'ID'})</span>
                            </p>
                          ))}
                          {team.members?.length > 3 && (
                            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
                              +{team.members.length - 3} more members
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          isFull
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                          <Users size={11} />
                          {memberCount} / {maxCap} {isFull ? '(Full)' : '(Open)'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-gray-500">
                        {new Date(team.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setSelectedTeam(team)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/20"
                            title="View Full Team Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(team)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                            title="Delete Team"
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

      {/* Team Details Modal */}
      <Modal isOpen={!!selectedTeam} onClose={() => setSelectedTeam(null)} title="Team Roster & Members" size="lg">
        {selectedTeam && (
          <div className="p-6 space-y-6 text-sm bg-[#050505] max-h-[80vh] overflow-y-auto">
            {/* Team Header Banner */}
            <div className="bg-gradient-to-r from-red-950/40 via-black to-black border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/30 flex items-center gap-1.5">
                      <span>{selectedTeam.event?.icon || '🎯'}</span>
                      <span>{selectedTeam.event?.name || 'Team Event'}</span>
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      selectedTeam.event?.category === 'non-technical'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}>
                      {selectedTeam.event?.category === 'non-technical' ? 'Non-Technical' : 'Technical'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-white mt-3">
                    {selectedTeam.teamName}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Created on {new Date(selectedTeam.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
                <div className="bg-black/80 border border-white/10 rounded-xl p-4 text-center sm:text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Team Join Code</p>
                  <div className="flex items-center justify-center sm:justify-end gap-2 mt-1">
                    <span className="text-xl font-mono font-black text-red-400 tracking-wider">
                      {selectedTeam.teamCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedTeam.teamCode, 'Team Code')}
                      className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-md transition-all"
                    >
                      {copiedCode === selectedTeam.teamCode ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Members</p>
                <p className="text-lg font-bold text-white">
                  {selectedTeam.members?.length} / {selectedTeam.event?.maxTeamSize || selectedTeam.members?.length}
                </p>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Event Category</p>
                <p className="text-sm font-bold text-red-400">
                  {selectedTeam.event?.category === 'non-technical' ? 'Non-Technical' : 'Technical'}
                </p>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Leader Name</p>
                <p className="text-sm font-bold text-white truncate">
                  {selectedTeam.leader?.fullName}
                </p>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Leader Payment</p>
                <p className="text-sm font-bold text-emerald-400 uppercase">
                  {selectedTeam.leader?.paymentStatus || 'unpaid'}
                </p>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Users size={16} className="text-red-500" />
                  Team Participants ({selectedTeam.members?.length || 0})
                </h3>
              </div>

              <div className="space-y-4">
                {(selectedTeam.members || []).map((member, idx) => {
                  const isLeader = member._id === selectedTeam.leader?._id || member.email === selectedTeam.leader?.email;

                  return (
                    <motion.div
                      key={member._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`rounded-2xl border p-5 transition-all ${
                        isLeader
                          ? 'bg-red-950/20 border-red-500/40 shadow-[0_0_15px_rgba(220,38,38,0.15)]'
                          : 'bg-black/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm ${
                            isLeader
                              ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                              : 'bg-white/10 text-gray-300'
                          }`}>
                            {member.fullName?.[0]?.toUpperCase() || 'M'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-base">{member.fullName}</h4>
                              {isLeader && (
                                <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                                  <ShieldCheck size={10} /> Team Leader
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{member.email}</p>
                          </div>
                        </div>

                        {/* Registration ID & Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-black border border-white/10 px-3 py-1.5 rounded-lg">
                            <Hash size={12} className="text-red-500" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reg ID:</span>
                            <span className="font-mono text-xs font-bold text-red-400">{member.registrationId || 'N/A'}</span>
                            {member.registrationId && member.registrationId !== 'N/A' && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(member.registrationId, 'Registration ID')}
                                className="text-gray-500 hover:text-white ml-1"
                              >
                                {copiedCode === member.registrationId ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                              </button>
                            )}
                          </div>

                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                            member.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            member.paymentStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                            member.paymentStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            'bg-white/5 text-gray-400 border-white/10'
                          }`}>
                            {member.paymentStatus === 'paid' && <CheckCircle2 size={11} />}
                            {member.paymentStatus === 'pending' && <Clock size={11} />}
                            {member.paymentStatus === 'rejected' && <XCircle size={11} />}
                            {member.paymentStatus || 'unpaid'}
                          </span>
                        </div>
                      </div>

                      {/* Participant Meta Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Mobile</p>
                          <p className="text-white font-mono font-medium mt-0.5">{member.mobile || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">College</p>
                          <p className="text-white font-medium mt-0.5 truncate" title={member.college}>{member.college || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Department / Year</p>
                          <p className="text-white font-medium mt-0.5">{member.department || '—'} {member.year ? `· ${member.year}` : ''}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Food Preference</p>
                          <p className="text-white font-medium mt-0.5">{member.foodPreference || '—'}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
        title="Delete Team"
        message={`Are you sure you want to delete the team "${deleteTarget?.teamName}" (${deleteTarget?.teamCode})? This action will unlink all members from this team.`}
        confirmLabel="Delete Team"
        variant="danger"
      />
    </div>
  );
}
