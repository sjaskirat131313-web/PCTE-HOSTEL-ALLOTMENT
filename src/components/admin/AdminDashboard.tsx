import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Bed,
  FileText,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  Plus,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatsData } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoAllotting, setAutoAllotting] = useState(false);
  const [autoResult, setAutoResult] = useState<{ allottedCount: number; messages: string[] } | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.getStats();
      setStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSmartAutoAllot = async () => {
    if (!confirm('Run Smart Auto-Allotment for all pending applications matching available room preferences?')) return;
    try {
      setAutoAllotting(true);
      setAutoResult(null);
      const res = await api.autoAllot();
      setAutoResult(res);
      await loadStats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Auto-allotment failed.');
    } finally {
      setAutoAllotting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Hostel Administration & Warden Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Hostel Executive Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time residential occupancy metrics, student allotment tracking, and room inventory control.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSmartAutoAllot}
            disabled={autoAllotting || (stats?.pendingApplications || 0) === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-400 text-slate-950 hover:bg-teal-300 disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{autoAllotting ? 'Processing...' : 'Smart Auto-Allot'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('admin-rooms')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-teal-300" />
            <span>Add Room</span>
          </button>

          <a
            href={api.getExportCsvUrl('allotments')}
            download
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-900" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Auto Allotment Execution Feedback */}
      {autoResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Auto-Allotment Batch Complete: {autoResult.allottedCount} student(s) allotted!</span>
          </div>
          {autoResult.messages.length > 0 && (
            <ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-0.5">
              {autoResult.messages.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Students */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registered Students</span>
            <Users className="w-5 h-5 text-blue-900" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.totalStudents || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled BCA & allied courses</p>
        </div>

        {/* Card 2: Occupancy Rate */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Occupancy Rate</span>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.occupancyPercentage || 0}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats?.occupiedBeds || 0} occupied / {stats?.totalBeds || 0} total beds
          </p>
        </div>

        {/* Card 3: Available Beds */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available Beds</span>
            <Bed className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">{stats?.availableBeds || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across 4 residential blocks</p>
        </div>

        {/* Card 4: Pending Tasks */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action Items</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">
            {(stats?.pendingApplications || 0) + (stats?.pendingChangeRequests || 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats?.pendingApplications || 0} apps • {stats?.pendingChangeRequests || 0} switch requests
          </p>
        </div>
      </div>

      {/* Block-wise Capacity Breakdown */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Hostel Block Occupancy Distribution</h2>
            <p className="text-xs text-slate-500">Breakdown of capacity, occupied beds, and remaining vacancies</p>
          </div>
          <button
            onClick={() => onNavigateTab('admin-rooms')}
            className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
          >
            <span>Manage Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.blockStats.map((block) => (
            <div key={block.blockId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">{block.blockName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {block.roomsCount} Rooms • Gender Wing: <span className="capitalize">{block.gender}</span>
                  </p>
                </div>
                <span className="text-xs font-black text-blue-950 bg-blue-100/70 px-2.5 py-1 rounded-xl">
                  {block.occupancyPercentage}% Full
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-linear-to-r from-blue-900 to-teal-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${block.occupancyPercentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                <span>Occupied: <strong>{block.occupiedBeds} beds</strong></span>
                <span>Available: <strong className="text-emerald-700">{block.availableBeds} beds</strong></span>
                <span>Total: <strong>{block.totalBeds} beds</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Application Approvals</h3>
            <p className="text-xs text-slate-500 mt-1">
              Review multi-step student applications, verify academic details, and allot rooms.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('admin-applications')}
            className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Review Applications ({stats?.pendingApplications || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Room-Change Processing</h3>
            <p className="text-xs text-slate-500 mt-1">
              Process student transfer requests with atomic room bed vacancy updates.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('admin-room-changes')}
            className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-900 text-white hover:bg-indigo-800 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Manage Switch Requests ({stats?.pendingChangeRequests || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-900 flex items-center justify-center mb-3">
              <Bed className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Room Allotment Register</h3>
            <p className="text-xs text-slate-500 mt-1">
              Search master allotment registry, vacate rooms, and view assigned occupants.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('admin-allotments')}
            className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Allotment Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
