import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-teal-300 font-bold text-xs">
            PCTE
          </div>
          <div>
            <p className="font-semibold text-slate-200">PCTE Hostel Room Allotment Portal</p>
            <p className="text-[11px] text-slate-500">
              Department of Computer Applications (BCA Project Demonstration)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 text-[11px] text-slate-300">
          <Info className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            This is an academic demonstration portal. It is not an official PCTE service unless formally authorized.
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            ABAC & RBAC Protected
          </span>
          <span>© 2026 BCA Capstone</span>
        </div>
      </div>
    </footer>
  );
};
