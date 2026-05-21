import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Equipment, CartItem, Reservation, StaffMember, SystemSettings, Role, ReservationStatus, ActivityLog } from '../types';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  equipmentList: Equipment[];
  cart: CartItem[];
  reservations: Reservation[];
  staffDirectory: StaffMember[];
  settings: SystemSettings;
  activityLogs: ActivityLog[];
  login: (email: string, password?: string) => boolean;
  register: (name: string, email: string, password: string, role: Role, department: string) => boolean;
  logout: () => void;
  // Equipment Management
  addEquipment: (item: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updated: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  // Repair Workflow
  sendToRepair: (id: string, notes: string, quantity: number) => void;
  returnFromRepair: (id: string, quantity: number) => void;
  // Cart Actions
  addToCart: (equipmentId: string, qty?: number) => void;
  removeFromCart: (equipmentId: string) => void;
  updateCartQty: (equipmentId: string, quantity: number) => void;
  clearCart: () => void;
  // Reservation Management
  createReservation: (purpose: string, pickupTime: string, returnTime: string) => { success: boolean; message: string };
  approveReservation: (id: string) => void;
  rejectReservation: (id: string, reason: string) => void;
  handoverReservation: (id: string) => void;
  returnReservation: (id: string) => void;
  // Staff Directory Management
  addStaff: (member: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, updated: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  // Settings Management
  updateSettings: (hospitalName: string, logoUrl: string, maxLoanDays: number, autoApproveConsumables: boolean) => void;
  // Logs Action
  addActivityLog: (action: string, details: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  clearLogs: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial SVG mock-images as default base64 strings or clean SVG markers
const MOCK_IMAGES = {
  projector: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="11" rx="2" ry="2"></rect><path d="M6 15v3"></path><path d="M18 15v3"></path><circle cx="12" cy="9" r="2"></circle></svg>',
  camera: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',
  audio: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><circle cx="12" cy="14" r="4"></circle><line x1="12" y1="6" x2="12.01" y2="6"></line></svg>',
  vr: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
  cart: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>',
  pointer: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3Z"></path><path d="m19 12-7-7 3-3 7 7-3 3Z"></path><path d="m14 15-4-4"></path></svg>',
  staff1: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230f766e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
};

const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'ผศ.นพ.นัฐวุฒิ รักเรียน (ผู้ดูแลระบบโสตฯ)', email: 'admin@taksin.hospital', role: 'Admin', department: 'ฝ่ายบริการการแพทย์และโสตทัศนูปกรณ์', password: 'TaksinAdmin2026' },
  { id: 'u2', name: 'ดร.อรอนงค์ เลิศภักดิ์ (หัวหน้าฝ่ายบริหารการรักษา)', email: 'manager@taksin.hospital', role: 'Manager', department: 'กลุ่มงานเทคโนโลยีสารสนเทศเพื่อสุขภาพ', password: 'TaksinManager3000' },
  { id: 'u3', name: 'นางสาวพิไลวรรณ พลอยดี (พยาบาลวิชาชีพชำนาญการ)', email: 'staff@taksin.hospital', role: 'Staff', department: 'หอผู้ป่วยวิกฤตศัลยกรรม (Surgical ICU)', password: 'TaksinStaff111' },
];

const DEFAULT_EQUIPMENT: Equipment[] = [
  // Category 1: AV Equipment & Hardware (Loanable / ยืม-คืน)
  {
    id: 'eq1',
    name: 'Projector (เครื่องฉายโปรเจคเตอร์)',
    category: 'Hardware',
    description: 'เครื่องฉายประสิทธิภาพสูง เหมาะสำหรับการบรรยายทางวิชาการและประชุมแพทย์',
    totalUnits: 5,
    availableUnits: 5,
    status: 'Ready',
    image: MOCK_IMAGES.projector
  },
  {
    id: 'eq2',
    name: 'Notebook (โน้ตบุ๊ก)',
    category: 'Hardware',
    description: 'โน้ตบุ๊กประสิทธิภาพสูง สำหรับงานนำเสนอและงานสอนทั่วไปของแพทย์ธิการ',
    totalUnits: 10,
    availableUnits: 10,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line><line x1="12" y1="17" x2="12" y2="20"></line></svg>'
  },
  {
    id: 'eq3',
    name: 'PC All in One (คอมพิวเตอร์ตั้งโต๊ะ All in One)',
    category: 'Hardware',
    description: 'คอมพิวเตอร์ตั้งโต๊ะ All in One จอใหญ่สะดวกใช้งาน ทำงานประมวลการสอนรวดเร็ว',
    totalUnits: 4,
    availableUnits: 4,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2316a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="12" rx="2"></rect><path d="M12 15v5M9 20h6"></path></svg>'
  },
  {
    id: 'eq4',
    name: 'Speaker System (ชุดลำโพงเคลื่อนย้าย)',
    category: 'Audio',
    description: 'ลำโพงอเนกประสงค์ มีล้อลากและแบตเตอรี่ในตัวสำหรับการบรรยายพยุงชีพ',
    totalUnits: 6,
    availableUnits: 6,
    status: 'Ready',
    image: MOCK_IMAGES.audio
  },
  {
    id: 'eq5',
    name: 'Television (TV)',
    category: 'Hardware',
    description: 'จอโทรทัศน์แบนราบ สำหรับต่อพ่วงแสดงรายละเอียดสไลด์การประชุมพยาธิวิทยา',
    totalUnits: 3,
    availableUnits: 3,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2"><rect x="2" y="3" width="20" height="13" rx="2"></rect><line x1="12" y1="16" x2="12" y2="21"></line><line x1="8" y1="21" x2="16" y2="21"></line></svg>'
  },
  {
    id: 'eq6',
    name: 'Power Strip (ปลั๊กไฟต่อพ่วง)',
    category: 'Accessories',
    description: 'ปลั๊กพ่วงสายยาว ปลอดภัย ได้มาตรฐานความหน่วงไฟฟ้ากระทรวงสาธารณสุข',
    totalUnits: 15,
    availableUnits: 15,
    status: 'Ready',
    image: MOCK_IMAGES.pointer
  },
  {
    id: 'eq7',
    name: 'Utility Cart (รถเข็นย้ายอุปกรณ์)',
    category: 'Accessories',
    description: 'รถเข็นเหล็กพกพาสะดวก สำหรับขนย้ายสื่ออุปกรณ์โสตฯ ตามตึกวอร์ดผู้ป่วยเพื่อจัดงานสอน',
    totalUnits: 2,
    availableUnits: 2,
    status: 'Ready',
    image: MOCK_IMAGES.cart
  },
  {
    id: 'eq8',
    name: 'Visualizer (เครื่องฉายภาพ 3 มิติ)',
    category: 'Hardware',
    description: 'เครื่องฉายจับมุมด้านบนจับฉายฟิล์มเอกสารและชิ้นตัวอย่างการแพทย์จำลอง',
    totalUnits: 2,
    availableUnits: 2,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%234338ca" stroke-width="2"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path><path d="M12 4V2M12 22v-2M4 12H2M22 12h-2"></path></svg>'
  },
  {
    id: 'eq9',
    name: 'Wireless Microphone (ไมค์ลอย)',
    category: 'Audio',
    description: 'ไมโครโฟนไร้สายส่งพลังงานคลื่นวิทยุความถี่สูง UHF สัญญาณแน่นต้านสัญญาณรบกวนแพทย์',
    totalUnits: 8,
    availableUnits: 8,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23db2777" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"></path></svg>'
  },
  {
    id: 'eq10',
    name: 'Conference Microphone (ไมค์ประชุม Conference)',
    category: 'Audio',
    description: 'ไมโครโฟนก้านยาวสไตล์คอห่าน พร้อมปุ่มสลับเสียงของประธานเปิดการจัดประชุมวิชาการ',
    totalUnits: 4,
    availableUnits: 4,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%237c3aed" stroke-width="2"><path d="M17 12a5 5 0 0 1-10 0"></path><path d="M12 17v4"></path><path d="M9 21h6"></path><path d="M12 1a3 3 5 0 0 1-3 3v7a3 3 0 0 1 6 0V4a3 3 0 0 1-3-3Z"></path></svg>'
  },
  {
    id: 'eq11',
    name: 'HDMI Cable (สายสัญญาณ HDMI)',
    category: 'Cables',
    description: 'สายต่อภาพความละเอียดความเร็วสูง HDMI 5m - 10m สำหรับเชื่อมต่อพอร์ตรวมหน้าสไลด์',
    totalUnits: 20,
    availableUnits: 20,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230f766e" stroke-width="2"><path d="M12 2v20M17 5H7M17 19H7"></path></svg>'
  },
  {
    id: 'eq12',
    name: 'Audio Cable (สายสัญญาณเสียง)',
    category: 'Cables',
    description: 'สายพ่วง AUX / XLR สำหรับต่อเชื่อมเสียงจากคอมพิวเตอร์เข้าแอมป์ใหญ่หอประชุม',
    totalUnits: 15,
    availableUnits: 15,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230f766e" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path></svg>'
  },
  {
    id: 'eq13',
    name: 'iPad Adapter (Adapter iPad)',
    category: 'Accessories',
    description: 'ตัวแปลงสัญญาณ Lightning / USB-C เป็น HDMI สำหรับแพทย์สายไอแพดฉายสไลด์เคส',
    totalUnits: 5,
    availableUnits: 5,
    status: 'Ready',
    image: MOCK_IMAGES.pointer
  },
  {
    id: 'eq14',
    name: 'HDMI Adapter (Adapter HDMI)',
    category: 'Accessories',
    description: 'ฮับต่อเชื่อมพอร์ตแปลงพ่วงสัญญาณ HDMI นานาสายต่อ',
    totalUnits: 10,
    availableUnits: 10,
    status: 'Ready',
    image: MOCK_IMAGES.pointer
  },
  {
    id: 'eq15',
    name: 'Macbook Adapter (Adapter Macbook)',
    category: 'Accessories',
    description: 'ตัวเชื่อมต่อแปรผันพอร์ตสำหรับแมคบุ๊กโดยเฉพาะ เพื่อแก้ปัญหาสายข้ามแบรนด์',
    totalUnits: 5,
    availableUnits: 5,
    status: 'Ready',
    image: MOCK_IMAGES.pointer
  },
  {
    id: 'eq16',
    name: 'Portable Projector Screen (จอรับโปรเจคเตอร์เคลื่อนที่)',
    category: 'Hardware',
    description: 'จอรับภาพพื้นขาวขาตั้งดึงก้าน แอร์เคลื่อนย้ายเร็วสำหรับจัดสอนวอร์ดด่วน',
    totalUnits: 4,
    availableUnits: 4,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2"><rect x="3" y="3" width="18" height="11" rx="2"></rect><path d="M12 14v5M7 19h10"></path></svg>'
  },
  {
    id: 'eq17',
    name: 'Laminator (เครื่องเคลือบบัตร/เอกสาร)',
    category: 'Hardware',
    description: 'เครื่องรีดพลาสติกเคลือบคะแนนบัตร ป้ายสตาฟ หรือรูปภาพพรีเกรดประกอบงานวิจัย',
    totalUnits: 2,
    availableUnits: 2,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230284c7" stroke-width="2"><path d="M4 18h16V6H4v12z"></path><path d="M1 9h2M21 9h2M6 22h12"></path></svg>'
  },
  {
    id: 'eq18',
    name: 'Heavy Duty Stapler (แม็กเย็บ ตัวใหญ่)',
    category: 'Office Supply',
    description: 'เครื่องเย็บเอกสารประวัติและเล่มงานพิมพ์ประกาศแพทย์ตัวหนาพิเศษ',
    totalUnits: 3,
    availableUnits: 3,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
  },
  {
    id: 'eq19',
    name: 'Standard Stapler (แม็กเย็บ ตัวเล็ก)',
    category: 'Office Supply',
    description: 'สเตปเลอร์เย็บประดาบขนาดทั่วไปสำหรับจัดกระดาษชีทเข้าแถว',
    totalUnits: 8,
    availableUnits: 8,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e45af" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>'
  },
  {
    id: 'eq20',
    name: 'Scissors (กรรไกร)',
    category: 'Office Supply',
    description: 'กรรไกรคมเหล็กด้ามสีสำหรับการจัดตัดแต่งขอบสติ๊กเกอร์พิจารณาบอร์ด',
    totalUnits: 10,
    availableUnits: 10,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23db2777" stroke-width="2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.8" y1="14.8" x2="20" y2="20"></line></svg>'
  },
  {
    id: 'eq21',
    name: 'Cutter (คัตเตอร์)',
    category: 'Office Supply',
    description: 'มีดคัตเตอร์คมปรับก้านสไลด์อรรถประโยชน์ตัดกรีดแผ่นรองฟิวเจอร์บอร์ด',
    totalUnits: 10,
    availableUnits: 10,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23db2777" stroke-width="2"><path d="m14.5 17.5 5 5 3-3-5-5"></path><path d="M13 16V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12z"></path></svg>'
  },
  {
    id: 'eq22',
    name: 'Ruler (ไม้บรรทัด)',
    category: 'Office Supply',
    description: 'ไม้บรรทัดเหล็กเกรดพรีเมียม สเกลชัดเจน สำหรับจัดสติกเกอร์ตรงเลเวลยึดเกาะ',
    totalUnits: 15,
    availableUnits: 15,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%234b5563" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="1"></rect><line x1="6" y1="7" x2="6" y2="12"></line><line x1="10" y1="7" x2="10" y2="12"></line><line x1="14" y1="7" x2="14" y2="12"></line><line x1="18" y1="7" x2="18" y2="12"></line></svg>'
  },
  {
    id: 'eq23',
    name: 'Cutting Mat (แผ่นรองตัด)',
    category: 'Office Supply',
    description: 'แผ่นยางรองกรีดจัดแนว ป้องกันผิวโต๊ะเป็นรอย มีพาสติกหนืดรับมีดดั่งดี',
    totalUnits: 5,
    availableUnits: 5,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>'
  },
  {
    id: 'eq24',
    name: 'Microphone Stand (ขาตั้งไมค์)',
    category: 'Audio',
    description: 'ขาตั้งเหล็กก้านสไลด์สากลอัพบวกได้หน้าเวที สแตฟจัดให้ได้',
    totalUnits: 6,
    availableUnits: 6,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><path d="M5 19h14M12 5l-4-3 4-1 4 1-4 3Z"></path></svg>'
  },
  {
    id: 'eq25',
    name: 'Vinyl Stand (ขาตั้งป้ายไวนิล)',
    category: 'Accessories',
    description: 'ขาเหล็กพับแบบ X-Stand ขึงป้ายโฆษณาจัดตั้งบอร์ดนิทรรศการวิชาการหน้าตึก',
    totalUnits: 4,
    availableUnits: 4,
    status: 'Ready',
    image: MOCK_IMAGES.pointer
  },
  {
    id: 'eq26',
    name: 'Squeegee (ไม้ปาดสติ๊กเกอร์)',
    category: 'Office Supply',
    description: 'แผ่นปาดหน้าตัดติดเรียบริมสติ๊กเกอร์ไวนิล ปราศจากฟองอากาศรบกวนตา',
    totalUnits: 4,
    availableUnits: 4,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23059669" stroke-width="2"><path d="M4 8h16V4H4v4z"></path><path d="M12 8v12M8 20h8"></path></svg>'
  },

  // Category 2: Office Supplies & Consumables (Deduct Only / เบิกแล้วหมดไป)
  {
    id: 'eq27',
    name: 'Futureboard (ฟิวเจอร์บอร์ด)',
    category: 'Consumables',
    description: 'แผ่นพลาสติกลูกฟูกตกแต่งป้ายสัมมนาหรือจัดนิทรรศการบอร์ดแพทย์ (เบิกแล้วหมดไป)',
    totalUnits: 30,
    availableUnits: 30,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq28',
    name: 'A4 Paper (กระดาษ A4 ธรรมดา)',
    category: 'Consumables',
    description: 'กระดาษดับเบิ้ลเอกระดาษคุณภาพพรีเมียม 80 แกรม สำหรับพิมพ์ใบโปรแกรม (เบิกแล้วหมดไป)',
    totalUnits: 100,
    availableUnits: 100,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq29',
    name: 'A4 Sticker Paper (กระดาษสติ๊กเกอร์ A4)',
    category: 'Consumables',
    description: 'สติ๊กเกอร์สีขาวพิมพ์และลอกติดกล่องเคสจัดลำดับผู้ป่วย (เบิกแล้วหมดไป)',
    totalUnits: 50,
    availableUnits: 50,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq30',
    name: 'A4 Photo Paper (กระดาษ A4 Photo)',
    category: 'Consumables',
    description: 'กระดาษพิมพ์สีกึ่งมันสวยงามพรีเมียมสำหรับภาพวิชาการผู้ป่วย (เบิกแล้วหมดไป)',
    totalUnits: 40,
    availableUnits: 40,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq31',
    name: 'AA Battery (ถ่าน AA)',
    category: 'Consumables',
    description: 'แบตเตอรี่อัลคาไลน์ไฟแรงสม่ำเสมอ สำหรับห้องสัมมนาใหญ่และไมโครโฟนลอย (เบิกแล้วหมดไป)',
    totalUnits: 120,
    availableUnits: 120,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq32',
    name: 'AAA Battery (ถ่าน AAA)',
    category: 'Consumables',
    description: 'แบตเตอรี่ตรายาวสำหรับใส่รีโมตนำเสนอพอยเตอร์และสัมปทานอุปกรณ์โสตฯ (เบิกแล้วหมดไป)',
    totalUnits: 120,
    availableUnits: 120,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq33',
    name: 'A4 Laminating Pouches (พลาสติกเคลือบแข็ง/สติ๊กเกอร์เคลือบ A4)',
    category: 'Consumables',
    description: 'พลาสติคใสเคลือบแข็งสลักเอกสารสตาฟป้องกันการหลุดกระดาษ (เบิกแล้วหมดไป)',
    totalUnits: 200,
    availableUnits: 200,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq34',
    name: 'Staples (ไส้แม็ก)',
    category: 'Consumables',
    description: 'กล่องไส้สเตปเลอร์ ลวดเย็บกระดาษสำหรับอัดชุดกระดาษสัมมนาแพทย์ (เบิกแล้วหมดไป)',
    totalUnits: 50,
    availableUnits: 50,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq35',
    name: 'Clear Sticker Film (สติ๊กเกอร์ใส)',
    category: 'Consumables',
    description: 'สติ๊กเกอร์ใสก้านกว้างใช้อัดเรียบผิวหน้าป้ายไวนิลสัมมนาการเรียนรู้ (เบิกแล้วหมดไป)',
    totalUnits: 30,
    availableUnits: 30,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq36',
    name: 'Double-Sided Foam Tape (กระดาษกาวสองหน้าแบบหนา)',
    category: 'Consumables',
    description: 'กาวโฟมสองหน้าแกนหนายึดแผ่นป้ายหน้าวอร์ดมั่นคงปลอดภัย (เบิกแล้วหมดไป)',
    totalUnits: 20,
    availableUnits: 20,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq37',
    name: 'Double-Sided Tissue Tape (กระดาษกาวสองหน้าแบบบาง)',
    category: 'Consumables',
    description: 'กระดาษเยื่อกาวบางติดสั่นแน่น เพื่อการประกอบใบชีทสัมปทานประดาษ (เบิกแล้วหมดไป)',
    totalUnits: 25,
    availableUnits: 25,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq38',
    name: 'Clear Tape (เทปใส)',
    category: 'Consumables',
    description: 'ม้วนมอกกาวใสขนาดอรรถประโยชน์เพื่องานสาสน์ (เบิกแล้วหมดไป)',
    totalUnits: 40,
    availableUnits: 40,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq39',
    name: 'A4 Opp Plastic Bag (ซองแก้ว A4)',
    category: 'Consumables',
    description: 'ซองซิลพลาสติกแก้วใสป้องกันคราบสกปรกและถนอมเกียรติบัตร (เบิกแล้วหมดไป)',
    totalUnits: 300,
    availableUnits: 300,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  },
  {
    id: 'eq40',
    name: 'Others (อื่นๆ)',
    category: 'Consumables',
    description: 'พัสดุหรือวัสดุสิ้นเปลืองสำหรับงานโสตศึกษาเบ็ดเตล็ด (เบิกแล้วหมดไป)',
    totalUnits: 100,
    availableUnits: 100,
    status: 'Ready',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230F766E" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>'
  }
];

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'st1',
    name: 'นายสมชาย รักโสต (Somchai Raksot)',
    role: 'หัวหน้างานโสตทัศนศึกษาแพทย์ (Chief of AV)',
    email: 'somchai.r@hospital.com',
    phone: '081-234-5678',
    photo: MOCK_IMAGES.staff1
  },
  {
    id: 'st2',
    name: 'นางสาวมณีจันทร์ อุปกรณ์ดี (Maneechan Upakorndee)',
    role: 'นักโสตทัศนศึกษาปฏิบัติการ (AV Specialist)',
    email: 'maneechan.u@hospital.com',
    phone: '089-876-5432',
    photo: MOCK_IMAGES.staff1
  },
  {
    id: 'st3',
    name: 'นายเกียรติศักดิ์ พึ่งสาย (Kiatsak Phungsai)',
    role: 'วิศวกรเครื่องเสียงการศึกษา (Sound-Visual Engineer)',
    email: 'kiatsak.p@hospital.com',
    phone: '084-555-1234',
    photo: MOCK_IMAGES.staff1
  },
];

