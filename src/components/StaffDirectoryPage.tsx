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
  Award
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

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name);
    setRole(member.role);
    setEmail(member.email);
    setPhone(member.phone);
    setPhoto(member.photo);
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
      photo: photo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23005a3c" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-200/80 gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users2 className="text-[#005a3c]" />
            <span>ทำเนียบคณะบุคลากรเทคนิคนักวิทยาการโสตทัศนศึกษาแพทย์ (AV Staff Directory)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            ช่องทางการสืบค้นติดต่อเจ้าหน้าที่ ช่างบำรุงวิทยุไมค์โครโฟน และวิศวกรดูแลระบบบันทึกภาพปฏิบัติการโรงพยาบาล
          </p>
        </div>

        {isEditor && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Plus size={16} />
            เพิ่มสัญญาสตาฟท่านใหม่
          </button>
        )}
      </div>

      {/* Staff Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffDirectory.map((member) => (
          <div
            key={member.id}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition duration-200"
          >
            <div>
              {/* Photo & Role Badge */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center p-1.5 border border-slate-200 overflow-hidden shrink-0 shadow-inner">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="max-h-full max-w-full rounded object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-850 truncate">{member.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-[#005a3c] font-black">
                    <Award size={12} className="shrink-0" />
                    <span className="truncate">{member.role}</span>
                  </div>
                </div>
              </div>

              {/* Contact methods */}
              <div className="space-y-2 mt-5 text-[11.5px] text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-snug font-bold">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate font-sans font-medium" title={member.email}>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span className="font-mono">{member.phone}</span>
                </div>
              </div>
            </div>

            {/* Admin operations */}
            {isEditor && (
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black border border-slate-200 shadow-sm text-center flex items-center justify-center gap-1.5 cursor-pointer hover:border-slate-350"
                >
                  <Edit2 size={11} className="text-[#005a3c]" />
                  แก้ไขประวัติ
                </button>
                <button
                  onClick={() => {
                    if (confirm(`คุณกรุณาตัดสินใจลบคุณ ${member.name} ออกจากระบบทำเนียบสตาฟโรงพยาบาลหรือไม่?`)) {
                      deleteStaff(member.id);
                    }
                  }}
                  className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[10px] text-center font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={11} />
                  ลบข้อมูลออก
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* STAFF CREATE/EDIT DIRECTORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-[#005a3c] flex items-center gap-2">
                <Users2 size={18} />
                <span>{editingStaff ? 'แก้ไขข้อมูลประวัติเจ้าหน้าที่' : 'ลงบันทึกรายชื่อกำลังบุคลากรโสตฯ บังคับบัญชาใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-500 font-black mb-1.5">ชื่อจริง - นามสกุลจริง (คำนำหน้าตามแพทยศาสตร์)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น นายอัศวิน รักษาธรรม"
                  className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-black mb-1.5">ตำแหน่ง / ฝ่ายงานควบคุมดูแล</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="เช่น หัวหน้าฝ่ายซ่อมบำรุงเครื่องขยายเสียงในงานเทคนิคศึกษาพยาบาล"
                  className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-black mb-1.5">เบอร์โทรติดต่อภายใน</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 062-xxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-black mb-1.5">อีเมลโรงพยาบาล (@taksin.hospital)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="เช่น staff.a@taksin.hospital"
                    className="w-full px-3 py-2 bg-slate-50 text-slate-800 border-slate-250 border rounded-xl focus:ring-2 focus:ring-[#005a3c] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Portrait Image upload preview */}
              <div>
                <label className="block text-slate-500 font-black mb-1.5">รูปคู่ถ่ายภาพติดบัตรพนักงาน (Upload base64)</label>
                <label className="w-full px-3 py-2.5 bg-slate-50 border border-dashed border-slate-350 hover:border-[#005a3c] rounded-xl text-slate-500 flex items-center justify-center gap-1.5 cursor-pointer transition font-bold">
                  <Upload size={14} className="text-[#005a3c]" />
                  <span>ค้นหาไฟล์ภาพถ่ายประวัติสตาฟ...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {photo && (
                <div className="bg-slate-100 p-2 border border-slate-200 rounded-xl flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">พรีวิวรูปโปรไฟล์:</span>
                  <img src={photo} alt="Preview" className="h-[40px] w-[40px] object-contain rounded border border-slate-200" referrerPolicy="no-referrer" />
                  <button type="button" onClick={() => setPhoto('')} className="text-[10px] text-rose-500 underline font-black cursor-pointer ml-auto">ล้างรูปพรีวิว</button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005a3c] hover:bg-[#004730] text-white rounded-xl font-black cursor-pointer transition text-xs shadow-sm"
                >
                  {editingStaff ? 'บันทึกแก้ไข' : 'บันทึกเปิดตัวเจ้าหน้าที่ใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
