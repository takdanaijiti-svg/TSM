import React, { useState } from 'react';
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
import { Shield, Sparkles, X, HeartPulse } from 'lucide-react';
import { Role } from './types';

function MainAppContent() {
  const { currentUser, login, users } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Fast switch roles handler for demo evaluation
  const handleRoleQuickSwitch = (selectedEmail: string) => {
    login(selectedEmail);
    // Automatically redirect to dashboard upon switching identities to prevent missing tab RBAC errors
    setActiveTab('dashboard');
    setIsRoleSwitcherOpen(false);
  };

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)} 
      />

      {/* Main Container Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-h-screen overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto space-y-6">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'equipment' && <EquipmentPage />}
          {activeTab === 'my-requests' && <MyRequestsPage />}
          {activeTab === 'approvals' && <ApprovalsPage />}
          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'staff-directory' && <StaffDirectoryPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>

      {/* RE-USABLE ROLE SWITCHER MODAL FOR EVALUATION */}
      {isRoleSwitcherOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" />
                <span>ตัวเลือกระดับจำลองสิทธิ์แพทย์ตรวจงาน</span>
              </h3>
              <button
                onClick={() => setIsRoleSwitcherOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-850 p-1 rounded-lg transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-slate-400 leading-normal mb-4 font-sans bg-slate-950 p-3 rounded-xl border border-slate-850">
              <span className="flex items-center gap-1 text-emerald-400 font-bold mb-1">
                <Sparkles size={12} className="animate-pulse" />
                เคล็ดลับผู้พัฒนาชวนทดสอบ:
              </span>
              สลับผู้ล็อกอินบนระบบจำลองได้อย่างรวดเร็ว เพื่อตรวจดูสิทธิ์ระดับเมนูด้านข้าง บูรณาการยืดหยุ่นโดยไม่ต้องล็อกเอาท์พิมพ์อีเมลใหม่!
            </div>

            <div className="space-y-2.5 text-xs font-sans">
              {users.map((us) => (
                <button
                  key={us.id}
                  onClick={() => handleRoleQuickSwitch(us.email)}
                  className={`
                    w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer group
                    ${currentUser.email === us.email 
                      ? 'bg-emerald-950/40 border-emerald-500 text-white' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }
                  `}
                >
                  <div>
                    <p className="font-bold">{us.name.split(' ')[0]}</p>
                    <span className="text-[10px] text-slate-500 font-mono italic">{us.email}</span>
                  </div>

                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border-l-4 ${
                    us.role === 'Admin' ? 'bg-rose-500/10 text-rose-400 border-l-rose-500' :
                    us.role === 'Manager' ? 'bg-orange-500/10 text-orange-400 border-l-orange-500' :
                    'bg-emerald-500/10 text-emerald-400 border-l-emerald-500'
                  }`}>
                    {us.role}
                  </span>
                </button>
              ))}
            </div>

            <div className="absolute top-2 right-12 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 filter blur-xl pointer-events-none" />
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
