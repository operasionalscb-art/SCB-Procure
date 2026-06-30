import { db, auth, isFirebaseConfigured } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { SPK, UserProfile } from '../types';

// ==========================================
// MOCK DATA SEED FOR LOCAL STORAGE
// ==========================================
const MOCK_SPKS: SPK[] = [
  {
    id: 'spk-001',
    nomorSpk: '001/SPK-PBJ/SCB/2026',
    namaPaket: 'Pengadaan Chromebook Lab Komputer dan Akses Internet Sekolah Cendekia BAZNAS',
    nilaiPengadaan: 150000000,
    namaVendor: 'PT Solusi Teknologi Nusantara',
    tanggalMulai: '2026-06-15',
    tanggalSelesai: '2026-07-15',
    detailSpesifikasi: '1. 30 Unit Chromebook High Performance 8GB RAM untuk Siswa\n2. 1 Unit Core Router & Access Point Kelas Industri\n3. Setup & Konfigurasi Jaringan Fiber Optic Kampus\n4. Garansi & Pemeliharaan Teknis Selama 1 Tahun',
    status: 'In Progress',
    createdAt: '2026-06-15T09:00:00.000Z',
    createdBy: 'Staf GA',
    milestones: [
      { id: 'm-1-1', title: 'Pengiriman Perangkat Utama Chromebook & Router', date: '2026-06-25', completed: true },
      { id: 'm-1-2', title: 'Instalasi Jaringan & Konfigurasi Software Lab', date: '2026-07-05', completed: false },
      { id: 'm-1-3', title: 'Uji Coba Bersama Santri & Serah Terima Pekerjaan (UAT)', date: '2026-07-15', completed: false }
    ]
  },
  {
    id: 'spk-002',
    nomorSpk: '002/SPK-PBJ/SCB/2026',
    namaPaket: 'Pengadaan Buku Pelajaran Kurikulum Merdeka dan Referensi Perpustakaan SCB',
    nilaiPengadaan: 45000000,
    namaVendor: 'CV Prima Pustaka Utama',
    tanggalMulai: '2026-06-01',
    tanggalSelesai: '2026-06-20',
    detailSpesifikasi: '1. Buku Paket Utama Kurikulum Merdeka untuk Kelas X, XI, XII (IPA/IPS)\n2. 150 Judul Buku Referensi Penunjang Olimpiade Sains dan Agama\n3. Buku Cerita Inspiratif & Kamus Bahasa Arab/Inggris\n4. Pelabelan Kode Perpustakaan dan Pengiriman ke Perpustakaan Utama SCB',
    status: 'Completed',
    createdAt: '2026-06-01T08:30:00.000Z',
    createdBy: 'Staf GA',
    milestones: [
      { id: 'm-2-1', title: 'Pemesanan & Pencetakan Buku Pelajaran', date: '2026-06-05', completed: true },
      { id: 'm-2-2', title: 'Quality Control Cetak & Pelabelan Kode Perpustakaan', date: '2026-06-12', completed: true },
      { id: 'm-2-3', title: 'Serah Terima Fisik Buku di Perpustakaan Kampus SCB', date: '2026-06-18', completed: true }
    ]
  },
  {
    id: 'spk-003',
    nomorSpk: '003/SPK-PBJ/SCB/2026',
    namaPaket: 'Penyediaan Bahan Makanan Sehat untuk Konsumsi Santri Boarding School SCB',
    nilaiPengadaan: 210000000,
    namaVendor: 'PT Agro Boga Mandiri',
    tanggalMulai: '2026-07-01',
    tanggalSelesai: '2026-07-20',
    detailSpesifikasi: '1. Pasokan Bahan Pokok (Beras Pandan Wangi 1.5 Ton, Minyak Goreng, Gula, Susu)\n2. Paket Daging Sapi & Ayam Segar, Telur, dan Sayur-Mayur Mingguan\n3. Jaminan Pengiriman Higienis Menggunakan Pendingin (Cold Chain)\n4. Verifikasi Kelayakan Nutrisi dan Tanggal Kedaluwarsa Minimal 10 Bulan',
    status: 'Pending',
    createdAt: '2026-06-28T11:45:00.000Z',
    createdBy: 'Staf GA',
    milestones: [
      { id: 'm-3-1', title: 'Persiapan Bahan Pokok di Gudang Vendor', date: '2026-07-05', completed: false },
      { id: 'm-3-2', title: 'Pemeriksaan Kesehatan dan Kebersihan Bahan Baku (QC)', date: '2026-07-12', completed: false },
      { id: 'm-3-3', title: 'Distribusi Perdana & Penataan di Dapur Kampus SCB', date: '2026-07-20', completed: false }
    ]
  }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'admin-123',
    email: 'admin@spk.go.id',
    displayName: 'Ahmad Subarjo',
    role: 'Admin',
    permissions: {
      canViewDashboard: true,
      canManageUsers: true,
      canCreateReports: true,
      canApproveRequests: true,
      canEditSettings: true
    },
    createdAt: new Date().toISOString()
  },
  {
    uid: 'ppk-123',
    email: 'ppk@spk.go.id',
    displayName: 'Ir. Budi Hermawan',
    role: 'Staf GA',
    permissions: {
      canViewDashboard: true,
      canManageUsers: false,
      canCreateReports: true,
      canApproveRequests: true,
      canEditSettings: false
    },
    createdAt: new Date().toISOString()
  },
  {
    uid: 'vendor-123',
    email: 'vendor@spk.go.id',
    displayName: 'PT Solusi Teknologi',
    role: 'Pegawai',
    permissions: {
      canViewDashboard: true,
      canManageUsers: false,
      canCreateReports: true,
      canApproveRequests: false,
      canEditSettings: false
    },
    createdAt: new Date().toISOString()
  },
  {
    uid: 'operasional-123',
    email: 'operasional.scb@gmail.com',
    displayName: 'Tim Operasional SCB',
    role: 'Admin',
    permissions: {
      canViewDashboard: true,
      canManageUsers: true,
      canCreateReports: true,
      canApproveRequests: true,
      canEditSettings: true
    },
    createdAt: new Date().toISOString()
  }
];

