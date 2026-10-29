import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Bed,
  Sparkles,
  AlertCircle,
  User,
  Building2,
  Calendar,
  Send,
  Download,
} from 'lucide-react';
import { HostelApplication, HostelRoom, ApplicationStatus } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<HostelApplication[]>([]);
  const [availableRooms, setAvailableRooms] = useState<HostelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Selected application for Review/Allot modal
  const [selectedApp, setSelectedApp] = useState<HostelApplication | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [allotModalOpen, setAllotModalOpen] = useState(false);

  // Allotment selection
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedNumber, setSelectedBedNumber] = useState<number>(1);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const [appRes, roomsRes] = await Promise.all([
        api.getApplications(),
        api.getRooms({ availableOnly: 'true' }),
      ]);
      setApplications(appRes.applications);
      setAvailableRooms(roomsRes.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const term = search.toLowerCase();
    const matchesSearch =
      app.studentName.toLowerCase().includes(term) ||
      app.studentRollNo.toLowerCase().includes(term) ||
      app.referenceNumber.toLowerCase().includes(term) ||
      app.course.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleOpenReview = (app: HostelApplication) => {
    setSelectedApp(app);
    setAdminRemarks(app.adminRemarks || '');
    setActionError(null);
    setReviewModalOpen(true);
  };

  const handleOpenAllot = (app: HostelApplication) => {
    setSelectedApp(app);
    setActionError(null);
    // Find rooms matching gender
    const eligibleRooms = availableRooms.filter(
      (r) => r.gender === 'any' || r.gender === app.gender
    );
    if (eligibleRooms.length > 0) {
      setSelectedRoomId(eligibleRooms[0].id);
      const firstVacant = eligibleRooms[0].beds.find((b) => !b.isOccupied);
      setSelectedBedNumber(firstVacant ? firstVacant.bedNumber : 1);
    }
    setAllotModalOpen(true);
  };

  const handleExecuteAllotment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !selectedRoomId) {
      setActionError('Please select an available room.');
      return;
    }

    try {
      setProcessing(true);
      setActionError(null);
      await api.allotRoom({
        studentId: selectedApp.studentId,
        roomId: selectedRoomId,
        bedNumber: Number(selectedBedNumber),
        applicationId: selectedApp.id,
      });

      setAllotModalOpen(false);
      setReviewModalOpen(false);
      await fetchApplications();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Allotment failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (status: ApplicationStatus) => {
    if (!selectedApp) return;
    try {
      setProcessing(true);
      setActionError(null);
      await api.updateApplicationStatus(selectedApp.id, status, adminRemarks);
      setReviewModalOpen(false);
      await fetchApplications();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            Admissions & Student Applications Desk
          </div>
          <h2 className="text-2xl font-black">Hostel Accommodation Applications</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Review student preferences, verify disciplinary eligibility, and allot hostel rooms.
          </p>
        </div>

        <a
          href={api.getExportCsvUrl('applications')}
          download
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-blue-900" />
          <span>Export Applications CSV</span>
        </a>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or ref ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 w-full sm:w-48"
          >
            <option value="all">All Applications ({applications.length})</option>
            <option value="pending">Pending ({applications.filter((a) => a.status === 'pending').length})</option>
            <option value="approved">Approved ({applications.filter((a) => a.status === 'approved').length})</option>
            <option value="waitlisted">Waitlisted ({applications.filter((a) => a.status === 'waitlisted').length})</option>
            <option value="rejected">Rejected ({applications.filter((a) => a.status === 'rejected').length})</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading student applications...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No applications found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting your filter or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-extrabold">
                <tr>
                  <th className="px-5 py-3.5">Ref Number</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Course / Year</th>
                  <th className="px-5 py-3.5">Preferences</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">{app.referenceNumber}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{app.studentName}</p>
                      <p className="text-[11px] text-slate-500">
                        Roll: {app.studentRollNo} • <span className="capitalize">{app.gender}</span>
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{app.course}</p>
                      <p className="text-[11px] text-slate-400">{app.academicYear}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 capitalize">
                        {app.preferredRoomType} Sharing {app.isACPreferred ? '(AC)' : ''}
                      </p>
                      <p className="text-[11px] text-slate-500">Floor {app.preferredFloor || 1}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {new Date(app.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(app)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Review
                      </button>
                      {app.status === 'pending' && (
                        <button
                          onClick={() => handleOpenAllot(app)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors"
                        >
                          Allot Room
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Application Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Application Review: ${selectedApp.referenceNumber}`}
          subtitle={`${selectedApp.studentName} (${selectedApp.studentRollNo})`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {actionError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Student & Course Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p className="text-slate-400 text-[10px]">Student Full Name</p>
                <p className="font-bold text-slate-900">{selectedApp.studentName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Roll Number & Gender</p>
                <p className="font-bold text-slate-900">
                  {selectedApp.studentRollNo} • <span className="capitalize">{selectedApp.gender}</span>
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Degree Program</p>
                <p className="font-bold text-slate-900">{selectedApp.course}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Academic Year</p>
                <p className="font-bold text-slate-900">{selectedApp.academicYear}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Student Contact</p>
                <p className="font-bold text-slate-900">{selectedApp.phone} • {selectedApp.email}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Current Status</p>
                <StatusBadge status={selectedApp.status} size="sm" />
              </div>
            </div>

            {/* Preferences Details */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs space-y-1">
              <span className="font-bold text-blue-950 uppercase tracking-wider text-[10px]">
                Accommodation Preferences
              </span>
              <p>• Room Sharing: <strong className="capitalize">{selectedApp.preferredRoomType} Sharing</strong></p>
              <p>• Climate Control: <strong>{selectedApp.isACPreferred ? 'AC Room Requested' : 'Standard Non-AC'}</strong></p>
              <p>• Floor Preference: <strong>Floor {selectedApp.preferredFloor || 1}</strong></p>
            </div>

            {/* Guardian & Medical Info */}
            <div className="grid grid-cols-2 gap-3 text-xs p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-slate-400 text-[10px]">Parent / Guardian</p>
                <p className="font-bold text-slate-900">{selectedApp.guardianName} ({selectedApp.guardianRelation})</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Parent Contact Phone</p>
                <p className="font-bold text-slate-900">{selectedApp.guardianPhone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 text-[10px]">Permanent Residence Address</p>
                <p className="font-bold text-slate-900">{selectedApp.permanentAddress}</p>
              </div>
              {selectedApp.medicalConditions && (
                <div className="col-span-2">
                  <p className="text-slate-400 text-[10px]">Medical Notes</p>
                  <p className="font-bold text-rose-700">{selectedApp.medicalConditions}</p>
                </div>
              )}
            </div>

            {/* Admin Remarks Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Warden / Administrator Decision Remarks
              </label>
              <textarea
                rows={2}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Enter remarks visible to student (e.g. Approved per merit, or reason for waitlist/rejection)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* Decision Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleUpdateStatus('rejected')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleUpdateStatus('waitlisted')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50"
                >
                  Waitlist
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReviewModalOpen(false);
                    handleOpenAllot(selectedApp);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Bed className="w-3.5 h-3.5 text-teal-300" />
                  <span>Allot Available Room</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Room Allotment Modal */}
      {selectedApp && (
        <Modal
          isOpen={allotModalOpen}
          onClose={() => setAllotModalOpen(false)}
          title={`Allot Hostel Room to ${selectedApp.studentName}`}
          subtitle={`Roll: ${selectedApp.studentRollNo} • Preference: ${selectedApp.preferredRoomType.toUpperCase()} Room`}
          maxWidth="lg"
        >
          <form onSubmit={handleExecuteAllotment} className="space-y-4">
            {actionError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Available Room ({selectedApp.gender.toUpperCase()} Wing)
              </label>
              <select
                required
                value={selectedRoomId}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value);
                  const room = availableRooms.find((r) => r.id === e.target.value);
                  if (room) {
                    const firstVacant = room.beds.find((b) => !b.isOccupied);
                    setSelectedBedNumber(firstVacant ? firstVacant.bedNumber : 1);
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              >
                {availableRooms
                  .filter((r) => r.gender === 'any' || r.gender === selectedApp.gender)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roomNumber} ({r.blockName}) - {r.capacity - r.occupiedBeds} vacant ({r.roomType}, {r.isAC ? 'AC' : 'Non-AC'})
                    </option>
                  ))}
              </select>
            </div>

            {/* Bed Number Selector based on chosen room */}
            {selectedRoomId && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Vacant Bed Number</label>
                <div className="flex gap-2">
                  {availableRooms
                    .find((r) => r.id === selectedRoomId)
                    ?.beds.map((b) => (
                      <button
                        type="button"
                        key={b.bedNumber}
                        disabled={b.isOccupied}
                        onClick={() => setSelectedBedNumber(b.bedNumber)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          b.isOccupied
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : selectedBedNumber === b.bedNumber
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Bed #{b.bedNumber} {b.isOccupied ? '(Occupied)' : '(Vacant)'}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAllotModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{processing ? 'Allotting...' : 'Confirm Allotment'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
