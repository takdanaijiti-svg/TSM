import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Equipment, CartItem, Reservation, StaffMember, SystemSettings, Role } from '../types';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  equipmentList: Equipment[];
  cart: CartItem[];
  reservations: Reservation[];
  staffDirectory: StaffMember[];
  settings: SystemSettings;
  login: (email: string) => boolean;
  register: (name: string, email: string, role: Role, department: string) => boolean;
  logout: () => void;
  // Equipment Management
  addEquipment: (item: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updated: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  // Repair Workflow
  sendToRepair: (id: string, notes: string) => void;
  returnFromRepair: (id: string) => void;
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
  updateSettings: (hospitalName: string, logoUrl: string) => void;
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
  { id: 'u1', name: 'ผศ.นพ.นัฐวุฒิ รักเรียน (ศัลยศาสตร์)', email: 'admin@hospital.com', role: 'Admin', department: 'ฝ่ายศัลยกรรม (Surgery)' },
  { id: 'u2', name: 'ดร.อรอนงค์ เลิศภักดิ์ (อายุรกรรม)', email: 'manager@hospital.com', role: 'Manager', department: 'ฝ่ายอายุรกรรม (Medicine)' },
  { id: 'u3', name: 'นางสาวพิไลวรรณ พลอยดี (โสตทัศนศึกษา)', email: 'staff@hospital.com', role: 'Staff', department: 'ฝ่ายกุมารเวชศาสตร์ (Pediatric)' },
];

