import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { KeyRound, ShieldAlert, Sparkles, Building2, UserPlus, LogIn, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, settings } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Staff');
  const [department, setDepartment] = useState('ฝ่ายกุมารเวชศาสตร์ (Pediatric)');
  const [error, setError] = useState('');

  // Quick access identities as mandated
  const quickLogins = [
    { email: 'admin@hospital.com', label: 'Admin (ผู้ดูแลระบบสูงสุด)', color: 'bg-rose-500 hover:bg-rose-600', desc: 'จัดการอุปกรณ์, อนุมัติยืม-คืน, จัดทำเนียบพนักงาน, เข้าถึง analytics และตั้งค่าระบบ' },
    { email: 'manager@hospital.com', label: 'Manager (หัวหน้างานโสตฯ)', color: 'bg-amber-500 hover:bg-amber-600', desc: 'ตรวจสอบและอนุมัติใบยืม, เช็คปฏิทิน และสืบค้นทำเนียบบุคลากร' },
    { email: 'staff@hospital.com', label: 'Staff (แพทย์ผู้ยืมยุทโธปกรณ์)', color: 'bg-emerald-500 hover:bg-emerald-600', desc: 'เลือกหยิบอุปกรณ์ใส่ตะกร้า, จัดทำใบจอง และดูสถานะประวัติการส่งคำขอ' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim() || !email.trim() || !department.trim()) {
        setError('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
        return;
      }
      const success = register(name, email, role, department);
      if (!success) {
        setError('อีเมลนี้ถูกบันทึกในระบบแล้ว');
      }
    } else {
      if (!email.trim()) {
        setError('กรุณากรอกอีเมลผู้ใช้งาน');
        return;
      }
      const success = login(email);
      if (!success) {
        setError('ไม่พบบัญชีผู้ใช้งานที่ผูกกับอีเมลนี้ (กรุณาใช้อีเมลด่วนที่ด้านล่าง หรือสลับโหมดเป็นสมัครสมาชิก)');
      }
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setError('');
    setEmail(quickEmail);
    login(quickEmail);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Absolute Visual Flourishes */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center">
          {/* Logo container dynamically loaded */}
          {settings.logoUrl.trim().startsWith('<svg') || settings.logoUrl.trim().startsWith('<?xml') || (settings.logoUrl.includes('<svg') && !settings.logoUrl.trim().startsWith('data:')) ? (
            <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-emerald-500 flex items-center justify-center p-3.5 shadow-emerald-500/10 shadow-lg text-emerald-400" dangerouslySetInnerHTML={{ __html: settings.logoUrl }} />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-emerald-500 flex items-center justify-center p-2 shadow-emerald-500/10 shadow-lg overflow-hidden shrink-0">
              <img
                src={settings.logoUrl}
                alt="Hospital Logo"
                className="max-h-full max-w-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <h2 className="mt-4 text-center text-3xl font-bold font-sans tracking-tight text-white">
            โสตทัศนศึกษา
          </h2>
          <p className="mt-1.5 text-center text-sm text-slate-400 font-medium">
            {settings.hospitalName}
          </p>
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-teal-950 border border-teal-800 rounded-full text-xs text-emerald-400 font-semibold shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ระบบจัดการยืม-คืนอุปกรณ์โสตทัศนูปกรณ์แพทย์ (AV Loan)
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <div className="bg-slate-900/90 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 backdrop-blur-xl sm:px-10">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            {isRegister ? <UserPlus size={18} className="text-emerald-400" /> : <LogIn size={18} className="text-emerald-400" />}
            {isRegister ? 'สมัครเข้าใช้ฐานข้อมูลระบบโสตฯ' : 'เข้าสู่ระบบบุคลากรโรงพยาบาล'}
          </h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-400 font-semibold flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isRegister && (
              <>
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    ชื่อ - นามสกุลจริง (ภาษาไทย)
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="นพ.สมศักดิ์ รักดี"
                    className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="role" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      ระดับตำแหน่ง (Role)
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                    >
                      <option value="Staff">Staff (ยืมได้อย่างเดียว)</option>
                      <option value="Manager">Manager (อนุมัติได้)</option>
                      <option value="Admin">Admin (จัดการระบบทั้งหมด)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      ฝ่าย/กองแผนกสังกัด
                    </label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="แผนกศัลยกรรมใบหน้า"
                      className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-600 font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                อีเมลผู้ใช้งาน (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 text-white border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-teal-900/30 transition-all cursor-pointer mt-4"
            >
              <span>{isRegister ? 'สร้างและล็อกอินเข้าระบบ' : 'ยืนยันเพื่อเข้าสู่ระบบ'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">
              {isRegister ? 'มีบัญชีผู้ใช้ระบบโสตฯ แล้ว?' : 'ไม่มีไอดี ยินดีลงทะเบียน?'}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors cursor-pointer"
            >
              {isRegister ? 'กดที่นี่เพื่อเข้าสู่ระบบ' : 'กดที่นี่เพื่อสมัครสมาชิกใหม่'}
            </button>
          </div>

          {/* Quick Access ID Section */}
          <div className="mt-8 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-1.5 mb-4">
              <KeyRound className="text-emerald-400 shrink-0" size={16} />
              <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase">
                ช่องทางทดสอบด่วนสำหรับกรรมการตรวจสอบ (Demo Profiles)
              </h4>
            </div>

            <div className="space-y-3">
              {quickLogins.map((ql) => (
                <button
                  key={ql.email}
                  type="button"
                  onClick={() => handleQuickLogin(ql.email)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 hover:border-slate-700 transition-all border border-slate-800 flex items-start gap-3 cursor-pointer group"
                >
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 group-hover:scale-130 transition-transform ${ql.email.includes('admin') ? 'bg-rose-500' : ql.email.includes('manager') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {ql.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono italic">
                        {ql.email}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                      {ql.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
