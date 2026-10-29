import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Bed,
  UserX,
  AlertCircle,
  Download,
  Calendar,
  CheckCircle,
  User,
} from 'lucide-react';
import { RoomAllotment } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const AdminAllotments: React.FC = () => {
  const [allotments, setAllotments] = useState<RoomAllotment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Vacate Modal
  const [vacateModalOpen, setVacateModalOpen] = useState(false);
  const [selectedAllotment, setSelectedAllotment] = useState<RoomAllotment | null>(null);
  const [vacateNotes, setVacateNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllotments = async () => {
    try {
      setLoading(true);
      const res = await api.getAllotments();
      setAllotments(res.allotments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllotments();
  }, []);

  const filteredAllotments = allotments.filter((alt) => {
    const matchesStatus = filterStatus === 'all' || alt.status === filterStatus;
    const term = search.toLowerCase();
    const matchesSearch =
      alt.studentName.toLowerCase().includes(term) ||
      alt.studentRollNo.toLowerCase().includes(term) ||
      alt.roomNumber.toLowerCase().includes(term) ||
      alt.blockName.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleOpenVacate = (alt: RoomAllotment) => {
    setSelectedAllotment(alt);
    setVacateNotes('Term completion / hostel room surrendered.');
    setError(null);
    setVacateModalOpen(true);
  };

  const handleExecuteVacate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllotment) return;

    try {
      setProcessing(true);
      setError(null);
      await api.vacateRoom(selectedAllotment.studentId, vacateNotes);
      setVacateModalOpen(false);
      await fetchAllotments();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to vacate room.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Master Allotment Ledger
          </div>
          <h2 className="text-2xl font-black">Room Allotments & Occupancy Register</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Complete audited registry of assigned student beds, wardens, dates, and transfers.
          </p>
        </div>

        <a
          href={api.getExportCsvUrl('allotments')}
          download
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-blue-900" />
          <span>Export Allotment CSV</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or room..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 w-full sm:w-48"
          >
            <option value="all">All Allotments ({allotments.length})</option>
            <option value="active">Active Beds ({allotments.filter((a) => a.status === 'active').length})</option>
            <option value="transferred">Transferred ({allotments.filter((a) => a.status === 'transferred').length})</option>
            <option value="vacated">Vacated ({allotments.filter((a) => a.status === 'vacated').length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading master allotment ledger...</div>
        ) : filteredAllotments.length === 0 ? (
          <div className="p-12 text-center">
            <Bed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No allotment records found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-extrabold">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Assigned Room & Bed</th>
                  <th className="px-5 py-3.5">Hostel Wing</th>
                  <th className="px-5 py-3.5">Allotted By</th>
                  <th className="px-5 py-3.5">Allotment Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllotments.map((alt) => (
                  <tr key={alt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{alt.studentName}</p>
                      <p className="text-[11px] text-slate-500">Roll: {alt.studentRollNo}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900 text-sm">{alt.roomNumber}</span>
                      <span className="ml-1 text-[11px] font-semibold text-blue-900">Bed #{alt.bedNumber}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-800 font-medium">{alt.blockName}</td>
                    <td className="px-5 py-4 text-slate-700 font-medium">{alt.allottedBy}</td>
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {new Date(alt.allottedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={alt.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {alt.status === 'active' ? (
                        <button
                          onClick={() => handleOpenVacate(alt)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          Vacate Bed
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vacate Bed Modal */}
      {selectedAllotment && (
        <Modal
          isOpen={vacateModalOpen}
          onClose={() => setVacateModalOpen(false)}
          title={`Vacate Bed: ${selectedAllotment.roomNumber} (Bed #${selectedAllotment.bedNumber})`}
          subtitle={`Student: ${selectedAllotment.studentName} (${selectedAllotment.studentRollNo})`}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteVacate} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold">Attention: </span>
              This will atomically release Bed #{selectedAllotment.bedNumber} in Room {selectedAllotment.roomNumber}, making it immediately available for new student applications.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Vacate Remarks</label>
              <textarea
                rows={2}
                required
                value={vacateNotes}
                onChange={(e) => setVacateNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVacateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-700 text-white hover:bg-rose-800 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Vacate'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
