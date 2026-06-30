import { db, isFirebaseConfigured } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';
import { UserProfile, UserPermissions } from '../types';

// Default permissions config per role
export const DEFAULT_PERMISSIONS: Record<UserProfile['role'], UserPermissions> = {
  'Admin': {
    canViewDashboard: true,
    canManageUsers: true,
    canCreateReports: true,
    canApproveRequests: true,
    canEditSettings: true
  },
  'Staf GA': {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateReports: true,
    canApproveRequests: true,
    canEditSettings: false
  },
  'Pegawai': {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateReports: true,
    canApproveRequests: false,
    canEditSettings: false
  },
  'Tamu': {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateReports: false,
    canApproveRequests: false,
    canEditSettings: false
  }
};

// 3 Default Users as requested
const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'admin-seed-01',
    email: 'operasional.scb@gmail.com',
    displayName: 'Administrator SCB',
    role: 'Admin',
    password: 'admin123',
    division: 'Sistem',
    permissions: DEFAULT_PERMISSIONS['Admin'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'ga-seed-02',
    email: 'ga@gmail.com',
    displayName: 'Staf GA SCB',
    role: 'Staf GA',
    password: 'ga123',
    division: 'Umum',
    permissions: DEFAULT_PERMISSIONS['Staf GA'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'pegawai-seed-03',
    email: 'pegawai@gmail.com',
    displayName: 'Pegawai Utama',
    role: 'Pegawai',
    password: 'pegawai123',
    division: 'Kesiswaan',
    permissions: DEFAULT_PERMISSIONS['Pegawai'],
    createdAt: new Date().toISOString()
  }
];

