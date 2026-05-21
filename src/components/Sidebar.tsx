import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Laptop,
  CheckSquare,
  Calendar,
  Users2,
  LogOut,
  Menu,
  X,
  FileClock,
  HeartPulse,
  Award,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, settings, cart } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role;

  // Official Navigation items (Settings has been removed as defaulted to Taksin Hospital)
  const navItems = [
    { id: 'dashboard', label: 'แผงควบคุมหลัก (Dashboard)', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'equipment', label: 'คลังอุปกรณ์โสตฯ', icon: Laptop, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'my-requests', label: 'ตะกร้า & รายการยืมของฉัน', icon: FileClock, roles: ['Staff'], badge: cart.length > 0 ? cart.length : undefined },
    { id: 'approvals', label: 'อนุมัติการยืม-คืน', icon: CheckSquare, roles: ['Admin', 'Manager'] },
    { id: 'calendar', label: 'ปฏิทินเวลายืมอุปกรณ์', icon: Calendar, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'staff-directory', label: 'ทำเนียบบุคลากรฝ่ายโสตฯ', icon: Users2, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'settings', label: 'ตั้งค่าระบบ & ประวัติการทำงาน', icon: Settings, roles: ['Admin', 'Manager'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#005a3c] text-white p-4 h-16 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <Logo 
            logoUrl={settings.logoUrl}
            className="w-10 h-10 rounded-full bg-white p-1 shrink-0 shadow"
            classNameImg="max-h-full max-w-full rounded-full object-contain"
          />
          <div>
            <h1 className="text-xs font-black tracking-tight text-emerald-200">งานโสตทัศนศึกษา</h1>
            <p className="text-[10px] text-white font-medium truncate max-w-[180px]">{settings.hospitalName}</p>
          </div>
        </div>
        <button 
          id="toggle-sidebar" 
          onClick={toggleSidebar} 
          className="text-white hover:text-emerald-200 p-1 cursor-pointer focus:outline-none" 
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Backdrop for mobile overlays */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 lg:hidden z-20 transition-opacity" onClick={toggleSidebar} />
      )}

      {/* Primary Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-[calc(100vh-4rem)] lg:h-screen w-72 bg-gradient-to-b from-[#004730] to-[#002f1f] text-white flex flex-col z-20 transition-transform duration-300 transform shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Hospital Branding Header */}
        <div className="p-5 border-b border-[#035237]/60 flex items-center gap-3 bg-[#003c27]">
          <Logo 
            logoUrl={settings.logoUrl}
            className="w-12 h-12 rounded-full bg-white p-1.5 shrink-0 shadow-lg"
            classNameImg="max-h-full max-w-full rounded-full object-contain"
          />
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h1 className="text-sm font-black tracking-wider text-white">งานโสตทัศนศึกษา</h1>
            </div>
            <p className="text-[10.5px] text-emerald-100 font-bold truncate mt-0.5" title={settings.hospitalName}>
              {settings.hospitalName}
            </p>
          </div>
        </div>

        {/* Selected User Profiles Card */}
        <div className="p-4 mx-4 my-5 rounded-2xl bg-white/10 border border-white/15 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-700 hover:bg-emerald-600 border-2 border-emerald-400 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0 select-none">
              {currentUser.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold truncate text-white" title={currentUser.name}>{currentUser.name}</p>
              <div className="flex flex-col gap-1 mt-1">
                <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-black rounded-md w-fit ${
                  currentUser.role === 'Admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  currentUser.role === 'Manager' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                  'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                }`}>
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-emerald-200 truncate font-semibold">{currentUser.department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Navigation links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer group
                  ${isSelected
                    ? 'bg-emerald-600/90 text-white shadow-md border-l-4 border-emerald-300'
                    : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <IconComponent 
                  size={16} 
                  className={`transition-all ${isSelected ? 'text-white scale-110' : 'text-emerald-300 group-hover:text-amber-300'}`} 
                />
                <span className="text-left flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Fixed footer & Action items */}
        <div className="p-4 border-t border-[#035237]/60 space-y-2 bg-[#002f1f]/80">
          <div className="flex items-center justify-between text-[10px] text-emerald-300/60 px-1 font-mono">
            <span>OFFICIAL AUDIOVISUAL</span>
            <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
              <Award size={10} className="animate-spin" />
              <span>SECURED</span>
            </span>
          </div>
          <button
            id="nav-logout"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-bold border border-rose-400/20 transition-all cursor-pointer hover:border-rose-400/40"
          >
            <LogOut size={14} />
            ออกจากระบบงานสิทธิ์ตรวจ
          </button>
        </div>
      </aside>
    </>
  );
};
