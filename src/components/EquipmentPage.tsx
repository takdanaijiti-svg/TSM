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
  Info
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
    removeFromCart
  } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal Control states
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairTarget, setRepairTarget] = useState<Equipment | null>(null);
  const [repairNotes, setRepairNotes] = useState('');

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
      image: formImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230f766e" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="5"></circle></svg>'
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

  // Local Image file picker Base64 converter:
  // "must support file picking that converts image assets to Data URLs (Base64) for client-side storage, with real-time previews."
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

    sendToRepair(repairTarget.id, repairNotes);
    setIsRepairModalOpen(false);
    setRepairTarget(null);
    setRepairNotes('');
  };

  const openRepairModal = (item: Equipment) => {
    setRepairTarget(item);
    setRepairNotes(item.repairNotes || '');
    setIsRepairModalOpen(true);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Compass className="text-emerald-400" />
            คลังอุปกรณ์โสตทัศนศึกษาเพื่อการเรียนรู้แพทย์ (AV Equipment Catalog)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            สืบค้นข้อมูล ตรวจสอบชิ้นพัสดุ และจัดทำคำขอจองอุปกรณ์ฉายภาพ เครื่องขยายเสียง หรือชุดจำลองช่วยฝึกอบรมแพทย์
          </p>
        </div>

        {currentUser.role === 'Admin' && (
          <button
            id="btn-add-equipment"
            onClick={openAddEquipment}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-950/40 flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Plus size={16} />
            ลงทะเบียนอุปกรณ์ชิ้นใหม่
          </button>
        )}
      </div>

      {/* Lookup filter bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="พิมพ์รหัส ค้นหาสินค้า ยี่ห้อ หรือคำอธิบายเพิ่มเติม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-600 font-medium"
          />
        </div>

        {/* Categories Carousel */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
                ${selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow shadow-emerald-950/50'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                }
              `}
            >
              {cat === 'All' && 'ทั้งหมด (All)'}
              {cat === 'Hardware' && 'Hardware (เครื่องฉาย/คอม)'}
              {cat === 'Audio' && 'Audio (ชุดวิทยุ/ไมค์)'}
              {cat === 'Accessories' && 'Accessories (ปลั๊กพ่วง/รถเข็น)'}
              {cat === 'Cables' && 'Cables (สายเชื่อมต่อ HDMI)'}
              {cat === 'Office Supply' && 'Office Supply (เบิกสำนักงาน)'}
              {cat === 'Consumables' && 'Consumables (วัสดุสิ้นเปลือง)'}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Card Grids */}
      {filteredEquipment.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-16 rounded-2xl text-center text-slate-500">
          <SlidersHorizontal size={40} className="mx-auto text-slate-700 mb-2 animate-pulse" />
          <p className="text-sm font-semibold">ไม่พบอุปกรณ์ที่ค้นหาหรือตรงกับกลุ่มหมวดหมู่ดังกล่าว</p>
          <p className="text-xs mt-1 text-slate-600">กรุณาลองป้อนคีย์เวิร์ดอื่น หรือตรวจสอบตัวสะกดใหม่อีกครั้ง</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => {
            const cartItem = cart.find(ci => ci.equipmentId === item.id);
            const cartQty = cartItem ? cartItem.quantity : 0;
            const isStaff = currentUser.role === 'Staff';
            const isAdmin = currentUser.role === 'Admin';
            const isOutOfStock = item.availableUnits <= 0 || item.status === 'Under Repair';

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all duration-300 hover:shadow-emerald-900/10 hover:border-slate-700"
              >
                {/* Image block featuring Hover zoom */}
                <div className="relative h-44 bg-slate-950 flex items-center justify-center p-6 border-b border-slate-800 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full object-contain filter drop-shadow max-w-[85%] transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-slate-900/80 text-teal-400 border border-teal-500/20 uppercase tracking-widest backdrop-blur-sm">
                      {item.category}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold block w-fit border ${
                      item.status === 'Ready'
                        ? 'bg-emerald-950/85 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-950/85 text-rose-400 border-rose-500/30'
                    }`}>
                      {item.status === 'Ready' ? '● มีพร้อมเบิกจ่าย' : '🛠️ ชำรุด/กำลังซ่อมบำรุง'}
                    </span>
                  </div>

                  {item.status === 'Under Repair' && item.repairNotes && (
                    <div className="absolute bottom-0 inset-x-0 bg-rose-950/90 text-rose-300 text-[10.5px] p-2 border-t border-rose-900/50 flex items-start gap-1.5 backdrop-blur-sm">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      <span className="truncate">โน้ตอาการเสีย: "{item.repairNotes}"</span>
                    </div>
                  )}
                </div>

                {/* Content info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 font-sans tracking-tight min-h-[40px] leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-[11.5px] text-slate-400 font-sans line-clamp-3 leading-relaxed mt-2" title={item.description}>
                      {item.description}
                    </p>
                  </div>

                  {/* Stock Metrics counters */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 font-medium">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">คลังคงเหลือ</span>
                      <span className={`text-sm font-mono font-bold ${item.availableUnits === 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                        {item.availableUnits} ชิ้น
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 font-medium">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">จัดซื้อทั้งหมด</span>
                      <span className="text-sm text-slate-300 font-mono font-bold">
                        {item.totalUnits} ชิ้น
                      </span>
                    </div>
                  </div>
                </div>

                {/* Roles Specific Buttons */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 gap-2 flex flex-col">
                  {/* STAFF CART CONTROLS */}
                  {isStaff && (
                    <div className="space-y-2">
                      {isOutOfStock ? (
                        <div className="text-center py-2 bg-slate-950/80 rounded-xl text-[10px] text-slate-500 font-bold border border-slate-800 uppercase tracking-widest">
                          {item.status === 'Ready' ? '❌ สินค้าหมดคลังชั่วคราว' : '🚫 งดเบิกยืมเนื่องจากกำลังซ่อมบำรุง'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {cartQty > 0 ? (
                            <div className="flex items-center justify-between w-full bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
                              <button
                                onClick={() => updateCartQty(item.id, cartQty - 1)}
                                className="p-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                              >
                                <MinusCircle size={15} />
                              </button>
                              <div className="text-xs font-mono font-extrabold text-white">
                                ยืม {cartQty} ชุด
                              </div>
                              <button
                                onClick={() => updateCartQty(item.id, cartQty + 1)}
                                className={`p-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer ${cartQty >= item.availableUnits ? 'opacity-30 cursor-not-allowed' : ''}`}
                                disabled={cartQty >= item.availableUnits}
                              >
                                <PlusCircle size={15} />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-[10px] px-2 py-1 text-rose-400 hover:bg-rose-950/30 rounded cursor-pointer font-bold shrink-0 transition"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item.id)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer uppercase tracking-wider"
                            >
                              <ShoppingBag size={14} />
                              ใส่ใบคำขอยืมอุปกรณ์
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
                        onClick={() => openEditEquipment(item)}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={12} />
                        แก้ไขครุภัณฑ์
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบ ${item.name} นี้ออกจากสารบบโสตฯ ใช่หรือไม่?`)) {
                            deleteEquipment(item.id);
                          }
                        }}
                        className="py-1.5 px-3 bg-rose-950/10 hover:bg-rose-950 text-rose-400 hover:text-white border border-rose-900/30 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={12} />
                        จำหน่ายออก
                      </button>

                      {/* REPAIR BUTTON (TRIGGER DIALOG) */}
                      {item.status === 'Ready' ? (
                        <button
                          onClick={() => openRepairModal(item)}
                          className="py-1.5 px-3 bg-amber-950/10 hover:bg-amber-950/30 border border-amber-900/30 hover:border-amber-700/60 text-amber-400 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer col-span-2"
                        >
                          <Wrench size={12} />
                          ส่งชำรุดเข้าห้องช่างบำรุง (-1 ยูนิต)
                        </button>
                      ) : (
                        <button
                          onClick={() => returnFromRepair(item.id)}
                          className="py-1.5 px-3 bg-emerald-950/40 hover:bg-emerald-950 border border-emerald-900 text-emerald-400 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer col-span-2"
                        >
                          <Check size={12} />
                          ซ่อมบำรุงเสร็จสิ้น | นำกลับเข้าคลัง (+1 ยูนิต)
                        </button>
                      )}
                    </div>
                  )}

                  {/* MANAGER INFORMATION LABELS ONLY */}
                  {currentUser.role === 'Manager' && (
                    <div className="text-xs text-center py-2 bg-slate-950/60 text-slate-400 rounded-xl border border-slate-800 font-medium">
                      {item.status === 'Ready' ? '✅ อุปกรณ์พร้อมใช้ (ติดต่อ Admin เพื่อแก้ไข)' : '🛠️ กำลังอยู่ในขั้นตอนส่งตรวจซ่อม'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EQUIPMENT MANAGEMENT MODAL (ADMIN ONLY) */}
      {isEquipmentModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3.5 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartPulse size={18} className="text-emerald-400" />
                {editingEquipment ? 'โมดูลแก้ไขรายละเอียดคุรุภัณฑ์โสตฯ' : 'ลงทะเบียนบันทึกอุปกรณ์ทางการแพทย์ชิ้นใหม่'}
              </h3>
              <button
                onClick={() => setIsEquipmentModalOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEquipmentSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">ชื่ออุปกรณ์โสตทัศนศึกษาทางการพยาบาล</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น เครื่องฉายโปรเจคเตอร์ 4K, กล้องผ่าตัด 60FPS"
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">หมวดหมู่ระบบเครื่องพ่วง</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  <label className="block text-slate-400 font-semibold mb-1.5">ภาพถ่ายอุปกรณ์แพทย์ (Upload Preview)</label>
                  <label className="w-full px-3 py-2 bg-slate-950 border border-dashed border-slate-800 hover:border-emerald-600 rounded-xl text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer transition">
                    <Upload size={14} className="text-emerald-400" />
                    <span>อัปโหลดรูปภาพ (.png, .jpeg)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Real-time Base64 preview snippet requested */}
              {formImage && (
                <div className="bg-slate-950 p-2 border border-slate-800 rounded-xl flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">พรีวิวรูปภาพอัปโหลด:</span>
                  <img src={formImage} alt="Preview" className="h-10 w-10 object-contain max-h-[40px] rounded border border-slate-800" referrerPolicy="no-referrer" />
                  <button type="button" onClick={() => setFormImage('')} className="text-[10px] text-rose-400 underline cursor-pointer ml-auto">ล้างรูปพรีวิว</button>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">คำอธิบายคุณสมบัติยุทโธปกรณ์เพิ่มเติม</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="ระบุวัตถุประสงค์ ส่วนเชื่อมต่อ กล่องบรรจุ และสิ่งของแนบเสร็จสรรพ..."
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">จำนวนรวมทั้งหมดจัดหา (Total Units)</label>
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
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">จำนวนพร้อมจ่ายยืม (Available Units)</label>
                  <input
                    type="number"
                    min={0}
                    max={formTotalUnits}
                    required
                    value={formAvailableUnits}
                    onChange={(e) => setFormAvailableUnits(Math.min(formTotalUnits, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEquipmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl font-bold cursor-pointer transition text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-bold cursor-pointer transition text-xs shadow-lg shadow-teal-950/20"
                >
                  {editingEquipment ? 'อัปเดตข้อมูล' : 'บันทึกเปิดคลังใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPAIR LOG MODAL FOR SPECIFYING REPAIR NOTES */}
      {isRepairModalOpen && repairTarget && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench size={16} className="text-amber-400" />
                <span>เปิดประวัติชำรุดเพื่อส่งซ่อมบำรุง (Repair notes)</span>
              </h3>
              <button
                onClick={() => setIsRepairModalOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs mb-4">
              <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">โปรไฟล์เป้าหมาย:</span>
              <p className="text-slate-200 font-bold">{repairTarget.name}</p>
              <div className="text-slate-500 text-[11px] mt-1 flex justify-between">
                <span>คลังพร้อมยืม ณ ปัจจุบัน: {repairTarget.availableUnits} ชุด</span>
                <span className="text-rose-400 animate-pulse font-bold">ส่งซ่อมจะลดลง 1 คลัง</span>
              </div>
            </div>

            <form onSubmit={handleRepairSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">สาเหตุการเสีย / อาการชำรุด (เวชศาสตร์เครื่องช่าง)</label>
                <textarea
                  required
                  rows={3}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="เช่น ลำโพงเสียงหวリード ไมโครโฟนไร้สายสัญญาณหลุดบ่อย หรือ เลนส์ขยายติดฝุ่นขุ่นมัว"
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-slate-950/40 p-2.5 rounded border border-slate-800">
                <Info size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>การกดยืนยันจะปรับสถานะอุปกรณ์เป็น Under Repair ทันที และระบบจะทำการหักยอดยูนิตจาก availableUnits ลง 1 ยูนิต คอยบำรุงเสร็จจึงสามารถกดคืนคลัง</span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRepairModalOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl font-bold cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold cursor-pointer text-xs transition"
                >
                  ยืนยันยืนคำสั่งส่งซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
