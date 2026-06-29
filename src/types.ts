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
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'Admin' | 'Pejabat Pembuat Komitmen' | 'Penyedia' | 'Tamu';
}