export const authService = {
  // Check if we prefer or can use Firebase Firestore
  isFirebaseActive(): boolean {
    const preference = localStorage.getItem('prefer_firebase');
    if (preference === 'false') return false;
    return isFirebaseConfigured && db !== null;
  },

  setFirebaseMode(active: boolean) {
    localStorage.setItem('prefer_firebase', active ? 'true' : 'false');
  },

  // Initialize and Seed Default Users
  async initializeDatabase(): Promise<boolean> {
    // 1. Always seed LocalStorage so it has fallback data immediately
    const localUsersStr = localStorage.getItem('local_users');
    if (!localUsersStr) {
      localStorage.setItem('local_users', JSON.stringify(DEFAULT_USERS));
    }

    // 2. Try seeding Cloud Firestore if reachable
    if (this.isFirebaseActive() && db) {
      try {
        // Check if seed exists by loading first document
        const seedRef = doc(db, 'app_users', 'admin-seed-01');
        const seedSnap = await getDoc(seedRef);
        
        if (!seedSnap.exists()) {
          console.log('Seeding default users to Cloud Firestore...');
          for (const u of DEFAULT_USERS) {
            await setDoc(doc(db, 'app_users', u.uid), u);
          }
          console.log('Cloud Firestore successfully seeded!');
        }
        return true;
      } catch (err) {
        console.warn('Unable to write seeds to Firebase Firestore. Continuing with Local Fallback.', err);
        return false;
      }
    }
    return false;
  },

  // Self-registration (Self-Registration)
  async registerUser(payload: {
    email: string;
    password?: string;
    displayName: string;
    division: string;
  }): Promise<UserProfile> {
    const normalizedEmail = payload.email.toLowerCase().trim();
    
    // Check if user already exists (in Local or Firebase)
    const existingUsers = await this.getAllUsers();
    const emailConflict = existingUsers.some(u => u.email.toLowerCase() === normalizedEmail);
    if (emailConflict) {
      throw new Error('Alamat email sudah terdaftar di dalam sistem.');
    }

    const newUid = `user-${Math.random().toString(36).substring(2, 11)}`;
    const newProfile: UserProfile = {
      uid: newUid,
      email: normalizedEmail,
      displayName: payload.displayName,
      role: 'Pegawai', // Default Role is 'Pegawai' as requested
      password: payload.password || 'password123',
      division: payload.division,
      permissions: DEFAULT_PERMISSIONS['Pegawai'],
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    if (this.isFirebaseActive() && db) {
      try {
        await setDoc(doc(db, 'app_users', newUid), newProfile);
        // Sync to local list as well
        this.saveUserToLocalList(newProfile);
        return newProfile;
      } catch (err) {
        console.warn('Firebase register failed, saving to local storage fallback...', err);
      }
    }

    // Local Storage Fallback
    this.saveUserToLocalList(newProfile);
    return newProfile;
  },

  // Log in
  async loginUser(email: string, password?: string): Promise<UserProfile> {
    const normalizedEmail = email.toLowerCase().trim();

    // Fetch all users to find match
    const users = await this.getAllUsers();
    const userMatch = users.find(
      u => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!userMatch) {
      throw new Error('Email atau kata sandi Anda salah. Silakan coba lagi.');
    }

    // Save session state to LocalStorage as requested (key: 'app_auth' and 'app_user')
    this.saveSession(userMatch);
    return userMatch;
  },

  // Save session state
  saveSession(user: UserProfile) {
    localStorage.setItem('app_auth', 'true');
    localStorage.setItem('app_user', JSON.stringify(user));
  },

  // Get active session
  getActiveSession(): UserProfile | null {
    const isAuthenticated = localStorage.getItem('app_auth') === 'true';
    const userData = localStorage.getItem('app_user');
    if (isAuthenticated && userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Log out
  logoutUser() {
    localStorage.removeItem('app_auth');
    localStorage.removeItem('app_user');
  },

  // Get all users (Admin view & login resolution)
  async getAllUsers(): Promise<UserProfile[]> {
    if (this.isFirebaseActive() && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'app_users'));
        const cloudUsers: UserProfile[] = [];
        querySnapshot.forEach((docSnap) => {
          cloudUsers.push(docSnap.data() as UserProfile);
        });
        
        if (cloudUsers.length > 0) {
          // Keep local storage list in sync with cloud
          localStorage.setItem('local_users', JSON.stringify(cloudUsers));
          return cloudUsers;
        }
      } catch (err) {
        console.warn('Failed to fetch users from Live Firebase, reading from local sandbox...', err);
      }
    }

    // Local Fallback
    const localStr = localStorage.getItem('local_users');
    if (localStr) {
      try {
        return JSON.parse(localStr);
      } catch (e) {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  },

  // Update a single user profile (Admin edit or self edit)
  async updateUserInfo(uid: string, updatedFields: Partial<UserProfile>): Promise<UserProfile> {
    const users = await this.getAllUsers();
    const index = users.findIndex(u => u.uid === uid);
    if (index === -1) {
      throw new Error('Pengguna tidak ditemukan dalam sistem.');
    }

    const updatedProfile: UserProfile = {
      ...users[index],
      ...updatedFields,
      // Ensure permissions match structure if role changed and not customized
      permissions: updatedFields.permissions || (updatedFields.role ? DEFAULT_PERMISSIONS[updatedFields.role] : users[index].permissions)
    };

    // Update in live Firestore
    if (this.isFirebaseActive() && db) {
      try {
        await setDoc(doc(db, 'app_users', uid), updatedProfile);
      } catch (err) {
        console.warn('Failed to update live user in Firestore, performing local-only edit...', err);
      }
    }

    // Always update Local Storage
    users[index] = updatedProfile;
    localStorage.setItem('local_users', JSON.stringify(users));

    // If current logged-in user is updated, sync their active session
    const activeSession = this.getActiveSession();
    if (activeSession && activeSession.uid === uid) {
      this.saveSession(updatedProfile);
    }

    return updatedProfile;
  },

  // Helper: Save user profile to local list
  saveUserToLocalList(user: UserProfile) {
    const localUsersStr = localStorage.getItem('local_users');
    let localUsers: UserProfile[] = [];
    if (localUsersStr) {
      try {
        localUsers = JSON.parse(localUsersStr);
      } catch (e) {
        localUsers = [...DEFAULT_USERS];
      }
    } else {
      localUsers = [...DEFAULT_USERS];
    }
    
    // De-duplicate if existing
    const idx = localUsers.findIndex(u => u.uid === user.uid);
    if (idx !== -1) {
      localUsers[idx] = user;
    } else {
      localUsers.push(user);
    }
    localStorage.setItem('local_users', JSON.stringify(localUsers));
  }
};
