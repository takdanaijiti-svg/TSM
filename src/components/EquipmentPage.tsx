import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Equipment } from '../types';
import {
  Search,
  Compass,
  Plus,
  Edit3,
  Trash2,
  SlidersHorizontal,
  Wrench,
  Check,
  X,
  AlertTriangle,
  Upload,
  ShoppingBag,
  MinusCircle,
  PlusCircle,
  HeartPulse,
  Info,
  History
} from 'lucide-react';

export const EquipmentPage: React.FC = () => {
  const {
    equipmentList,
    currentUser,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    sendToRepair,
    returnFromRepair,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    activityLogs
  } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [pageTab, setPageTab] = useState<'catalog' | 'maintenance'>('catalog');

  // Modal Control states
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairTarget, setRepairTarget] = useState<Equipment | null>(null);
  const [repairNotes, setRepairNotes] = useState('');
  const [repairQuantity, setRepairQuantity] = useState(1);

  // Return From Repair Modal states
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<Equipment | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(1);

  // Completeness/checking verification checklist values
  const [checklistVerify, setChecklistVerify] = useState({
    appearance: false, // ตรวจสอบสภาพภายนอกสะอาด ไม่มีชิ้นส่วนแตกหัก
    functionality: false, // ทดสอบเปิดปิดและทดลองใช้งานปกติแล้ว
    accessories: false, // ได้อุปกรณ์เสริม สายไฟ และสายต่อกลับมาครบกล่อง
  });

  // Equipment Form fields state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Hardware');
  const [formDescription, setFormDescription] = useState('');
  const [formTotalUnits, setFormTotalUnits] = useState(1);
  const [formAvailableUnits, setFormAvailableUnits] = useState(1);
  const [formStatus, setFormStatus] = useState<'Ready' | 'Under Repair'>('Ready');
  const [formImage, setFormImage] = useState('');

  // Categories list
  const categories = ['All', 'Hardware', 'Audio', 'Accessories', 'Cables', 'Office Supply', 'Consumables'];

  // Handle equipment modal submission
  const handleEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) return;

    const dataPayload = {
      name: formName,
      category: formCategory,
      description: formDescription,
      totalUnits: Number(formTotalUnits),
      availableUnits: Number(formAvailableUnits),
      status: formStatus,
      image: formImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23005a3c" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="5"></circle></svg>'
    };

    if (editingEquipment) {
      updateEquipment(editingEquipment.id, dataPayload);
    } else {
      addEquipment(dataPayload);
    }

    resetEquipmentForm();
    setIsEquipmentModalOpen(false);
  };

  const resetEquipmentForm = () => {
    setEditingEquipment(null);
    setFormName('');
    setFormCategory('Hardware');
    setFormDescription('');
    setFormTotalUnits(1);
    setFormAvailableUnits(1);
    setFormStatus('Ready');
    setFormImage('');
  };

  const openAddEquipment = () => {
    resetEquipmentForm();
    setIsEquipmentModalOpen(true);
  };

  const openEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormTotalUnits(item.totalUnits);
    setFormAvailableUnits(item.availableUnits);
    setFormStatus(item.status);
    setFormImage(item.image);
    setIsEquipmentModalOpen(true);
  };

  // Local Image file picker Base64 converter
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setFormImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Repair modal submission
  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairTarget) return;

    sendToRepair(repairTarget.id, repairNotes, repairQuantity);
    setIsRepairModalOpen(false);
    setRepairTarget(null);
    setRepairNotes('');
    setRepairQuantity(1);
  };

  const openRepairModal = (item: Equipment) => {
    setRepairTarget(item);
    setRepairNotes(item.repairNotes || '');
    setRepairQuantity(1);
    setIsRepairModalOpen(true);
  };

  // Handle Return From Repair modal submission
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTarget) return;

    if (!checklistVerify.appearance || !checklistVerify.functionality || !checklistVerify.accessories) {
      alert("กรุณาตรวจสอบความถูกต้องและเรียบร้อยครบทุกรายการด้วยการทำเครื่องหมายกล่องยืนยันสถานะ");
      return;
    }

    returnFromRepair(returnTarget.id, returnQuantity);
    setIsReturnModalOpen(false);
    setReturnTarget(null);
    setReturnQuantity(1);
    setChecklistVerify({
      appearance: false,
      functionality: false,
      accessories: false,
    });
  };

  const openReturnModal = (item: Equipment) => {
    setReturnTarget(item);
    setReturnQuantity(item.unitsUnderRepair || 1);
    setChecklistVerify({
      appearance: false,
      functionality: false,
      accessories: false,
    });
    setIsReturnModalOpen(true);
  };

  // Filter Equipment List
  const filteredEquipment = equipmentList.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(search.toLowerCase()) || 
                          eq.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || eq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-200/80 gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Compass className="text-[#005a3c]" />
            <span>คลังอุปกรณ์โสตศึกษาและเวชสาธิต (AV Catalog & Assets)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            สืบค้นข้อมูลพัสดุ ตรวจจับคงคลัง และจัดเบิกจองพัสดุอุปกรณ์โสตทัศนศึกษาหรือชิ้นพัดสุสิ้นเปลืองสนับสนุนการวิจัยแพทย์
          </p>
        </div>

        {currentUser.role === 'Admin' && (
          <button
            id="btn-add-equipment"
            onClick={openAddEquipment}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Plus size={16} />
            ลงทะเบียนพัสดุใหม่
          </button>
        )}
      </div>

      {/* Segment Tabs Selection */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-sm border">
        <button
          id="btn-tab-catalog"
          type="button"
          onClick={() => setPageTab('catalog')}
          className={`flex-grow sm:flex-initial px-5 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            pageTab === 'catalog'
              ? 'bg-[#005a3c] text-white shadow-sm'
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <Compass size={14} />
          <span>รายการครุภัณฑ์และวัสดุโสตฯ (AV Catalog)</span>
        </button>
        <button
          id="btn-tab-maintenance"
          type="button"
          onClick={() => setPageTab('maintenance')}
          className={`flex-grow sm:flex-initial px-5 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 relative ${
            pageTab === 'maintenance'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <Wrench size={14} />
          <span>ประวัติ & ติดตามงานซ่อมบำรุง (Maintenance System)</span>
          {equipmentList.filter(eq => eq.status === 'Under Repair').length > 0 && (
            <span className="bg-rose-500 text-white font-mono font-black rounded-full text-[9px] px-2 py-0.5 animate-pulse shrink-0">
              {equipmentList.filter(eq => eq.status === 'Under Repair').length} เครื่องคาซ่อม
            </span>
          )}
        </button>
      </div>

      {/* CONIDTIONAL RENDERING BRACES */}
      {pageTab === 'catalog' ? (
        <>
          {/* Lookup filter bar */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row gap-3 shadow-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="พิมพ์คำค้นหา ชื่อพัสดุ หมวดหมู่ ยี่ห้อ หรือสรรพคุณโสตทัศนศึกษา..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#005a3c] focus:border-transparent placeholder-slate-400 font-bold"
              />
            </div>

            {/* Categories Carousel */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border
                    ${selectedCategory === cat
                      ? 'bg-[#005a3c] text-white border-[#005a3c] shadow-sm'
                      : 'bg-white text-slate-600 hover:text-[#005a3c] hover:bg-slate-50 border-slate-250'
                    }
                  `}
                >
                  {cat === 'All' && 'ทั้งหมด (All)'}
                  {cat === 'Hardware' && 'Hardware (เครื่องฉาย/คอม)'}
                  {cat === 'Audio' && 'Audio (ชุดวิทยุ/ไมค์)'}
                  {cat === 'Accessories' && 'Accessories (ปลั๊กพ่วง/รถเข็น)'}
                  {cat === 'Cables' && 'Cables (HDMI/AUX)'}
                  {cat === 'Office Supply' && 'Office Supply (เบิกสำนักงาน)'}
                  {cat === 'Consumables' && 'Consumables (วัสดุสิ้นเปลือง)'}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Card Grids */}
          {filteredEquipment.length === 0 ? (
            <div className="bg-white border border-slate-200/80 p-16 rounded-2xl text-center text-slate-400 shadow-sm">
              <SlidersHorizontal size={40} className="mx-auto text-slate-300 mb-2 animate-pulse" />
              <p className="text-sm font-semibold">ไม่พบอุปกรณ์ที่ค้นหาหรือตรงกับกลุ่มหมวดหมู่ดังกล่าว</p>
              <p className="text-xs mt-1 text-slate-400 font-medium font-sans">กรุณาลองระบุชื่ออื่น หรือตรวจสอบตัวสะกดใหม่อีกครั้ง</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((item) => {
                const cartItem = cart.find(ci => ci.equipmentId === item.id);
                const cartQty = cartItem ? cartItem.quantity : 0;
                const isStaff = currentUser.role === 'Staff';
                const isAdmin = currentUser.role === 'Admin';
                const isOutOfStock = item.availableUnits <= 0;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group transition-all duration-300 hover:shadow-md hover:border-emerald-300"
                  >
                    {/* Image block featuring Hover zoom */}
                    <div className="relative h-44 bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100 overflow-hidden select-none">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full object-contain filter drop-shadow max-w-[85%] transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />

                      {/* Badges Overlay */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-white/90 text-[#005a3c] border border-emerald-100 uppercase tracking-widest shadow-sm">
                          {item.category}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-black block w-fit border ${
                          item.availableUnits > 0
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {item.availableUnits > 0 ? '● มีพร้อมเบิกจ่าย' : '❌ หมดคลังชั่วคราว'}
                        </span>
                        {(item.unitsUnderRepair || 0) > 0 && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-md font-black block w-fit border bg-amber-50 text-amber-805 border-amber-200 shadow-sm animate-pulse">
                            🔧 ส่งช่างซ่อมอยู่ {item.unitsUnderRepair} ชิ้น
                          </span>
                        )}
                      </div>

                      {(item.unitsUnderRepair || 0) > 0 && item.repairNotes && (
                        <div className="absolute bottom-0 inset-x-0 bg-rose-50/95 text-rose-800 text-[10.5px] p-2 border-t border-rose-100 flex items-start gap-1.5 font-bold">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                          <span className="truncate">โน้ตอาการชำรุด: "{item.repairNotes}"</span>
                        </div>
                      )}
                    </div>

                    {/* Content info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800 font-sans tracking-normal min-h-[40px] leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-[11.5px] text-slate-500 font-medium font-sans line-clamp-3 leading-normal mt-2" title={item.description}>
                          {item.description}
                        </p>
                      </div>

                      {/* Stock Metrics counters */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 font-bold">
                          <span className="text-[9.5px] text-slate-400 block uppercase font-bold text-slate-500">เหลือคงคลังอยู่</span>
                          <span className={`text-xs font-mono font-black ${item.availableUnits === 0 || item.status === 'Under Repair' ? 'text-rose-600 animate-pulse' : 'text-[#005a3c]'}`}>
                            เหลือคงคลังอยู่ {item.availableUnits} ชิ้น
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 font-bold">
                          <span className="text-[9.5px] text-slate-400 block uppercase font-bold text-slate-500">รวมที่จัดหากลาง</span>
                          <span className="text-xs text-slate-600 font-mono font-black">
                            {item.totalUnits} ชิ้น
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Roles Specific Buttons */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/70 gap-2 flex flex-col">
                      {/* STAFF CART CONTROLS */}
                      {isStaff && (
                        <div className="space-y-2">
                           {isOutOfStock ? (
                            <div className="text-center py-2 bg-slate-100 rounded-xl text-[10px] text-slate-400 font-black border border-slate-200 uppercase tracking-wider select-none">
                              {item.status === 'Ready' ? '❌ สินค้าหมดคลังชั่วคราว' : '🚫 งดเบิกยืมเนื่องจากกำลังซ่อมบำรุง'}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {cartQty > 0 ? (
                                <div className="flex items-center justify-between w-full bg-white border border-slate-200 rounded-xl p-1 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQty(item.id, cartQty - 1)}
                                    className="p-1 px-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded transition cursor-pointer"
                                  >
                                    <MinusCircle size={15} />
                                  </button>
                                  <div className="text-xs font-mono font-black text-[#005a3c]">
                                    ตะกร้าสะสม {cartQty} ชุด
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateCartQty(item.id, cartQty + 1)}
                                    className={`p-1 px-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded transition cursor-pointer ${cartQty >= item.availableUnits ? 'opacity-35 cursor-not-allowed' : ''}`}
                                    disabled={cartQty >= item.availableUnits}
                                  >
                                    <PlusCircle size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-[10px] px-2 py-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer font-black shrink-0 transition"
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => addToCart(item.id)}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer tracking-wide"
                                >
                                  <ShoppingBag size={14} />
                                  หยิบของใส่ใบขอยืมอุปกรณ์
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ADMIN EDIT / REPAIR CONTROLS */}
                      {isAdmin && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => openEditEquipment(item)}
                            className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black border border-slate-200 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer hover:border-emerald-700"
                          >
                            <Edit3 size={11} className="text-[#005a3c]" />
                            แก้ไขครุภัณฑ์
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`คุณต้องการจำหน่าย ${item.name} นี้ออกจากสารบบโสตฯ ใช่หรือไม่?`)) {
                                deleteEquipment(item.id);
                              }
                            }}
                            className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={11} />
                            จำหน่ายออก
                          </button>

                          {/* REPAIR BUTTONS */}
                          {item.availableUnits > 0 && (
                            <button
                              type="button"
                              onClick={() => openRepairModal(item)}
                              className={`py-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                (item.unitsUnderRepair || 0) > 0 ? 'col-span-1' : 'col-span-2'
                              }`}
                            >
                              <Wrench size={11} />
                              ส่งชำรุดเพิ่ม
                            </button>
                          )}

                          {(item.unitsUnderRepair || 0) > 0 && (
                            <button
                              type="button"
                              onClick={() => openReturnModal(item)}
                              className={`py-1.5 px-3 bg-emerald-50 hover:bg-[#e6f4ea] border border-emerald-250 text-[#005a3c] rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                item.availableUnits > 0 ? 'col-span-1' : 'col-span-2'
                              }`}
                            >
                              <Check size={11} />
                              รับคืนจากซ่อม ({item.unitsUnderRepair})
                            </button>
                          )}
                        </div>
                      )}

                      {/* MANAGER INFORMATION LABELS ONLY */}
                      {currentUser.role === 'Manager' && (
                        <div className="text-[10px] text-center py-2 bg-white text-slate-500 rounded-xl border border-slate-200 font-bold shadow-sm select-none">
                          {item.availableUnits > 0 
                            ? `✅ พร้อมใช้งาน (${item.availableUnits} ชิ้น)` 
                            : '❌ ไม่มีอุปกรณ์ในคลัง'}
                          {(item.unitsUnderRepair || 0) > 0 && ` • 🛠️ ส่งซ่อม ${item.unitsUnderRepair} ชิ้น`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* DYNAMIC MAINTENANCE TRACKER & HISTORY DASHBOARD */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-805 text-slate-800 flex items-center gap-2">
                <Wrench className="text-amber-500 animate-pulse" size={18} />
                <span>รายงานสถานะคิวพัสดุชำรุดและสมุดประวัติ (Maintenance & Fault Tracking Ledger)</span>
              </h3>
              <p className="text-slate-500 font-semibold text-xs mt-1 leading-normal font-sans">
                สถิติครุภัณฑ์โสตทัศนูปกรณ์ที่อยู่ต่างตึกชำรุด ปัจจุบันขาดส่งพร้อมใช้ชั่วคราว: <span className="text-amber-600 font-black">{equipmentList.filter(eq => eq.status === 'Under Repair').length} เครื่อง</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active repairs list */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-[#005a3c] uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <span>อุปกรณ์ที่อยู่ระหว่างสรุปช่างซ่อม (Active Repairs Queue)</span>
              </h4>

              {equipmentList.filter(eq => eq.status === 'Under Repair').length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="w-12 h-12 bg-[#e6f4ea] text-[#005a3c] rounded-full flex items-center justify-center mx-auto mb-3 border">
                    <Check size={22} className="stroke-[3px]" />
                  </div>
                  <p className="font-extrabold text-xs text-slate-700">พัสดุส่งกำลังตรวจฟิตเรียบร้อยดี 100%!</p>
                  <p className="text-[10px] mt-1 text-slate-400 font-medium font-sans">ไม่มีพัสดุหรือกล่องไมโครโฟนสายเคฟเวอร์ค้างซ่อมบำรุงในขณะนี้</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipmentList.filter(eq => eq.status === 'Under Repair').map(item => (
                    <div key={item.id} className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-3 items-start select-none">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-white rounded border p-1 shrink-0" referrerPolicy="no-referrer" />
                        <div>
                          <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shadow-sm">
                            {item.category}
                          </span>
                          <h5 className="font-black text-slate-800 text-xs mt-1.5 leading-tight flex flex-wrap items-center gap-1.5">
                            <span>{item.name}</span>
                            <span className="text-amber-800 font-black font-sans bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200 text-[9.5px]">
                              ส่งซ่อมอยู่: {item.unitsUnderRepair || 1} ชิ้น
                            </span>
                          </h5>
                          <p className="text-[10.5px] italic text-slate-500 font-bold mt-1 font-sans">
                            🚨 อาการจองแจ้งชำรุด: "{item.repairNotes || 'ไม่ระบุพยาธิสภาพ'}"
                          </p>
                        </div>
                      </div>

                      {['Admin', 'Manager'].includes(currentUser.role) && (
                        <button
                          type="button"
                          onClick={() => openReturnModal(item)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-[10px] rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1 shrink-0"
                        >
                          <Check size={11} className="stroke-[3px]" />
                          รับมอบคืนตรวจพัสดุซ่อมเสร็จ
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historic Maintenance Journal Ledger */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-1.5">
                <History size={14} className="text-[#005a3c]" />
                <span>ประวัติแจ้งเสื่อมสภาพ & งานช่าง (Fault Ledger)</span>
              </h4>

              {activityLogs.filter(log => 
                log.action.includes('ซ่อม') || log.action.includes('เคลม') || log.action.includes('ชำรุด') ||
                log.details.includes('ซ่อม') || log.details.includes('ชำรุด')
              ).length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Info size={24} className="mx-auto text-slate-300 mb-1" />
                  <p className="text-[10px] text-slate-500 font-semibold font-sans">ขอยืนยันว่ายังไม่มีการบันทึกชำรุดสัปดาห์นี้</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-205 pl-3.5 space-y-4 max-h-[350px] overflow-y-auto scrollbar-none">
                  {activityLogs.filter(log => 
                    log.action.includes('ซ่อม') || log.action.includes('เคลม') || log.action.includes('ชำรุด') ||
                    log.details.includes('ซ่อม') || log.details.includes('ชำรุด')
                  ).map(log => {
                    const isReturn = log.action.includes('รับคืน');
                    return (
                      <div key={log.id} className="relative text-[10.5px]">
                        {/* Circle dot timeline layout */}
                        <span className={`absolute -left-[20.5px] top-1 w-2 h-2 rounded-full border border-white ${
                          isReturn ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'
                        }`} />
                        
                        <div className="font-sans font-black flex justify-between items-center text-slate-700">
                          <span className={isReturn ? "text-[#005a3c]" : "text-amber-800"}>{log.action}</span>
                          <span className="text-[9px] text-slate-400 font-mono font-medium">
                            {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-500 font-bold mt-0.5 leading-relaxed" title={log.details}>
                          {log.details}
                        </p>
                        <div className="text-[9px] text-[#005a3c] mt-1 pt-1 border-t border-slate-100 flex justify-between font-bold">
                          <span>บันทึกความเห็น: {log.userName.split(' ')[0]}</span>
                          <span className="text-slate-400 uppercase">[{log.role}]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EQUIPMENT MANAGEMENT MODAL (ADMIN ONLY) */}
      {isEquipmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
              <h3 className="text-sm font-black text-[#005a3c] flex items-center gap-2">
                <HeartPulse size={18} />
                <span>{editingEquipment ? 'แก้ไขรายละเอียดคุรุภัณฑ์โสตฯ' : 'ลงทะเบียนบันทึกอุปกรณ์โสตทัศนศึกษาเพื่อการแพทย์'}</span>
              </h3>
              <button
                onClick={() => setIsEquipmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEquipmentSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-500 font-black mb-1.5">ชื่ออุปกรณ์ประมวลถ่ายภาพ / เครื่องเสียงสัมมนา</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น เครื่องรับส่งสัญญาณ 4K ไร้สาย, หูฟังอารมณ์ความถึ่วิทยุทางการแพทย์"
                  className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl text-xs focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-black mb-1.5">หมวดหมู่ระบบพ่วง</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl text-xs focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                  >
                    <option value="Hardware">Hardware (เครื่องฉาย/คอมพิวเตอร์)</option>
                    <option value="Audio">Audio (ชุดลำโพง/ไมค์)</option>
                    <option value="Accessories">Accessories (ปลั๊กพ่วง/รถเข็น/ตัวแปลง)</option>
                    <option value="Cables">Cables (สายสัญญาณ HDMI/AUX)</option>
                    <option value="Office Supply">Office Supply (อุปกรณ์สำนักงาน)</option>
                    <option value="Consumables">Consumables (วัสดุสิ้นเปลือง)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-black mb-1.5">ภาพถ่ายอุปกรณ์ (Upload Base64 Picker)</label>
                  <label className="w-full px-3 py-2 bg-slate-50 border border-dashed border-slate-350 hover:border-[#005a3c] rounded-xl text-slate-500 flex items-center justify-center gap-1.5 cursor-pointer transition font-bold">
                    <Upload size={14} className="text-[#005a3c]" />
                    <span>อัปโหลดรูปภาพใหม่...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Real-time Base64 preview  */}
              {formImage && (
                <div className="bg-slate-50 p-2 border border-slate-205 rounded-xl flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">พรีวิวรูปภาพสวรรค์:</span>
                  <img src={formImage} alt="Preview" className="h-10 w-10 object-contain max-h-[40px] rounded border border-slate-205" referrerPolicy="no-referrer" />
                  <button type="button" onClick={() => setFormImage('')} className="text-[10px] text-rose-500 font-black underline cursor-pointer ml-auto">ล้างรูปพรีวิว</button>
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-black mb-1.5">คำอธิบายคุณสมบัติยุทโธปกรณ์เพิ่มเติม</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="สเปกสินค้า ส่วนประกอบ ความละเอียด คีย์ฟังก์ชันการใช้งาน..."
                  className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl text-xs focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-black mb-1.5">จำนวนรวมทั้งหมดจัดหา (Total Units)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formTotalUnits}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormTotalUnits(val);
                      if (val < formAvailableUnits) {
                        setFormAvailableUnits(val);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl text-xs focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-black mb-1.5">จำนวนพร้อมจ่ายยืม (Available Units)</label>
                  <input
                    type="number"
                    min={0}
                    max={formTotalUnits}
                    required
                    value={formAvailableUnits}
                    onChange={(e) => setFormAvailableUnits(Math.min(formTotalUnits, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl text-xs focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEquipmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-202 text-slate-600 rounded-xl font-bold cursor-pointer transition text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005a3c] hover:bg-[#004730] text-white rounded-xl font-bold cursor-pointer transition text-xs shadow-sm"
                >
                  {editingEquipment ? 'อัปเดตข้อมูล' : 'บันทึกเปิดรับเข้าคลัง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPAIR LOG MODAL */}
      {isRepairModalOpen && repairTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-705 flex items-center gap-2">
                <Wrench size={16} className="text-amber-600" />
                <span>บันทึกอาการชำรุดเพื่อส่งช่างซ่อมบำรุง</span>
              </h3>
              <button
                onClick={() => setIsRepairModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 hover:bg-slate-150 p-1 rounded-lg transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-4">
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">อุปกรณ์เป้าหมาย:</span>
              <p className="text-[#005a3c] font-black">{repairTarget.name}</p>
              <div className="text-slate-500 text-[10.5px] mt-1 flex justify-between font-semibold">
                <span>คงคลังพร้อมใช้ปัจจุบัน: {repairTarget.availableUnits} ชิ้น</span>
                <span className="text-rose-600 animate-pulse font-black">กำลังจะส่งชำรุด {repairQuantity} ชิ้น</span>
              </div>
            </div>

            <form onSubmit={handleRepairSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-505 font-black mb-1.5 text-[11px]">จำนวนเครื่องที่ส่งเคลม/ชำรุด (ระบุได้ไม่เกินยอดคงคลัง)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={repairTarget.availableUnits}
                  value={repairQuantity}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(repairTarget.availableUnits, Number(e.target.value)));
                    setRepairQuantity(val);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-black"
                />
              </div>

              <div>
                <label className="block text-slate-505 font-black mb-1.5">สาเหตุการเสีย / อาการชำรุด โดยละเอียด</label>
                <textarea
                  required
                  rows={3}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="เช่น ปลั๊กหลวม สวิตช์เปิดปิดกดยาก เลนส์โปรเจคเตอร์ขุ่นมัว หรือช่องเชื่อมต่อชำรุด"
                  className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                />
              </div>

              <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-[#e6f4ea] p-2.5 rounded border border-emerald-100 font-bold">
                <Info size={14} className="text-[#005a3c] shrink-0 mt-0.5" />
                <span>การกดยืนยันจะลดจำนวนพร้อมใช้อย่างเด็ดขาดลง {repairQuantity} หน่วย เพื่อความปลอดภัยและป้องกันบุคลากรจองพัสดุเสียหรือขัดข้องเพิ่ม</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRepairModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-black cursor-pointer text-xs transition-all shadow-sm"
                >
                  ยืนยันคำสั่งส่งซ่อมบำรุง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN FROM REPAIR WITH COMPLETENESS CHECKLIST MODAL (เช็คความเรียบร้อย) */}
      {isReturnModalOpen && returnTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-emerald-800 flex items-center gap-2">
                <Check size={16} className="text-emerald-700 bg-emerald-100/50 p-0.5 rounded" />
                <span>รับมอบและส่งตรวจสอบเครื่องซ่อมเสร็จ</span>
              </h3>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 hover:bg-slate-150 p-1 rounded-lg transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-4">
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">อุปกรณ์เป้าหมาย:</span>
              <p className="text-[#005a3c] font-black">{returnTarget.name}</p>
              <div className="text-slate-500 text-[10.5px] mt-1 flex justify-between font-semibold">
                <span>ความรับผิดชอบรักษาเดิม: "{returnTarget.repairNotes || 'ไม่ระบุ'}"</span>
                <span className="text-emerald-700 font-black">ส่งช่างซ่อมอยู่: {returnTarget.unitsUnderRepair || 1} ชิ้น</span>
              </div>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-600 font-black mb-1.5 text-[11px]">จำนวนเครื่องพัสดุชิ้นที่ซ่อมคืนสำเร็จแล้ว</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={returnTarget.unitsUnderRepair || 1}
                  value={returnQuantity}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(returnTarget.unitsUnderRepair || 1, Number(e.target.value)));
                    setReturnQuantity(val);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-black"
                />
              </div>

              {/* CHECKLIST (เช็คความเรียบร้อย) */}
              <div className="space-y-2.5 bg-[#e6f4ea]/40 p-4 rounded-xl border border-dashed border-emerald-250">
                <label className="block text-[#005a3c] font-black text-[10.5px] uppercase tracking-wider mb-1">🔍 บันทึกเช็คความเรียบร้อย (Completeness Check)</label>
                
                <label className="flex items-start gap-2.5 cursor-pointer text-[10.5px] font-bold text-slate-700 hover:text-slate-950 select-none">
                  <input
                    type="checkbox"
                    checked={checklistVerify.appearance}
                    onChange={(e) => setChecklistVerify(prev => ({ ...prev, appearance: e.target.checked }))}
                    className="mt-0.5 rounded text-[#005a3c] focus:ring-[#005a3c]"
                  />
                  <span>สภาพภายนอกสะอาด เรียบร้อย ปราศจากความขุ่นมัว หน้าปุ่มไร้รอยแตกหักหรือน็อตหลวมเสี่ยงหลุด</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-[10.5px] font-bold text-slate-700 hover:text-slate-950 select-none">
                  <input
                    type="checkbox"
                    checked={checklistVerify.functionality}
                    onChange={(e) => setChecklistVerify(prev => ({ ...prev, functionality: e.target.checked }))}
                    className="mt-0.5 rounded text-[#005a3c] focus:ring-[#005a3c]"
                  />
                  <span>ทดสอบระบบไฟฟ้า สวิตช์จ่ายกำลังไฟเข้าเลี้ยง เปิดใช้พอร์ตร่วมและทดสอบสัญญาณภาพ/เสียงทำงานเป็นปกติ</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-[10.5px] font-bold text-slate-700 hover:text-slate-950 select-none">
                  <input
                    type="checkbox"
                    checked={checklistVerify.accessories}
                    onChange={(e) => setChecklistVerify(prev => ({ ...prev, accessories: e.target.checked }))}
                    className="mt-0.5 rounded text-[#005a3c] focus:ring-[#005a3c]"
                  />
                  <span>อุปกรณ์ส่วนประกอบพ่วง สายพ่วง หม้อแปลง รีโมต และกล่องสาย พับจัดเก็บกลับมาครบบริบูรณ์ในยูนิต</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!checklistVerify.appearance || !checklistVerify.functionality || !checklistVerify.accessories}
                  className={`px-4 py-2 text-white rounded-xl font-black cursor-pointer text-xs transition-all shadow-sm ${
                    checklistVerify.appearance && checklistVerify.functionality && checklistVerify.accessories
                      ? 'bg-emerald-700 hover:bg-emerald-600 cursor-pointer text-white shadow'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  บันทึกคืนคลังพัสดุเช็คสภาพเสร็จสิ้น
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
