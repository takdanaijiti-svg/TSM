import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Reservation } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, Clock, AlertCircle, Award } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { reservations, settings } = useApp();
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
      
      const targetDate = new Date(currentYear, currentMonth, day);
      
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-slate-200/80 gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <CalendarIcon className="text-[#005a3c]" />
            <span>ปฏิทินตรวจเช็ครายการจองเครื่องโสตฯ (AV Calendar)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            สืบค้นตารางเวลา และตรวจสอบคิวการใช้ของตึกพยาบาลผ่านระบบแผนปฏิทินแบบละเอียด
          </p>
        </div>
        
        {/* Quick Instructions Badge */}
        <div className="flex items-center gap-2 text-xs text-[#005a3c] bg-[#e6f4ea] border border-emerald-200 px-3.5 py-2 rounded-xl font-bold">
          <Info size={14} className="shrink-0 text-[#005a3c]" />
          <span>ชี้ที่วันเพื่อเปิด Tooltip สะดวกตรวจสิทธิ์ | คลิกที่วันเพื่อกรองรายละเอียดเจาะลึก</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Calendar Grid Panel */}
        <div id="calendar-container" className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm relative">
          
          {/* Month Navigator Controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-600 hover:text-[#005a3c] bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <h3 className="text-base font-black text-[#005a3c]">
                {monthNames[currentMonth]}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">ค.ศ. {currentYear}</p>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-600 hover:text-[#005a3c] bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 mb-2 border-b border-slate-100 pb-3">
            {daysOfWeek.map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
            {/* Render blank spaces */}
            {blankDays.map((_, idx) => (
              <div key={`blank-${idx}`} className="aspect-[4/3] rounded-xl bg-slate-50 border border-slate-100/50" />
            ))}

            {/* Render realistic days */}
            {monthDays.map(day => {
              const dayReservations = getReservationsForDay(day);
              const hasReservations = dayReservations.length > 0;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  onMouseEnter={(e) => handleDayMouseEnter(day, e)}
                  onMouseLeave={handleDayMouseLeave}
                  className={`
                    aspect-[4/3] relative rounded-xl border p-2 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none
                    ${dayReservations.length > 0 
                      ? 'bg-emerald-50/50 border-emerald-200 hover:border-[#005a3c] hover:bg-emerald-50' 
                      : 'bg-white border-slate-200 hover:border-[#005a3c]/60 hover:bg-slate-50'
                    }
                    ${isSelected ? 'ring-2 ring-[#005a3c] border-transparent bg-emerald-50/70' : ''}
                  `}
                >
                  <span className={`
                    absolute top-1.5 left-2 text-xs font-mono font-bold transition-colors
                    ${isSelected ? 'text-[#005a3c] font-black text-sm' : 'text-slate-500'}
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
                          Returned: 'bg-emerald-600',
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
              className="absolute z-50 transform -translate-x-1/2 -translate-y-full mb-3 bg-white border border-slate-300 p-4 rounded-xl shadow-xl w-80 pointer-events-none transition-all"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs text-[#005a3c] font-extrabold">
                  วันที่ {hoveredDay} {monthNames[currentMonth].split(' ')[0]} {currentYear}
                </span>
                <span className="text-[9px] text-[#005a3c] bg-[#e6f4ea] px-1.5 py-0.5 rounded font-bold">
                  {activeTooltipReservations.length} แฟ้มจอง
                </span>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {activeTooltipReservations.map((res) => (
                  <div key={res.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-inner">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-slate-700 truncate">{res.userName}</span>
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-black ${
                        res.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        res.status === 'Approved' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        res.status === 'Handed Over' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                        res.status === 'Returned' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                        {res.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5 font-bold">
                      สังกัด: {res.userDepartment}
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[11px] text-slate-600">
                      <p className="font-black text-slate-500 text-[9px] uppercase mb-0.5">ยุทโธปกรณ์:</p>
                      <div className="space-y-0.5 max-h-16 overflow-y-auto">
                        {res.items.map((itm, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-[#005a3c] font-bold">
                            <span className="truncate pr-2">{itm.equipmentName.split(' ')[0]}</span>
                            <span className="font-mono text-slate-500">x{itm.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-300 rotate-45" />
            </div>
          )}
        </div>

        {/* Selected Day Detailed Info Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center justify-between">
                <span>ตารางรายละเอียดคิวประจำวัน</span>
                {selectedDay && (
                  <span className="text-[#005a3c] bg-[#e6f4ea] text-xs font-mono font-black px-2.5 py-1 rounded-lg border border-emerald-100">
                    {selectedDay} {monthNames[currentMonth].split(' ')[0]} {currentYear}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                คลิกเลือกวันที่ใดๆ บนปฏิทินเพื่อวิเคราะห์ตารางงานสอน/วินิจฉัยโรคความเร็วสูง
              </p>
            </div>

            {selectedDay ? (
              (() => {
                const dayReservations = getReservationsForDay(selectedDay);
                if (dayReservations.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400">
                      <AlertCircle className="mx-auto mb-2 text-slate-300" size={32} />
                      <p className="text-xs font-semibold">ไม่มีการจองอุปกรณ์ในวันนี้</p>
                      <p className="text-[11px] mt-0.5">ครุภัณฑ์ในคลังตึกโสตทัศนศึกษาพร้อมให้บริการทุกชิ้น</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {dayReservations.map((res) => (
                      <div key={res.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 shadow-inner">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black text-slate-800">{res.userName}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-bold">{res.userDepartment}</p>
                          </div>
                          
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black inline-block border ${
                            res.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            res.status === 'Approved' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            res.status === 'Handed Over' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                            res.status === 'Returned' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            {res.status}
                          </span>
                        </div>

                        {/* Event Time */}
                        <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-800 font-mono font-bold bg-[#e6f4ea] px-2 py-1 rounded w-fit">
                          <Clock size={12} className="shrink-0 text-[#005a3c]" />
                          <span>{new Date(res.pickupTime).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>-</span>
                          <span>{new Date(res.returnTime).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Purpose */}
                        <p className="text-[11.5px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-150 leading-relaxed font-sans font-medium">
                          <span className="font-extrabold text-slate-400">วัตถุประสงค์: </span>
                          {res.purpose}
                        </p>

                        {/* Equipment List */}
                        <div className="text-xs space-y-1.5 pt-1.5 border-t border-slate-200">
                          <span className="text-[9.5px] font-black text-slate-400 tracking-wider block uppercase">ยุทโธปกรณ์ที่สั่งยืม (ITEMS):</span>
                          {res.items.map((itm, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px] bg-white p-1.5 rounded border border-slate-150 font-bold">
                              <span className="text-slate-600 truncate max-w-[200px]">{itm.equipmentName}</span>
                              <span className="font-mono font-black text-[#005a3c] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
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
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs font-medium">กรุณาเลือกวันที่บนปฏิทินเพื่อเรียกดูรายงาน</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-150 pt-4 mt-4 grid grid-cols-2 gap-2 text-center text-[10px] text-slate-500 font-bold">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="block text-amber-600 text-xs font-mono font-black">Pending</span>
              <span>รอนุมัติจัดเตรียมของ</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-[#cbd5e1]">
              <span className="block text-blue-600 text-xs font-mono font-black">Approved</span>
              <span>อนุมัติคิวจองสำเร็จ</span>
            </div>
            <div className="bg-[#e6f4ea] p-2 rounded-xl border border-emerald-200 mt-2 col-span-2 text-emerald-800">
              <span className="block text-emerald-700 text-xs font-mono font-black">Handed Over & Returned</span>
              <span>เบิกของไปยังห้องผ่าตัด | คืนของกลับเข้าคลังสมบูรณ์</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
