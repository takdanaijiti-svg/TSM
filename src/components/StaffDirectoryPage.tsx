import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StaffMember } from '../types';
import {
  Users2,
  Mail,
  Phone,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  User,
  Activity,
  Award,
  BookOpen
} from 'lucide-react';

export const StaffDirectoryPage: React.FC = () => {
  const { staffDirectory, currentUser, addStaff, updateStaff, deleteStaff } = useApp();
  
  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');

  const isEditor = currentUser?.role === 'Admin';

  const resetForm = () => {
    setEditingStaff(null);
    setName('');
    setRole('');
    setEmail('');
    setPhone('');
    setPhoto('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StaffMember) => {
    setEditingStaff(item);
    setName(item.name);
    setRole(item.role);
    setEmail(item.email);
    setPhone(item.phone);
    setPhoto(item.photo);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !email.trim() || !phone.trim()) return;

    const payload = {
      name,
      role,
      email,
      phone,
      photo: photo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230f766e" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    };

    if (editingStaff) {
      updateStaff(editingStaff.id, payload);
    } else {
      addStaff(payload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Users2 className="text-emerald-400" />
            ทำเนียบบุคลากรฝ่ายโสตทัศนศึกษาแพทย์ (AV Staff Directory)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            สืบค้นข้อมูลทำเนียบช่างเทคนิค วิศวกรเครื่องเสียง และผู้ควบคุมบริหารงานโสตทัศน์ประจำโรงพยาบาล
          </p>
        </div>

        {isEditor && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-950/40 flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Plus size={16} />
            เพิ่มรายชื่อเจ้าหน้าที่โสตฯ
          </button>
        )}
      </div>

      {/* Staff Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffDirectory.map((member) => (
          <div
            key={member.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between hover:border-slate-700 transition duration-200"
          >
            <div>
              {/* Photo & Role Badge */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center p-1.5 border border-slate-800 overflow-hidden shrink-0">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="max-h-full max-w-full rounded object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-100 truncate">{member.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-emerald-400 font-bold">
                    <Award size={12} className="shrink-0" />
                    <span className="truncate">{member.role}</span>
                  </div>
                </div>
              </div>

              {/* Contact methods */}
              <div className="space-y-2 mt-5 text-[11.5px] text-slate-400 bg-slate-950 p-3.5 rounded-xl border border-slate-850/60 leading-normal">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-500 shrink-0" />
                  <span className="truncate" title={member.email}>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 pt-1.5 border-t border-slate-900">
                  <Phone size={13} className="text-slate-500 shrink-0" />
                  <span className="font-mono">{member.phone}</span>
                </div>
              </div>
            </div>

            {/* Admin operations */}
            {isEditor && (
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[10px] font-bold border border-slate-700 text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 size={11} />
                  แก้ไขโปรไฟล์
                </button>
                <button
                  onClick={() => {
                    if (confirm(`คุณกรุณาตัดสินใจแน่ชัดที่จะปรับโครงสร้าง ลบคุณ ${member.name} ออกจากระบบทำเนียบสตาฟหรือไม่?`)) {
                      deleteStaff(member.id);
                    }
                  }}
                  className="py-1.5 px-3 bg-rose-950/10 hover:bg-rose-950 text-rose-400 border border-rose-900/30 rounded-xl text-[10px] text-center font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={11} />
                  ลบรายชื่อออก
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* STAFF CREATE/EDIT DIRECTORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users2 size={18} className="text-emerald-400" />
                <span>{editingStaff ? 'แก้ไขข้อมูลทำเนียบสตาฟ' : 'เพิ่มรายชื่อกำลังบุคลากรโสตฯ ท่านใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-850 p-1 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">ชื่อจริง - นามสกุลจริง (ไทย/อังกฤษ)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น นายอัศวิน บุญรักษา"
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">บทบาทหน้าที่ / ตำแหน่งทำงาน</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="เช่น ช่างซ่อมบำรุงกล้องผ่าตัดอาวุโส"
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">โทรศัพท์ติดต่อภายใน</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 089-xxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 font-sans">อีเมลสำนักโรงพยาบาล</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="เช่น staff@hospital.com"
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Portrait Image selection Base64 preview mandated */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">รูปคู่ถ่ายประวัติพนักงาน (Upload Preview)</label>
                <label className="w-full px-3 py-2.5 bg-slate-950 border border-dashed border-slate-800 hover:border-emerald-600 rounded-xl text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer transition">
                  <Upload size={14} className="text-emerald-400" />
                  <span>บันทึกไฟล์ภาพถ่าย (.png, .jpeg)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {photo && (
                <div className="bg-slate-950 p-2 border border-slate-800 rounded-xl flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block">พรีวิวรูปถ่ายหน้าตรง:</span>
                  <img src={photo} alt="Preview" className="h-[40px] w-[40px] object-contain rounded border border-slate-800" referrerPolicy="no-referrer" />
                  <button type="button" onClick={() => setPhoto('')} className="text-[10px] text-rose-400 underline cursor-pointer ml-auto">ล้างรูปพรีวิว</button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl font-bold cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-bold cursor-pointer transition text-xs shadow-lg shadow-teal-950/20"
                >
                  {editingStaff ? 'บันทึกแก้ไขข้อมูล' : 'ส่งบันทึกสารบัญใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
