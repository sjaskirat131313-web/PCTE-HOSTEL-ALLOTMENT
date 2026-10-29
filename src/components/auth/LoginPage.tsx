import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';

interface LoginPageProps {
  onBackToLanding: () => void;
  onGoToRegister: () => void;
  initialEmail?: string;
  initialPassword?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToLanding,
  onGoToRegister,
  initialEmail = '',
  initialPassword = '',
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetPasswordVal) {
      setResetMsg({ type: 'error', text: 'Please fill in both fields.' });
      return;
    }
    try {
      setResetLoading(true);
      setResetMsg(null);
      const res = await api.resetPassword(resetEmail, resetPasswordVal);
      setResetMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setResetModalOpen(false);
        setEmail(resetEmail);
      }, 1500);
    } catch (err: unknown) {
      setResetMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to reset password.' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 px-4 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-[11px] font-medium text-slate-400">Secure College SSO / ERP</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-slate-950 via-blue-900 to-indigo-800 flex items-center justify-center text-white shadow-xl shadow-blue-900/30">
            <Building2 className="w-7 h-7 text-teal-300" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black text-slate-900 tracking-tight">
          PCTE Hostel ERP Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Sign in to your Student or Hostel Administrator account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@pcte.edu.in or admin@pcte.edu.in"
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Account Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-blue-900 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 hover:from-blue-800 hover:to-slate-800 shadow-md shadow-blue-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating credentials...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-teal-300" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Quick Evaluator Demo Sign In
              </span>
              <span className="text-[10px] text-slate-400">Sample Data</span>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@pcte.edu.in', 'Admin@12345')}
                className="w-full text-left p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100/60 transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-700" />
                    Hostel Administrator
                  </p>
                  <p className="text-[10px] text-indigo-700">admin@pcte.edu.in (Dr. R. K. Sharma)</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-200/80 text-indigo-900">
                  Warden
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('arjun.sharma@pcte.edu.in', 'Student@12345')}
                className="w-full text-left p-2.5 rounded-xl border border-teal-100 bg-teal-50/60 hover:bg-teal-100/60 transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                    Student with Allotted Room
                  </p>
                  <p className="text-[10px] text-teal-700">arjun.sharma@pcte.edu.in (Room A-204)</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-200/80 text-teal-900">
                  BCA 3rd Yr
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('priya.verma@pcte.edu.in', 'Student@12345')}
                className="w-full text-left p-2.5 rounded-xl border border-amber-100 bg-amber-50/60 hover:bg-amber-100/60 transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                    Student with Pending App
                  </p>
                  <p className="text-[10px] text-amber-700">priya.verma@pcte.edu.in (App #1021)</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                  BCA 2nd Yr
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>New student without an account? </span>
            <button
              onClick={onGoToRegister}
              className="font-bold text-blue-900 hover:text-blue-700 hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Account Password"
        subtitle="Hostel Portal Security Verification"
      >
        <form onSubmit={handlePasswordReset} className="space-y-4">
          {resetMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                resetMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {resetMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{resetMsg.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Registered College Email</label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="e.g. arjun.sharma@pcte.edu.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
              placeholder="Enter at least 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {resetLoading ? 'Resetting...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
