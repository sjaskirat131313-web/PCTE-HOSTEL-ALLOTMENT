import React, { useEffect, useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Bed,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  FileCheck2,
  Clock,
  LogIn,
  UserPlus,
  Layers,
  Wifi,
  Wind,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatsData } from '../../types';

interface LandingPageProps {
  onGoToLogin: (defaultEmail?: string, defaultPass?: string) => void;
  onGoToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin, onGoToRegister }) => {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 py-2 px-4 text-xs text-center border-b border-slate-800">
        <span className="font-semibold text-teal-400">Notice:</span> College BCA demonstration project. Not an official PCTE service unless formally authorized.
      </div>

      {/* Main Hero Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-slate-950 via-blue-900 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <Building2 className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900">PCTE HOSTEL PORTAL</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 tracking-wider">
                  ERP 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Online Room Allotment & Student Accommodation System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onGoToLogin()}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>Log In</span>
            </button>
            <button
              onClick={onGoToRegister}
              className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 text-white hover:bg-blue-800 shadow-md shadow-blue-900/20 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-teal-300" />
              <span>Student Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-linear-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Next-Gen College Residential Management System</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                Digital Hostel Room Allotment & Campus Living Portal
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                A seamless, transparent hostel accommodation platform for PCTE students. Browse live room availability, submit multi-step applications, choose preferences, track allotment status in real-time, and submit room-change requests.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onGoToLogin()}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-linear-to-r from-blue-900 to-indigo-900 text-white hover:from-blue-800 hover:to-indigo-800 shadow-xl shadow-blue-950/20 flex items-center gap-2 group transition-all"
                >
                  <span>Access Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-teal-300" />
                </button>

                <button
                  onClick={onGoToRegister}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 shadow-xs transition-all flex items-center gap-2"
                >
                  <span>New Student Registration</span>
                </button>
              </div>

              {/* Quick Demo Logins Box */}
              <div className="pt-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      Quick Evaluator Demo Accounts
                    </span>
                    <span className="text-[10px] text-slate-400">1-Click Login</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => onGoToLogin('admin@pcte.edu.in', 'Admin@12345')}
                      className="p-2.5 rounded-xl text-left border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all text-xs"
                    >
                      <p className="font-bold text-indigo-950">Hostel Admin</p>
                      <p className="text-[10px] text-indigo-600 truncate">Chief Warden</p>
                    </button>
                    <button
                      onClick={() => onGoToLogin('arjun.sharma@pcte.edu.in', 'Student@12345')}
                      className="p-2.5 rounded-xl text-left border border-teal-100 bg-teal-50/50 hover:bg-teal-50 transition-all text-xs"
                    >
                      <p className="font-bold text-teal-950">Student (Allotted)</p>
                      <p className="text-[10px] text-teal-600 truncate">Room A-204</p>
                    </button>
                    <button
                      onClick={() => onGoToLogin('priya.verma@pcte.edu.in', 'Student@12345')}
                      className="p-2.5 rounded-xl text-left border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-all text-xs"
                    >
                      <p className="font-bold text-amber-950">Student (Pending)</p>
                      <p className="text-[10px] text-amber-600 truncate">App #1021</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Stats Card */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-teal-500 rounded-3xl blur-xl opacity-25"></div>
                <div className="relative rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Campus Capacity</p>
                      <h3 className="text-xl font-extrabold text-slate-900">Hostel Allotment Status</h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active Session
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Total Beds</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalBeds || 22}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Across 4 Blocks</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100">
                      <p className="text-xs text-teal-700 font-medium">Available Beds</p>
                      <p className="text-2xl font-black text-teal-900 mt-1">{stats?.availableBeds || 15}</p>
                      <p className="text-[11px] text-teal-600 mt-1">Ready for Allotment</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <p className="text-xs text-blue-700 font-medium">Occupancy Rate</p>
                      <p className="text-2xl font-black text-blue-900 mt-1">{stats?.occupancyPercentage || 32}%</p>
                      <p className="text-[11px] text-blue-600 mt-1">Current Term</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <p className="text-xs text-amber-700 font-medium">Pending Apps</p>
                      <p className="text-2xl font-black text-amber-900 mt-1">{stats?.pendingApplications || 1}</p>
                      <p className="text-[11px] text-amber-600 mt-1">In Verification</p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2.5 pt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero Overbooking Concurrency Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Automated Preference Matching & Manual Approval</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct Room Switching Workflow with Admin Audit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Architecture & Capabilities</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Engineered for Modern College Campus Living
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Everything students and wardens need to handle hostel admissions, room inventories, and roommate allotments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-teal-300 flex items-center justify-center mb-4">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Step Application Wizard</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Students submit academic details, room preference (Single, Double, Triple), AC preferences, floor choices, emergency contacts, and code-of-conduct undertakings.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-900 text-teal-300 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Live Room Inventory & Filtering</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Filter rooms by Block (Aryabhatta, Bhabha, Kalpana Chawla, Sarojini), floor number, AC status, and available beds. Transparent bed occupation indicators.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-900 text-teal-300 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Atomic Concurrency & Room Switching</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Mutual-exclusion locking ensures two students cannot reserve the same final bed. Atomic bed transfers when room switch requests are approved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hostel Blocks Overview */}
      <section className="py-16 bg-slate-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xs font-bold text-blue-900 uppercase tracking-widest">Campus Accommodations</h2>
              <p className="text-2xl font-black text-slate-900 mt-1">Hostel Blocks & Amenities</p>
            </div>
            <span className="text-xs text-slate-500">Separately managed Boys and Girls residential wings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Block A</span>
                <span className="text-xs text-slate-400">Boys Wing</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Aryabhatta Boys Wing</h4>
              <p className="text-xs text-slate-500">4 Floors • Single, Double & Triple Sharing • High-speed Wi-Fi, Recreation Room.</p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-teal-700 font-medium">
                <Wifi className="w-3.5 h-3.5" /> High-Speed LAN
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Block B</span>
                <span className="text-xs text-slate-400">Boys Senior</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Bhabha Boys Senior Wing</h4>
              <p className="text-xs text-slate-500">3 Floors • AC Single & Double suites • Gymnasium access, Silent reading hall.</p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-teal-700 font-medium">
                <Wind className="w-3.5 h-3.5" /> Split AC Suites
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">Block C</span>
                <span className="text-xs text-slate-400">Girls Wing</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Kalpana Chawla Girls Wing</h4>
              <p className="text-xs text-slate-500">4 Floors • Double & Triple sharing • Biometric security, Pantry, Badminton court.</p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-teal-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 24/7 Security
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Block D</span>
                <span className="text-xs text-slate-400">Girls Executive</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Sarojini Naidu Girls Wing</h4>
              <p className="text-xs text-slate-500">3 Floors • AC Single & Double study pods • Elevator access, Geysers, Lounge.</p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-teal-700 font-medium">
                <Layers className="w-3.5 h-3.5" /> Modern Suites
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-12 bg-linear-to-r from-slate-950 via-blue-950 to-indigo-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h3 className="text-2xl font-black">Ready to Apply for Hostel Accommodation?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Log in with your college credentials to submit your application or view your existing room allotment.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onGoToLogin()}
              className="px-6 py-3 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 transition-all shadow-lg"
            >
              Sign In to Portal
            </button>
            <button
              onClick={onGoToRegister}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20"
            >
              Create New Student Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
