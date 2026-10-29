import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Building2,
  Users,
  Bed,
  FileText,
  RotateCcw,
  CheckCircle,
  TrendingUp,
  Shield,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatsData } from '../../types';

export const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

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

  const handleResetDemo = async () => {
    if (!confirm('Are you sure you want to reset the database to its pristine college demo state? All demo students and initial rooms will be restored.')) return;
    try {
      setResetting(true);
      setResetMsg(null);
      const res = await api.resetDemo();
      setResetMsg(res.message);
      await loadStats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Reports & Analytics
          </div>
          <h2 className="text-2xl font-black">Hostel Capacity & Allotment Reports</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Data insights, occupancy rates, and downloadable CSV audit sheets.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-teal-300" />
          <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
        </button>
      </div>

      {resetMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{resetMsg}</span>
        </div>
      )}

      {/* CSV Export Quick Cards */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Download Official CSV Exports</h3>
        <p className="text-xs text-slate-500">
          Generated formatted spreadsheet files for college administrative records and warden committee meetings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center mb-3">
                <Bed className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Master Allotment Register</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Full list of students with allotted room numbers, bed IDs, warden signatures, and dates.
              </p>
            </div>
            <a
              href={api.getExportCsvUrl('allotments')}
              download
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Allotments CSV</span>
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Hostel Rooms & Inventory</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Room inventory with capacities, occupied beds, vacant beds, fees, and AC classifications.
              </p>
            </div>
            <a
              href={api.getExportCsvUrl('rooms')}
              download
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-teal-800 text-white hover:bg-teal-700 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Rooms CSV</span>
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Applications Summary</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Complete log of submitted student applications with reference numbers, status, and warden remarks.
              </p>
            </div>
            <a
              href={api.getExportCsvUrl('applications')}
              download
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-900 text-white hover:bg-indigo-800 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Applications CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Block Capacity Table Report */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden p-6 sm:p-7 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Residential Block Occupancy Statistics</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-extrabold">
              <tr>
                <th className="px-4 py-3">Block Name</th>
                <th className="px-4 py-3">Wing</th>
                <th className="px-4 py-3">Total Rooms</th>
                <th className="px-4 py-3">Bed Capacity</th>
                <th className="px-4 py-3">Occupied</th>
                <th className="px-4 py-3">Available Beds</th>
                <th className="px-4 py-3 text-right">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.blockStats.map((b) => (
                <tr key={b.blockId} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{b.blockName}</td>
                  <td className="px-4 py-3.5 capitalize font-medium text-slate-700">{b.gender} Wing</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{b.roomsCount}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{b.totalBeds} Beds</td>
                  <td className="px-4 py-3.5 font-bold text-blue-900">{b.occupiedBeds}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">{b.availableBeds}</td>
                  <td className="px-4 py-3.5 text-right font-black text-slate-900">{b.occupancyPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
