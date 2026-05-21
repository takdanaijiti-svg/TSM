import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { KeyRound, ShieldAlert, Sparkles, Building2, UserPlus, LogIn, Mail, ArrowRight, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { playBeep } from '../utils/audio';

export const LoginPage: React.FC = () => {
  const { login, register, settings } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Staff');
  const [department, setDepartment] = useState('ฝ่ายบริการการแพทย์หลัก (General Medical Dept)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Official pre-configured credentials catalog
  const credentialCatalog = [
    { 
      email: 'admin@taksin.hospital', 
      password: 'TaksinAdmin2026', 
      label: 'Admin (ผู้ดูแลระบบสูงสุด)', 
      color: 'border-l-rose-500 bg-rose-50/70',
      textColor: 'text-rose-800',
      badgeColor: 'bg-rose-100 text-rose-700',
      desc: 'เข้าถึงแผงสถิติ, จัดการอุปกรณ์ถาวร, อนุมัติยืม-คืน, จัดทำทำเนียบพนักงานระดับสูง' 
    },
    { 
      email: 'manager@taksin.hospital', 
      password: 'TaksinManager3000', 
      label: 'Manager (หัวหน้างานฝ่ายอนุมัติ)', 
      color: 'border-l-emerald-600 bg-emerald-50/70',
      textColor: 'text-emerald-800',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      desc: 'คัดกรองคำสั่งชะลอจ่าย, ตรวจพิจารณาฟอร์มยืม, คุมคิวอุปกรณ์ และเช็คประวัติการยืมในคลัง' 
    },
    { 
      email: 'staff@taksin.hospital', 
      password: 'TaksinStaff111', 
      label: 'Staff (แพทย์/พยาบาล ผู้ใช้สิทธิ์ยืม)', 
      color: 'border-l-blue-500 bg-blue-50/70',
      textColor: 'text-blue-800',
      badgeColor: 'bg-blue-100 text-blue-700',
      desc: 'หยิบยุทโธปกรณ์เคลื่อนย้าย, เสนอคำจองล่วงหน้า และติดตามประวัติใบขออนุมัติ' 
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegister) {
      if (!name.trim() || !email.trim() || !password) {
        setError('กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วนทุกช่อง');
        playBeep('error');
        return;
      }
      if (password.length < 6) {
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรเพื่อความปลอดภัยระดับวิชาชีพ');
        playBeep('error');
        return;
      }
      if (password !== confirmPassword) {
        setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
        playBeep('error');
        return;
      }
      const success = register(name, email, password, role, department);
      if (success) {
        setSuccessMsg('สมัครสมาชิกสำเร็จแล้ว! ระบบได้บันทึกรายชื่อลงฐานข้อมูลโรงพยาบาลแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านดังกล่าว');
        playBeep('success');
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        setError('อีเมลนี้ถูกบันทึกในระบบทะเบียนของโรงพยาบาลอยู่แล้ว');
        playBeep('error');
      }
    } else {
      if (!email.trim() || !password) {
        setError('กรุณากรอกอีเมลและรหัสผ่านผู้ใช้งาน');
        playBeep('error');
        return;
      }
      const success = login(email, password);
      if (success) {
        playBeep('success');
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้องตามเกณฑ์ความปลอดภัยของกระทรวงสาธารณสุข กรุณาตรวจสอบอักษรพิมพ์ใหญ่-เล็กในหน้ารายชื่อผู้ได้รับอนุญาตด้านล่าง');
        playBeep('error');
      }
    }
  };

  const copyCredentials = (targetEmail: string, targetPass: string) => {
    playBeep('click');
    setEmail(targetEmail);
    setPassword(targetPass);
    setError('');
    setSuccessMsg('อัปโหลดข้อมูลไปยังช่องป้อนข้อมูลเรียบร้อยแล้ว กรุณากดปุ่ม "ยืนยันเพื่อเข้าสู่ระบบ"');
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative medical background motifs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Structural subtle medical grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2ebd9_1px,transparent_1px),linear-gradient(to_bottom,#e2ebd9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center">
          {/* Logo container utilizing the beautiful forest green SVG setup */}
          <Logo 
            logoUrl={settings.logoUrl}
            className="w-24 h-24 rounded-full bg-white border border-slate-200 shadow-lg p-2.5 transition-all duration-300 hover:scale-105"
          />
          
          <h2 className="mt-4 text-center text-2xl font-black text-slate-800 tracking-tight">
            ระบบบริหารจัดการอุปกรณ์โสตทัศนศึกษา
          </h2>
          <p className="mt-1 text-center text-sm text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
            {settings.hospitalName}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/80 rounded-2xl border border-slate-200/60 sm:px-10">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>{isRegister ? 'แบบฟอร์มลงทะเบียนบุคลากรใหม่' : 'การยืนยันตัวตนก่อนเข้าใช้งานคลัง'}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
              <KeyRound size={12} className="text-emerald-600" />
              <span>SSL SECURE PORTAL</span>
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 bg-rose-50 border-l-4 border-rose-600 rounded-lg text-xs text-rose-800 font-medium flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-600 rounded-lg text-xs text-emerald-800 font-semibold flex items-start gap-2.5">
                <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {isRegister && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 transition-all animate-fade-in">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    ชื่อ - นามสกุลจริง (ระบุคำนำหน้าชื่อตัวอย่างเหมาะสม)
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น นพ.เกียรติภูมิ ภักดี"
                    className="w-full px-3.5 py-2 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent placeholder-slate-400 font-medium font-sans shadow-inner transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                ที่อยู่อีเมลประจำตำแหน่ง (Email Address)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น admin@taksin.hospital"
                  className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent placeholder-slate-400 font-medium font-sans shadow-inner transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>รหัสผ่านขอยืมพัสดุ (Password)</span>
                {isRegister && <span className="text-[#005a3c] font-black tracking-normal text-[10.5px] bg-[#e6f4ea] px-2 py-0.5 rounded border border-emerald-250">ความปลอดภัย 256-Bit</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "ตั้งรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)" : "ป้อนรหัสผ่านป้องกันสิทธิ์การยืมของคุณ"}
                  className="w-full pl-10 pr-10 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a3c] focus:border-transparent placeholder-slate-400 font-medium font-mono shadow-inner transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter when Registering */}
              {isRegister && password.length > 0 && (
                <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 transition-all text-[11px] font-sans">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-extrabold">ความปลอดภัยรหัสผ่าน:</span>
                    <span className={`font-black ${
                      password.length < 6 ? 'text-rose-600' :
                      !/\d/.test(password) || !/[A-Z]/.test(password) ? 'text-amber-600' : 'text-emerald-700 animate-pulse'
                    }`}>
                      {password.length < 6 ? '❌ สั้นเกินไป' :
                       !/\d/.test(password) || !/[A-Z]/.test(password) ? '⚠️ ปลอดภัยระดับปานกลาง (ขาดอักษรใหญ่/ตัวเลข)' : '🛡️ แข็งแกร่งยอดเยี่ยม'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full rounded-full transition-all duration-300 ${password.length >= 6 ? 'bg-amber-500 w-1/3' : 'bg-rose-500 w-[15%]'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${password.length >= 6 && /\d/.test(password) ? 'bg-amber-500 w-1/3' : 'bg-slate-200 w-0'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${password.length >= 6 && /\d/.test(password) && /[A-Z]/.test(password) ? 'bg-emerald-600 w-1/3' : 'bg-slate-200 w-0'}`} />
                  </div>
                  <p className="text-[9.5px] italic text-slate-400 font-medium leading-tight">
                    *เพื่อให้สอดคล้องกับข้อกำหนด PDPA ทางการแพทย์ แนะนำให้ประกอบด้วย ตัวอักษรพิมพ์ใหญ่ (A-Z) และตัวเลข (0-9)
                  </p>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  พิมพ์รหัสผ่านยืนยันอีกครั้ง (Confirm Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านเดิมซ้ำเพื่อความแม่นยำ"
                    className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-950 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent placeholder-slate-400 font-medium font-mono shadow-inner transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#005a3c] hover:bg-[#004730] text-white rounded-xl text-sm font-extrabold shadow-md shadow-emerald-900/10 transition-all cursor-pointer mt-4"
            >
              <span>{isRegister ? 'สร้างและส่งประวัติลงฐานข้อมูล' : 'เข้าสู่ระบบเครือข่ายความปลอดภัยหลัก'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">
              {isRegister ? 'มีประวัติขึ้นทะเบียนเดิมในคลังแล้ว?' : 'ยังไม่มีไอดีระบบตรวจสอบ?'}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessMsg('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-emerald-700 hover:text-[#005a3c] font-bold underline transition-colors cursor-pointer"
            >
              {isRegister ? 'กดที่นี่เพื่อย้อนกลับไปเข้าสู่ระบบ' : 'ลงทะเบียนสิทธิ์บุคลากรใหม่'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
