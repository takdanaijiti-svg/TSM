import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Laptop,
  CheckSquare,
  Calendar,
  BarChart3,
  Users2,
  Settings,
  LogOut,
  UserCheck,
  Menu,
  X,
  PlusCircle,
  FileClock,
  HeartPulse
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRoleSwitcher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenRoleSwitcher }) => {
  const { currentUser, logout, settings, cart } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role;

  // Navigation schema configured by role (RBAC)
  const navItems = [
    { id: 'dashboard', label: 'แผงควบคุม (Dashboard)', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'equipment', label: 'คลังอุปกรณ์โสตฯ', icon: Laptop, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'my-requests', label: 'ตะกร้า & รายการยืมของฉัน', icon: FileClock, roles: ['Staff'], badge: cart.length > 0 ? cart.length : undefined },
    { id: 'approvals', label: 'อนุมัติการยืม-คืน', icon: CheckSquare, roles: ['Admin', 'Manager'] },
    { id: 'calendar', label: 'ปฏิทินการจอง', icon: Calendar, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'staff-directory', label: 'ทำเนียบบุคลากรโสตฯ', icon: Users2, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'settings', label: 'ตั้งค่าระบบโรงพยาบาล', icon: Settings, roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header bar */}
      <header className="lg:hidden bg-slate-900 text-white p-4 h-16 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          {settings.logoUrl.trim().startsWith('<svg') || settings.logoUrl.trim().startsWith('<?xml') || (settings.logoUrl.includes('<svg') && !settings.logoUrl.trim().startsWith('data:')) ? (
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center p-1.5 shrink-0" dangerouslySetInnerHTML={{ __html: settings.logoUrl }} />
          ) : (
            <div className="w-8 h-8 rounded bg-slate-850 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 p-0.5">
              <img
                src={settings.logoUrl}
                alt="Hospital Logo"
                className="max-h-full max-w-full object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold tracking-tight font-sans text-emerald-300">โสตทัศนศึกษา</h1>
            <p className="text-[10px] text-slate-300 truncate max-w-[180px]">{settings.hospitalName}</p>
          </div>
        </div>
        <button id="toggle-sidebar" onClick={toggleSidebar} className="text-slate-300 hover:text-white p-1" aria-label="Toggle Navigation">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-20 transition-opacity" onClick={toggleSidebar} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-[calc(100vh-4rem)] lg:h-screen w-72 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 flex flex-col z-20 transition-transform duration-300 transform shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header/Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          {settings.logoUrl.trim().startsWith('<svg') || settings.logoUrl.trim().startsWith('<?xml') || (settings.logoUrl.includes('<svg') && !settings.logoUrl.trim().startsWith('data:')) ? (
            <div className="w-11 h-11 rounded-lg bg-emerald-50 bg-opacity-10 p-2 flex items-center justify-center text-teal-400 shadow-inner shrink-0" dangerouslySetInnerHTML={{ __html: settings.logoUrl }} />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-slate-900 border border-slate-800 p-1.5 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={settings.logoUrl}
                alt="Hospital Logo"
                className="max-h-full max-w-full object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-lg font-bold font-sans tracking-tight text-white">โสตทัศนศึกษา</h1>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5" title={settings.hospitalName}>
              {settings.hospitalName}
            </p>
          </div>
        </div>

        {/* User Info & Fast Role Switcher */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-800 flex items-center justify-center font-bold text-teal-200 text-sm border-2 border-emerald-500 shadow-md">
              {currentUser.role[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-white">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  currentUser.role === 'Admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  currentUser.role === 'Manager' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{currentUser.department.split(' ')[0]}</span>
              </div>
            </div>
          </div>
          
          <button 
            id="role-switch"
            onClick={onOpenRoleSwitcher} 
            className="w-full mt-3 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-[11px] font-medium rounded-lg text-slate-200 border border-slate-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <UserCheck size={12} className="text-emerald-400" />
            สลับระดับสิทธิ์ตรวจงาน (Switch Role)
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
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
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer group
                  ${isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/20 border-l-4 border-emerald-300'
                    : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                  }
                `}
              >
                <IconComponent size={18} className={`transition-transform group-hover:scale-105 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                <span className="text-left flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-slate-900 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span>ระบบยืมอุปกรณ์ v1.0.0</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <HeartPulse size={10} className="animate-pulse" />
              โหมดเสถียร
            </span>
          </div>
          <button
            id="nav-logout"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            ออกจากระบบ (Sign Out)
          </button>
        </div>
      </aside>
    </>
  );
};