// ==========================================
// STORAGE SERVICE IMPLEMENTATION
// ==========================================
export const storageService = {
  // Check if real Firebase is configured
  isFirebaseActive(): boolean {
    return isFirebaseConfigured && db !== null;
  },

  // ------------------------------------------
  // SPK CRUD OPERATIONS
  // ------------------------------------------
  
  async getSPKs(): Promise<SPK[]> {
    if (this.isFirebaseActive() && db) {
      try {
        const q = query(collection(db, 'spk'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const list: SPK[] = [];
        querySnapshot.forEach((document) => {
          list.push({ id: document.id, ...document.data() } as SPK);
        });
        
        // If Firestore is empty, let's seed it for the user
        if (list.length === 0) {
          console.log('Firestore is empty. Seeding default data...');
          for (const item of MOCK_SPKS) {
            const { id, ...rest } = item;
            await addDoc(collection(db, 'spk'), rest);
          }
          // Fetch again
          return this.getSPKs();
        }
        
        return list;
      } catch (error) {
        console.error('Error fetching SPK from Firebase.', error);
        throw error;
      }
    } else {
      throw new Error('Firebase Cloud tidak terhubung atau database bermasalah.');
    }
  },

  async saveSPK(spkData: Omit<SPK, 'id' | 'createdAt'>): Promise<SPK> {
    const newRecord = {
      ...spkData,
      createdAt: new Date().toISOString()
    };

    if (this.isFirebaseActive() && db) {
      try {
        const docRef = await addDoc(collection(db, 'spk'), newRecord);
        return {
          id: docRef.id,
          ...newRecord
        } as SPK;
      } catch (error) {
        console.error('Error adding SPK to Firestore.', error);
        throw error;
      }
    } else {
      throw new Error('Firebase Cloud tidak terhubung atau database bermasalah.');
    }
  },

  async updateSPK(id: string, updatedFields: Partial<SPK>): Promise<void> {
    if (this.isFirebaseActive() && db) {
      try {
        const docRef = doc(db, 'spk', id);
        await updateDoc(docRef, updatedFields);
        return;
      } catch (error) {
        console.error('Error updating Firestore SPK.', error);
        throw error;
      }
    } else {
      throw new Error('Firebase Cloud tidak terhubung atau database bermasalah.');
    }
  },

  async deleteSPK(id: string): Promise<void> {
    if (this.isFirebaseActive() && db) {
      try {
        const docRef = doc(db, 'spk', id);
        await deleteDoc(docRef);
        return;
      } catch (error) {
        console.error('Error deleting SPK from Firestore.', error);
        throw error;
      }
    } else {
      throw new Error('Firebase Cloud tidak terhubung atau database bermasalah.');
    }
  }
};