const DEFAULT_EQUIPMENT: Equipment[] = [
  {
    id: 'eq1',
    name: 'Surgical Video Camera System (กล้องผ่าตัดเคลื่อนที่ความละเอียดสูง)',
    category: 'กล้องและบันทึกภาพ',
    description: 'ชุดกล้องสำหรับบันทึกวิดีโอผ่าตัด เลนส์ขยายพิเศษเพื่อการเรียนการสอน มีระบบเก็บข้อมูลผ่าน SD Card และต่อสายสัญญาณ HDMI ขึ้นหน้าจอมอนิเตอร์ใหญ่',
    totalUnits: 3,
    availableUnits: 3,
    status: 'Ready',
    image: MOCK_IMAGES.camera
  },
  {
    id: 'eq2',
    name: 'Medical Grand Round Projector (เครื่องฉายเลเซอร์โปรเจคเตอร์ 4K)',
    category: 'เครื่องฉายและจอภาพ',
    description: 'เครื่องฉายความสว่างสูง 6,000 Lumens สำหรับห้องคอนเฟอเรนซ์และหอประชุมใหญ่ แสดงผลสไลด์เคสผู้ป่วยและรูปสีเอ็กซ์เรย์ได้คมชัดสูง',
    totalUnits: 5,
    availableUnits: 5,
    status: 'Ready',
    image: MOCK_IMAGES.projector
  },
  {
    id: 'eq3',
    name: 'Wireless UHF Microphone & Audio Set (ชุดไมโครโฟนไร้สายระดับพรีเมียม)',
    category: 'ระบบเสียง',
    description: 'ตู้ลำโพงพกพาพร้อมไมค์ไร้สายคู่ สำหรับการบรรยายความรู้ทางวิชาการและการนำเสนอเคสในวอร์ดผู้ป่วย',
    totalUnits: 4,
    availableUnits: 4,
    status: 'Ready',
    image: MOCK_IMAGES.audio
  },
  {
    id: 'eq4',
    name: '3D Anatomy VR Simulator Headset (แว่นจำลองกายวิภาคศาสตร์ 3 มิติ)',
    category: 'ศูนย์ฝึกแพทย์จำลอง',
    description: 'แว่นจำลองภาพเสมือนจริงระบบ Virtual Reality สำหรับศึกษาโครงสร้างหัวใจและระบบประสาทของแพทย์ฝึกหัด มีโปรแกรมสอนล่วงหน้าติดตั้งพร้อมใช้',
    totalUnits: 2,
    availableUnits: 1, // Let's make 1 units ready, 1 in repair to exhibit workflow initial state
    status: 'Ready',
    image: MOCK_IMAGES.vr
  },
  {
    id: 'eq5',
    name: 'Telemedicine Dual-Screen Mobile Cart (รถเข็นตรวจผู้ป่วยทางไกลจอคู่)',
    category: 'เครื่องฉายและจอภาพ',
    description: 'รถเข็นติดตั้งหน้าจอความละเอียดสูง 2 ตัว พร้อมกล้องแพนซูมระยะไกลและชุดต่อพ่วงอุปกรณ์ส่องหู/คอ สำหรับประชุมทางไกลข้ามโรงพยาบาลภูมิภาค',
    totalUnits: 3,
    availableUnits: 3,
    status: 'Ready',
    image: MOCK_IMAGES.cart
  },
  {
    id: 'eq6',
    name: 'Smart Laser Presenter & Pointer (รีโมทพรีเซนต์ความถี่วิทยุไร้สาย)',
    category: 'อุปกรณ์เสริม',
    description: 'รีโมทควบคุมสไลด์ระยะไกลพร้อมไฟชี้พอยเตอร์สีเขียวสะท้อนแสง สำหรับงานสัมมนาวิชาการทางการแพทย์',
    totalUnits: 8,
    availableUnits: 8,
    status: 'Ready',
    image: MOCK_IMAGES.pointer
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
      { equipmentId: 'eq2', equipmentName: 'Medical Grand Round Projector (เครื่องฉายเลเซอร์โปรเจคเตอร์ 4K)', quantity: 1 },
      { equipmentId: 'eq3', equipmentName: 'Wireless UHF Microphone & Audio Set (ชุดไมโครโฟนไร้สายระดับพรีเมียม)', quantity: 2 },
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
    userDepartment: 'ฝ่ายประสาทวิทยา (Neurology)',
    items: [
      { equipmentId: 'eq4', equipmentName: '3D Anatomy VR Simulator Headset (แว่นจำลองกายวิภาคศาสตร์ 3 มิติ)', quantity: 1 }
    ],
    purpose: 'ฝึกปฏิบัติจริงผ่าตัดส่องกล้องจำลองระบบประสาท (Neuro simulation workshop)',
    pickupTime: '2026-05-19T09:00',
    returnTime: '2026-05-19T13:00',
    status: 'Handed Over',
    createdAt: '2026-05-18T10:30:00Z',
  },
  {
    id: 'res-103',
    userId: 'u3',
    userName: 'นางสาวพิไลวรรณ พลอยดี',
    userDepartment: 'ฝ่ายศัลยกรรม (Surgery)',
    items: [
      { equipmentId: 'eq1', equipmentName: 'Surgical Video Camera System (กล้องผ่าตัดเคลื่อนที่ความละเอียดสูง)', quantity: 1 },
      { equipmentId: 'eq6', equipmentName: 'Smart Laser Presenter & Pointer (รีโมทพรีเซนต์ความถี่วิทยุไร้สาย)', quantity: 1 }
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
      { equipmentId: 'eq5', equipmentName: 'Telemedicine Dual-Screen Mobile Cart (รถเข็นตรวจผู้ป่วยทางไกลจอคู่)', quantity: 1 },
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
      { equipmentId: 'eq3', equipmentName: 'Wireless UHF Microphone & Audio Set (ชุดไมโครโฟนไร้สายระดับพรีเมียม)', quantity: 1 },
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
  hospitalName: 'โรงพยาบาลมหาวิทยาลัยแพทยศาสตร์โสตทัศน์',
  logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230f766e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global States initialization
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('av_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USERS[0]; // Default to first user (Admin) to facilitate instant inspection
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('av_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('av_equipment');
    return saved ? JSON.parse(saved) : DEFAULT_EQUIPMENT;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('av_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('av_reservations');
    return saved ? JSON.parse(saved) : DEFAULT_RESERVATIONS;
  });

  const [staffDirectory, setStaffDirectory] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('av_staff');
    return saved ? JSON.parse(saved) : DEFAULT_STAFF;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('av_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

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
  const login = (email: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (foundUser) {
      setCurrentUser(foundUser);
      return true;
    }
    // Attempt automatic fallback mock provision for testing
    if (cleanEmail.includes('admin')) {
      const u: User = { id: 'u' + Date.now(), name: 'Admin User', email: email, role: 'Admin', department: 'ฝ่ายผู้อำนวยการโสตศึกษา' };
      setUsers(prev => [...prev, u]);
      setCurrentUser(u);
      return true;
    } else if (cleanEmail.includes('manager')) {
      const u: User = { id: 'u' + Date.now(), name: 'Manager User', email: email, role: 'Manager', department: 'ฝ่ายเทคโนโลยีพยาบาล' };
      setUsers(prev => [...prev, u]);
      setCurrentUser(u);
      return true;
    } else if (cleanEmail.includes('staff')) {
      const u: User = { id: 'u' + Date.now(), name: 'Staff User', email: email, role: 'Staff', department: 'ฝ่ายวิจัยและกุมารเวช' };
      setUsers(prev => [...prev, u]);
      setCurrentUser(u);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, role: Role, department: string): boolean => {
    const trimmedEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return false; // Already exists
    }
    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      name,
      email: trimmedEmail,
      role,
      department
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
        return result;
      }
      return eq;
    }));
  };

  const deleteEquipment = (id: string) => {
    setEquipmentList(prev => prev.filter(eq => eq.id !== id));
    setCart(prev => prev.filter(itm => itm.equipmentId !== id));
  };

  // Repair Workflow:
  // "When an Admin sends an item to repair via a Modal specifying repair notes, the item's state changes to 'Under Repair'
  // and its available units decrease by 1. When marked fixed, it returns to 'Ready' and restores 1 unit to available units."
  const sendToRepair = (id: string, notes: string) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id) {
        // Decrease availableUnits by 1 if above 0
        const updatedAvailableUnits = Math.max(0, eq.availableUnits - 1);
        return {
          ...eq,
          status: 'Under Repair',
          repairNotes: notes,
          availableUnits: updatedAvailableUnits
        };
      }
      return eq;
    }));
  };

  const returnFromRepair = (id: string) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id) {
        // Increase availableUnits by 1 without exceeding totalUnits
        const updatedAvailableUnits = Math.min(eq.totalUnits, eq.availableUnits + 1);
        return {
          ...eq,
          status: 'Ready',
          repairNotes: undefined,
          availableUnits: updatedAvailableUnits
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
    if (!pickupTime || !returnTime) return { success: false, message: 'กรุณาระบุวันเวลาที่รับและส่งคืนอุปกรณ์' };

    // Format items as ReservationItems structure
    const reservationItems = cart.map(cartItm => {
      const eq = equipmentList.find(e => e.id === cartItm.equipmentId);
      return {
        equipmentId: cartItm.equipmentId,
        equipmentName: eq ? eq.name : 'อุปกรณ์ไม่ทราบชื่อ',
        quantity: cartItm.quantity
      };
    });

    const newReservation: Reservation = {
      id: 'res-' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department || 'ไม่ระบุแผนก',
      items: reservationItems,
      purpose,
      pickupTime,
      returnTime,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setReservations(prev => [newReservation, ...prev]);
    setCart([]);
    return { success: true, message: 'ทำการจองอุปกรณ์สำเร็จเรียบร้อยแล้ว กำลังรอผู้ดูแลตรวจสอบการอนุมัติ' };
  };

  // Reservation Approval workflows:
  const approveReservation = (id: string) => {
    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        return { ...res, status: 'Approved' };
      }
      return res;
    }));
  };

  const rejectReservation = (id: string, reason: string) => {
    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        return { ...res, status: 'Rejected', rejectionReason: reason };
      }
      return res;
    }));
  };

  // Handover / Return flows:
  // "When a reservation is "Approved" and subsequently marked as "Handed Over" by an Admin, the system must automatically
  // deduct the exact item quantities from the equipment's availableUnits. When marked as "Returned", the inventory must be Wait!
  // automatically added back to availableUnits without exceeding totalUnits."
  const handoverReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return;

    // Transition reservation state to Handed Over
    setReservations(prev => prev.map(res => res.id === id ? { ...res, status: 'Handed Over' } : res));

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
  };

  const returnReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return;

    // Transition state
    setReservations(prev => prev.map(res => res.id === id ? { ...res, status: 'Returned' } : res));

    // Automatically restore equipment availableUnits, bounded by totalUnits
    setEquipmentList(prev => prev.map(eq => {
      const itemToRestore = reservation.items.find(itm => itm.equipmentId === eq.id);
      if (itemToRestore) {
        const updatedAvailableUnits = Math.min(eq.totalUnits, eq.availableUnits + itemToRestore.quantity);
        return {
          ...eq,
          availableUnits: updatedAvailableUnits
        };
      }
      return eq;
    }));
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
  const updateSettings = (hospitalName: string, logoUrl: string) => {
    setSettings({
      hospitalName,
      logoUrl: logoUrl || DEFAULT_SETTINGS.logoUrl
    });
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
      updateSettings
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
