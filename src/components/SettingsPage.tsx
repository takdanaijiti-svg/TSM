import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Clock, 
  Cpu, 
  Trash2, 
  Search, 
  CheckCircle2, 
  XSquare, 
  AlertTriangle, 
  Info,
  RefreshCw,
  Sliders,
  Settings,
  Flame,
  FileText
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, activityLogs, clearLogs, currentUser } = useApp();
  
  const [hospitalName, setHospitalName] = useState(settings.hospitalName);
  const [logoOption, setLogoOption] = useState('current'); // 'current', 'preset1', 'preset2', 'custom'
  const [customLogoUrl, setCustomLogoUrl] = useState(settings.logoUrl);
  const [maxLoanDays, setMaxLoanDays] = useState(settings.maxLoanDays || 7);
  const [autoApproveConsumables, setAutoApproveConsumables] = useState(settings.autoApproveConsumables !== undefined ? settings.autoApproveConsumables : true);
  
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('all');
  
  const [successMsg, setSuccessMsg] = useState('');

  // Default preset Logos
  const PRESETS = {
    taksin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="47" fill="#005a3c" stroke="#ffffff" stroke-width="1" /><circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.5" /><circle cx="50" cy="50" r="33.5" fill="none" stroke="#ffffff" stroke-width="1.2" /><path id="topTextPath" d="M 9.5 50 A 40.5 40.5 0 0 1 90.5 50" fill="none" /><path id="bottomTextPath" d="M 90.5 50 A 40.5 40.5 0 0 1 9.5 50" fill="none" /><text font-family="'Sarabun', 'Inter', sans-serif" font-size="4.2" font-weight="950" fill="#ffffff" letter-spacing="0.08"><textPath href="#topTextPath" startOffset="50%" text-anchor="middle">โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช</textPath></text><text font-family="'Sarabun', 'Inter', sans-serif" font-size="5" font-weight="950" fill="#ffffff" letter-spacing="0.1"><textPath href="#bottomTextPath" startOffset="50%" text-anchor="middle">กระทรวงสาธารณสุข</textPath></text><g transform="translate(50, 50) scale(0.55)"><line x1="0" y1="-28" x2="0" y2="24" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" /><circle cx="0" cy="-28" r="3" fill="#ffffff" /><path d="M -5 -33 C -7 -38 0 -45 0 -45 C 0 -45 7 -38 5 -33 C 8 -30 3 -26 0 -26 C -3 -26 -8 -30 -5 -33 Z" fill="#ffffff" /><path d="M -2 -31 C -4 -34 0 -38 0 -38 C 0 -38 4 -34 2 -31 C 3 -29 1 -27 0 -27 C -1 -27 -3 -29 -2 -31 Z" fill="#e6f4ea" opacity="0.9" /><path d="M 0 -13 C 8 -23 25 -18 25 -9 C 25 -2 15 -4 10 -2 C 6 0 2 3 0 5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 -13 C -8 -23 -25 -18 -25 -9 C -25 -2 -15 -4 -10 -2 C -6 0 -2 3 0 5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 -7 C 5 -15 20 -11 20 -4 C 20 2 12 0 7 2" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 -7 C -5 -15 -20 -11 -20 -4 C -20 2 -12 0 -7 2" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 10 C 13 8 13 -6 0 -8 C -13 -6 -13 8 0 10" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" /><path d="M 0 22 C 10 20 10 12 0 10 C -10 12 -10 20 0 22" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" /><path d="M -1 -7 C -5 -9 -8 -9 -11 -8 C -10 -7 -8 -5 -5 -6 Z" fill="#ffffff" /><path d="M 1 -7 C 5 -9 8 -9 11 -8 C 10 -7 8 -5 5 -6 Z" fill="#ffffff" /></g></svg>`,
    modernBlue: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="20" fill="#1e3a8a"/><circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" stroke-width="3"/><path d="M50 25 L50 75 M25 50 L75 50" stroke="#f8fafc" stroke-width="10" stroke-linecap="round"/><circle cx="50" cy="50" r="10" fill="#f43f5e"/></svg>`,
    simpleCross: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="45" fill="#f5f5f5" stroke="#ef4444" stroke-width="5"/><path d="M50 20 L50 80 M20 50 L80 50" stroke="#ef4444" stroke-width="18" stroke-linecap="square"/></svg>`
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetLogo = settings.logoUrl;
    if (logoOption === 'taksin') {
      targetLogo = PRESETS.taksin;
    } else if (logoOption === 'modernBlue') {
      targetLogo = PRESETS.modernBlue;
    } else if (logoOption === 'simpleCross') {
      targetLogo = PRESETS.simpleCross;
    } else if (logoOption === 'custom' && customLogoUrl.trim()) {
      targetLogo = customLogoUrl;
    }

    updateSettings(
      hospitalName.trim() || 'โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช',
      targetLogo,
      maxLoanDays,
      autoApproveConsumables
    );

    setSuccessMsg('บันทึกสเปกนโยบายและหน้าตาของระบบสำเร็จแล้ว!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleResetToDefault = () => {
    setHospitalName('โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช');
    setLogoOption('taksin');
    setMaxLoanDays(7);
    setAutoApproveConsumables(true);
  };

  // Log filtering
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(logSearch.toLowerCase());
      
    if (logTypeFilter === 'all') return matchesSearch;
    return matchesSearch && log.type === logTypeFilter;
  });

  return (
    <div className="space-y-6" id="settings-page">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="text-[#005a3c] w-7 h-7" />
            <span>ตั้งค่าระบบนโยบายและประวัติประสงค์</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            ปรับแต่งกฎการเบิกยืมอุปกรณ์โสตทัศนูปกรณ์ เปลี่ยนแปลงชื่อตราสัญลักษณ์โรงพยาบาล และตรวจสอบบันทึกธุรกรรมระบบทั้งหมด
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Policy Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/75 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#005a3c]" />
              <h3 className="font-extrabold text-sm text-gray-800">การตั้งค่าพารามิเตอร์และสิทธิ์</h3>
            </div>
            
            <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
              {/* Success Notification Banner */}
              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-fadeIn flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Hospital Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-gray-700 block">
                  ชื่อองค์กร / โรงพยาบาลป้ายหลัก
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#005a3c] focus:ring-2 focus:ring-emerald-100 outline-none transition text-xs font-semibold text-gray-800"
                    required
                  />
                </div>
              </div>

              {/* Borrow Duration Limits */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-extrabold text-gray-700">
                  <span>ระยะเวลาอนุญาตยืมสูงสุด (วัน)</span>
                  <span className="text-[#005a3c] bg-emerald-50 px-2 py-0.5 rounded-md">{maxLoanDays} วัน</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={maxLoanDays}
                  onChange={(e) => setMaxLoanDays(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#005a3c]"
                />
                <span className="text-[10px] text-gray-400 flex justify-between font-mono">
                  <span>1 วัน</span>
                  <span>15 วัน</span>
                  <span>30 วัน</span>
                </span>
              </div>

              {/* Consumable Auto Approval toggle */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-extrabold text-gray-800 block">
                      อนุมัติวัสดุสิ้นเปลืองอัตโนมัติ
                    </label>
                    <span className="text-[10px] text-gray-400">
                      เมื่อสมาชิกยืมเฉพาะกระดาษถ่านไฟสำรอง จะผ่านทันทีไม่ตระเตรียมรอแอดมินอนุมัติแต่อย่างใด
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoApproveConsumables}
                      onChange={(e) => setAutoApproveConsumables(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005a3c]"></div>
                  </label>
                </div>
              </div>

              {/* Logo selection preset */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-700 block">
                  ตราสัญลักษณ์โรงพยาบาล (Logo)
                </label>
                <select
                  value={logoOption}
                  onChange={(e) => setLogoOption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#005a3c] outline-none text-xs font-semibold text-gray-800 bg-white"
                >
                  <option value="taksin">ตราโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช (ดั้งเดิม)</option>
                  <option value="modernBlue">สัญลักษณ์สากลสีน้ำเงินเข้ม (Modern Blue)</option>
                  <option value="simpleCross">สัญลักษณ์ไม้กางเขนแพทย์เสมือน (Medical Red)</option>
                  <option value="custom">ระบุ SVG Code หรือภาพลิงก์ (Custom URL)</option>
                </select>

                {logoOption === 'custom' && (
                  <textarea
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    placeholder="ใส่ URL รูปภาพ หรือ SVG code"
                    rows={4}
                    className="w-full p-2.5 mt-2 text-[11px] font-mono border border-gray-200 rounded-xl focus:border-[#005a3c] outline-none"
                  />
                )}
                
                {/* Live Emblem Preview */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl mt-3">
                  <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-white border flex items-center justify-center p-1">
                    {logoOption === 'taksin' ? (
                      <div dangerouslySetInnerHTML={{ __html: PRESETS.taksin }} className="w-full h-full" />
                    ) : logoOption === 'modernBlue' ? (
                      <div dangerouslySetInnerHTML={{ __html: PRESETS.modernBlue }} className="w-full h-full" />
                    ) : logoOption === 'simpleCross' ? (
                      <div dangerouslySetInnerHTML={{ __html: PRESETS.simpleCross }} className="w-full h-full" />
                    ) : (
                      customLogoUrl.startsWith('<svg') ? (
                        <div dangerouslySetInnerHTML={{ __html: customLogoUrl }} className="w-full h-full" />
                      ) : (
                        <img src={customLogoUrl} alt="Logo preview" referrerPolicy="no-referrer" className="w-full h-full object-contain error-fallback" />
                      )
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 block tracking-wide">ตราพรีวิวภาพขวา</span>
                    <span className="text-xs font-extrabold text-gray-700 block truncate max-w-[200px]">{hospitalName}</span>
                  </div>
                </div>
              </div>

              {/* Action commands */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 text-center bg-[#005a3c] text-white py-2 px-4 rounded-xl text-xs font-extrabold hover:bg-[#004730] hover:shadow-md cursor-pointer transition-all"
                >
                  บันทึกตราและสิทธิ์
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  title="รีเซ็ตค่ากลับตอนเริ่มต้น"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Searchable System Audit Logs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col h-[650px]">
            <div className="p-5 border-b border-gray-100 bg-gray-50/75 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-extrabold text-sm text-gray-800">บันทึกธุรกรรมระบบย้อนหลัง (System Logs)</h3>
                  <p className="text-[10px] text-gray-400">ควบคุมและประเมินพฤติกรรมการยื่นเบิกอุปกรณ์โสตโสตสัปตัญพยาบาล</p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearLogs}
                disabled={activityLogs.length === 0}
                className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all shrink-0"
              >
                <Trash2 size={12} />
                ล้างข้อมูลบันทึกทั้งหมด
              </button>
            </div>

            {/* Logs Filter bar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-2.5 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="ค้นหาตามบทบาท, ทากำการ, บุคคล, หรือใบจอง..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 font-semibold"
                />
              </div>
              
              <select
                value={logTypeFilter}
                onChange={(e) => setLogTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-xl border-gray-200 text-xs font-semibold focus:outline-none bg-white text-gray-700 shrink-0 min-w-[120px]"
              >
                <option value="all">แสดงทุกประเภท</option>
                <option value="success">ธุรกรรมสำเร็จ (Success)</option>
                <option value="info">ข้อมูลทรรศนะ (Info)</option>
                <option value="warning">การเตือนนโยบาย (Warning)</option>
                <option value="error">การปฏิเสธ/ตัดลด (Error)</option>
              </select>
            </div>

            {/* Log list list content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-gray-50">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border mb-3">
                    <Search size={30} />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800">ไม่พบประวัติผลลัพธ์ข้อมูลระบบ</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">ไม่มีกิจกรรมหรือประวัติใดรี่ตรงกับการตั้งค่าตัวกรองของคุณในขณะนี้</p>
                </div>
              ) : (
                filteredLogs.map((log, index) => {
                  return (
                    <div 
                      key={log.id} 
                      className={`flex gap-3 text-xs pt-3.5 ${index === 0 ? 'pt-0' : ''}`}
                    >
                      {/* Classification Badge indicator and Icon */}
                      <div className="shrink-0 pt-0.5">
                        {log.type === 'success' && (
                          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                        {log.type === 'info' && (
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                            <Info size={14} />
                          </div>
                        )}
                        {log.type === 'warning' && (
                          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                            <AlertTriangle size={14} />
                          </div>
                        )}
                        {log.type === 'error' && (
                          <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                            <XSquare size={14} />
                          </div>
                        )}
                      </div>

                      {/* Content block */}
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                          <span className="font-extrabold text-xs text-gray-800">{log.action}</span>
                          <span className="text-[10px] text-gray-400 font-mono font-medium">
                            {new Date(log.timestamp).toLocaleString('th-TH')}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px] font-medium leading-relaxed">
                          {log.details}
                        </p>
                        
                        {/* Actor metadata info line */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[9.5px]">
                          <span className="text-gray-400 font-bold">ดำเนินการโดย:</span>
                          <span className="font-extrabold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                            {log.userName}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 font-medium font-mono">{log.userEmail}</span>
                          <span className="text-gray-300 font-medium font-mono">|</span>
                          <span className={`px-1 rounded-sm text-[8px] font-black ${
                            log.role === 'Admin' ? 'bg-rose-50 text-rose-600' :
                            log.role === 'Manager' ? 'bg-amber-50 text-amber-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {log.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Logs statistical metadata footer */}
            <div className="p-3 bg-gray-50 border-t text-[11px] font-bold text-gray-500 flex justify-between items-center shrink-0">
              <span>แสดงทั้งหมด: <span className="text-gray-700 font-extrabold">{logSearch || logTypeFilter !== 'all' ? `${filteredLogs.length} / ` : ''}{activityLogs.length}</span> รายการ</span>
              <span className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Audit trail secured</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
