export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface SPK {
  id: string;
  nomorSpk: string;
  namaPaket: string;
  nilaiPengadaan: number;
  namaVendor: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  detailSpesifikasi: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
  createdBy: string;
  milestones: Milestone[];
  nomorRekening?: string;
  namaBank?: string;
  atasNamaRekening?: string;
  namaPihakKesatu?: string;
  jabatanPihakKesatu?: string;
}

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canCreateReports: boolean;
  canApproveRequests: boolean;
  canEditSettings: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'Admin' | 'Staf GA' | 'Pegawai' | 'Tamu';
  password?: string; // Stored for administrative review/management as requested
  division?: string; // Division like Asrama, Kesiswaan, Umum, dsb.
  permissions: UserPermissions;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isFirebaseMode: boolean; // Indicates if currently running on Live Firebase or Local Sandbox
}
