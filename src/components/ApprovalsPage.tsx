import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Reservation } from '../types';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  MessageSquare,
  Search,
  Building,
  CalendarDays,
  AlertOctagon,
  CornerDownRight,
  User,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const {
    reservations,
    approveReservation,
    rejectReservation,
    handoverReservation,
    returnReservation,
    currentUser
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Approved' | 'Handed Over' | 'Returned' | 'Rejected'>('All');
  const [search, setSearch] = useState('');
  
  // Rejection Dialog State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Protect view check of RBAC
  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Manager')) {
    return (
      <div className="bg-red-950/20 border border-red-900 p-8 rounded-2xl text-center max-w-lg mx-auto my-12">
        <AlertOctagon className="mx-auto text-red-500 mb-2" size={36} />
        <h3 className="text-sm font-bold text-slate-100">🚫 ขออภัย สิทธิ์ในการเข้าถึงถูกปัดปฏิเสธ</h3>
        <p className="text-xs text-slate-400 mt-2">
          หน้าจอควบคุมรายการอนุมัติระบบโสตฯ สงวนไว้สำหรับบุคลากรระดับ Admin และ Manager เท่านั้น
        </p>
      </div>
    );
  }

  const handleOpenRejectDialog = (id: string) => {
    setRejectId(id);
    setRejectionNotes('');
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectionNotes.trim()) return;

    rejectReservation(rejectId, rejectionNotes);
    setRejectId(null);
    setRejectionNotes('');
  };

  // Filter reservations based on search text (borrower name or purpose)
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.userName.toLowerCase().includes(search.toLowerCase()) ||
                          res.userDepartment.toLowerCase().includes(search.toLowerCase()) ||
                          res.purpose.toLowerCase().includes(search.toLowerCase()) ||
                          res.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || res.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <FileCheck className="text-emerald-400" />
            ศูนย์อนุมัติและบริหารสัญญายืมเครื่องโสตฯ (AV Approval Hub)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ตรวจพิจารณาคุณสมบัติคำขอยืม ดำเนินงานตรวจสอบพัสดุ ปล่อยจ่ายครุภัณฑ์ (Handover) และบันทึกคืนครุภัณฑ์ (Return) เข้าคลังโรงพยาบาล
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
          <ShieldCheck size={14} />
          <span>ระดับการบริหาร: {currentUser.role}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ร้องขอยืม, แผนก, วัตถุประสงค์ หรือรหัสใบเสร็จ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-600 font-medium"
          />
        </div>

        {/* Status selection pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          {([
            { id: 'All', label: 'ทั้งหมด' },
            { id: 'Pending', label: '⏳ รอดำเนินการ' },
            { id: 'Approved', label: '✅ อนุมัติแล้ว' },
            { id: 'Handed Over', label: '📦 ส่งมอบแล้ว' },
            { id: 'Returned', label: '🔄 ส่งคืนแล้ว' },
            { id: 'Rejected', label: '❌ ปฏิเสธ' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
                ${activeFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow shadow-emerald-950/50'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests table / card timelines */}
      {filteredReservations.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-16 rounded-2xl text-center text-slate-500">
          <FileCheck size={40} className="mx-auto text-slate-700 mb-2" />
          <p className="text-sm font-semibold">ไม่มีรายการยืมที่อยู่ภายใต้การคัดกรองดังกล่าว</p>
          <p className="text-xs mt-1 text-slate-600">คำร้องขอใหม่ที่แพทย์ส่งเข้ามาจะเปิดแสดงที่นี่โดยตรง</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((res) => {
            const hasPending = res.status === 'Pending';
            const hasApproved = res.status === 'Approved';
            const hasHandedOver = res.status === 'Handed Over';

            return (
              <div
                key={res.id}
                className={`
                  bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all hover:border-slate-700
                  ${res.status === 'Pending' ? 'border-l-4 border-l-amber-500 border-slate-800' :
                    res.status === 'Approved' ? 'border-l-4 border-l-blue-500 border-slate-800' :
                    res.status === 'Handed Over' ? 'border-l-4 border-l-teal-500 border-slate-800' :
                    res.status === 'Returned' ? 'border-l-4 border-l-emerald-500 border-slate-800' :
                    'border-l-4 border-l-rose-500 border-slate-800'
                  }
                `}
              >
                {/* ID & Status Line */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/70 pb-3 mb-4.5 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                      เลขเอกสารยืม: #{res.id}
                    </span>
                    <span className="text-slate-700 text-xs">|</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays size={13} className="text-emerald-400" />
                      <span>บันทึกส่งเรื่อง: {new Date(res.createdAt).toLocaleString('th-TH')}</span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                    res.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    res.status === 'Approved' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    res.status === 'Handed Over' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                    res.status === 'Returned' ? 'bg-emerald-505/10 text-emerald-400 border-emerald-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {res.status === 'Pending' && '⏳ รอการพิจารณาตรวจสอบ'}
                    {res.status === 'Approved' && '✅ อนุมัติแล้ว - รอส่งสินค้า'}
                    {res.status === 'Handed Over' && '📦 จ่ายเครื่องออกไปแล้ว (บีบหักคลัง)'}
                    {res.status === 'Returned' && '🔄 ตรวจรับของคืนเรียบร้อย (เติมคลัง)'}
                    {res.status === 'Rejected' && '❌ ปฏิเสธไม่ออกสัมปทาน'}
                  </span>
                </div>

                {/* Patient / Borrower Specs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Column 1: Borrower Profile */}
                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">โปรไฟล์ผู้เบิกยืม:</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 mt-1">
                      <User size={13} className="text-emerald-400" />
                      <span>{res.userName}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] font-sans flex items-center gap-1.5 mt-0.5">
                      <Building size={12} className="text-slate-500" />
                      <span>{res.userDepartment}</span>
                    </div>
                  </div>

                  {/* Column 2: Date Pickups */}
                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80 justify-between flex flex-col">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">กำหนดวันเวลารับ-คืนครุภัณฑ์:</span>
                      <div className="mt-1 text-slate-200 leading-snug font-sans">
                        <p className="flex justify-between">
                          <span className="text-slate-400 text-[11px]">วันเข้ารับ:</span>
                          <span className="font-mono text-emerald-400">{new Date(res.pickupTime).toLocaleString('th-TH')}</span>
                        </p>
                        <p className="flex justify-between border-t border-slate-900 pt-1 mt-1">
                          <span className="text-slate-400 text-[11px]">วันส่งคืน:</span>
                          <span className="font-mono text-amber-500">{new Date(res.returnTime).toLocaleString('th-TH')}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Intent/Purpose */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">ประสงค์ใช้ในงาน:</span>
                      <p className="text-[11.5px] text-slate-300 mt-1 leading-relaxed line-clamp-3">
                        {res.purpose}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items and action buttons */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Hardware list */}
                  <div className="w-full sm:max-w-md">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-1.5">รายการอุปกรณ์ที่ประสงค์ขอยืม (AV Hardware):</span>
                    <div className="space-y-1">
                      {res.items.map((itm, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs bg-slate-950 p-1.5 px-3 rounded-lg border border-slate-850/60 justify-between">
                          <span className="text-slate-300 truncate max-w-[280px]">{itm.equipmentName}</span>
                          <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-2 py-0.5 rounded text-[11px]">
                            x{itm.quantity} ชุด
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Action triggers depending on role and states */}
                  <div className="flex flex-wrap gap-2 justify-end items-center self-end sm:self-center">
                    
                    {/* Rejection Log banner if rejected */}
                    {res.status === 'Rejected' && res.rejectionReason && (
                      <div className="p-2.5 bg-rose-950/20 border border-rose-900/50 rounded-xl text-[11px] text-rose-300 flex items-start gap-1.5 max-w-sm">
                        <MessageSquare size={13} className="shrink-0 mt-0.5" />
                        <span>เหตุผลปฏิเสธการยืม: "{res.rejectionReason}"</span>
                      </div>
                    )}

                    {/* Pending actions (Approve / Reject) only accessible to Admin or Manager */}
                    {hasPending && (
                      <>
                        <button
                          onClick={() => handleOpenRejectDialog(res.id)}
                          className="px-3.5 py-2 bg-rose-950/20 hover:bg-rose-950 hover:text-white text-rose-400 border border-rose-900/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle size={13} />
                          ปฏิเสธคำขอ
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('คุณแน่ใจที่จะอนุมัติเอกสารยืมเครื่องโสตฉบับนี้หรือไม่?')) {
                              approveReservation(res.id);
                            }
                          }}
                          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          พิจารณาอนุมัติ
                        </button>
                      </>
                    )}

                    {/* Approved actions (Handover) accessible to Admin only to verify physical custody */}
                    {hasApproved && (
                      <button
                        onClick={() => {
                          if (confirm('ยืนยันส่งมอบอุปกรณ์โสตฯ ให้กับผู้เบิกใช้? ขั้นตอนนี้จะปรับหักยอดคลังเหลือจริงลงทันที')) {
                            handoverReservation(res.id);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 cursor-pointer"
                      >
                        <Truck size={14} className="animate-bounce" />
                        ส่งมอบพัสดุออกคลัง (-{res.items.reduce((ac, cv) => ac + cv.quantity, 0)} ยอดใช้จริง)
                      </button>
                    )}

                    {/* Handed Over actions (Return) accessible to Admin or Managers */}
                    {hasHandedOver && (
                      <button
                        onClick={() => {
                          if (confirm('ได้รับการส่งคืนพัสดุครบถ้วนสมบูรณ์แล้วหรือไม่? ขั้นตอนนี้จะบวกเติมอุปกรณ์กลับเข้าคลังอย่างปลอดภัย')) {
                            returnReservation(res.id);
                          }
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        ตรวจรับของคืนคลัง (+{res.items.reduce((ac, cv) => ac + cv.quantity, 0)} ยอดกลับคลัง)
                      </button>
                    )}

                    {/* Completed State */}
                    {res.status === 'Returned' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-950/20 text-emerald-400 border border-emerald-900 rounded-xl text-xs font-bold font-sans">
                        <CheckCircle2 size={14} />
                        <span>ปิดสัญญาเรียบร้อย</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REJECTION REASON DIALOG MODAL */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertOctagon size={16} className="text-rose-400" />
                <span>ระบุเหตุผลในการปฏิเสธคำขอใช้หนี้</span>
              </h3>
              <button
                onClick={() => setRejectId(null)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition cursor-pointer"
              >
                <XCircle size={16} />
              </button>
            </div>

            <form onSubmit={handleRejectConfirm} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">คำชี้แจงอาการ / ตารางทับซ้อน (ชี้ทางแก้ไขให้แพทย์ผู้ยืม)</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="เช่น อุปกรณ์มีผู้จอบซ้อนในวันดังกล่าว หรือ กล้องตัวผ่าตัดส่องทางกล้องกำลังส่งซ่อมบำรุงระยะยาว"
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectId(null)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl font-bold cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer text-xs transition animate-pulse"
                >
                  ยืนยันปฏิเสธเอกสารใบจอง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
