import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Building2,
  Image,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  HeartPulse
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, currentUser } = useApp();
  const [hospitalName, setHospitalName] = useState(settings.hospitalName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [success, setSuccess] = useState(false);

  // Protect view check of RBAC
  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="bg-red-950/20 border border-red-900 p-8 rounded-2xl text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="mx-auto text-red-500 mb-2" size={36} />
        <h3 className="text-sm font-bold text-slate-100">🚫 ขออภัย สิทธิ์ในการเข้าถึงถูกปัดปฏิเสธ</h3>
        <p className="text-xs text-slate-400 mt-2">
          หน้าจอตั้งค่ายุทธศาสตร์โรงพยาบาลสงวนสิทธิ์ไว้เฉพาะระดับ Admin เท่านั้น
        </p>
      </div>
    );
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    updateSettings(hospitalName, logoUrl);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // Reset to original preset
  const handleResetPresets = () => {
    if (confirm('คุณต้องการรีเซ็ตชื่อโรงพยาบาลและโลโก้หลักกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      const originalLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="47" fill="#005a3c" stroke="#ffffff" stroke-width="1" /><circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.5" /><circle cx="50" cy="50" r="33.5" fill="none" stroke="#ffffff" stroke-width="1.2" /><path id="topTextPath" d="M 9.5 50 A 40.5 40.5 0 0 1 90.5 50" fill="none" /><path id="bottomTextPath" d="M 90.5 50 A 40.5 40.5 0 0 1 9.5 50" fill="none" /><text font-family="'Sarabun', 'Inter', sans-serif" font-size="4.2" font-weight="950" fill="#ffffff" letter-spacing="0.08"><textPath href="#topTextPath" startOffset="50%" text-anchor="middle">โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช</textPath></text><text font-family="'Sarabun', 'Inter', sans-serif" font-size="5" font-weight="950" fill="#ffffff" letter-spacing="0.1"><textPath href="#bottomTextPath" startOffset="50%" text-anchor="middle">กระทรวงสาธารณสุข</textPath></text><g transform="translate(50, 50) scale(0.55)"><line x1="0" y1="-28" x2="0" y2="24" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" /><circle cx="0" cy="-28" r="3" fill="#ffffff" /><path d="M -5 -33 C -7 -38 0 -45 0 -45 C 0 -45 7 -38 5 -33 C 8 -30 3 -26 0 -26 C -3 -26 -8 -30 -5 -33 Z" fill="#ffffff" /><path d="M -2 -31 C -4 -34 0 -38 0 -38 C 0 -38 4 -34 2 -31 C 3 -29 1 -27 0 -27 C -1 -27 -3 -29 -2 -31 Z" fill="#e6f4ea" opacity="0.9" /><path d="M 0 -13 C 8 -23 25 -18 25 -9 C 25 -2 15 -4 10 -2 C 6 0 2 3 0 5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 -13 C -8 -23 -25 -18 -25 -9 C -25 -2 -15 -4 -10 -2 C -6 0 -2 3 0 5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 -7 C 5 -15 20 -11 20 -4 C 20 2 12 0 7 2" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 -7 C -5 -15 -20 -11 -20 -4 C -20 2 -12 0 -7 2" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 10 C 13 8 13 -6 0 -8 C -13 -6 -13 8 0 10" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" /><path d="M 0 22 C 10 20 10 12 0 10 C -10 12 -10 20 0 22" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" /><path d="M -1 -7 C -5 -9 -8 -9 -11 -8 C -10 -7 -8 -5 -5 -6 Z" fill="#ffffff" /><path d="M 1 -7 C 5 -9 8 -9 11 -8 C 10 -7 8 -5 5 -6 Z" fill="#ffffff" /></g></svg>`;
      const originalName = 'โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช';
      setHospitalName(originalName);
      setLogoUrl(originalLogo);
      updateSettings(originalName, originalLogo);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Settings className="text-emerald-400" />
            ตู้ตั้งค่าส่วนกลางและแบรนดิ้งโรงพยาบาล (System Settings)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ปรับเปลี่ยนชื่องานสาธารณสุข ยกระดับแบรนดิ้งองค์กรด้วยการแทนชื่อองค์กรและตราโลโก้ที่เผยแพร่ทั่วระบบ
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
          <ShieldCheck size={14} />
          <span>ระดับบริหารระบบ (Master Admin)</span>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>บันทึกตั้งค่าเปลี่ยนชื่องานและโลโก้สัญลักษณ์จัดสรรสำเร็จเรียบร้อยแล้ว! (มีผลต่อหน้า Login และ Sidebar ทันที)</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-base font-bold font-sans text-white border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
            <Building2 size={18} className="text-emerald-400" />
            <span>ปรับปรุงแบรนด์พยาบาลและภาพรวมโสตศึกษา</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-5 text-xs font-sans">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wide">ชื่อโรงพยาบาลหลัก (Hospital Name)</label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="เช่น โรงพยาบาลกรุงเทพคริสเตียนสงเคราะห์"
                className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400 font-semibold uppercase tracking-wide">ตราสัญลักษณ์แบรนด์เครื่องหมายโรงพยาบาล (Logo Image)</label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850/60">
                {/* Live Logo Render */}
                {logoUrl.trim().startsWith('<svg') || logoUrl.trim().startsWith('<?xml') || (logoUrl.includes('<svg') && !logoUrl.trim().startsWith('data:')) ? (
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border-2 border-emerald-500 flex items-center justify-center p-2.5 shrink-0 text-emerald-400" dangerouslySetInnerHTML={{ __html: logoUrl }} />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border-2 border-emerald-500 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    <img
                      src={logoUrl}
                      alt="Hospital Logo"
                      className="max-h-full max-w-full object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                
                <div className="space-y-2 flex-1 w-full">
                  <span className="text-[10px] text-slate-500 block">เลือกหน้าภาพสัญลักษณ์สถาบันแพทย์ หรือลากวางไฟล์ภาพด้านล่างเพื่อแปลงเป็น Base64 Data-URL ทันที:</span>
                  <label className="px-4 py-2 bg-slate-900 border border-dashed border-slate-800 hover:border-emerald-600 rounded-xl text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition text-xs font-semibold">
                    <Upload size={14} className="text-emerald-400" />
                    <span>อัปโหลดตราสัญลักษณ์โรงพยาบาลของคุณ</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleResetPresets}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-450 hover:text-slate-200 border border-slate-850/60 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={14} />
                คืนค่าค่ากำหนดเดิมกระทรวง (Reset presets)
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-950/20 transition cursor-pointer"
              >
                บันทึกการจัดส่วนกลางสากล
              </button>
            </div>
          </form>
        </div>

        {/* Informational Guidelines card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-sans text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <HeartPulse size={16} className="text-emerald-400" />
              <span>เกณฑ์สากลจริยธรรมผู้บริหารคอม</span>
            </h3>

            <div className="text-[11.5px] text-slate-400 leading-relaxed space-y-3 font-sans">
              <p>
                ในฐานะผู้ควบคุมสูงสุดตราสัญลักษณ์และโครงสร้างสารสนเทศทางการแพทย์พึงตรวจสอบ:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                <li>ตราสัญลักษณ์ควรสอดรับกับนโยบายกองศึกษาเพื่อไม่ก่อให้เกิดการไขว้เขว</li>
                <li>ทุกรายชื่อในทำเนียบสตาฟจะถูกบันทึกอย่างถาวรภายใต้ข้อกำหนด HIPAA</li>
                <li>ความคลาดเคลื่อนชิ้นพัสดุยืมจะถูกรายงานออกไปยังส่วนบัญชีครุภัณฑ์เขต 7</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-teal-950/30 border border-teal-900 text-[10px] text-emerald-400 leading-normal rounded-xl">
            ระบุความเปลี่ยนแปลงจะประจักษ์โดยทั่วกันทั้งผู้เข้าชมล็อกอิน เจ้าหน้าที่ประจำตึก และผู้กรองสัญญาพ้นวิบัติในชั่วเสี้ยววินาที
          </div>
        </div>
      </div>
    </div>
  );
};
