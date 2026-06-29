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
    nomorSpk: '001/SPK-PBJ/DISKOMINFO/2026',
    namaPaket: 'Pengadaan Server Cloud dan Perangkat Jaringan Dinas Komunikasi',
    nilaiPengadaan: 150000000,
    namaVendor: 'PT Solusi Teknologi Nusantara',
    tanggalMulai: '2026-06-15',
    tanggalSelesai: '2026-07-15',
    detailSpesifikasi: '1. 2 Unit Server High Performance 64GB RAM\n2. 1 Unit Core Switch Managed 24 Port\n3. Setup & Konfigurasi Jaringan Fiber Optic\n4. Garansi & Pemeliharaan 1 Tahun',
    status: 'In Progress',
    createdAt: '2026-06-15T09:00:00.000Z',
    createdBy: 'Pejabat Pembuat Komitmen',
    milestones: [
      { id: 'm-1-1', title: 'Pengiriman Perangkat Utama', date: '2026-06-25', completed: true },
      { id: 'm-1-2', title: 'Instalasi & Konfigurasi Software', date: '2026-07-05', completed: false },
      { id: 'm-1-3', title: 'Uji Coba & Serah Terima Pekerjaan (UAT)', date: '2026-07-15', completed: false }
    ]
  },
  {
    id: 'spk-002',
    nomorSpk: '002/SPK-PBJ/SETDA/2026',
    namaPaket: 'Penyediaan Laptop Operasional Bagian Umum Sekretariat Daerah',
    nilaiPengadaan: 85000000,
    namaVendor: 'CV Prima Elektronik',
    tanggalMulai: '2026-06-01',
    tanggalSelesai: '2026-06-20',
    detailSpesifikasi: '1. 10 Unit Laptop Intel Core i5 16GB RAM SSD 512GB\n2. Bundled Windows 11 Original & Office Home Student\n3. Tas Laptop, Mouse Wireless, dan Kelengkapan Standar\n4. Pengiriman Langsung ke Gedung A Kantor Sekretariat Daerah',
    status: 'Completed',
    createdAt: '2026-06-01T08:30:00.000Z',
    createdBy: 'Pejabat Pembuat Komitmen',
    milestones: [
      { id: 'm-2-1', title: 'Pembelian & Pengadaan Unit Laptop', date: '2026-06-05', completed: true },
      { id: 'm-2-2', title: 'QC Hardware & Instalasi Lisensi Original', date: '2026-06-12', completed: true },
      { id: 'm-2-3', title: 'Serah Terima Fisik Laptop & Dokumentasi', date: '2026-06-18', completed: true }
    ]
  },
  {
    id: 'spk-003',
    nomorSpk: '003/SPK-PBJ/DINSOS/2026',
    namaPaket: 'Pengadaan Bahan Logistik dan Makanan Sehat Bantuan Sosial',
    nilaiPengadaan: 210000000,
    namaVendor: 'PT Agro Boga Mandiri',
    tanggalMulai: '2026-07-01',
    tanggalSelesai: '2026-07-20',
    detailSpesifikasi: '1. 500 Paket Sembako Premium (Beras Pandan Wangi 5kg, Minyak Goreng 2L, Gula Pasir 2kg, Susu Kental Manis 2 kaleng)\n2. Pengemasan Higienis dalam Box Serbaguna berlabel Dinsos\n3. Distribusi Terbagi ke 5 Titik Lokasi Kantor Wilayah Bantuan Sosial\n4. Jaminan Kelayakan dan Kedaluwarsa Minimal 10 Bulan sejak pengiriman',
    status: 'Pending',
    createdAt: '2026-06-28T11:45:00.000Z',
    createdBy: 'Pejabat Pembuat Komitmen',
    milestones: [
      { id: 'm-3-1', title: 'Persiapan Bahan Baku Sembako', date: '2026-07-05', completed: false },
      { id: 'm-3-2', title: 'Proses Packing & QC Kedaluwarsa', date: '2026-07-12', completed: false },
      { id: 'm-3-3', title: 'Distribusi dan Verifikasi di 5 Kantor Wilayah', date: '2026-07-20', completed: false }
    ]
  }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'admin-123',
    email: 'admin@spk.go.id',
    displayName: 'Ahmad Subarjo',
    role: 'Admin'
  },
  {
    uid: 'ppk-123',
    email: 'ppk@spk.go.id',
    displayName: 'Ir. Budi Hermawan',
    role: 'Pejabat Pembuat Komitmen'
  },
  {
    uid: 'vendor-123',
    email: 'vendor@spk.go.id',
    displayName: 'PT Solusi Teknologi',
    role: 'Penyedia'
  },
  {
    uid: 'operasional-123',
    email: 'operasional.scb@gmail.com',
    displayName: 'Tim Operasional SCB',
    role: 'Pejabat Pembuat Komitmen'
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
    return isFirebaseConfigured && db !== null && auth !== null;
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
                role: 'Pejabat Pembuat Komitmen'
              });
            }
          } catch (e) {
            callback({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Pengguna',
              role: 'Pejabat Pembuat Komitmen'
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
          role: email.includes('vendor') ? 'Penyedia' : email.includes('admin') ? 'Admin' : 'Pejabat Pembuat Komitmen'
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
          role: email.includes('vendor') ? 'Penyedia' : email.includes('admin') ? 'Admin' : 'Pejabat Pembuat Komitmen'
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
        role
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
        role
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
