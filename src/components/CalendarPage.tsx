import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Reservation, Equipment } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, Clock, AlertCircle, RefreshCw, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { reservations, equipmentList } = useApp();
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 4 = May (0-indexed)

  const monthNames = [
    'มกราคม (January)', 'กุมภาพันธ์ (February)', 'มีนาคม (March)', 'เมษายน (April)',
    'พฤษภาคม (May)', 'มิถุนายน (June)', 'กรกฎาคม (July)', 'สิงหาคม (August)',
    'กันยายน (September)', 'ตุลาคม (October)', 'พฤศจิกายน (November)', 'ธันวาคม (December)'
  ];

  const daysOfWeek = ['อา. (Sun)', 'จ. (Mon)', 'อ. (Tue)', 'พ. (Wed)', 'พฤ. (Thu)', 'ศ. (Fri)', 'ส. (Sat)'];

  // Helper: Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get starting day of week
  const getStartDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getStartDayOfWeek(currentYear, currentMonth);

  // Generate blank preceding items for calendar grid alignment
  const blankDays = Array(startDay).fill(null);
  
  // Day array: [1, 2, 3, ... 31]
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // States for interactive tooltip / select details
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [activeTooltipReservations, setActiveTooltipReservations] = useState<Reservation[]>([]);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedDay, setSelectedDay] = useState<number | null>(20); // Default to 20 for convenient initial view

  // Identify reservations active on a given day
  const getReservationsForDay = (day: number): Reservation[] => {
    return reservations.filter(res => {
      const pickupDateObj = new Date(res.pickupTime);
      const returnDateObj = new Date(res.returnTime);
      
      // Calculate start and end ranges ignoring timezone nuances for precise calendar tracking
      const targetDate = new Date(currentYear, currentMonth, day);
      
      // Zero out hours for full-day comparisons
      const dTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
      const dPickup = new Date(pickupDateObj.getFullYear(), pickupDateObj.getMonth(), pickupDateObj.getDate()).getTime();
      const dReturn = new Date(returnDateObj.getFullYear(), returnDateObj.getMonth(), returnDateObj.getDate()).getTime();
      
      return dTarget >= dPickup && dTarget <= dReturn;
    });
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const handleDayMouseEnter = (day: number, e: React.MouseEvent) => {
    const dayReservations = getReservationsForDay(day);
    setHoveredDay(day);
    setActiveTooltipReservations(dayReservations);
    
    // Set tooltip coordinate offsets
    const rect = e.currentTarget.getBoundingClientRect();
    const parentContainer = document.getElementById('calendar-container')?.getBoundingClientRect();
    const parentLeft = parentContainer?.left || 0;
    const parentTop = parentContainer?.top || 0;
    
    setTooltipPos({
      x: rect.left - parentLeft + rect.width / 2,
      y: rect.top - parentTop - 12
    });
  };

  const handleDayMouseLeave = () => {
    setHoveredDay(null);
    setActiveTooltipReservations([]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="text-emerald-400" />
            ปฏิทินตรวจเช็ครายการจองเครื่องโสตฯ (Interactive AV Calendar)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            สืบค้นตารางความหนาแน่นการใช้งาน และตรวจสอบเวลาทับซ้อนของยุทโธปกรณ์ผ่านระบบแผนปฏิทิน
          </p>
        </div>
        
        {/* Quick Instructions Badge */}
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-3.5 py-2 rounded-xl">
          <Info size={14} className="animate-bounce" />
          <span>ชี้เมาส์ (Hover) ที่วันเพื่อเปิด Tooltip ตรวจใบคำขอ | คลิกที่วันเพื่อล็อคดูรายละเอียด</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Calendar Grid Panel */}
        <div id="calendar-container" className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative">
          
          {/* Month Navigator Controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-bold font-sans text-emerald-400">
                {monthNames[currentMonth]}
              </h3>
              <p className="text-xs text-slate-400 font-mono font-medium mt-0.5">ค.ศ. {currentYear}</p>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2 border-b border-slate-800/60 pb-3">
            {daysOfWeek.map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
            {/* Render blank spaces */}
            {blankDays.map((_, idx) => (
              <div key={`blank-${idx}`} className="aspect-[4/3] rounded-xl bg-slate-950/20" />
            ))}

            {/* Render realistic days */}
            {monthDays.map(day => {
              const dayReservations = getReservationsForDay(day);
              const hasReservations = dayReservations.length > 0;
              const isSelected = selectedDay === day;
              
              // Color schemes depending on statuses of events
              const hasPending = dayReservations.some(r => r.status === 'Pending');
              const hasApproved = dayReservations.some(r => r.status === 'Approved');
              const hasHandedOver = dayReservations.some(r => r.status === 'Handed Over');
              const hasReturned = dayReservations.some(r => r.status === 'Returned');

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  onMouseEnter={(e) => handleDayMouseEnter(day, e)}
                  onMouseLeave={handleDayMouseLeave}
                  className={`
                    aspect-[4/3] relative rounded-xl border p-2 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none
                    ${dayReservations.length > 0 
                      ? 'bg-slate-800/40 border-slate-700 hover:border-emerald-500 hover:bg-slate-800' 
                      : 'bg-slate-950 border-slate-800/50 hover:border-teal-800/80 hover:bg-slate-900/40'
                    }
                    ${isSelected ? 'ring-2 ring-emerald-500 border-transparent bg-slate-800' : ''}
                  `}
                >
                  <span className={`
                    absolute top-1.5 left-2 text-xs font-bold font-mono transition-colors
                    ${isSelected ? 'text-emerald-400 font-extrabold text-sm' : 'text-slate-400'}
                  `}>
                    {day}
                  </span>

                  {/* Indicators inside the box */}
                  {hasReservations && (
                    <div className="mt-5 flex flex-wrap gap-1 items-end min-h-[14px]">
                      {dayReservations.slice(0, 3).map((res, index) => {
                        const styleMap = {
                          Pending: 'bg-amber-500',
                          Approved: 'bg-blue-500',
                          'Handed Over': 'bg-teal-500',
                          Returned: 'bg-emerald-500',
                          Rejected: 'bg-rose-500'
                        };
                        return (
                          <span
                            key={`${res.id}-${index}`}
                            className={`w-1.5 h-1.5 rounded-full ${styleMap[res.status] || 'bg-slate-400'}`}
                            title={`${res.userName}: ${res.status}`}
                          />
                        );
                      })}
                      {dayReservations.length > 3 && (
                        <span className="text-[9px] font-mono font-bold text-slate-500 pr-0.5">
                          +{dayReservations.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Floating Tooltip (Dynamic Hover Guard) */}
          {hoveredDay !== null && activeTooltipReservations.length > 0 && (
            <div
              className="absolute z-50 transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950 border border-slate-700 p-4.5 rounded-xl shadow-2xl w-80 pointer-events-none transition-all"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs text-emerald-400 font-bold font-mono">
                  รายการจองวันที่ {hoveredDay} {monthNames[currentMonth].split(' ')[0]} {currentYear}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  {activeTooltipReservations.length} แฟ้มยืม
                </span>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {activeTooltipReservations.map((res) => (
                  <div key={res.id} className="text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-200 truncate">{res.userName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        res.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        res.status === 'Approved' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        res.status === 'Handed Over' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                        res.status === 'Returned' ? 'bg-emerald-505/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                        {res.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                      สังกัด: {res.userDepartment}
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 text-[11px] text-slate-300">
                      <p className="font-semibold text-slate-400 text-[10px] uppercase mb-0.5">อุปกรณ์ทีจอง:</p>
                      <div className="space-y-0.5 max-h-16 overflow-y-auto">
                        {res.items.map((itm, idx) => (
                          <div key={idx} className="flex justify-between text-[11.5px] text-emerald-300">
                            <span className="truncate pr-2">{itm.equipmentName.split(' ')[0]}</span>
                            <span className="font-mono text-slate-400">x{itm.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-950 border-r border-s border-slate-700 rotate-45" />
            </div>
          )}
        </div>

        {/* Selected Day Detailed Info Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold font-sans text-white flex items-center justify-between">
                <span>เจาะลึกวันจองเครื่อง (Day Details)</span>
                {selectedDay && (
                  <span className="text-emerald-400 bg-slate-800 text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg">
                    {selectedDay} {monthNames[currentMonth].split(' ')[0]} {currentYear}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                คลิกเลือกวันที่อื่นในตารางปฏิทิน เพื่อทัศนารายเอียดทั้งหมดของวันนั้นๆ
              </p>
            </div>

            {selectedDay ? (
              (() => {
                const dayReservations = getReservationsForDay(selectedDay);
                if (dayReservations.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-500">
                      <AlertCircle className="mx-auto mb-2 text-slate-600" size={32} />
                      <p className="text-xs font-semibold">ไม่มีการจองอุปกรณ์ในวันนี้</p>
                      <p className="text-[11px] mt-0.5">คลังเครื่องโสตฯ ทั้งหมดพร้อมสรรพว่างงาน</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {dayReservations.map((res) => (
                      <div key={res.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3 shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">{res.userName}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{res.userDepartment}</p>
                          </div>
                          
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block border ${
                            res.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            res.status === 'Approved' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            res.status === 'Handed Over' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                            res.status === 'Returned' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {res.status}
                          </span>
                        </div>

                        {/* Event Time */}
                        <div className="flex items-center gap-1.5 text-[10.5px] text-amber-300 font-mono">
                          <Clock size={12} className="shrink-0" />
                          <span>{new Date(res.pickupTime).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>-</span>
                          <span>{new Date(res.returnTime).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Purpose */}
                        <p className="text-[11.5px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/50 leading-relaxed font-sans">
                          <span className="font-bold text-slate-400">วัตถุประสงค์: </span>
                          {res.purpose}
                        </p>

                        {/* Equipment List */}
                        <div className="text-xs space-y-1.5 pt-1 border-t border-slate-800/80">
                          <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase">อุปกรณ์ยืม (AV items):</span>
                          {res.items.map((itm, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11.5px] bg-slate-900/40 p-1.5 rounded border border-slate-800/30">
                              <span className="text-slate-300 truncate max-w-[200px]">{itm.equipmentName}</span>
                              <span className="font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900">
                                x{itm.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="py-12 text-center text-slate-500">
                <p className="text-xs">กรุณาเลือกวันที่บนปฏิทินเพื่อดูรายงาน</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 mt-4 grid grid-cols-2 gap-2 text-center text-[10px] text-slate-400 font-medium">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="block text-amber-400 text-xs font-mono font-bold">Pending</span>
              <span>รอดำเนินการคลิกอนุมัติ</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="block text-blue-400 text-xs font-mono font-bold">Approved</span>
              <span>อนุมัติแล้วรอส่งมอบพัสดุ</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 mt-2 col-span-2">
              <span className="block text-teal-400 text-xs font-mono font-bold">Handed Over & Returned</span>
              <span>จ่ายอุปกรณ์ไปยังห้องผ่าตัด | คืนเข้าคลังโรงพยาบาล</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
