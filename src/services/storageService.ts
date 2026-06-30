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

// Helper to initialize local storage
const initLocalStorage = () => {
  if (!localStorage.getItem('spk_data')) {
    localStorage.setItem('spk_data', JSON.stringify(MOCK_SPKS));
  }
  if (!localStorage.getItem('spk_users')) {
    localStorage.setItem('spk_users', JSON.stringify(DEFAULT_USERS));
  }
};

initLocalStorage();

// ==========================================
// STORAGE SERVICE IMPLEMENTATION
// ==========================================
export const storageService = {
  // Check if real Firebase is configured
  isFirebaseActive(): boolean {
    if (localStorage.getItem('prefer_local_sandbox') === 'true') {
      return false;
    }
    return isFirebaseConfigured && db !== null && auth !== null;
  },

  // Set Firebase Mode preference
  setFirebaseActive(active: boolean) {
    localStorage.setItem('prefer_local_sandbox', active ? 'false' : 'true');
  },

  // ------------------------------------------
  // USER PROFILE & AUTHENTICATION FUNCTIONS
  // ------------------------------------------
  
  // Custom auth listener
  onAuthChanged(callback: (user: UserProfile | null) => void) {
    if (this.isFirebaseActive() && auth) {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch additional profile info from firestore
          try {
            const userDoc = await getDoc(doc(db!, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              callback(userDoc.data() as UserProfile);
            } else {
              // Fallback default profile
              callback({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'Pengguna Baru',
                role: 'Pegawai',
                permissions: {
                  canViewDashboard: true,
                  canManageUsers: false,
                  canCreateReports: true,
                  canApproveRequests: false,
                  canEditSettings: false
                },
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
            callback({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Pengguna',
              role: 'Pegawai',
              permissions: {
                canViewDashboard: true,
                canManageUsers: false,
                canCreateReports: true,
                canApproveRequests: false,
                canEditSettings: false
              },
              createdAt: new Date().toISOString()
            });
          }
        } else {
          callback(null);
        }
      });
    } else {
      // Local Storage Auth Listener
      const handleStorageAuth = () => {
        const currentUser = localStorage.getItem('spk_current_user');
        if (currentUser) {
          callback(JSON.parse(currentUser));
        } else {
          callback(null);
        }
      };
      
      // Call once initially
      handleStorageAuth();
      
      // Poll or listen to storage changes
      const interval = setInterval(handleStorageAuth, 1000);
      return () => clearInterval(interval);
    }
  },

  async login(email: string, password: string): Promise<UserProfile> {
    if (this.isFirebaseActive() && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Get profile from doc
      const userDoc = await getDoc(doc(db!, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      } else {
        const defaultProf: UserProfile = {
          uid,
          email,
          displayName: userCredential.user.displayName || email.split('@')[0],
          role: email.includes('admin') ? 'Admin' : email.includes('ga') ? 'Staf GA' : 'Pegawai',
          permissions: email.includes('admin') ? {
            canViewDashboard: true,
            canManageUsers: true,
            canCreateReports: true,
            canApproveRequests: true,
            canEditSettings: true
          } : {
            canViewDashboard: true,
            canManageUsers: false,
            canCreateReports: true,
            canApproveRequests: false,
            canEditSettings: false
          },
          createdAt: new Date().toISOString()
        };
        // Save profile
        await setDoc(doc(db!, 'users', uid), defaultProf);
        return defaultProf;
      }
    } else {
      // Offline local auth
      const usersStr = localStorage.getItem('spk_users') || '[]';
      const users: UserProfile[] = JSON.parse(usersStr);
      
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        // Any password works in offline sandbox mode
        localStorage.setItem('spk_current_user', JSON.stringify(foundUser));
        return foundUser;
      } else {
        // Create an on-the-fly offline profile if it's a new email
        const newProf: UserProfile = {
          uid: 'user-' + Date.now(),
          email,
          displayName: email.split('@')[0].toUpperCase(),
          role: email.includes('admin') ? 'Admin' : email.includes('ga') ? 'Staf GA' : 'Pegawai',
          permissions: email.includes('admin') ? {
            canViewDashboard: true,
            canManageUsers: true,
            canCreateReports: true,
            canApproveRequests: true,
            canEditSettings: true
          } : {
            canViewDashboard: true,
            canManageUsers: false,
            canCreateReports: true,
            canApproveRequests: false,
            canEditSettings: false
          },
          createdAt: new Date().toISOString()
        };
        users.push(newProf);
        localStorage.setItem('spk_users', JSON.stringify(users));
        localStorage.setItem('spk_current_user', JSON.stringify(newProf));
        return newProf;
      }
    }
  },

  async register(email: string, password: string, displayName: string, role: UserProfile['role']): Promise<UserProfile> {
    if (this.isFirebaseActive() && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      const profile: UserProfile = {
        uid,
        email,
        displayName,
        role,
        permissions: role === 'Admin' ? {
          canViewDashboard: true,
          canManageUsers: true,
          canCreateReports: true,
          canApproveRequests: true,
          canEditSettings: true
        } : role === 'Staf GA' ? {
          canViewDashboard: true,
          canManageUsers: false,
          canCreateReports: true,
          canApproveRequests: true,
          canEditSettings: false
        } : {
          canViewDashboard: true,
          canManageUsers: false,
          canCreateReports: true,
          canApproveRequests: false,
          canEditSettings: false
        },
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db!, 'users', uid), profile);
      return profile;
    } else {
      const usersStr = localStorage.getItem('spk_users') || '[]';
      const users: UserProfile[] = JSON.parse(usersStr);
      
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('Email sudah terdaftar di sistem!');
      }
      
      const newProf: UserProfile = {
        uid: 'user-' + Date.now(),
        email,
        displayName,
        role,
        permissions: role === 'Admin' ? {
          canViewDashboard: true,
          canManageUsers: true,
          canCreateReports: true,
          canApproveRequests: true,
          canEditSettings: true
        } : role === 'Staf GA' ? {
          canViewDashboard: true,
          canManageUsers: false,
          canCreateReports: true,
          canApproveRequests: true,
          canEditSettings: false
        } : {
          canViewDashboard: true,
          canManageUsers: false,
          canCreateReports: true,
          canApproveRequests: false,
          canEditSettings: false
        },
        createdAt: new Date().toISOString()
      };
      
      users.push(newProf);
      localStorage.setItem('spk_users', JSON.stringify(users));
      localStorage.setItem('spk_current_user', JSON.stringify(newProf));
      return newProf;
    }
  },

  async logout(): Promise<void> {
    if (this.isFirebaseActive() && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem('spk_current_user');
    }
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
        console.error('Error fetching SPK from Firebase, trying Local Storage fallback.', error);
        return this.getLocalSPKs();
      }
    } else {
      return this.getLocalSPKs();
    }
  },

  getLocalSPKs(): SPK[] {
    const spkStr = localStorage.getItem('spk_data');
    if (spkStr) {
      const list = JSON.parse(spkStr) as SPK[];
      // Ensure sorted by createdAt desc
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
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
        console.error('Error adding SPK to Firestore, writing to Local Storage instead.', error);
        return this.saveLocalSPK(newRecord);
      }
    } else {
      return this.saveLocalSPK(newRecord);
    }
  },

  saveLocalSPK(newRecord: Omit<SPK, 'id'>): SPK {
    const current = this.getLocalSPKs();
    const withId: SPK = {
      id: 'spk-' + Date.now(),
      ...newRecord
    };
    current.push(withId);
    localStorage.setItem('spk_data', JSON.stringify(current));
    return withId;
  },

  async updateSPK(id: string, updatedFields: Partial<SPK>): Promise<void> {
    if (this.isFirebaseActive() && db) {
      try {
        const docRef = doc(db, 'spk', id);
        await updateDoc(docRef, updatedFields);
        return;
      } catch (error) {
        console.error('Error updating Firestore SPK, writing to Local Storage fallback.', error);
        this.updateLocalSPK(id, updatedFields);
      }
    } else {
      this.updateLocalSPK(id, updatedFields);
    }
  },

  updateLocalSPK(id: string, updatedFields: Partial<SPK>): void {
    const current = this.getLocalSPKs();
    const updated = current.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    localStorage.setItem('spk_data', JSON.stringify(updated));
  },

  async deleteSPK(id: string): Promise<void> {
    if (this.isFirebaseActive() && db) {
      try {
        const docRef = doc(db, 'spk', id);
        await deleteDoc(docRef);
        return;
      } catch (error) {
        console.error('Error deleting SPK from Firestore, running Local Storage fallback.', error);
        this.deleteLocalSPK(id);
      }
    } else {
      this.deleteLocalSPK(id);
    }
  },

  deleteLocalSPK(id: string): void {
    const current = this.getLocalSPKs();
    const filtered = current.filter(item => item.id !== id);
    localStorage.setItem('spk_data', JSON.stringify(filtered));
  }
};
