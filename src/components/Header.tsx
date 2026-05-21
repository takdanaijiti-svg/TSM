import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, Trash2, Calendar, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'success' | 'warn' | 'info' | 'danger';
  read: boolean;
}

export const Header: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const { currentUser, reservations, equipmentList, settings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('av_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save read state to local storage
  useEffect(() => {
    localStorage.setItem('av_read_notifications', JSON.stringify(readIds));
  }, [readIds]);

  if (!currentUser) return null;

  // Compile notification feed dynamically
  const generatedList: NotificationItem[] = [];

  // Current system base time context: 2026-05-20T08:06:05Z
  const CURRENT_TIME = new Date('2026-05-20T08:06:05Z');

  // 1. Staff Specific Status Reminders
  const myReservations = reservations.filter(res => res.userId === currentUser.id);
  myReservations.forEach(res => {
    // Approved notices
    if (res.status === 'Approved') {
      generatedList.push({
        id: `approve-${res.id}`,
        title: 'คำยืมได้รับการอนุมัติแล้ว',
        message: `รายการจอง #${res.id} (${res.purpose}) ผ่านตรวจอนุมัติหลักการแล้ว พัสดุพร้อมเบิกรับกายภาพ`,
        timestamp: res.createdAt,
        type: 'success',
        read: readIds.includes(`approve-${res.id}`)
      });
    }
    // Rejected notices
    if (res.status === 'Rejected') {
      generatedList.push({
        id: `reject-${res.id}`,
        title: 'ใบจองพัสดุถูกปฏิเสธสิทธิ์',
        message: `คำขอ #${res.id} ไม่ได้รับการอนุมัติ ปัจจัย: ${res.rejectionReason || 'ไม่พิจารณาเป็นของใช้สิ้นเปลืองจำเป็นหลัก'}`,
        timestamp: res.createdAt,
        type: 'danger',
        read: readIds.includes(`reject-${res.id}`)
      });
    }
    // Handed over notices
    if (res.status === 'Handed Over') {
      generatedList.push({
        id: `handover-${res.id}`,
        title: 'ส่งมอบพัสดุนอกคลังแล้ว',
        message: `รายการ #${res.id} ออกจดจำหน่ายในความดูแลของหน่วยงานท่านแล้ว ณ พิกัดบริการแอดมิน`,
        timestamp: res.createdAt,
        type: 'info',
        read: readIds.includes(`handover-${res.id}`)
      });
    }
  });

  // 2. Return due reminders (Nearing deadlines inside 48 hours or Overdue)
  reservations.forEach(res => {
    if (res.status === 'Handed Over' && res.returnTime) {
      const returnDate = new Date(res.returnTime);
      const timeDiff = returnDate.getTime() - CURRENT_TIME.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      if (daysDiff < 0) {
        generatedList.push({
          id: `overdue-${res.id}`,
          title: '🚨 พัสดุค้างส่งคืนเลยกำหนดเวลา!',
          message: `ใบขอยืม #${res.id} ของคุณ "${res.userName}" เกินกำหนดส่งมอบกลับคลังโรงพยาบาล วันกำหนดคืน (${res.returnTime})`,
          timestamp: res.returnTime,
          type: 'danger',
          read: readIds.includes(`overdue-${res.id}`)
        });
      } else if (daysDiff <= 2) {
        generatedList.push({
          id: `due-soon-${res.id}`,
          title: '⚠️ ครบกำหนดเวลาคืนพัสดุใกล้ตัว',
          message: `ใบขอยืม #${res.id} กำหนดคืนคืนภายในเร็ววัน (${res.returnTime})`,
          timestamp: res.returnTime,
          type: 'warn',
          read: readIds.includes(`due-soon-${res.id}`)
        });
      }
    }
  });

  // 3. Admin / Manager Alerts (Pending reservation requests, Repair notifications)
  if (['Admin', 'Manager'].includes(currentUser.role)) {
    const pendingRequests = reservations.filter(res => res.status === 'Pending');
    pendingRequests.forEach(req => {
      generatedList.push({
        id: `pending-${req.id}`,
        title: '📥 คำร้องขอยืมใหม่รอตรวจอนุมัติ',
        message: `ผู้ใช้ "${req.userName}" เสนอยาเบิกยืมห้องประชุม วัตถุประสงค์เพื่อ: "${req.purpose}"`,
        timestamp: req.createdAt,
        type: 'info',
        read: readIds.includes(`pending-${req.id}`)
      });
    });

    const repairItems = equipmentList.filter(eq => eq.status === 'Under Repair');
    repairItems.forEach(item => {
      generatedList.push({
        id: `repair-${item.id}`,
        title: '🛠️ รายงานชำรุดรอทีมช่างแก้ไข',
        message: `เครื่อง "${item.name}" มีการส่งเคลมอาการซ่อม: ${item.repairNotes || 'เสียหายเบื้องต้น'}`,
        timestamp: CURRENT_TIME.toISOString(),
        type: 'warn',
        read: readIds.includes(`repair-${item.id}`)
      });
    });
  }

  // Sort: unread first, then newest timestamp
  const notifications = generatedList.sort((a, b) => {
    if (a.read && !b.read) return 1;
    if (!a.read && b.read) return -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(prev => Array.from(new Set([...prev, ...allIds])));
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readIds.includes(id)) {
      setReadIds(prev => prev.filter(item => item !== id));
    } else {
      setReadIds(prev => [...prev, id]);
    }
  };

  const handleClearReads = () => {
    setReadIds([]);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200/80 px-5 py-4 rounded-2xl shadow-sm gap-4 relative">
      <div>
        <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-[#e6f4ea] px-3 py-1 rounded-full w-fit">
          <ShieldCheck size={12} />
          <span>ระบบรักษาความปลอดภัยพัสดุเสมือนจริง</span>
        </div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight mt-1">
          {activeTab === 'dashboard' && 'แผงควบคุมสถิติสรุป (Main Dashboard)'}
          {activeTab === 'equipment' && 'คลังอุปกรณ์โสตและรายงานชำรุด (AV Catalog)'}
          {activeTab === 'my-requests' && 'รายการใบยื่นยืมของฉัน (My Requests)'}
          {activeTab === 'approvals' && 'ตารางการตรวจสิทธิ์อนุมัติ (Manager Approvals)'}
          {activeTab === 'calendar' && 'ปฏิทินส่งคืนครุภัณฑ์ (Due Timeline)'}
          {activeTab === 'staff-directory' && 'ทำเนียบแต่งตั้งและทีมบุคลากร (Staff Hub)'}
          {activeTab === 'settings' && 'ค่าระบบและระบบตรวจสอบบัญชี (System Auditing)'}
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          ยินดีต้อนรับผู้ใช้: <strong className="text-slate-600 font-extrabold">{currentUser.name}</strong> ({currentUser.email})
        </p>
      </div>

      {/* Bell alert notifications dropdown button */}
      <div className="relative self-end sm:self-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer flex items-center justify-center text-slate-600"
          title="แจ้งเตือนด่วนภายในระบบ"
        >
          <Bell size={18} className={unreadCount > 0 ? "text-rose-500 animate-bounce" : ""} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono font-black border-2 border-white rounded-full min-w-[20px] h-5 text-[9px] flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden animate-fadeIn text-xs">
              
              {/* Dropdown Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Bell size={14} className="text-emerald-700" />
                  <span>กล่องแจ้งเตือนภัยระบบ ({notifications.length})</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="text-[10px] font-black text-emerald-700 hover:underline cursor-pointer disabled:opacity-40 disabled:no-underline"
                  >
                    อ่านข้อมูลทั้งหมด
                  </button>
                  {readIds.length > 0 && (
                    <button
                      onClick={handleClearReads}
                      className="text-[10px] text-rose-600 hover:underline cursor-pointer font-black"
                    >
                      ล้างปุ่มอ่าน
                    </button>
                  )}
                </div>
              </div>

              {/* Feed lists */}
              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    <Info size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-xs text-slate-700">ไม่มีสิ่งแจ้งเตือนใหม่ในระบบ</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">ระบบจะคอยรายงานความคลาดเคลื่อน อัปเดต และตารางซ่อมแซมให้คุณทันที</p>
                  </div>
                ) : (
                  notifications.map(item => {
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 transition-all flex gap-2.5 items-start relative ${
                          item.read ? 'bg-white opacity-70' : 'bg-emerald-50/40 border-l-2 border-emerald-500'
                        }`}
                      >
                        {/* Status Classification indicators */}
                        <div className="shrink-0 mt-0.5">
                          {item.type === 'success' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                          )}
                          {item.type === 'danger' && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 block animate-ping" />
                          )}
                          {item.type === 'warn' && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                          )}
                          {item.type === 'info' && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                          )}
                        </div>

                        {/* Text detail block */}
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-1.5 font-extrabold text-[11px]">
                            <span className={`${item.read ? 'text-slate-600' : 'text-slate-800'}`}>{item.title}</span>
                            <span className="text-[9px] text-slate-400 font-mono font-medium">
                              {new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium text-[10.5px] leading-relaxed">
                            {item.message}
                          </p>
                        </div>

                        {/* Interactive trigger checks */}
                        <button
                          onClick={(e) => handleToggleRead(item.id, e)}
                          className={`shrink-0 p-1 rounded-md border border-slate-200 cursor-pointer ${
                            item.read ? 'text-slate-300 bg-slate-50' : 'text-[#005a3c] bg-white hover:bg-slate-55'
                          }`}
                          title={item.read ? "ทำเครื่องหมายว่ายังไม่ได้อ่าน" : "ทำเครื่องหมายว่าอ่านแล้ว"}
                        >
                          <Check size={10} className={item.read ? "" : "stroke-[3px]"} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown footer info */}
              <div className="p-2.5 bg-slate-50 border-t text-center text-[10px] font-bold text-slate-400">
                <span>แสดงพัสดุและเวลาสรุปสถิติล่าสุด</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
