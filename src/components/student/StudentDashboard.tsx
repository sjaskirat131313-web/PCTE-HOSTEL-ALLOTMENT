import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Bed,
  FileText,
  RefreshCw,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  Phone,
  ShieldAlert,
  Wind,
  Bath,
  Search,
  X,
  Filter,
  History,
  Layers,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { HostelRoom, HostelApplication, RoomChangeRequest, NotificationItem, RoomAllotment } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RoomChangeRequestModal } from './RoomChangeRequestModal';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenProfile: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab, onOpenProfile }) => {
  const { user, profile } = useAuth();
  const [allottedRoom, setAllottedRoom] = useState<HostelRoom | null>(null);
  const [application, setApplication] = useState<HostelApplication | null>(null);
  const [applications, setApplications] = useState<HostelApplication[]>([]);
  const [allotments, setAllotments] = useState<RoomAllotment[]>([]);
  const [changeRequest, setChangeRequest] = useState<RoomChangeRequest | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for Applications & Allotment History
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'applications' | 'allotments'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Room Switch Modal
  const [roomSwitchModalOpen, setRoomSwitchModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [appRes, crRes, notifRes, altRes] = await Promise.all([
        api.getApplications(),
        api.getRoomChangeRequests(),
        api.getNotifications(),
        api.getAllotments(),
      ]);

      setApplications(appRes.applications);
      if (appRes.applications.length > 0) {
        setApplication(appRes.applications[0]);
      } else {
        setApplication(null);
      }

      setAllotments(altRes.allotments);

      if (crRes.requests.length > 0) {
        setChangeRequest(crRes.requests[0]);
      } else {
        setChangeRequest(null);
      }
      setNotifications(notifRes.notifications.slice(0, 5));

      if (profile?.allottedRoomId) {
        const roomRes = await api.getRoomById(profile.allottedRoomId);
        setAllottedRoom(roomRes.room);
      } else {
        setAllottedRoom(null);
      }
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [profile?.allottedRoomId]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.referenceNumber.toLowerCase().includes(q) ||
        app.status.toLowerCase().includes(q) ||
        app.academicYear.toLowerCase().includes(q) ||
        app.course.toLowerCase().includes(q) ||
        app.preferredRoomType.toLowerCase().includes(q) ||
        (app.preferredBlockId && app.preferredBlockId.toLowerCase().includes(q)) ||
        (app.adminRemarks && app.adminRemarks.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Filtered allotments (room history)
  const filteredAllotments = useMemo(() => {
    return allotments.filter((alt) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        alt.roomNumber.toLowerCase().includes(q) ||
        alt.blockName.toLowerCase().includes(q) ||
        String(alt.bedNumber).includes(q) ||
        alt.status.toLowerCase().includes(q) ||
        alt.academicYear.toLowerCase().includes(q) ||
        alt.allottedBy.toLowerCase().includes(q) ||
        (alt.notes && alt.notes.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' || alt.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [allotments, searchQuery, statusFilter]);

  const totalResultsCount =
    activeTabFilter === 'all'
      ? filteredApplications.length + filteredAllotments.length
      : activeTabFilter === 'applications'
      ? filteredApplications.length
      : filteredAllotments.length;

  const totalRawCount =
    activeTabFilter === 'all'
      ? applications.length + allotments.length
      : activeTabFilter === 'applications'
      ? applications.length
      : allotments.length;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Residential Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {user?.fullName || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Student ID: <span className="font-mono font-bold text-white">{profile?.rollNumber || 'Enrolled'}</span> • {profile?.course} ({profile?.academicYear})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenProfile}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              View My Profile
            </button>
            {!profile?.allottedRoomId ? (
              <button
                onClick={() => onNavigateTab('apply')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all shadow-md"
              >
                {application ? 'Track Application' : 'Apply for Hostel'}
              </button>
            ) : (
              <button
                onClick={() => setRoomSwitchModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all shadow-md flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Request Room Switch</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Allotment Status */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Hostel Accommodation
            </span>
            <Bed className="w-5 h-5 text-blue-900" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-slate-900">
                {profile?.allottedRoomId ? allottedRoom?.roomNumber || 'Allotted' : 'Not Allotted'}
              </h3>
              <StatusBadge status={profile?.allottedRoomId ? 'allotted' : 'not_applied'} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              {profile?.allottedRoomId
                ? `${profile.allottedBlock} • Bed #${profile.allottedBedNumber}`
                : application
                ? 'Application pending review'
                : 'No active hostel allotment'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Status</span>
            <span className="font-bold text-blue-900">
              {profile?.allottedRoomId ? 'Active Key Issued' : application ? 'Under Review' : 'Admission Open'}
            </span>
          </div>
        </div>

        {/* Card 2: Application Tracker */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Hostel Application
            </span>
            <FileText className="w-5 h-5 text-teal-700" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-slate-900">
                {application ? application.referenceNumber : 'No Application'}
              </h3>
              {application && <StatusBadge status={application.status} size="sm" />}
            </div>
            <p className="text-xs text-slate-500">
              {application
                ? `Submitted: ${new Date(application.submittedAt).toLocaleDateString()}`
                : 'Submit form to get allotted'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab('apply')}
              className="text-teal-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>{application ? 'View Form Details' : 'Start Application Wizard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Room Change Request Status */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Room-Switch Status
            </span>
            <RefreshCw className="w-5 h-5 text-indigo-700" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-slate-900">
                {changeRequest ? changeRequest.status.toUpperCase() : 'No Active Request'}
              </h3>
              {changeRequest && <StatusBadge status={changeRequest.status} size="sm" />}
            </div>
            <p className="text-xs text-slate-500">
              {changeRequest
                ? `Reason: ${changeRequest.reasonCategory}`
                : profile?.allottedRoomId
                ? 'Eligible to apply for room switch'
                : 'Available once allotted a room'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setRoomSwitchModalOpen(true)}
              className="text-indigo-800 font-bold hover:underline flex items-center gap-1"
            >
              <span>{changeRequest ? 'Check Request Details' : 'Submit Switch Request'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Search & Filter Hub for Applications & Allotted Room History */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold mb-1">
              <Search className="w-3 h-3 text-blue-700" />
              <span>Record Search Hub</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              My Applications & Allotted Room History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quickly filter active applications, room assignments, and historical hostel transfers.
            </p>
          </div>

          {/* Records Counter Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {totalResultsCount} matching {totalResultsCount === 1 ? 'record' : 'records'}
              {searchQuery || statusFilter !== 'all' ? ` (of ${totalRawCount})` : ''}
            </span>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                title="Clear all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input and Sub-filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Ref # (e.g. PCTE-2026), Room (e.g. A-204), Block, Year, or remarks..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-44 px-3 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              >
                <option value="all">All Statuses</option>
                {activeTabFilter !== 'allotments' && (
                  <>
                    <option value="pending">Application: Pending</option>
                    <option value="approved">Application: Approved</option>
                    <option value="under_review">Application: Under Review</option>
                    <option value="waitlisted">Application: Waitlisted</option>
                    <option value="rejected">Application: Rejected</option>
                  </>
                )}
                {activeTabFilter !== 'applications' && (
                  <>
                    <option value="active">Allotment: Active</option>
                    <option value="transferred">Allotment: Transferred</option>
                    <option value="vacated">Allotment: Vacated</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Filter Pills / Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <button
              onClick={() => {
                setActiveTabFilter('all');
                setStatusFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Records</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTabFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {applications.length + allotments.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTabFilter('applications');
                setStatusFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'applications'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Hostel Applications</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTabFilter === 'applications' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTabFilter('allotments');
                setStatusFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'allotments'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Allotted Room History</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTabFilter === 'allotments' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {allotments.length}
              </span>
            </button>
          </div>
        </div>

        {/* Results Display */}
        {totalResultsCount === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No matching records found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? `No application or room history matched "${searchQuery}".`
                : 'No records found for the selected status filter.'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-3 px-4 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Show Applications if tab is 'all' or 'applications' */}
            {(activeTabFilter === 'all' || activeTabFilter === 'applications') && filteredApplications.length > 0 && (
              <div className="space-y-3">
                {activeTabFilter === 'all' && (
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-800" />
                    <span>Applications ({filteredApplications.length})</span>
                  </h3>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-black text-blue-950 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60">
                            {app.referenceNumber}
                          </span>
                          <StatusBadge status={app.status} size="sm" />
                        </div>

                        <p className="text-xs font-bold text-slate-900 capitalize mt-1">
                          {app.preferredRoomType} Sharing Room {app.isACPreferred ? '(AC Preferred)' : '(Standard)'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Academic Year: {app.academicYear} • Floor {app.preferredFloor || 1}
                        </p>

                        {app.adminRemarks && (
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                            <span className="font-semibold text-slate-900">Admin Remarks: </span>
                            <span>{app.adminRemarks}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Submitted: {new Date(app.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button
                          onClick={() => onNavigateTab('apply')}
                          className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                        >
                          <span>Track Application</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show Allotments if tab is 'all' or 'allotments' */}
            {(activeTabFilter === 'all' || activeTabFilter === 'allotments') && filteredAllotments.length > 0 && (
              <div className="space-y-3 pt-2">
                {activeTabFilter === 'all' && (
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-800" />
                    <span>Allotted Room History ({filteredAllotments.length})</span>
                  </h3>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAllotments.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                              Room {alt.roomNumber}
                            </span>
                            <span className="text-xs font-bold text-blue-900">
                              Bed #{alt.bedNumber}
                            </span>
                          </div>
                          <StatusBadge status={alt.status} size="sm" />
                        </div>

                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-800" />
                          {alt.blockName}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Academic Term: {alt.academicYear} • Assigned by {alt.allottedBy}
                        </p>

                        {alt.notes && (
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic">
                            "{alt.notes}"
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Allotted: {new Date(alt.allottedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {alt.status === 'active' ? (
                          <button
                            onClick={() => setRoomSwitchModalOpen(true)}
                            className="text-xs font-bold text-indigo-900 hover:text-indigo-700 flex items-center gap-1"
                          >
                            <span>Request Switch</span>
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {alt.status === 'transferred' ? 'Transferred to alternative room' : 'Surrendered / Vacated'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Main Allotted Room Details & Roommates Section */}
      {profile?.allottedRoomId && allottedRoom && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Official Campus Residence
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                Room {allottedRoom.roomNumber} ({allottedRoom.blockName})
              </h2>
              <p className="text-xs text-slate-500">
                Floor {allottedRoom.floor} • Bed #{profile.allottedBedNumber} Assigned to you
              </p>
            </div>

            <div className="flex items-center gap-2">
              {allottedRoom.isAC && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  <Wind className="w-3.5 h-3.5" /> AC Room
                </span>
              )}
              {allottedRoom.hasAttachedWashroom && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  <Bath className="w-3.5 h-3.5" /> Attached Washroom
                </span>
              )}
            </div>
          </div>

          {/* Roommates Card */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              Room Occupants & Roommates ({allottedRoom.occupiedBeds}/{allottedRoom.capacity} Beds Occupied)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {allottedRoom.beds.map((bed) => {
                const isYou = bed.studentId === user?.id;
                return (
                  <div
                    key={bed.bedNumber}
                    className={`p-4 rounded-2xl border transition-all ${
                      isYou
                        ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-900/10'
                        : bed.isOccupied
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-emerald-50/40 border-emerald-200 border-dashed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs flex items-center gap-1 text-slate-700">
                        <Bed className="w-4 h-4 text-blue-900" />
                        Bed #{bed.bedNumber}
                      </span>
                      {isYou ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900 text-white">
                          You
                        </span>
                      ) : bed.isOccupied ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          Roommate
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Vacant
                        </span>
                      )}
                    </div>

                    {bed.isOccupied ? (
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">{bed.studentName}</p>
                        <p className="text-[11px] text-slate-500">Roll: {bed.studentRollNo || 'Enrolled'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Allotted: {bed.allottedAt ? new Date(bed.allottedAt).toLocaleDateString() : 'Active'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-700 italic">Bed available for college allotment.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities & Resident Guidelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Room Amenities Included:</span>
              <div className="flex flex-wrap gap-1.5">
                {allottedRoom.amenities.map((item, i) => (
                  <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Superintendent Office:</span>
              <p className="text-slate-600">
                For room key assistance, maintenance, or guest permissions, visit the Block Warden office between 9:00 AM – 5:00 PM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section: Quick Actions & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Action Navigation */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Hostel Portal Quick Actions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('rooms')}
              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Browse Available Rooms</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Explore floors, room sharing types & vacancies</p>
            </button>

            <button
              onClick={() => onNavigateTab('apply')}
              className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Hostel Application Wizard</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Submit preferences and code of conduct form</p>
            </button>

            <button
              onClick={() => setRoomSwitchModalOpen(true)}
              className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Request Room Switch</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Apply to switch room on academic or medical grounds</p>
            </button>

            <button
              onClick={onOpenProfile}
              className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">My Emergency Contact</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Update guardian contact numbers & address</p>
            </button>
          </div>
        </div>

        {/* Notifications and Activity */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-900" />
              Recent Announcements
            </h3>
            <span className="text-[11px] text-slate-400">Hostel ERP</span>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recent notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Room Change Modal */}
      <RoomChangeRequestModal
        isOpen={roomSwitchModalOpen}
        onClose={() => setRoomSwitchModalOpen(false)}
        onRequestSubmitted={() => loadDashboardData()}
      />
    </div>
  );
};
