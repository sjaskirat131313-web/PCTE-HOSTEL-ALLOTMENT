import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { StudentDashboard } from './components/student/StudentDashboard';
import { HostelApplicationWizard } from './components/student/HostelApplicationWizard';
import { RoomBrowser } from './components/student/RoomBrowser';
import { StudentProfileModal } from './components/student/StudentProfileModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminApplications } from './components/admin/AdminApplications';
import { AdminRooms } from './components/admin/AdminRooms';
import { AdminAllotments } from './components/admin/AdminAllotments';
import { AdminRoomChanges } from './components/admin/AdminRoomChanges';
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminReports } from './components/admin/AdminReports';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';

function MainApp() {
  const { user, isLoading, isAdmin, isStudent } = useAuth();

  // Navigation states
  const [viewState, setViewState] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [loginDefaults, setLoginDefaults] = useState<{ email?: string; password?: string }>({});

  // Profile modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sync tab with user role upon login
  useEffect(() => {
    if (user) {
      setViewState('app');
      setCurrentTab(user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    } else {
      if (viewState === 'app') {
        setViewState('landing');
      }
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400 flex items-center justify-center animate-spin">
          <div className="w-4 h-4 bg-teal-400 rounded-sm"></div>
        </div>
        <p className="text-xs text-slate-300 font-semibold mt-4">Initializing PCTE Hostel ERP...</p>
      </div>
    );
  }

  // Not logged in: Show Landing, Login, or Register
  if (!user) {
    if (viewState === 'login') {
      return (
        <LoginPage
          initialEmail={loginDefaults.email}
          initialPassword={loginDefaults.password}
          onBackToLanding={() => setViewState('landing')}
          onGoToRegister={() => setViewState('register')}
        />
      );
    }
    if (viewState === 'register') {
      return (
        <RegisterPage
          onBackToLanding={() => setViewState('landing')}
          onGoToLogin={() => setViewState('login')}
        />
      );
    }
    return (
      <LandingPage
        onGoToLogin={(email, pass) => {
          setLoginDefaults({ email, password: pass });
          setViewState('login');
        }}
        onGoToRegister={() => setViewState('register')}
      />
    );
  }

  // Logged In: Render Authenticated ERP Layout
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 font-sans text-slate-900">
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Views */}
        {isStudent && (
          <>
            {currentTab === 'dashboard' && (
              <StudentDashboard
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenProfile={() => setProfileModalOpen(true)}
              />
            )}
            {currentTab === 'apply' && (
              <HostelApplicationWizard
                onApplicationSubmitted={() => setCurrentTab('dashboard')}
              />
            )}
            {currentTab === 'rooms' && <RoomBrowser />}
            {currentTab === 'room-switch' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 to-indigo-950 text-white shadow-xl">
                  <h2 className="text-xl font-bold">Alternative Room Selection</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Select an eligible vacant room to request a room change through the Warden Office.
                  </p>
                </div>
                <RoomBrowser selectable={true} />
              </div>
            )}
          </>
        )}

        {/* Administrator Views */}
        {isAdmin && (
          <>
            {currentTab === 'admin-dashboard' && (
              <AdminDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'admin-applications' && <AdminApplications />}
            {currentTab === 'admin-rooms' && <AdminRooms />}
            {currentTab === 'admin-allotments' && <AdminAllotments />}
            {currentTab === 'admin-room-changes' && <AdminRoomChanges />}
            {currentTab === 'admin-students' && <AdminStudents />}
            {currentTab === 'admin-reports' && <AdminReports />}
            {currentTab === 'admin-audit' && <AdminAuditLogs />}
          </>
        )}
      </main>

      {/* Student Profile Modal */}
      {isStudent && (
        <StudentProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
