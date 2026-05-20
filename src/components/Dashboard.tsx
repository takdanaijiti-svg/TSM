import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Laptop,
  CheckCircle,
  FileClock,
  Clock,
  Wrench,
  TrendingUp,
  Hospital,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { equipmentList, reservations, currentUser, settings } = useApp();

  if (!currentUser) return null;

  // Counters
  const totalEquipmentCount = equipmentList.length;
  
  // Under repair items
  const repairCount = equipmentList.filter(eq => eq.status === 'Under Repair').length;
  
  // Available units sum
  const totalAvailableUnits = equipmentList.reduce((acc, eq) => acc + eq.availableUnits, 0);
  const totalUnitsSum = equipmentList.reduce((acc, eq) => acc + eq.totalUnits, 0);

  // Validate transaction logic for statistics charting:
  // "The borrowing frequency chart/data should only calculate and display frequencies based on valid transactions
  // (Approved, Handed Over, or Returned), entirely excluding Pending or Rejected entries"
  const validReservations = reservations.filter(res => 
    ['Approved', 'Handed Over', 'Returned'].includes(res.status)
  );

  const pendingCount = reservations.filter(res => res.status === 'Pending').length;
  const activeBorrowedCount = reservations.filter(res => res.status === 'Handed Over').length;

  // Let's compute equipment borrowing frequencies based strictly on VALID transactions
  const frequencyMap: { [eqName: string]: number } = {};
  
  validReservations.forEach(res => {
    res.items.forEach(itm => {
      frequencyMap[itm.equipmentName] = (frequencyMap[itm.equipmentName] || 0) + itm.quantity;
    });
  });

  // Convert to chartable array and sort descending
  const sortedFrequencies = Object.entries(frequencyMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Compute category borrowing frequency based strictly on VALID transactions
  const categoryFreqMap: { [cat: string]: number } = {};
  validReservations.forEach(res => {
    res.items.forEach(itm => {
      const eq = equipmentList.find(e => e.id === itm.equipmentId);
      const cat = eq ? eq.category : 'ทั่วไป';
      categoryFreqMap[cat] = (categoryFreqMap[cat] || 0) + itm.quantity;
    });
  });

  const categoryFrequencies = Object.entries(categoryFreqMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Clinically Polished Welcome Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2.5 py-1 rounded-full w-fit">
              <Hospital size={12} />
              <span>ยินดีต้อนรับสู่หอโสตทัศนศึกษาทางการศึกษาแพทย์</span>
            </div>
            <h2 className="text-2xl font-bold font-sans tracking-tight text-white mt-2">
              {settings.hospitalName}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              ผู้ล็อกอิน: <span className="text-slate-200 font-semibold">{currentUser.name}</span> | สังกัด: {currentUser.department}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs text-slate-300 font-semibold">
              ระดับสิทธิ์ใช้งาน: <span className="text-emerald-400 font-bold">{currentUser.role}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <Laptop size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">อุปกรณ์คลังโสตฯ ทั้งหมด</span>
            <span className="text-2xl font-bold text-white font-mono">{totalEquipmentCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">รวมทั้งหมด {totalUnitsSum} ชิ้นพัสดุ</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-blue-950 border border-blue-800 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">พร้อมให้บริการยืม</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{totalAvailableUnits}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">ถูกเบิกและส่งซ่อม {totalUnitsSum - totalAvailableUnits} ชิ้น</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-amber-950 border border-amber-800 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={24} className={pendingCount > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">คิวคำขอรอตรวจสอบอนุมัติ</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{pendingCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {currentUser.role !== 'Staff' ? 'แจ้งเตือนมีใบจองรอตรวจ' : 'ตรวจสอบรายงานผลลัพธ์ด่วน'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-rose-950 border border-rose-800 text-rose-400 rounded-xl flex items-center justify-center shrink-0">
            <Wrench size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">ส่งตรวจสภาพ / ส่งซ่อมบำรุง</span>
            <span className="text-2xl font-bold text-rose-400 font-mono">{repairCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">งดเบิกจ่ายชั่วคราว</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Borrowing statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Borrowing Frequencies component */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-4 gap-2">
              <div>
                <h3 className="text-base font-bold font-sans text-white flex items-center gap-2">
                  <TrendingUp className="text-emerald-400" size={18} />
                  อัตราความถี่การยืมอุปกรณ์โสตฯ (AV Borrowing Frequency)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  คำนวณจำแนกตามรายอุปกรณ์เฉพาะจากเอกสารที่<strong>ได้รับการอนุมัติแล้ว, ส่งมอบแล้ว หรือส่งคืนเรียบร้อยเท่านั้น</strong> (ไม่รวมฉบับร่างคอยตรวจหรือฉบับยกเลิก)
                </p>
              </div>
              <div className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-900 rounded-lg">
                กรองสถิติจริง (Statistics Filter)
              </div>
            </div>

            {sortedFrequencies.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <AlertCircle size={36} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold">ยังไม่มีข้อมูลสถิติประวัติการยืมในบิลที่อนุมัติ</p>
                <p className="text-[11px] mt-0.5 text-slate-600">คำขอทั้งหมดต้องได้รับการปรับสถานะเป็นอนุมัติก่อนสถิติจึงจะอัปเดต</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedFrequencies.slice(0, 5).map((item, idx) => {
                  const maxCount = sortedFrequencies[0].count;
                  const ratio = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-300 truncate max-w-[340px]">
                          {idx + 1}. {item.name}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
                          {item.count} ครั้ง
                        </span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800/85 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-3 mt-4 text-[11px] text-slate-500 flex justify-between items-center bg-slate-950/20 p-2 rounded-xl">
            <span>คำนวณอัตราความถี่รายตัวที่มีผลสัมฤทธิ์ {validReservations.length} รายการ</span>
            <button onClick={() => setActiveTab('equipment')} className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer">
              เข้าไปเลือกยืมเครื่องโสตฯ
              <ArrowRight size={10} />
            </button>
          </div>
        </div>

        {/* Category breakdown (side card) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-sans text-white border-b border-slate-800 pb-3 mb-4">
              ตามสัดส่วนหมวดหมู่ (Category Breakdowns)
            </h3>

            {categoryFrequencies.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <AlertCircle size={28} className="mx-auto text-slate-600 mb-2" />
                <span className="text-xs">ไม่พบสัญญายืมพร้อมอนุมัติ</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {categoryFrequencies.map((cat, idx) => {
                  const colors = [
                    'bg-emerald-500 text-emerald-100 border-emerald-600',
                    'bg-teal-500 text-teal-100 border-teal-600',
                    'bg-blue-500 text-blue-100 border-blue-600',
                    'bg-amber-500 text-amber-100 border-amber-600',
                    'bg-rose-500 text-rose-100 border-rose-600'
                  ];
                  const col = colors[idx % colors.length];

                  return (
                    <div key={cat.name} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${col.split(' ')[0]}`} />
                        <span className="font-semibold text-slate-300">{cat.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
                        ยืมไป {cat.count} ยูนิต
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 mt-4 text-[10.5px] text-slate-500 leading-relaxed font-sans">
            สัดส่วนแสดงผลกลุ่มครุภัณฑ์เพื่อวางงบประมาณจัดซื้อเพิ่มเติม บันทึกตามการรับรองของฝ่ายบริหารโรงพยาบาลและสถาบันฝึกหัดแพทย์สาธารณสุข
          </div>
        </div>
      </div>

      {/* Quick Action & Notifications Info block */}
      <div className="p-4 bg-emerald-950/20 border border-emerald-900 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-start gap-2.5">
          <Sparkles className="text-emerald-400 shrink-0 mt-0.5 animate-spin" size={16} />
          <div>
            <h4 className="text-xs font-bold text-slate-200">คู่มือลัดการจองใช้เครื่องโสตทัศนศึกษาแพทย์</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              1. เลือกอุปกรณ์แพทย์ความถี่วิทยุใส่ตะกร้า 2. กรอกวันเวลาที่จอง 3. อนุมัติคำแถลงใบยืมโดย Admin หรือ Manager และชี้ปฏิทินตรวจดู tooltip คิวที่ทับซ้อนได้ทันที!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
