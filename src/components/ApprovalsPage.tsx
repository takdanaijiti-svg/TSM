import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  MessageSquare,
  Search,
  Building,
  CalendarDays,
  AlertOctagon,
  User,
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

  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Approved' | 'Handed Over' | 'Returned' | 'Rejected' | 'Disbursed'>('All');
  const [search, setSearch] = useState('');
  
  // Rejection Dialog State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Protect view check of RBAC
  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Manager')) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center max-w-lg mx-auto my-12">
        <AlertOctagon className="mx-auto text-rose-600 mb-2" size={36} />
        <h3 className="text-sm font-black text-slate-800">🚫 ขออภัย สิทธิ์ในการเข้าถึงหน้าควบคุมถูกปฏิเสธ</h3>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          หน้าจอควบคุมรายการอนุมัติระบบโสตฯ นี้ สงวนไว้สำหรับบุคลากรระดับ Admin และ Manager เท่านั้น
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

  // Filter reservations based on search text 
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-200/80 gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <FileCheck className="text-[#005a3c]" />
            <span>ศูนย์อนุมัติและควิบมิตรภาพเครื่องโสตฯ (AV Approval Hub)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            คัดกรองใบจอง ตรวจทานเป้าหมายเบิกใช้ และทำรายการปล่อยจ่ายของออกจากคลังพยาบาล (Handover) หรือเช็คของกลับเข้าคลัง (Return)
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-[#005a3c] font-black flex items-center gap-2 shadow-inner">
          <ShieldCheck size={14} />
          <span>ผู้มีสิทธิ์อนุมัติ: {currentUser.role}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col lg:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้จอง, แผนกแพทย์, วัตถุประสงค์ หรือเลขที่ใบอนุญาต..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#005a3c] focus:border-transparent placeholder-slate-400 font-bold"
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
            { id: 'Disbursed', label: '🧪 เบิกจ่ายพัสดุสิ้นเปลือง' },
            { id: 'Rejected', label: '❌ ปฏิเสธ' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border
                ${activeFilter === tab.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 hover:text-[#005a3c] hover:bg-slate-50 border-slate-250'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests list */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white border border-slate-200/80 p-16 rounded-2xl text-center text-slate-400 shadow-sm animate-pulse">
          <FileCheck size={40} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">ไม่มีรายการใบยืมที่มีสถานะตรงกับตัวกรองในขณะนี้</p>
          <p className="text-xs mt-1 text-slate-400 font-medium">เมื่อมีเจ้าหน้าที่ส่งสัญญายืมฉบับใหม่เข้ามา คำร้องขอจะแสดงที่นี่ทันที</p>
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
                  bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300
                  ${res.status === 'Pending' ? 'border-l-4 border-l-amber-500 border-slate-150' :
                    res.status === 'Approved' ? 'border-l-4 border-l-blue-500 border-slate-150' :
                    res.status === 'Handed Over' ? 'border-l-4 border-l-teal-500 border-slate-150' :
                    res.status === 'Returned' ? 'border-l-4 border-l-emerald-600 border-slate-150' :
                    res.status === 'Disbursed' ? 'border-l-4 border-l-purple-500 border-slate-150' :
                    'border-l-4 border-l-rose-500 border-slate-150'
                  }
                `}
              >
                {/* ID & Status Line */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 mb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-[#005a3c] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      เลขที่เอกสาร: #{res.id}
                    </span>
                    <span className="text-slate-300 text-xs">|</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                      <CalendarDays size={13} className="text-[#005a3c]" />
                      <span>วันที่บันทึกส่ง: {new Date(res.createdAt).toLocaleString('th-TH')}</span>
                    </div>
                  </div>

                  <span className={`text-[10.5px] font-black px-3 py-1 rounded-full border ${
                    res.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    res.status === 'Approved' ? 'bg-blue-550/10 bg-blue-50 text-blue-800 border-blue-200' :
                    res.status === 'Handed Over' ? 'bg-teal-50 text-teal-850 border-teal-200 text-teal-800' :
                    res.status === 'Returned' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    res.status === 'Disbursed' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                    'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {res.status === 'Pending' && '⏳ รอกรรมการประเมินอนุมัติ'}
                    {res.status === 'Approved' && '✅ อนุมัติแล้ว - รอส่งมอบพัสดุ'}
                    {res.status === 'Handed Over' && '📦 มีการรับของออกไปใช้งานแล้ว'}
                    {res.status === 'Returned' && '🔄 ของคืนเข้าคลังสมบูรณ์'}
                    {res.status === 'Disbursed' && '🧪 เบิกจ่ายวัสดุสิ้นเปลืองเรียบร้อย'}
                    {res.status === 'Rejected' && '❌ คำขอถูกไม่อนุมัติ'}
                  </span>
                </div>

                {/* Profiles & Target Pickups */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Column 1: Borrower Profile */}
                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[9.5px] text-slate-400 uppercase font-black block">ผู้ส่งเรื่องร้องขอ:</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-850 mt-1">
                      <User size={13} className="text-[#005a3c]" />
                      <span>{res.userName}</span>
                    </div>
                    <div className="text-slate-600 text-[10.5px] font-bold flex items-center gap-1.5 mt-0.5">
                      <Building size={12} className="text-slate-400" />
                      <span>สังกัด: {res.userDepartment}</span>
                    </div>
                  </div>

                  {/* Column 2: Date Pickups */}
                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80 justify-between flex flex-col">
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-black block">กำหนดการวันใช้พัสดุ:</span>
                      <div className="mt-1 text-slate-700 leading-normal font-bold">
                        <p className="flex justify-between">
                          <span className="text-slate-400 text-[11px] font-medium">วันรับครูภัณฑ์:</span>
                          <span className="font-mono text-[#005a3c]">{new Date(res.pickupTime).toLocaleString('th-TH')}</span>
                        </p>
                        <p className="flex justify-between border-t border-slate-200/50 pt-1 mt-1">
                          <span className="text-slate-400 text-[11px] font-medium">วันส่งพิกัดคืน:</span>
                          <span className="font-mono text-amber-600">
                            {res.returnTime ? new Date(res.returnTime).toLocaleString('th-TH') : 'ไม่ต้องคืน (วัสดุสิ้นเปลือง)'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Intent/Purpose */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-black block">นำไปใช้งานเพื่อ:</span>
                      <p className="text-[11px] text-slate-700 mt-1 leading-normal font-bold line-clamp-3" title={res.purpose}>
                        {res.purpose}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items and action buttons */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Hardware list */}
                  <div className="w-full sm:max-w-md">
                    <span className="text-[9.5px] font-black text-slate-400 tracking-wider uppercase block mb-1.5">ครุภัณฑ์ที่ร้องขอร่วมรายการ:</span>
                    <div className="space-y-1">
                      {res.items.map((itm, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs bg-slate-50 p-1.5 px-3 rounded-lg border border-slate-200 justify-between font-bold">
                          <span className="text-slate-600 truncate max-w-[280px]">{itm.equipmentName}</span>
                          <span className="font-mono font-black text-[#005a3c] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[11px]">
                            x{itm.quantity} ชุด
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Action triggers depending on states */}
                  <div className="flex flex-wrap gap-2 justify-end items-center self-end sm:self-center">
                    
                    {/* Rejection Log banner if rejected */}
                    {res.status === 'Rejected' && res.rejectionReason && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 flex items-start gap-1.5 max-w-sm font-bold">
                        <MessageSquare size={13} className="shrink-0 mt-0.5 text-rose-600" />
                        <span>เหตุผลปฏิเสธการสัญญายืม: "{res.rejectionReason}"</span>
                      </div>
                    )}

                    {/* Pending actions */}
                    {hasPending && (
                      <>
                        <button
                          onClick={() => handleOpenRejectDialog(res.id)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle size={13} />
                          ปฏิเสธคำขอ
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('คุณแน่ใจที่จะอนุมัติสัญญายืมใบนี้ใช่หรือเปล่า? คำขอจะปรับสถานะเตรียมเปิดจ่ายคลังสินค้าต่อไป')) {
                              approveReservation(res.id);
                            }
                          }}
                          className="px-3.5 py-2 bg-[#005a3c] hover:bg-[#004730] text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 size={13} />
                          อนุมัติใบคำขอ
                        </button>
                      </>
                    )}

                    {/* Approved actions (Handover) */}
                    {hasApproved && (
                      <button
                        onClick={() => {
                          if (confirm('ยืนยันบันทึกส่งพัสดุออกคลัง? ระบบจะหักยอดคงเหลือพร้อมยืมจริงลงเรียบร้อย')) {
                            handoverReservation(res.id);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-2 cursor-pointer"
                      >
                        <Truck size={14} className="animate-bounce" />
                        ส่งมอบพัสดุออกคลังจริง (-{res.items.reduce((ac, cv) => ac + cv.quantity, 0)} ยอดคงคลัง)
                      </button>
                    )}

                    {/* Handed Over actions (Return) */}
                    {hasHandedOver && (
                      <button
                        onClick={() => {
                          if (confirm('ตรวจรับพัสดุพ่วงคืนคลังพยาบาลเรียบร้อย ครบถ้วนตามรายการใบสัญญายืมสำเร็จ?')) {
                            returnReservation(res.id);
                          }
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-550 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        ตรวจรับของคืนคลัง (+{res.items.reduce((ac, cv) => ac + cv.quantity, 0)} เพิ่มยอดคลัง)
                      </button>
                    )}

                    {/* Completed State */}
                    {res.status === 'Returned' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-55 text-emerald-800 bg-[#e6f4ea] border border-emerald-200 rounded-xl text-xs font-black">
                        <CheckCircle2 size={14} className="text-[#005a3c]" />
                        <span>ปิดสัญญา ยืม-คืน สมบูรณ์</span>
                      </div>
                    )}

                    {res.status === 'Disbursed' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-black">
                        <CheckCircle2 size={14} className="text-purple-600" />
                        <span>เบิกจ่ายเสร็จสิ้น (สิ้นเปลือง)</span>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-rose-700 flex items-center gap-2">
                <AlertOctagon size={16} className="text-rose-600" />
                <span>ระบุเหตุผลในการปฏิเสธการอนุมัติ</span>
              </h3>
              <button
                onClick={() => setRejectId(null)}
                className="text-slate-450 hover:text-slate-800 p-1 rounded-lg transition cursor-pointer"
              >
                <XCircle size={16} />
              </button>
            </div>

            <form onSubmit={handleRejectConfirm} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-500 font-extrabold mb-1.5">เหตุผลความไม่เหมาะสม / ตารางซ้อนพัสดุ</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="ระบุสาเหตุเพื่อให้แพทย์ผู้ยืมรับทราบและแก้ไขใบคำขอได้อย่างถูกต้อง..."
                  className="w-full px-3 py-2 bg-slate-50 text-slate-800 border border-slate-250 rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-extrabold cursor-pointer text-xs transition"
                >
                  ปฏิเสธใบคำร้องนี้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
