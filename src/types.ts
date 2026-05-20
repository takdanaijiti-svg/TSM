export type Role = 'Admin' | 'Manager' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  totalUnits: number;
  availableUnits: number;
  status: 'Ready' | 'Under Repair';
  image: string; // Base64 Data URL or nice visual placeholder SVG block
  repairNotes?: string;
}

export interface CartItem {
  equipmentId: string;
  quantity: number;
}

export type ReservationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Handed Over' | 'Returned';

export interface ReservationItem {
  equipmentId: string;
  equipmentName: string;
  quantity: number;
}

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userDepartment: string;
  items: ReservationItem[];
  purpose: string;
  pickupTime: string; // ISO date string or yyyy-MM-ddThh:mm
  returnTime: string; // ISO date string or yyyy-MM-ddThh:mm
  status: ReservationStatus;
  createdAt: string;
  rejectionReason?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo: string; // Base64 or standard asset
}

export interface SystemSettings {
  hospitalName: string;
  logoUrl: string; // base64 logo or customizable image
}
