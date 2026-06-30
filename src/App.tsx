import { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { SPK, UserProfile } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SpkForm from './components/SpkForm';
import SpkPreview from './components/SpkPreview';
import CalendarView from './components/CalendarView';
import AccountManagement from './components/AccountManagement';
import UserManagement from './components/UserManagement';
import { 
  FileText, 
  Calendar, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  User, 
  Menu, 
  X,
  RefreshCw,
  Database,
  Cloud,
  UserCog,
  ShieldCheck,
  Users
} from 'lucide-react';

const GUEST_USER: UserProfile = {
  uid: 'guest',
  email: 'tamu@spk.go.id',
  displayName: 'Tamu / Pengunjung',
  role: 'Tamu',
  permissions: {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateReports: false,
    canApproveRequests: false,
    canEditSettings: false
  },
  createdAt: new Date().toISOString()
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [spks, setSpks] = useState<SPK[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'preview' | 'calendar' | 'profile' | 'users'>('dashboard');
  const [activeSpkForPreview, setActiveSpkForPreview] = useState<SPK | null>(null);
  const [activeSpkForEdit, setActiveSpkForEdit] = useState<SPK | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Listen for Authentication Changes & Seed Database
  useEffect(() => {
    const initSession = async () => {
      // Auto seed db with default profiles
      await authService.initializeDatabase();
      
      // Load active session
      const sessionUser = authService.getActiveSession();
      if (sessionUser) {
        setCurrentUser(sessionUser);
      } else {
        // Force authentication on first visit, unless choosing guest mode
        setIsAuthenticating(true);
      }
      setIsLoading(false);
    };

    initSession();
  }, []);

  // 2. Fetch SPK Data on User Auth
  useEffect(() => {
    if (currentUser) {
      fetchSpks();
    }
  }, [currentUser]);

  const fetchSpks = async () => {
    setIsRefreshing(true);
    try {
      const data = await storageService.getSPKs();
      setSpks(data);
    } catch (error) {
      console.error('Failed to load SPK records:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 3. SPK CRUD Actions
  const handleSaveSpk = async (payload: Omit<SPK, 'id' | 'createdAt'>) => {
    try {
      if (activeSpkForEdit) {
        // Update operation
        await storageService.updateSPK(activeSpkForEdit.id, payload);
      } else {
        // Create operation
        await storageService.saveSPK(payload);
      }
      
      // Refresh list & reset states
      await fetchSpks();
      setActiveSpkForEdit(null);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Failed to save SPK:', error);
      throw error;
    }
  };

  const handleDeleteSpk = async (id: string) => {
    try {
      await storageService.deleteSPK(id);
      await fetchSpks();
    } catch (error) {
      console.error('Failed to delete SPK:', error);
      throw error;
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: SPK['status']) => {
    try {
      await storageService.updateSPK(id, { status: newStatus });
      await fetchSpks();
    } catch (error) {
      console.error('Failed to update SPK status:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      authService.logoutUser();
      setCurrentUser(GUEST_USER);
      setSpks([]);
      setIsAuthenticating(true);
      setCurrentView('dashboard');
    }
  };

  // Helper permissions
  const canCreateSpk = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Staf GA');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-700 animate-pulse">Menghubungkan ke Sistem Otoritas...</p>
        </div>
      </div>
    );
  }

  // Not logged in or explicitly authenticating: Show Login / Register Page
  if (isAuthenticating || !currentUser) {
    return (
      <Login 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticating(false);
        }} 
        onCancel={() => {
          // If no user exists, set to GUEST_USER and allow them to proceed
          if (!currentUser) {
            setCurrentUser(GUEST_USER);
          }
          setIsAuthenticating(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans print:bg-white print:min-h-0">
      
      {/* APP TOP LEVEL NAVBAR - Hidden when printing */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              
              {/* Brand Logo & Connection State Indicator */}
              <div 
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => {
                  setCurrentView('dashboard');
                  setActiveSpkForEdit(null);
                }}
              >
                <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight block">SPK Pengadaan</span>
                  <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">Barang & Jasa</span>
                </div>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('dashboard');
                    setActiveSpkForEdit(null);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    currentView === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  Dashboard
                </button>

                {currentUser.role !== 'Tamu' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('calendar');
                        setActiveSpkForEdit(null);
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentView === 'calendar' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      Kalender Timeline
                    </button>

                    {canCreateSpk && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSpkForEdit(null);
                          setCurrentView('form');
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          currentView === 'form' && !activeSpkForEdit ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <PlusCircle className="h-4 w-4 text-emerald-600" />
                        Buat SPK
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSpkForEdit(null);
                        setCurrentView('profile');
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentView === 'profile' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      <UserCog className="h-4 w-4 text-teal-600" />
                      Pengelolaan Akun
                    </button>
                  </>
                )}

                {currentUser.role === 'Admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSpkForEdit(null);
                      setCurrentView('users');
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      currentView === 'users' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    <Users className="h-4 w-4 text-rose-600" />
                    Manajemen Pengguna
                  </button>
                )}
              </div>

            </div>

            {/* Profile Info, Database Mode & Refresh/Logout Buttons */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* DB Indicator badge */}
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-emerald-700 shadow-sm">
                <Cloud className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span>Firebase Cloud</span>
              </div>

              {/* Sync Refresh Button */}
              <button
                type="button"
                onClick={fetchSpks}
                disabled={isRefreshing}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title="Refresh Sinkronisasi Data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              </button>

              {/* User Avatar Card info / Login Button for Guest */}
              {currentUser.role === 'Tamu' ? (
                <button
                  type="button"
                  onClick={() => setIsAuthenticating(true)}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition shadow-sm hover:shadow"
                >
                  <User className="h-4 w-4" />
                  Masuk / Login
                </button>
              ) : (
                <>
                  <div 
                    onClick={() => setCurrentView('profile')}
                    className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer hover:bg-slate-50/80 p-1.5 rounded-xl transition"
                    title="Kelola Profil Akun"
                  >
                    <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 border border-slate-200">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="text-left text-xs">
                      <span className="font-bold text-slate-900 block max-w-[120px] truncate">{currentUser.displayName}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">{currentUser.role}</span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </>
              )}

            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center md:hidden gap-2">
              <button
                type="button"
                onClick={fetchSpks}
                disabled={isRefreshing}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu panel dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setCurrentView('dashboard');
                setActiveSpkForEdit(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                currentView === 'dashboard' ? 'bg-slate-100 text-blue-600' : 'text-slate-600'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              Dashboard Utama
            </button>

            {currentUser.role !== 'Tamu' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('calendar');
                    setActiveSpkForEdit(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                    currentView === 'calendar' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  <Calendar className="h-4.5 w-4.5" />
                  Kalender Pekerjaan
                </button>

                {canCreateSpk && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSpkForEdit(null);
                      setCurrentView('form');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                      currentView === 'form' && !activeSpkForEdit ? 'bg-slate-100 text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    <PlusCircle className="h-4.5 w-4.5" />
                    Buat Surat Perintah Kerja (SPK)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveSpkForEdit(null);
                    setCurrentView('profile');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                    currentView === 'profile' ? 'bg-slate-100 text-teal-600' : 'text-slate-600'
                  }`}
                >
                  <UserCog className="h-4.5 w-4.5" />
                  Pengelolaan Akun
                </button>
              </>
            )}

            {currentUser.role === 'Admin' && (
              <button
                type="button"
                onClick={() => {
                  setActiveSpkForEdit(null);
                  setCurrentView('users');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                  currentView === 'users' ? 'bg-slate-100 text-rose-600' : 'text-slate-600'
                }`}
              >
                <Users className="h-4.5 w-4.5 text-rose-600" />
                Manajemen Pengguna
              </button>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="font-bold truncate max-w-[150px]">{currentUser.displayName}</span>
              </div>
              {currentUser.role === 'Tamu' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthenticating(true);
                  }}
                  className="text-blue-600 font-bold"
                >
                  Masuk / Login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-red-500 font-bold"
                >
                  Keluar
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* REFRESHING OVERLAY SPINNER (SUBTLE BAR ON HEADER) */}
      {isRefreshing && !isLoading && (
        <div className="h-1 bg-indigo-500 w-full animate-pulse sticky top-16 z-30 print:hidden"></div>
      )}

      {/* CORE VIEW RENDER ENGINE */}
      <main className="flex-grow">
        {currentView === 'dashboard' && (
          <Dashboard 
            spks={spks}
            currentUser={currentUser}
            onNavigateToForm={(spkToEdit) => {
              setActiveSpkForEdit(spkToEdit || null);
              setCurrentView('form');
            }}
            onNavigateToPreview={(spk) => {
              setActiveSpkForPreview(spk);
              setCurrentView('preview');
            }}
            onDeleteSpk={handleDeleteSpk}
            onUpdateStatus={handleUpdateStatus}
            onInitiateLogin={() => setIsAuthenticating(true)}
          />
        )}

        {currentView === 'form' && (
          <SpkForm 
            spkToEdit={activeSpkForEdit || undefined}
            currentUser={currentUser}
            onSave={handleSaveSpk}
            onCancel={() => {
              setActiveSpkForEdit(null);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'preview' && activeSpkForPreview && (
          <SpkPreview 
            spk={activeSpkForPreview}
            onBack={() => {
              setActiveSpkForPreview(null);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView 
            spks={spks}
            onNavigateToPreview={(spk) => {
              setActiveSpkForPreview(spk);
              setCurrentView('preview');
            }}
          />
        )}

        {currentView === 'profile' && (
          <AccountManagement 
            currentUser={currentUser}
            onUpdateProfile={(updatedProfile) => {
              setCurrentUser(updatedProfile);
            }}
            onInitiateLogin={() => setIsAuthenticating(true)}
          />
        )}

        {currentView === 'users' && currentUser.role === 'Admin' && (
          <UserManagement 
            currentUser={currentUser}
          />
        )}
      </main>

      {/* APP FOOTER - Hidden when printing */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-8 print:hidden">
        <div>&copy; 2026 SCB Procurement</div>
        <div className="text-slate-300 mt-0.5">Sistem Pembuatan SPK Pengadaan Barang dan Jasa - Sekolah Cendekia BAZNAS</div>
      </footer>

    </div>
  );
}