const DEFAULT_RESERVATIONS: Reservation[] = [
  {
    id: 'res-101',
    userId: 'u3',
    userName: 'นางสาวพิไลวรรณ พลอยดี',
    userDepartment: 'ฝ่ายกุมารเวชศาสตร์ (Pediatric)',
    items: [
      { equipmentId: 'eq1', equipmentName: 'Projector (เครื่องฉายโปรเจคเตอร์)', quantity: 1 },
      { equipmentId: 'eq9', equipmentName: 'Wireless Microphone (ไมค์ลอย)', quantity: 2 },
    ],
    purpose: 'งานสัมมนาวิชาการเรื่องการดูแลทารกแรกเกิดภาวะวิกฤต (NICU Grand Rounds)',
    pickupTime: '2026-05-18T08:30',
    returnTime: '2026-05-18T16:30',
    status: 'Returned',
    createdAt: '2026-05-17T11:00:00Z',
  },
  {
    id: 'res-102',
    userId: 'u3',
    userName: 'นางสาวพิไลวรรณ พลอยดี',
    userDepartment: 'ฝ่ายอายุรกรรม (Medicine)',
    items: [
      { equipmentId: 'eq27', equipmentName: 'Futureboard (ฟิวเจอร์บอร์ด)', quantity: 5 },
      { equipmentId: 'eq28', equipmentName: 'A4 Paper (กระดาษ A4 ธรรมดา)', quantity: 20 }
    ],
    purpose: 'แผนจัดอบรมผู้ช่วยวิจัยเวชศาสตร์และป้ายสัมมนา (เบิกวัสดุสิ้นเปลืองสำนักงาน)',
    pickupTime: '2026-05-19T09:00',
    returnTime: '',
    status: 'Disbursed',
    createdAt: '2026-05-18T10:30:00Z',
  },
  {
    id: 'res-103',
    userId: 'u3',
    userName: 'นางสาวพิไลวรรณ พลอยดี',
    userDepartment: 'ฝ่ายศัลยกรรม (Surgery)',
    items: [
      { equipmentId: 'eq1', equipmentName: 'Projector (เครื่องฉายโปรเจคเตอร์)', quantity: 1 },
      { equipmentId: 'eq6', equipmentName: 'Power Strip (ปลั๊กไฟต่อพ่วง)', quantity: 1 }
    ],
    purpose: 'บันทึกการสอนหัตถการเย็บหลอดเลือดใหญ่ในห้องปฏิบัติการจำลองระดับสูง',
    pickupTime: '2026-05-20T13:00',
    returnTime: '2026-05-20T17:00',
    status: 'Approved',
    createdAt: '2026-05-19T14:40:00Z',
  },
  {
    id: 'res-104',
    userId: 'u3',
    userName: 'นางสาวพิไลวรรณ พลอยดี',
    userDepartment: 'ฝ่ายอายุรกรรม (Medicine)',
    items: [
      { equipmentId: 'eq3', equipmentName: 'PC All in One (คอมพิวเตอร์ตั้งโต๊ะ All in One)', quantity: 1 },
    ],
    purpose: 'สัมภาษณ์ประชุมปรึกษาทางไกลร่วมกับโรงพยาบาลเครือข่ายจังหวัดพังงา',
    pickupTime: '2026-05-21T09:00',
    returnTime: '2026-05-21T12:00',
    status: 'Pending',
    createdAt: '2026-05-20T04:00:00Z',
  },
  {
    id: 'res-105',
    userId: 'u3',
    userName: 'นางสาวพิไลวรรณ พลอยดี',
    userDepartment: 'ฝ่ายจิตเวชศาสตร์ (Psychology)',
    items: [
      { equipmentId: 'eq9', equipmentName: 'Wireless Microphone (ไมค์ลอย)', quantity: 1 },
    ],
    purpose: 'กิจกรรมจัดอบรมบุคลากรด้านจิตวิทยาบรรเทาความเหนื่อยล้าในการทำงาน (Burnout Relief)',
    pickupTime: '2026-05-15T09:00',
    returnTime: '2026-05-15T12:00',
    status: 'Rejected',
    createdAt: '2026-05-14T08:00:00Z',
    rejectionReason: 'ไมโครโฟนมีอัตราคิวยืมทับซ้อนเต็มจำนวนและลำโพงขัดข้องในวันเวลาดังกล่าว',
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  hospitalName: 'โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช',
  logoUrl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="47" fill="#005a3c" stroke="#ffffff" stroke-width="1" /><circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.5" /><circle cx="50" cy="50" r="33.5" fill="none" stroke="#ffffff" stroke-width="1.2" /><path id="topTextPath" d="M 9.5 50 A 40.5 40.5 0 0 1 90.5 50" fill="none" /><path id="bottomTextPath" d="M 90.5 50 A 40.5 40.5 0 0 1 9.5 50" fill="none" /><text font-family="'Sarabun', 'Inter', sans-serif" font-size="4.2" font-weight="950" fill="#ffffff" letter-spacing="0.08"><textPath href="#topTextPath" startOffset="50%" text-anchor="middle">โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช</textPath></text><text font-family="'Sarabun', 'Inter', sans-serif" font-size="5" font-weight="950" fill="#ffffff" letter-spacing="0.1"><textPath href="#bottomTextPath" startOffset="50%" text-anchor="middle">กระทรวงสาธารณสุข</textPath></text><g transform="translate(50, 50) scale(0.55)"><line x1="0" y1="-28" x2="0" y2="24" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" /><circle cx="0" cy="-28" r="3" fill="#ffffff" /><path d="M -5 -33 C -7 -38 0 -45 0 -45 C 0 -45 7 -38 5 -33 C 8 -30 3 -26 0 -26 C -3 -26 -8 -30 -5 -33 Z" fill="#ffffff" /><path d="M -2 -31 C -4 -34 0 -38 0 -38 C 0 -38 4 -34 2 -31 C 3 -29 1 -27 0 -27 C -1 -27 -3 -29 -2 -31 Z" fill="#e6f4ea" opacity="0.9" /><path d="M 0 -13 C 8 -23 25 -18 25 -9 C 25 -2 15 -4 10 -2 C 6 0 2 3 0 5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 -13 C -8 -23 -25 -18 -25 -9 C -25 -2 -15 -4 -10 -2 C -6 0 -2 3 0 5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 -7 C 5 -15 20 -11 20 -4 C 20 2 12 0 7 2" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 -7 C -5 -15 -20 -11 -20 -4 C -20 2 -12 0 -7 2" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" /><path d="M 0 10 C 13 8 13 -6 0 -8 C -13 -6 -13 8 0 10" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" /><path d="M 0 22 C 10 20 10 12 0 10 C -10 12 -10 20 0 22" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" /><path d="M -1 -7 C -5 -9 -8 -9 -11 -8 C -10 -7 -8 -5 -5 -6 Z" fill="#ffffff" /><path d="M 1 -7 C 5 -9 8 -9 11 -8 C 10 -7 8 -5 5 -6 Z" fill="#ffffff" /></g></svg>`,
  maxLoanDays: 7,
  autoApproveConsumables: true
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global States initialization
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('av_users');
    const loaded: User[] = saved ? JSON.parse(saved) : DEFAULT_USERS;
    
    // Safety migrations: If there are old demo accounts with old passwords, map them to current ones
    return loaded.map(u => {
      const cleanEmail = u.email.toLowerCase();
      if (cleanEmail === 'admin@hospital.com' || cleanEmail === 'admin@taksin.hospital') {
        return { ...u, email: 'admin@taksin.hospital', password: 'TaksinAdmin2026', name: 'ผศ.นพ.นัฐวุฒิ รักเรียน (ผู้ดูแลระบบโสตฯ)', department: 'ฝ่ายบริการการแพทย์และโสตทัศนูปกรณ์' };
      }
      if (cleanEmail === 'manager@hospital.com' || cleanEmail === 'manager@taksin.hospital') {
        return { ...u, email: 'manager@taksin.hospital', password: 'TaksinManager3000', name: 'ดร.อรอนงค์ เลิศภักดิ์ (หัวหน้าฝ่ายบริหารการรักษา)', department: 'กลุ่มงานเทคโนโลยีสารสนเทศเพื่อสุขภาพ' };
      }
      if (cleanEmail === 'staff@hospital.com' || cleanEmail === 'staff@taksin.hospital') {
        return { ...u, email: 'staff@taksin.hospital', password: 'TaksinStaff111', name: 'นางสาวพิไลวรรณ พลอยดี (พยาบาลวิชาชีพชำนาญการ)', department: 'หอผู้ป่วยวิกฤตศัลยกรรม (Surgical ICU)' };
      }
      return u;
    });
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('av_current_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u) {
          const cleanEmail = u.email.toLowerCase();
          if (cleanEmail.includes('admin')) {
            return { ...u, email: 'admin@taksin.hospital', password: 'TaksinAdmin2026', role: 'Admin' as Role };
          } else if (cleanEmail.includes('manager')) {
            return { ...u, email: 'manager@taksin.hospital', password: 'TaksinManager3000', role: 'Manager' as Role };
          } else if (cleanEmail.includes('staff')) {
            return { ...u, email: 'staff@taksin.hospital', password: 'TaksinStaff111', role: 'Staff' as Role };
          }
          return u;
        }
      } catch (e) {
        return null;
      }
    }
    return null; // Require login under strict mode
  });

  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('av_equipment');
    const hasV3 = localStorage.getItem('av_inventory_v3');
    if (saved && hasV3) {
      return JSON.parse(saved);
    }
    localStorage.setItem('av_inventory_v3', 'true');
    localStorage.setItem('av_equipment', JSON.stringify(DEFAULT_EQUIPMENT));
    localStorage.setItem('av_reservations', JSON.stringify(DEFAULT_RESERVATIONS));
    return DEFAULT_EQUIPMENT;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('av_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('av_reservations');
    const hasV3 = localStorage.getItem('av_inventory_v3');
    if (saved && hasV3) {
      return JSON.parse(saved);
    }
    return DEFAULT_RESERVATIONS;
  });

  const [staffDirectory, setStaffDirectory] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('av_staff');
    return saved ? JSON.parse(saved) : DEFAULT_STAFF;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('av_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.hospitalName === 'โรงพยาบาลมหาวิทยาลัยแพทยศาสตร์โสตทัศน์') {
          return DEFAULT_SETTINGS;
        }
        return {
          ...DEFAULT_SETTINGS,
          ...parsed
        };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('av_activity_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'log-1',
        userName: 'ผศ.นพ.นัฐวุฒิ รักเรียน (ผู้ดูแลระบบโสตฯ)',
        userEmail: 'admin@taksin.hospital',
        role: 'Admin',
        action: 'ติดตั้งระบบและนำเข้าข้อมูลตั้งต้น',
        details: 'นำเข้าข้อมูลครุภัณฑ์โสตทัศนูปกรณ์จำนวน 26 รายการ และวัสดุสิ้นเปลือง 14 รายการ เรียบร้อยแล้ว',
        timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        type: 'success'
      },
      {
        id: 'log-2',
        userName: 'นางสาวพิไลวรรณ พลอยดี',
        userEmail: 'staff@taksin.hospital',
        role: 'Staff',
        action: 'ยื่นคำร้องขอยืมอุปกรณ์',
        details: 'ยื่นคำร้องขอยืม Projector (เครื่องฉายโปรเจคเตอร์) 1 เครื่อง และ Wireless Microphone (ไมค์ลอย) 2 ชิ้น สำหรับงาน NICU Grand Rounds (ส่งคืนสำเร็จแล้ว)',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        type: 'info'
      },
      {
        id: 'log-3',
        userName: 'ดร.อรอนงค์ เลิศภักดิ์',
        userEmail: 'manager@taksin.hospital',
        role: 'Manager',
        action: 'อนุมัติคำร้องขอขอยืมอุปกรณ์',
        details: 'การจองรหัส res-101 ได้รับการอนุมัติและประทับสิทธิ์ตามระเบียบโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช',
        timestamp: new Date(Date.now() - 3600000 * 24 * 1.9).toISOString(),
        type: 'success'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('av_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const addActivityLog = (
    action: string, 
    details: string, 
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userName: currentUser ? currentUser.name : 'System (ระบบอัตโนมัติ)',
      userEmail: currentUser ? currentUser.email : 'system@taksin.hospital',
      role: currentUser ? currentUser.role : 'System',
      action,
      details,
      timestamp: new Date().toISOString(),
      type
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 500));
  };

  const clearLogs = () => {
    setActivityLogs([]);
  };

  // Persists states in LocalStorage upon change
  useEffect(() => {
    localStorage.setItem('av_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('av_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('av_equipment', JSON.stringify(equipmentList));
  }, [equipmentList]);

  useEffect(() => {
    localStorage.setItem('av_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('av_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('av_staff', JSON.stringify(staffDirectory));
  }, [staffDirectory]);

  useEffect(() => {
    localStorage.setItem('av_settings', JSON.stringify(settings));
  }, [settings]);

  // Actions handler
  const login = (email: string, password?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (foundUser) {
      if (password && foundUser.password === password) {
        setCurrentUser(foundUser);
        return true;
      }
      return false;
    }
    return false;
  };

  const register = (name: string, email: string, password: string, role: Role, department: string): boolean => {
    const trimmedEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return false; // Already exists
    }
    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      name,
      email: trimmedEmail,
      role,
      department,
      password
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  // Equipment CRUD
  const addEquipment = (item: Omit<Equipment, 'id'>) => {
    const newItem: Equipment = {
      ...item,
      id: 'eq-' + Math.random().toString(36).substr(2, 9)
    };
    setEquipmentList(prev => [...prev, newItem]);
    addActivityLog(
      'เพิ่มครุภัณฑ์ใหม่',
      `นำเข้า "${newItem.name}" เข้าสู่สารบบคลังรวม จำนวนปริมาณตั้งต้น ${newItem.totalUnits} ชิ้น`,
      'success'
    );
  };

  const updateEquipment = (id: string, updated: Partial<Equipment>) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id) {
        const result = { ...eq, ...updated };
        // Clean available units to never exceed total units or fall below 0
        if (result.totalUnits < result.availableUnits) {
          result.availableUnits = result.totalUnits;
        }
        if (result.availableUnits < 0) result.availableUnits = 0;
        
        addActivityLog(
          'แก้ไขข้อมูลพัสดุ',
          `อัปเดตสเปกครุภัณฑ์ "${eq.name}" ในระบบเรียบร้อยแล้ว`,
          'info'
        );
        return result;
      }
      return eq;
    }));
  };

  const deleteEquipment = (id: string) => {
    const found = equipmentList.find(e => e.id === id);
    setEquipmentList(prev => prev.filter(eq => eq.id !== id));
    setCart(prev => prev.filter(itm => itm.equipmentId !== id));
    if (found) {
      addActivityLog(
        'ลบครุภัณฑ์พัสดุ',
        `จำหน่ายครุภัณฑ์ "${found.name}" ออกจากสารบัญระบบการจอง`,
        'error'
      );
    }
  };

  // Repair Workflow:
  // "When an Admin sends an item to repair via a Modal specifying repair notes, the item's state changes to 'Under Repair'
  // and its available units decrease by the specified quantity. When marked fixed, it restores the returned quantity to available units."
  const sendToRepair = (id: string, notes: string, quantity: number) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id) {
        const qtyToSend = Math.max(1, Math.min(eq.availableUnits, quantity));
        const updatedAvailableUnits = Math.max(0, eq.availableUnits - qtyToSend);
        const currentUnderRepair = eq.unitsUnderRepair || 0;
        const updatedUnderRepair = currentUnderRepair + qtyToSend;
        addActivityLog(
          'ส่งซ่อมส่งเคลมบำรุง',
          `ส่งจำหน่ายซ่อมบำรุงพัสดุ "${eq.name}" จำนวน ${qtyToSend} ชิ้น อาการ: ${notes || 'ไม่ระบุ'} (ตัดลดยอดคงเหลือ ${qtyToSend} ชิ้นชั่วคราว)`,
          'warning'
        );
        return {
          ...eq,
          status: 'Under Repair',
          repairNotes: notes,
          availableUnits: updatedAvailableUnits,
          unitsUnderRepair: updatedUnderRepair
        };
      }
      return eq;
    }));
  };

  const returnFromRepair = (id: string, quantity: number) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id) {
        const currentUnderRepair = eq.unitsUnderRepair || 0;
        // Make sure returning quantity doesn't exceed unitsUnderRepair
        const qtyToReturn = Math.max(1, Math.min(currentUnderRepair, quantity));
        const updatedUnderRepair = Math.max(0, currentUnderRepair - qtyToReturn);
        const updatedAvailableUnits = Math.min(eq.totalUnits, eq.availableUnits + qtyToReturn);
        
        addActivityLog(
          'รับคืนจากการส่งซ่อม',
          `รับมอบคืนพัสดุเสร็จสิ้นจากการซ่อมบำรุง "${eq.name}" จำนวน ${qtyToReturn} ชิ้น ส่งคืนเข้าคลังพร้อมจำหน่ายให้บริการ`,
          'success'
        );
        return {
          ...eq,
          status: updatedUnderRepair > 0 ? 'Under Repair' : 'Ready',
          repairNotes: updatedUnderRepair > 0 ? eq.repairNotes : undefined,
          availableUnits: updatedAvailableUnits,
          unitsUnderRepair: updatedUnderRepair
        };
      }
      return eq;
    }));
  };

  // Cart operations
  const addToCart = (equipmentId: string, qty = 1) => {
    const eq = equipmentList.find(e => e.id === equipmentId);
    if (!eq || eq.status !== 'Ready' || eq.availableUnits <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.equipmentId === equipmentId);
      if (existing) {
        const newQty = Math.min(eq.availableUnits, existing.quantity + qty);
        return prev.map(item => item.equipmentId === equipmentId ? { ...item, quantity: newQty } : item);
      } else {
        return [...prev, { equipmentId, quantity: Math.min(eq.availableUnits, qty) }];
      }
    });
  };

  const removeFromCart = (equipmentId: string) => {
    setCart(prev => prev.filter(item => item.equipmentId !== equipmentId));
  };

  const updateCartQty = (equipmentId: string, quantity: number) => {
    const eq = equipmentList.find(e => e.id === equipmentId);
    if (!eq) return;

    // Minimum limit is 1, maximum limit is availableUnits
    const sanitizedQty = Math.max(1, Math.min(eq.availableUnits, quantity));
    setCart(prev => prev.map(item => item.equipmentId === equipmentId ? { ...item, quantity: sanitizedQty } : item));
  };

  const clearCart = () => setCart([]);

  // Create Reservation from Cart
  const createReservation = (purpose: string, pickupTime: string, returnTime: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำการยืม' };
    if (cart.length === 0) return { success: false, message: 'ไม่มีอุปกรณ์ในรายการยืม' };
    if (!purpose.trim()) return { success: false, message: 'กรุณาระบุวัตถุประสงค์การใช้งาน' };

    const itemsInCart = cart.map(cartItm => {
      const eq = equipmentList.find(e => e.id === cartItm.equipmentId);
      return eq;
    });
    const hasLoanable = itemsInCart.some(eq => eq && eq.category !== 'Consumables');

    if (!pickupTime) return { success: false, message: 'กรุณาระบุวันเวลาที่เข้ารับพัสดุ' };
    if (hasLoanable && !returnTime) return { success: false, message: 'กรุณาระบุวันเวลาที่ส่งคืนอุปกรณ์' };

    // Format items as ReservationItems structure
    const reservationItems = cart.map(cartItm => {
      const eq = equipmentList.find(e => e.id === cartItm.equipmentId);
      return {
        equipmentId: cartItm.equipmentId,
        equipmentName: eq ? eq.name : 'อุปกรณ์ไม่ทราบชื่อ',
        quantity: cartItm.quantity
      };
    });

    const isPurelyConsumable = reservationItems.every(itm => {
      const eq = equipmentList.find(e => e.id === itm.equipmentId);
      return eq && eq.category === 'Consumables';
    });

    const isAutoApproved = isPurelyConsumable && settings.autoApproveConsumables;

    const newReservation: Reservation = {
      id: 'res-' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department || 'ไม่ระบุแผนก',
      items: reservationItems,
      purpose,
      pickupTime,
      returnTime: hasLoanable ? returnTime : '',
      status: isAutoApproved ? 'Approved' : 'Pending',
      createdAt: new Date().toISOString()
    };

    setReservations(prev => [newReservation, ...prev]);
    setCart([]);

    addActivityLog(
      'ทำรายการจองอุปกรณ์',
      `ส่งคำขอร้องยืมรหัส ${newReservation.id} สำหรับงาน "${purpose}" จำนวน ${reservationItems.length} ไอเท็ม ${isAutoApproved ? '(อนุมัติอัตโนมัตินโยบายวัสดุสิ้นเปลือง)' : '(รอตรวจอนุมัติ)'}`,
      isAutoApproved ? 'success' : 'info'
    );

    return { 
      success: true, 
      message: isAutoApproved 
        ? 'ทำการจองสำเร็จและอนุมัติอัตโนมัติแล้ว! พัสดุพร้อมรับจ่ายที่พิกัดคลังทันที'
        : 'ทำการจองอุปกรณ์สำเร็จเรียบร้อยแล้ว กำลังรอผู้ดูแลตรวจสอบการอนุมัติ' 
    };
  };

  // Reservation Approval workflows:
  const approveReservation = (id: string) => {
    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        addActivityLog(
          'อนุมัติรายการยืมพัสดุ',
          `รายการจอง ${res.id} ของคุณ "${res.userName}" ได้รับการพิจารณาเลือกอนุมัติผ่านระบบ`,
          'success'
        );
        return { ...res, status: 'Approved' };
      }
      return res;
    }));
  };

  const rejectReservation = (id: string, reason: string) => {
    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        addActivityLog(
          'ปฏิเสธการมอบยืมพัสดุ',
          `ปฏิเสธคำขอจอง ${res.id} ของคุณ "${res.userName}" เนื่องจาก: ${reason}`,
          'error'
        );
        return { ...res, status: 'Rejected', rejectionReason: reason };
      }
      return res;
    }));
  };

  // Handover / Return flows:
  // "When a reservation is "Approved" and subsequently marked as "Handed Over" by an Admin, the system must automatically
  // deduct the exact item quantities from the equipment's availableUnits. When marked as "Returned", the inventory must be
  // automatically added back to availableUnits without exceeding totalUnits."
  const handoverReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return;

    // Check if the reservation consists ONLY of consumables
    const isPurelyConsumable = reservation.items.every(itm => {
      const eq = equipmentList.find(e => e.id === itm.equipmentId);
      return eq && eq.category === 'Consumables';
    });

    const targetStatus: ReservationStatus = isPurelyConsumable ? 'Disbursed' : 'Handed Over';

    // Transition reservation state
    setReservations(prev => prev.map(res => res.id === id ? { ...res, status: targetStatus } : res));

    // Automatically deduct quantities from equipment availableUnits
    setEquipmentList(prev => prev.map(eq => {
      const itemToDeduct = reservation.items.find(itm => itm.equipmentId === eq.id);
      if (itemToDeduct) {
        const updatedAvailableUnits = Math.max(0, eq.availableUnits - itemToDeduct.quantity);
        return {
          ...eq,
          availableUnits: updatedAvailableUnits
        };
      }
      return eq;
    }));

    addActivityLog(
      targetStatus === 'Disbursed' ? 'จ่ายพัสดุเบิกสิ้นเปลือง' : 'ส่งมอบพัสดุนอกคลัง',
      `เบิกจ่าย/ส่งมอบไอเท็มรหัสคำขอ ${id} ให้กับคุณ "${reservation.userName}" เรียบร้อยแล้ว (ตัดตัดลดยอดคงเหลือในคลัง)`,
      'success'
    );
  };

  const returnReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return;

    // Transition state
    setReservations(prev => prev.map(res => res.id === id ? { ...res, status: 'Returned' } : res));

    // Automatically restore equipment availableUnits, bounded by totalUnits BUT skip consumables
    setEquipmentList(prev => prev.map(eq => {
      const itemToRestore = reservation.items.find(itm => itm.equipmentId === eq.id);
      if (itemToRestore) {
        if (eq.category === 'Consumables') {
          return eq; // Consumables are consumed, do not restore
        }
        const updatedAvailableUnits = Math.min(eq.totalUnits, eq.availableUnits + itemToRestore.quantity);
        return {
          ...eq,
          availableUnits: updatedAvailableUnits
        };
      }
      return eq;
    }));

    addActivityLog(
      'รับตรวจคืนพัสดุสู่คลัง',
      `รับคืนพัสดุครบตามจำนวนตามใบจอง ${id} ของคุณ "${reservation.userName}" กลับสู่คลังหลักเพื่อพร้อมบริการต่อ`,
      'success'
    );
  };

  // Staff CRUD
  const addStaff = (member: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...member,
      id: 'st-' + Math.random().toString(36).substr(2, 9)
    };
    setStaffDirectory(prev => [...prev, newStaff]);
  };

  const updateStaff = (id: string, updated: Partial<StaffMember>) => {
    setStaffDirectory(prev => prev.map(st => st.id === id ? { ...st, ...updated } : st));
  };

  const deleteStaff = (id: string) => {
    setStaffDirectory(prev => prev.filter(st => st.id !== id));
  };

  // Settings Management
  const updateSettings = (hospitalName: string, logoUrl: string, maxLoanDays: number, autoApproveConsumables: boolean) => {
    setSettings({
      hospitalName,
      logoUrl: logoUrl || DEFAULT_SETTINGS.logoUrl,
      maxLoanDays: maxLoanDays || 7,
      autoApproveConsumables: autoApproveConsumables !== undefined ? autoApproveConsumables : true
    });
    addActivityLog(
      'เปลี่ยนการตั้งค่าระบบ',
      `ปรับปรุงชื่อโรงพยาบาลเป็น "${hospitalName}" และตั้งค่านโยบายยืมสูงสุด ${maxLoanDays} วัน (อนุมัติวัสดุสิ้นเปลืองอัตโนมัติ: ${autoApproveConsumables ? "เปิด" : "ปิด"})`,
      'warning'
    );
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      equipmentList,
      cart,
      reservations,
      staffDirectory,
      settings,
      activityLogs,
      login,
      register,
      logout,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      sendToRepair,
      returnFromRepair,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      createReservation,
      approveReservation,
      rejectReservation,
      handoverReservation,
      returnReservation,
      addStaff,
      updateStaff,
      deleteStaff,
      updateSettings,
      addActivityLog,
      clearLogs
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
