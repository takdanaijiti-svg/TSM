import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileClock,
  ShoppingBag,
  Trash2,
  Calendar,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  User,
  Activity,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

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

  if (!currentUser) return null;

  const userReservations = reservations.filter(res => res.userId === currentUser.id);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const result = createReservation(purpose, pickupTime, returnTime);
    if (result.success) {
      setToast({ type: 'success', message: result.message });
      setPurpose('');
    } else {
      setToast({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="text-emerald-400" />
            รายการยืมของฉัน & จัดส่งใบจองเครื่องโสตฯ (My Cart & Requests)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ตรวจพัสดุในตะกร้า จัดทำรายละเอียดการขอยืม และติดตามการวินิจฉัยอนุมัติใบสัญญายืมอย่างใกล้ชิด
          </p>
        </div>

        <div className="px-3 py-1 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs text-emerald-400 font-bold">
          ตะกร้า: {cart.length} หมวดรายการ
        </div>
      </div>

      {toast && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-semibold ${
          toast.type === 'success' ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400' : 'bg-red-950/70 border-red-800 text-red-400'
        }`}>
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Cart & Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Cart Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-base font-bold font-sans text-white border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
              <span>ชิ้นพัสดุในตะกร้าเตรียมยืม (Cart Items)</span>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Trash2 size={13} />
                  ล้างตะกร้าทั้งหมด
                </button>
              )}
            </h3>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <ShoppingBag className="mx-auto text-slate-700 mb-2" size={32} />
                <p className="text-xs font-semibold">ไม่มีอุปกรณ์สะสมในตะกร้า</p>
                <p className="text-[11px] text-slate-600 mt-0.5">กรุณาไปที่ "คลังเสนออุปกรณ์โสตฯ" และเลือกหยิบใส่ตะกร้าเพื่อจอง</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cart.map((cartItm) => {
                  const eq = equipmentList.find(e => e.id === cartItm.equipmentId);
                  if (!eq) return null;

                  return (
                    <div key={cartItm.equipmentId} className="p-4 bg-slate-950 rounded-xl border border-slate-850/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-slate-900 rounded-lg p-2 shrink-0 border border-slate-800 flex items-center justify-center">
                          <img src={eq.image} alt="" className="max-h-full max-w-full" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{eq.name}</h4>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/40 inline-block mt-1 font-mono">
                            หมวดหมู่: {eq.category}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls inside Cart */}
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => updateCartQty(eq.id, cartItm.quantity - 1)}
                            className="text-slate-400 hover:text-white p-1 text-[11px] font-bold cursor-pointer"
                          >
                            [-]
                          </button>
                          <span className="text-xs font-mono font-bold text-slate-200 px-2">
                            {cartItm.quantity} ชิ้น
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(eq.id, cartItm.quantity + 1)}
                            className="text-slate-400 hover:text-white p-1 text-[11px] font-bold cursor-pointer"
                            disabled={cartItm.quantity >= eq.availableUnits}
                          >
                            [+]
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(eq.id)}
                          className="text-rose-400 hover:text-rose-300 p-2 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
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
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h3 className="text-base font-bold font-sans text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <Sparkles className="text-emerald-400 text-sm animate-pulse" />
                <span>จัดทำแบบคำขอใบจองโสตฯ (Checkout Form)</span>
              </h3>

              <form onSubmit={handleCheckout} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">วัตถุประสงค์ในการขอเช่าพัสดุ</label>
                  <textarea
                    required
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="เช่น จัดประชุม Grand Rounds หอประชุมใหญ่ศัลยกรรมตึก 3 หรือ บันทึกวิดีโอผ่าตัดส่องลำไส้ใหญ่ในการเรียนพยาบาลวิชาชีพ"
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">กำหนดการส่งมอบพัสดุ (วันรับของ)</label>
                    <input
                      type="datetime-local"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">กำหนดการส่งคืนพัสดุ (วันส่งของเข้าคลัง)</label>
                    <input
                      type="datetime-local"
                      required
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[10.5px] text-slate-500 bg-slate-950/40 p-2.5 rounded border border-slate-800">
                  <Info size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>การส่งเบิกยืมจะทำการลงชื่อของท่านในแแผนปฏิทิน และแจ้งเตือนไปยังแอร์บอร์ดผู้บริหาร เพื่อทำการส่งพิสูจน์คิวจองอุปกรณ์ต่อไป</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 font-bold text-white shadow-lg shadow-teal-950/30 rounded-xl cursor-pointer transition uppercase text-xs flex items-center justify-center gap-1.5"
                >
                  ส่งประเมินสัญญายืม (Submit Loan Request)
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Requests log / processing timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-sans text-white border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <span>ประวัติการเบิกยืมของฉัน (Request Logs)</span>
              <span className="text-[10px] bg-slate-800 font-mono px-2 py-0.5 font-bold rounded text-slate-400">
                {userReservations.length} ใบเสร็จ
              </span>
            </h3>

            {userReservations.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <FileClock className="mx-auto mb-2 text-slate-600 animate-pulse" size={28} />
                <p className="text-xs">ไม่พบคำขอยืมประวัติเก่า</p>
                <p className="text-[10px] text-slate-600 mt-1">คลังยังไม่มีประวัติการส่งคำร้องจากไอดีบุคลากรนี้</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {userReservations.map((res) => (
                  <div key={res.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">#{res.id}</span>
                      
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold inline-block border ${
                        res.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        res.status === 'Approved' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        res.status === 'Handed Over' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                        res.status === 'Returned' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {res.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-amber-300 font-mono flex items-center gap-1.5">
                      <Clock size={11} className="shrink-0" />
                      <span>{new Date(res.pickupTime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} {new Date(res.pickupTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2">
                      <span className="font-bold text-slate-500">เหตุประสงค์: </span>
                      {res.purpose}
                    </p>

                    {/* Rejection Note inside user view */}
                    {res.status === 'Rejected' && res.rejectionReason && (
                      <div className="bg-rose-950/20 border border-rose-900/40 p-2 rounded text-[10px] text-rose-300 leading-relaxed font-semibold">
                        เหตุผลปัดตก: "{res.rejectionReason}"
                      </div>
                    )}

                    {/* Hardware summary */}
                    <div className="text-[10.5px] space-y-1 bg-slate-900/50 p-2 rounded-lg border border-slate-900">
                      {res.items.map((itm, idx) => (
                        <div key={idx} className="flex justify-between items-center text-teal-400">
                          <span className="truncate max-w-[150px]">{itm.equipmentName.split(' ')[0]}</span>
                          <span className="font-mono text-slate-500">x{itm.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-3 mt-4 text-[10px] text-slate-500 leading-relaxed text-center font-sans">
            หากต้องการเลื่อนกำหนดการส่งคืน หรือยกเลิกใบจองที่อนุมัติแล้ว กรุณาเขียนคำจารึกชี้แจงโดยด่วนผ่านสายด่วนโทรศัพท์สตาฟโสตฯ
          </div>
        </div>
      </div>
    </div>
  );
};
