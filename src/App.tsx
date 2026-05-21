import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { EquipmentPage } from './components/EquipmentPage';
import { MyRequestsPage } from './components/MyRequestsPage';
import { ApprovalsPage } from './components/ApprovalsPage';
import { CalendarPage } from './components/CalendarPage';
import { StaffDirectoryPage } from './components/StaffDirectoryPage';
import { SettingsPage } from './components/SettingsPage';
import { Header } from './components/Header';
import { Shield, Sparkles, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { playBeep } from './utils/audio';

function MainAppContent() {
  const { currentUser, logout } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Inactivity timeout: 5 minutes (300 seconds)
  const TIMEOUT_LIMIT = 300; 
  const WARNING_THRESHOLD = 30; // 30 seconds count warning

  const [idleSeconds, setIdleSeconds] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_THRESHOLD);

  const lastActivityTime = useRef<number>(Date.now());

  // Reset activity timestamp upon interactions
  const resetActivity = () => {
    lastActivityTime.current = Date.now();
    setIdleSeconds(0);
    if (showWarningModal) {
      setShowWarningModal(false);
      setCountdown(WARNING_THRESHOLD);
      playBeep('success');
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Track standard physical events
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'];
    events.forEach(ev => window.addEventListener(ev, resetActivity));

    // Monitor tick interval
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityTime.current) / 1000);
      setIdleSeconds(elapsed);

      // Warning phase
      if (elapsed >= (TIMEOUT_LIMIT - WARNING_THRESHOLD)) {
        const remaining = TIMEOUT_LIMIT - elapsed;
        if (remaining > 0) {
          setCountdown(remaining);
          if (!showWarningModal) {
            setShowWarningModal(true);
            playBeep('warning');
          }
        } else {
          // Zero remaining: Auto logout!
          clearInterval(interval);
          playBeep('error');
          logout();
        }
      } else {
        if (showWarningModal) {
          setShowWarningModal(false);
        }
      }
    }, 1000);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetActivity));
      clearInterval(interval);
    };
  }, [currentUser, showWarningModal]);

  // Handle manual tab change with sound effects
  const handleTabChange = (tab: string) => {
    playBeep('click');
    setActiveTab(tab);
  };

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-800 flex flex-col lg:flex-row antialiased font-sans">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
      />

      {/* Main Container Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-h-screen overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top header containing bell notifications */}
          <Header activeTab={activeTab} setActiveTab={handleTabChange} />

          {activeTab === 'dashboard' && <Dashboard setActiveTab={handleTabChange} />}
          {activeTab === 'equipment' && <EquipmentPage />}
          {activeTab === 'my-requests' && <MyRequestsPage />}
          {activeTab === 'approvals' && <ApprovalsPage />}
          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'staff-directory' && <StaffDirectoryPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>

      {/* Security Heartbeat Banner for Hospital Audits */}
      <div className="fixed bottom-4 right-4 z-40 bg-slate-900/95 text-white py-1.5 px-3 rounded-lg border border-slate-700/60 shadow-lg text-[10px] font-mono flex items-center gap-2 backdrop-blur-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>SHIELD v2.5: SECURE PORTAL</span>
        <span className="text-slate-500 font-bold">|</span>
        <span className="text-emerald-400 font-extrabold">{TIMEOUT_LIMIT - idleSeconds}s</span>
      </div>

      {/* Shared Kiosk Auto-Logout warning overlay modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-rose-300 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 animate-bounce">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">คำเตือนความปลอดภัยเวิร์กสเตชัน</h3>
                <p className="text-[10px] text-rose-600 font-bold block pt-0.5">AUTO-LOGOUT FORSHARED HOSPITAL TERMINAL</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              ระบบตรวจพบว่าเครื่องเทอร์มินัลนี้ไม่มีการใช้งานนานเกิน <strong className="text-slate-800">5 นาที</strong> พนักงานเวชระเบียนกำลังปล่อยเครื่องเข้าโหมดไม่มีคนคุม เพื่อป้องกันสิทธิ์เข้ายืมอุปกรณ์ทับซ้อน ระบบสำนักงานความปลอดภัยหลักจะล็อคประวัติการยืมใน:
            </p>

            {/* Simulated Clinical Counter HUD */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 font-mono tracking-wider block uppercase">ปล่อยไอดีอัตโนมัติรอบถัดไปใน</span>
              <span className="text-4xl font-extrabold font-mono text-rose-600 animate-pulse">{countdown}</span>
              <span className="text-xs font-extrabold text-[#005a3c] block">วินาที</span>
            </div>

            <p className="text-[10.5px] text-slate-400 text-center font-bold">
              โรงพยาบาลมีสติ๊กเกอร์สแกนคุมเข้มรักษาความปลอดภัย 256-Bit
            </p>

            <button
              onClick={resetActivity}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#005a3c] hover:bg-[#004730] text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-emerald-900/10 cursor-pointer transition-all active:scale-[0.98]"
            >
              <ShieldCheck size={16} />
              <span>กดเพื่อยืนยันปฏิบัติงานต่อในเซสชันเดิม</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

