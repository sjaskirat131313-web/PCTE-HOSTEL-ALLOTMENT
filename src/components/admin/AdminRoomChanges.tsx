import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Bed,
  ArrowRight,
  Clock,
  Send,
} from 'lucide-react';
import { RoomChangeRequest, HostelRoom } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const AdminRoomChanges: React.FC = () => {
  const [requests, setRequests] = useState<RoomChangeRequest[]>([]);
  const [availableRooms, setAvailableRooms] = useState<HostelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<RoomChangeRequest | null>(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [targetBedNumber, setTargetBedNumber] = useState<number>(1);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [crRes, roomsRes] = await Promise.all([
        api.getRoomChangeRequests(),
        api.getRooms({ availableOnly: 'true' }),
      ]);
      setRequests(crRes.requests);
      setAvailableRooms(roomsRes.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const term = search.toLowerCase();
    const matchesSearch =
      r.studentName.toLowerCase().includes(term) ||
      r.studentRollNo.toLowerCase().includes(term) ||
      r.currentRoomNumber.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleOpenProcess = (req: RoomChangeRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setActionType(action);
    setError(null);
    setAdminRemarks(action === 'approve' ? 'Approved by hostel administration. Keys ready at office.' : 'Declined due to unavailability.');

    // Preselect target room if specified or available
    if (action === 'approve') {
      const match = req.targetRoomId
        ? availableRooms.find((r) => r.id === req.targetRoomId)
        : availableRooms[0];
      if (match) {
        setTargetRoomId(match.id);
        const vacant = match.beds.find((b) => !b.isOccupied);
        setTargetBedNumber(vacant ? vacant.bedNumber : 1);
      }
    }

    setProcessModalOpen(true);
  };

  const handleExecuteProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      setError(null);
      await api.processRoomChange(selectedRequest.id, {
        action: actionType,
        targetRoomId: actionType === 'approve' ? targetRoomId : undefined,
        targetBedNumber: actionType === 'approve' ? Number(targetBedNumber) : undefined,
        adminRemarks,
      });

      setProcessModalOpen(false);
      await fetchRequests();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Processing failed.');
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
            <RefreshCw className="w-3.5 h-3.5" />
            Room Transfer Management
          </div>
          <h2 className="text-2xl font-black">Room Switch & Transfer Requests</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Process student room transfers with atomic concurrency guarantees.
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 text-xs text-slate-200">
          Pending Transfers: <strong className="text-teal-300">{requests.filter((r) => r.status === 'pending').length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, roll number, or current room..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 w-full sm:w-48"
          >
            <option value="all">All Switch Requests ({requests.length})</option>
            <option value="pending">Pending ({requests.filter((r) => r.status === 'pending').length})</option>
            <option value="approved">Approved ({requests.filter((r) => r.status === 'approved').length})</option>
            <option value="rejected">Rejected ({requests.filter((r) => r.status === 'rejected').length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading switch requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No room change requests found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-extrabold">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Current Room</th>
                  <th className="px-5 py-3.5">Requested Preference</th>
                  <th className="px-5 py-3.5">Reason Category & Details</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{req.studentName}</p>
                      <p className="text-[11px] text-slate-500">Roll: {req.studentRollNo}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900">{req.currentRoomNumber}</span>
                      <span className="text-[11px] text-slate-500 block">Bed #{req.currentBedNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-blue-900">
                        {req.targetRoomNumber ? `Room ${req.targetRoomNumber}` : `${req.requestedRoomType?.toUpperCase() || 'Any'} Room`}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {req.requestedBlockId || 'Any Block'}
                      </p>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700 capitalize mb-1">
                        {req.reasonCategory}
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2 italic">"{req.reasonDetails}"</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {new Date(req.submittedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleOpenProcess(req, 'approve')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors"
                          >
                            Approve Switch
                          </button>
                          <button
                            onClick={() => handleOpenProcess(req, 'reject')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Processed by {req.processedBy || 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Transfer Modal */}
      {selectedRequest && (
        <Modal
          isOpen={processModalOpen}
          onClose={() => setProcessModalOpen(false)}
          title={
            actionType === 'approve'
              ? `Approve Room Switch for ${selectedRequest.studentName}`
              : `Decline Room Switch for ${selectedRequest.studentName}`
          }
          subtitle={`Current Allotment: ${selectedRequest.currentRoomNumber} (Bed #${selectedRequest.currentBedNumber})`}
          maxWidth="lg"
        >
          <form onSubmit={handleExecuteProcess} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Invariant Explanation */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1">
              <p className="font-bold">Atomic Transactional Transfer:</p>
              <p>
                Approving this switch will atomically vacate Bed #{selectedRequest.currentBedNumber} in {selectedRequest.currentRoomNumber} and occupy the selected bed in the destination room in a single atomic transaction.
              </p>
            </div>

            {actionType === 'approve' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Destination Room with Vacant Beds
                  </label>
                  <select
                    required
                    value={targetRoomId}
                    onChange={(e) => {
                      setTargetRoomId(e.target.value);
                      const room = availableRooms.find((r) => r.id === e.target.value);
                      if (room) {
                        const firstVacant = room.beds.find((b) => !b.isOccupied);
                        setTargetBedNumber(firstVacant ? firstVacant.bedNumber : 1);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  >
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} ({r.blockName}) - {r.capacity - r.occupiedBeds} vacant ({r.roomType})
                      </option>
                    ))}
                  </select>
                </div>

                {targetRoomId && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Bed Number</label>
                    <div className="flex gap-2">
                      {availableRooms
                        .find((r) => r.id === targetRoomId)
                        ?.beds.map((b) => (
                          <button
                            type="button"
                            key={b.bedNumber}
                            disabled={b.isOccupied}
                            onClick={() => setTargetBedNumber(b.bedNumber)}
                            className={`flex-1 py-2 rounded-xl border text-xs font-bold ${
                              b.isOccupied
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : targetBedNumber === b.bedNumber
                                ? 'bg-blue-900 text-white border-blue-900'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            Bed #{b.bedNumber} {b.isOccupied ? '(Occupied)' : '(Vacant)'}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Remarks</label>
              <textarea
                rows={2}
                required
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Enter feedback or instructions for the student..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProcessModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 flex items-center gap-1.5 ${
                  actionType === 'approve'
                    ? 'bg-blue-900 hover:bg-blue-800'
                    : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{processing ? 'Processing...' : actionType === 'approve' ? 'Confirm Switch' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
