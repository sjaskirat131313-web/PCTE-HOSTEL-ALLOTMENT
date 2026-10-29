import React, { useState } from 'react';
import {
  Building2,
  User as UserIcon,
  LogOut,
  Home,
  FileText,
  Bed,
  RefreshCw,
  Users,
  BarChart3,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenProfile }) => {
  const { user, profile, isAdmin, isStudent, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const studentNavItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: Home },
    { id: 'apply', label: 'Hostel Application', icon: FileText },
    { id: 'rooms', label: 'Room Availability', icon: Bed },
    { id: 'room-switch', label: 'Room Switch', icon: RefreshCw },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Overview', icon: Home },
    { id: 'admin-applications', label: 'Applications', icon: FileText },
    { id: 'admin-rooms', label: 'Room Inventory', icon: Bed },
    { id: 'admin-allotments', label: 'Allotments', icon: Sparkles },
    { id: 'admin-room-changes', label: 'Room Switches', icon: RefreshCw },
    { id: 'admin-students', label: 'Students', icon: Users },
    { id: 'admin-reports', label: 'Reports & CSV', icon: BarChart3 },
    { id: 'admin-audit', label: 'Audit Trail', icon: ShieldAlert },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      {/* College Project Disclaimer Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-[11px] flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-teal-400"></span>
          <span>
            <strong className="text-white">BCA Academic Capstone Project:</strong> PCTE Hostel Room Allotment System (Demonstration Portal)
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <span>Campus Residential ERP v2.4</span>
          <span>Academic Year: 2025-2026</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & College Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab(isAdmin ? 'admin-dashboard' : 'dashboard')}
              className="flex items-center gap-3 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-slate-950 via-blue-900 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">PCTE HOSTEL</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800 tracking-wider">
                    ERP
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500">Room Allotment & Management Portal</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header: Notifications & User profile */}
          <div className="flex items-center gap-3">
            <NotificationDropdown />

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100/80 transition-all focus:outline-hidden"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user?.fullName || 'User'}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {isAdmin ? 'Hostel Warden / Admin' : profile?.rollNumber ? `Roll: ${profile.rollNumber}` : 'Student'}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                  isAdmin ? 'bg-indigo-700' : 'bg-teal-700'
                }`}>
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 z-50 py-2 divide-y divide-slate-100 animate-in fade-in duration-100">
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isAdmin ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {isAdmin ? 'Hostel Administrator' : 'BCA Student'}
                    </span>
                  </div>

                  {isStudent && (
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Student Profile
                      </button>
                    </div>
                  )}

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
