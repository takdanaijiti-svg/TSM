import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Reservation } from '../types';
import {
  FileClock,
  ShoppingBag,
  Trash2,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Printer,
  QrCode,
  Download,
  ShieldCheck,
  Check,
  X,
  FileText
} from 'lucide-react';
import { playBeep } from '../utils/audio';

export const MyRequestsPage: React.FC = () => {
  const {
    cart,
    equipmentList,
    updateCartQty,
    removeFromCart,
    clearCart,
    createReservation,
    reservations,
    currentUser
  } = useApp();

  const [purpose, setPurpose] = useState('');
  const [pickupTime, setPickupTime] = useState('2026-05-20T09:00');
  const [returnTime, setReturnTime] = useState('2026-05-20T17:00');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cool interactive states for slip mockup & QR sticker simulator
  const [selectedResForReceipt, setSelectedResForReceipt] = useState<Reservation | null>(null);
  const [selectedResForQR, setSelectedResForQR] = useState<Reservation | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!currentUser) return null;

  const userReservations = reservations.filter(res => res.userId === currentUser.id);
  const cartEquipment = cart.map(cartItm => equipmentList.find(e => e.id === cartItm.equipmentId));
  const hasLoanable = cartEquipment.some(eq => eq && eq.category !== 'Consumables');

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const result = createReservation(purpose, pickupTime, hasLoanable ? returnTime : '');
    if (result.success) {
      setToast({ type: 'success', message: result.message });
      setPurpose('');
      playBeep('success');
    } else {
      setToast({ type: 'error', message: result.message });
      playBeep('error');
    }
  };

  const openReceiptModal = (res: Reservation) => {
    playBeep('click');
    setSelectedResForReceipt(res);
  };

  const openQRModal = (res: Reservation) => {
    playBeep('click');
    setSelectedResForQR(res);
  };

  const handleSimulatePrint = () => {
    playBeep('success');
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      alert("🖨️ จำลองส่งเอกสารสิทธิ์ไปยังเครื่องพิมพ์สติกเกอร์และใบจ่ายพัสดุระบบความร้อน (Thermal Printer) เรียบร้อย!");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-200/80 gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingBag className="text-[#005a3c]" />
            <span>รายการยืมของฉัน & ส่งใบจองเครื่องโสตฯ (AV Cart & Requests)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            ตรวจครุภัณฑ์ในตะกร้าส่วนตัวของท่าน กรอกวัตถุประสงค์ในการจอง และติดตามการวิเคราะห์อนุมัติใบยืมได้ทันที
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-[#e6f4ea] border border-emerald-100 rounded-xl text-xs text-[#005a3c] font-black">
          ตะกร้าสะสม: {cart.length} หมวดพัสดุ
        </div>
      </div>

      {toast && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-black shadow-sm ${
          toast.type === 'success' ? 'bg-[#e6f4ea] border-emerald-200 text-[#005a3c]' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Cart & Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Cart Section */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
              <span>ชิ้นพัสดุสะสมสะสมในตะกร้า (Cart Items)</span>
              {cart.length > 0 && (
                <button
                  onClick={() => { playBeep('click'); clearCart(); }}
                  className="text-xs text-rose-600 hover:text-rose-500 flex items-center gap-1 cursor-pointer font-black transition-all"
                >
                  <Trash2 size={13} />
                  ล้างตะกร้าทั้งหมด
                </button>
              )}
            </h3>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingBag className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-xs font-semibold">ยังไม่มีพัสดุสะสมในตะกร้า</p>
                <p className="text-[11px] text-slate-400 mt-0.5">กรุณาไปที่ "คลังอุปกรณ์โสตฯ" และเลือกหยิบใส่ตะกร้าเพื่อเตรียมจอง</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((cartItm) => {
                  const eq = equipmentList.find(e => e.id === cartItm.equipmentId);
                  if (!eq) return null;

                  return (
                    <div key={cartItm.equipmentId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white rounded-lg p-2 shrink-0 border border-slate-200 flex items-center justify-center">
                          <img src={eq.image} alt="" className="max-h-full max-w-full hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800">{eq.name}</h4>
                          <span className="text-[9.5px] text-[#005a3c] font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50 inline-block mt-1 font-mono">
                            หมวดพัสดุ: {eq.category}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls inside Cart */}
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => { playBeep('click'); updateCartQty(eq.id, cartItm.quantity - 1); }}
                            className="text-slate-505 hover:text-[#005a3c] px-1.5 font-bold cursor-pointer text-xs focus:outline-none"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono font-black text-slate-700 px-1">
                            {cartItm.quantity} ชิ้น
                          </span>
                          <button
                            type="button"
                            onClick={() => { playBeep('click'); updateCartQty(eq.id, cartItm.quantity + 1); }}
                            className="text-slate-500 hover:text-[#005a3c] px-1.5 font-bold cursor-pointer text-xs disabled:opacity-35 focus:outline-none"
                            disabled={cartItm.quantity >= eq.availableUnits}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => { playBeep('click'); removeFromCart(eq.id); }}
                          className="text-rose-600 hover:text-rose-500 p-2 text-xs font-black transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          เอาออก
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checkout Specs Form only display when cart has item */}
          {cart.length > 0 && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Sparkles className="text-[#005a3c] text-sm animate-pulse" />
                <span>จัดทำแบบคำขอใบจองเครื่องโสตฯ (Checkout Form)</span>
              </h3>

              <form onSubmit={handleCheckout} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-500 font-black mb-1.5">วัตถุประสงค์ในการเสนอขอใช้อุปกรณ์</label>
                  <textarea
                    required
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="เช่น จัดโครงการอบรมวินิจฉัยหัวใจล้มเหลวด่วน หอประชุมใหญ่ศัลยกรรมแพทย์ ตึก 2 ชั้น 3 ทักษะวิชาชีพ"
                    className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                  />
                </div>

                <div className={hasLoanable ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                  <div>
                    <label className="block text-slate-500 font-black mb-1.5">
                      {hasLoanable ? "กำหนดการรับอุปกรณ์พัสดุ (วันเข้ารับ)" : "กำหนดการรับพัสดุสิ้นเปลือง (วันเบิกจ่าย)"}
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-mono font-bold"
                    />
                  </div>

                  {hasLoanable && (
                    <div>
                      <label className="block text-slate-500 font-black mb-1.5">กำหนดการคืนอุปกรณ์เข้าคลังตรวจรับ</label>
                      <input
                        type="datetime-local"
                        required
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-mono font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-[#e6f4ea] p-2.5 rounded border border-emerald-100 font-bold leading-normal">
                  <Info size={14} className="text-[#005a3c] shrink-0 mt-0.5" />
                  <span>การส่งเรื่องขอยืมจะทำการทำคิวจองบนแผนผังปฏิทินโรงพยาบาล และแจ้งเตือนไปยังฝ่ายอนุมัติเพื่อพิจารณาความพร้อม ทันที</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 font-black text-white shadow-sm rounded-xl cursor-pointer transition text-xs flex items-center justify-center gap-1.5"
                >
                  {hasLoanable ? "ส่งคำเสนอใบจองยืมครุภัณฑ์" : "ส่งใบเสร็จอนุมัติเบิกพัสดุสิ้นเปลือง"}
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Requests log / processing timeline */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <span>ทะเบียนการยืมของฉัน (Request Logs)</span>
              <span className="text-[9px] bg-slate-100 font-mono px-2 py-0.5 font-bold rounded text-slate-500">
                {userReservations.length} แฟ้มจอง
              </span>
            </h3>

            {userReservations.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileClock className="mx-auto mb-2 text-slate-300 animate-pulse" size={28} />
                <p className="text-xs">ไม่พบแฟ้มประวัติการสัญญายืมในอดีต</p>
                <p className="text-[10px] text-slate-400 mt-1">คลังยังไม่มีใบคำขอที่ได้รับการยื่นประเมินจากท่านในระบบเบื้องต้น</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {userReservations.map((res) => (
                  <div key={res.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 shadow-inner hover:border-emerald-200 transition duration-150">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] text-[#005a3c] font-black bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">#{res.id}</span>
                      
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-black inline-block border ${
                        res.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        res.status === 'Approved' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        res.status === 'Handed Over' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                        res.status === 'Returned' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {res.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-emerald-800 font-mono flex items-center gap-1.5 font-bold">
                      <Clock size={11} className="shrink-0 text-[#005a3c]" />
                      <span>{new Date(res.pickupTime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} {new Date(res.pickupTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-bold leading-normal">
                      <span className="font-extrabold text-slate-400">ประสงค์ใช้: </span>
                      {res.purpose}
                    </p>

                    {/* Rejection Note inside user view if rejected */}
                    {res.status === 'Rejected' && res.rejectionReason && (
                      <div className="bg-rose-50 border border-rose-150 p-2.5 rounded text-[10px] text-rose-800 leading-normal font-bold">
                        หมายเหตุชี้แจง: "{res.rejectionReason}"
                      </div>
                    )}

                    {/* Hardware summary */}
                    <div className="text-[10.5px] space-y-1 bg-white p-2 rounded-lg border border-slate-200">
                      {res.items.map((itm, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[#005a3c] font-black">
                          <span className="truncate max-w-[150px]">{itm.equipmentName.split(' ')[0]}</span>
                          <span className="font-mono text-slate-500">x{itm.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Highly Interactive Actions: Print Thermal & Quick Barcode QR */}
                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => openReceiptModal(res)}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-slate-200/50"
                      >
                        <Printer size={11} />
                        🧾 สลิปส่งยืม
                      </button>
                      <button
                        onClick={() => openQRModal(res)}
                        className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-[#005a3c] font-extrabold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-emerald-150"
                      >
                        <QrCode size={11} />
                        📱 สติกเกอร์ QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 leading-normal text-center font-medium">
            หากต้องการติดต่อขอเลื่อนตารางเวลา หรือชี้แจงสถานการณ์พัสดุเป็นกรณีฉุกเฉิน กรุณาติดต่อสายด่วนสตาฟผู้ควบคุมโดยตรงที่ห้องโสตฯ
          </div>
        </div>
      </div>

      {/* 1. THERMAL PRINT SLIP SIMULATOR MODAL */}
      {selectedResForReceipt && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#f0f0f0] rounded-2xl p-6 max-w-sm w-full border border-slate-300 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button
              onClick={() => { playBeep('click'); setSelectedResForReceipt(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white shadow rounded-full p-1.5 cursor-pointer z-10 transition-all"
            >
              <X size={15} />
            </button>

            <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest text-center uppercase block mb-3">
              🏥 RECEIPT PRINTER THERMAL LAYOUT
            </span>

            {/* Thermal Slip Body */}
            <div className="bg-white border border-slate-300 rounded shadow-md p-5 font-mono text-[10.5px] text-slate-800 space-y-4 overflow-y-auto flex-1 select-none">
              
              {/* Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-350">
                <span className="font-extrabold text-xs block text-slate-950">
                  รพ.สมเด็จพระเจ้าตากสินมหาราช
                </span>
                <span className="text-[9px] text-slate-500 block">
                  กลุ่มงานเทคโนโลยีสารสนเทศเพื่อสุขภาพ
                </span>
                <span className="text-[8.5px] text-slate-400 block font-bold">
                  TEL: 055-511024
                </span>
              </div>

              {/* Patient/Staff specs */}
              <div className="space-y-1 pb-3 border-b border-dashed border-slate-350">
                <div><span className="text-slate-400">ใบคำสั่งจอง:</span> #{selectedResForReceipt.id}</div>
                <div><span className="text-slate-400">ผู้ยื่นเสนอ:</span> {selectedResForReceipt.userName}</div>
                <div><span className="text-slate-400">สังกัดฝ่าย:</span> {selectedResForReceipt.userDepartment}</div>
                <div><span className="text-slate-400">สถานะจอง:</span> <span className="underline font-black">{selectedResForReceipt.status}</span></div>
                <div><span className="text-slate-400">พิมพ์สดเมื่อ:</span> {new Date().toLocaleString('th-TH')}</div>
              </div>

              {/* Items listing */}
              <div className="space-y-1.5 py-1">
                <div className="flex justify-between font-black text-slate-950 border-b pb-1 mb-1 text-[9px]">
                  <span>รายการครุภัณฑ์โสตฯ</span>
                  <span>จำนวน</span>
                </div>
                {selectedResForReceipt.items.map((itm, i) => (
                  <div key={i} className="flex justify-between items-start leading-tight">
                    <span className="w-40 truncate">{i+1}. {itm.equipmentName}</span>
                    <span className="font-black">x{itm.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Purpose block */}
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[9px] leading-relaxed text-slate-550">
                <strong className="text-slate-700 font-black">จุดประสงค์ใช้งาน:</strong> "{selectedResForReceipt.purpose}"
              </div>

              {/* Barcode representation using CSS blocks */}
              <div className="text-center pt-2 space-y-1 pb-1 border-t border-dashed border-slate-350">
                <div className="flex justify-center items-center h-8 bg-white overflow-hidden gap-px">
                  {[2,3,1,2,4,1,3,2,1,2,3,4,1,2,3,1,2,3,2,1,4,3,2,1,2,3,4,1,2].map((w, idx) => (
                    <div key={idx} className="bg-slate-950 h-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <span className="text-[8.5px] font-bold text-slate-400 block tracking-widest font-mono">
                  *{selectedResForReceipt.id}-TAKSHIN*
                </span>
              </div>

              {/* Signatures placeholder */}
              <div className="grid grid-cols-2 gap-4 pt-4 text-[8.5px] text-center">
                <div className="space-y-4">
                  <span className="block border-b border-slate-300 h-4"></span>
                  <span className="text-slate-400 font-bold block">(พนักงานผู้รับของ)</span>
                </div>
                <div className="space-y-4">
                  <span className="block border-b border-slate-300 h-4"></span>
                  <span className="text-slate-400 font-bold block">(เจ้าหน้าที่ส่งมอบ)</span>
                </div>
              </div>

              <div className="text-center font-bold text-[8px] text-slate-400 pt-3 border-t">
                *** ขอบคุณสำหรับการประสานงานโสตฯ ***
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSimulatePrint}
                disabled={isPrinting}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.98]"
              >
                <Printer size={13} className={isPrinting ? 'animate-spin' : ''} />
                <span>{isPrinting ? 'กำลังพิมพ์...' : 'สั่งพิมพ์สลิปจริง (Thermal Print)'}</span>
              </button>
              <button
                onClick={() => { playBeep('click'); setSelectedResForReceipt(null); }}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-bold cursor-pointer hover:bg-slate-50 transition-all"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC QR STICKER & IDENTIFIER MODEL */}
      {selectedResForQR && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#121c17] rounded-2xl p-6 max-w-sm w-full border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col">
            <button
              onClick={() => { playBeep('click'); setSelectedResForQR(null); }}
              className="absolute top-4 right-4 text-emerald-400/60 hover:text-emerald-300 bg-emerald-950/40 rounded-full p-1.5 cursor-pointer transition-all border border-emerald-500/20"
            >
              <X size={15} />
            </button>

            <span className="text-[10px] text-emerald-400 font-mono font-black tracking-widest text-center uppercase block mb-3 animate-pulse">
              📱 DYNAMIC QR-CODE STICKER COUPLING
            </span>

            <div className="bg-white border-2 border-emerald-500/25 rounded-2xl p-5 text-center space-y-4 relative">
              {/* Badge Overlay */}
              <div className="absolute top-2 left-2 bg-[#005a3c] text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">
                VERIFIED LAPEL
              </div>

              {/* Header inside White area */}
              <div className="space-y-0.5 pt-2">
                <span className="font-extrabold text-xs block text-slate-800 tracking-tight leading-tight">
                  ใบส่งตรวจรับครุภัณฑ์โสตฯ 🏥
                </span>
                <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono tracking-wider">
                  #{selectedResForQR.id} • {selectedResForQR.userName.split(' ')[0]}
                </span>
              </div>

              {/* Vector SVG generated clean QR-Code representation */}
              <div className="flex justify-center py-2 relative">
                <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white transition-all shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-36 h-36">
                    {/* Corners outer squares */}
                    <rect x="0" y="0" width="30" height="30" fill="#005a3c" />
                    <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="10" width="10" height="10" fill="#005a3c" />

                    <rect x="70" y="0" width="30" height="30" fill="#005a3c" />
                    <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="80" y="10" width="10" height="10" fill="#005a3c" />

                    <rect x="0" y="70" width="30" height="30" fill="#005a3c" />
                    <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="80" width="10" height="10" fill="#005a3c" />

                    {/* Small alignment block */}
                    <rect x="75" y="75" width="10" height="10" fill="#005a3c" />

                    {/* Simulated Random Pixel Matrix using SVG elements */}
                    <rect x="35" y="5" width="10" height="5" fill="#005a3c" />
                    <rect x="50" y="0" width="5" height="15" fill="#005a3c" />
                    <rect x="60" y="10" width="5" height="5" fill="#005a3c" />
                    <rect x="35" y="20" width="15" height="5" fill="#005a3c" />
                    
                    <rect x="5" y="35" width="5" height="15" fill="#005a3c" />
                    <rect x="15" y="45" width="15" height="5" fill="#005a3c" />
                    <rect x="5" y="55" width="10" height="5" fill="#005a3c" />

                    <rect x="35" y="35" width="30" height="10" fill="#005a3c" />
                    <rect x="35" y="50" width="10" height="15" fill="#005a3c" />
                    <rect x="55" y="50" width="5" height="15" fill="#005a3c" />
                    <rect x="45" y="60" width="10" height="5" fill="#005a3c" />

                    <rect x="75" y="35" width="15" height="10" fill="#005a3c" />
                    <rect x="70" y="55" width="15" height="5" fill="#005a3c" />
                    <rect x="85" y="45" width="10" height="15" fill="#005a3c" />

                    <rect x="35" y="75" width="15" height="5" fill="#005a3c" />
                    <rect x="55" y="70" width="10" height="10" fill="#005a3c" />
                    <rect x="40" y="85" width="5" height="15" fill="#005a3c" />
                    <rect x="55" y="85" width="15" height="5" fill="#005a3c" />
                  </svg>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl text-[9.5px] leading-relaxed font-bold border border-emerald-100/50">
                💡 คำแนะนำ: พนักงานผู้ตรวจรับของสามารถแสดงหน้าจอ QR Code ของครุภัณฑ์ชิ้นนี้ แก่แผนกประสานงานโสตแพทย์เพื่อทำการสแกนยึดครองสิทธิ์ Handover เข้ามือท่านแบบอัตโนมัติ โดยไม่ค้างกระดาษเลย!
              </div>
            </div>

            {/* Quick Actions for Sticker Download visualization */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { playBeep('success'); alert("📸 จำลองบันทึกภาพสติกเกอร์บิลความปลอดภัย QR-Code ลงโทรศัพท์ของคุณ เรียบร้อย!"); }}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold cursor-pointer transition flex items-center justify-center gap-1 shadow-md"
              >
                <Download size={13} />
                บันทึกคิวภาพ QR
              </button>
              <button
                onClick={() => { playBeep('click'); setSelectedResForQR(null); }}
                className="py-2.5 bg-[#1f2e26] border border-emerald-500/20 hover:bg-[#283b31] text-emerald-400 rounded-xl font-bold cursor-pointer transition"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
