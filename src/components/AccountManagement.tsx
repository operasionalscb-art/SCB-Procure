import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldAlert, 
  UserCog, 
  Save, 
  Cloud, 
  Database, 
  CheckCircle, 
  AlertCircle,
  Clock,
  KeyRound
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface AccountManagementProps {
  currentUser: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onInitiateLogin?: () => void;
}

export default function AccountManagement({
  currentUser,
  onUpdateProfile,
  onInitiateLogin
}: AccountManagementProps) {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>(currentUser.role);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const rolesList: UserProfile['role'][] = [
    'Admin',
    'Staf GA',
    'Pegawai',
    'Tamu'
  ];

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Nama lengkap tidak boleh kosong!' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (currentUser.uid !== 'guest') {
        // Update user document in live firestore database
        const updatedProfile = await authService.updateUserInfo(currentUser.uid, {
          displayName: displayName.trim(),
          role: selectedRole
        });
        onUpdateProfile(updatedProfile);
      } else {
        // Guest mode simulation update
        const updatedProfile: UserProfile = {
          ...currentUser,
          displayName: displayName.trim(),
          role: selectedRole
        };
        onUpdateProfile(updatedProfile);
      }

      setMessage({ type: 'success', text: 'Profil akun berhasil diperbarui!' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: `Gagal memperbarui profil: ${err.message || err}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="account-management-view" className="max-w-4xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
          Pengelolaan Akun
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola profil pengguna, atur preferensi hak akses, dan pantau status koneksi database sistem Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Connection Details and Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border-2 border-slate-200 shadow-inner">
                  <User className="h-10 w-10 text-slate-500" />
                </div>
                <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center ${
                  currentUser.role === 'Tamu' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                </div>
              </div>

              <h2 className="mt-4 font-extrabold text-slate-800 text-base">
                {currentUser.displayName}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 mt-2">
                <UserCog className="w-3.5 h-3.5 text-slate-500" />
                {currentUser.role}
              </span>
            </div>

             <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Status Koneksi</span>
                <span className="font-extrabold flex items-center gap-1">
                  <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <Cloud className="w-3 h-3" /> Live Firebase
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Metode Masuk</span>
                <span className="text-slate-700 font-bold flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-slate-400" />
                  {currentUser.uid === 'guest' ? 'Akses Tamu' : 'Email & Sandi'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">User ID (UID)</span>
                <span className="text-slate-500 font-mono text-[10px] truncate max-w-[120px]" title={currentUser.uid}>
                  {currentUser.uid}
                </span>
              </div>
            </div>
          </div>

          {currentUser.role === 'Tamu' && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-3">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                Hak Akses Terbatas
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Anda masuk menggunakan akun Tamu publik. Anda dapat memantau linimasa SPK, namun memerlukan akun resmi (PPK, Admin, atau Vendor) untuk mengelola atau menyetujui draf Surat Perintah Kerja.
              </p>
              {onInitiateLogin && (
                <button
                  type="button"
                  onClick={onInitiateLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md cursor-pointer text-center"
                >
                  Masuk Sekarang
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveChanges} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Pengaturan Profil Pengguna
              </h3>

              {message && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-semibold leading-relaxed">{message.text}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email Akun
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium cursor-not-allowed outline-none"
                      value={currentUser.email}
                      disabled
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-400 font-medium">
                    Email akun bersifat permanen dan tidak dapat diubah demi alasan keamanan audit pengadaan.
                  </p>
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap / Instansi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      id="displayName"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 font-medium outline-none transition"
                      placeholder="Masukkan nama lengkap Anda..."
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hak Akses / Peran Pengguna
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserCog className="h-4.5 w-4.5" />
                    </div>
                    <select
                      id="role"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 font-medium outline-none transition cursor-pointer appearance-none"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserProfile['role'])}
                    >
                      {rolesList.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-400 font-medium leading-relaxed">
                    Penggantian peran secara interaktif disediakan untuk kemudahan demo evaluasi kelayakan sistem (RBAC) pada server live dan sandbox ini.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Terakhir Diperbarui: Baru saja
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow hover:shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
