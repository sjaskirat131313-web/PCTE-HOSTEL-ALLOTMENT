import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertCircle,
  Building2,
  Bed,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  HelpCircle,
} from 'lucide-react';
import { RoomChangeRequest, HostelRoom, RoomType, HostelBlock } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';

interface RoomChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted?: () => void;
}

export const RoomChangeRequestModal: React.FC<RoomChangeRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted,
}) => {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<RoomChangeRequest[]>([]);
  const [blocks, setBlocks] = useState<HostelBlock[]>([]);
  const [availableRooms, setAvailableRooms] = useState<HostelRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [requestedBlockId, setRequestedBlockId] = useState('');
  const [requestedRoomType, setRequestedRoomType] = useState<RoomType>('single');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [reasonCategory, setReasonCategory] = useState<RoomChangeRequest['reasonCategory']>('academic');
  const [reasonDetails, setReasonDetails] = useState('');

  const activePendingRequest = requests.find((r) => r.status === 'pending');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, blocksRes, roomsRes] = await Promise.all([
        api.getRoomChangeRequests(),
        api.getBlocks(),
        api.getRooms({ availableOnly: 'true' }),
      ]);
      setRequests(reqRes.requests);
      setBlocks(blocksRes.blocks);
      setAvailableRooms(roomsRes.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.allottedRoomId) {
      setError('You must have an allotted hostel room before requesting a change.');
      return;
    }
    if (!reasonDetails.trim()) {
      setError('Please provide detailed justification for your room switch request.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.submitRoomChangeRequest({
        requestedBlockId: requestedBlockId || undefined,
        requestedRoomType,
        targetRoomId: targetRoomId || undefined,
        reasonCategory,
        reasonDetails,
      });

      setReasonDetails('');
      await fetchData();
      if (onRequestSubmitted) onRequestSubmitted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit room change request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this pending room change request?')) return;
    try {
      await api.cancelRoomChangeRequest(requestId);
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel request.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hostel Room Change / Switch Request"
      subtitle="Submit formal application to the Warden Office for room transfer"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Allotment Info */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Allotment</span>
            <p className="font-extrabold text-slate-900 text-sm mt-0.5">
              {profile?.allottedBlock || 'No room allotted yet'} • Bed #{profile?.allottedBedNumber || 'N/A'}
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-900">
            Active Allotment
          </span>
        </div>

        {/* Existing Pending Request Banner */}
        {activePendingRequest ? (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs flex items-center gap-1.5 text-amber-900">
                <Clock className="w-4 h-4 text-amber-700" />
                Pending Room Change Request Under Review
              </span>
              <StatusBadge status="pending" size="sm" />
            </div>

            <p className="text-xs text-amber-900">
              You submitted a switch request from <strong>{activePendingRequest.currentRoomNumber}</strong> to{' '}
              <strong>{activePendingRequest.requestedRoomType?.toUpperCase()} Room</strong> on{' '}
              {new Date(activePendingRequest.submittedAt).toLocaleDateString()}.
            </p>

            <div className="text-[11px] bg-white/70 p-3 rounded-xl border border-amber-200/80">
              <span className="font-bold">Reason Category: </span>
              <span className="capitalize">{activePendingRequest.reasonCategory}</span>
              <p className="mt-1 text-slate-700 font-medium italic">"{activePendingRequest.reasonDetails}"</p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleCancelRequest(activePendingRequest.id)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancel Pending Request
              </button>
            </div>
          </div>
        ) : !profile?.allottedRoomId ? (
          <div className="p-6 text-center text-xs text-slate-500">
            You do not have an active hostel room allotment yet. Please submit a hostel accommodation application first.
          </div>
        ) : (
          /* Form to Submit New Change Request */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Target Block</label>
                <select
                  value={requestedBlockId}
                  onChange={(e) => setRequestedBlockId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                >
                  <option value="">Any Available Block</option>
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Sharing Type</label>
                <select
                  value={requestedRoomType}
                  onChange={(e) => setRequestedRoomType(e.target.value as RoomType)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                >
                  <option value="single">Single Room (1 Bed)</option>
                  <option value="double">Double Sharing (2 Beds)</option>
                  <option value="triple">Triple Sharing (3 Beds)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Alternative Room (Optional, based on vacant beds)
              </label>
              <select
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              >
                <option value="">No specific room preference (Let warden decide)</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} ({r.blockName}) - {r.capacity - r.occupiedBeds} vacant beds ({r.roomType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason Category</label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              >
                <option value="academic">Academic & Study Environment (Need quieter room)</option>
                <option value="medical">Medical or Health Grounds (e.g., lower floor preference)</option>
                <option value="compatibility">Roommate Compatibility / Mutual Adjustment</option>
                <option value="financial">Financial (Switching room category / sharing)</option>
                <option value="other">Other Grounds</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Justification / Remarks for Warden
              </label>
              <textarea
                rows={3}
                required
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="Explain why you are requesting a room switch in detail..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Past Requests History */}
        {requests.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-600 mb-2">Previous Room Change Requests History</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-800">
                      From {req.currentRoomNumber} to {req.targetRoomNumber || req.requestedRoomType || 'Requested Room'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Submitted on {new Date(req.submittedAt).toLocaleDateString()} • Reason: {req.reasonCategory}
                    </p>
                    {req.adminRemarks && (
                      <p className="text-[11px] text-blue-800 mt-0.5">Admin Note: {req.adminRemarks}</p>
                    )}
                  </div>
                  <StatusBadge status={req.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
