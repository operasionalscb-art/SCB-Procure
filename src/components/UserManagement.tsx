import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserProfile, UserPermissions } from '../types';
import { 
  Users, 
  ShieldCheck, 
  Building, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Settings,
  Shield,
  FileSpreadsheet,
  CheckSquare,
  Square,
  UserCheck
} from 'lucide-react';

interface UserManagementProps {
  currentUser: UserProfile;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Track passwords visibility per user uid
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  
  // Local modifications state
  const [editStates, setEditStates] = useState<Record<string, Partial<UserProfile>>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Gagal memuat daftar pengguna: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (uid: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [uid]: !prev[uid]
    }));
  };

  const handleFieldChange = (uid: string, field: keyof UserProfile, value: any) => {
    setEditStates(prev => {
      const userEdits = prev[uid] || {};
      return {
        ...prev,
        [uid]: {
          ...userEdits,
          [field]: value
        }
      };
    });
  };

  const handlePermissionChange = (uid: string, permKey: keyof UserPermissions, checked: boolean) => {
    const originalUser = users.find(u => u.uid === uid);
    if (!originalUser) return;

    setEditStates(prev => {
      const userEdits = prev[uid] || {};
      const currentPermissions = userEdits.permissions || originalUser.permissions;
      
      return {
        ...prev,
        [uid]: {
          ...userEdits,
          permissions: {
            ...currentPermissions,
            [permKey]: checked
          }
        }
      };
    });
  };

  const handleSaveUser = async (uid: string) => {
    const edits = editStates[uid];
    if (!edits) return; // Nothing changed

    setSavingId(uid);
    setFeedback(null);

    try {
      const updated = await authService.updateUserInfo(uid, edits);
      
      // Update local users array state
      setUsers(prev => prev.map(u => u.uid === uid ? updated : u));
      
      // Clean up local edits state for this user
      setEditStates(prev => {
        const copy = { ...prev };
        delete copy[uid];
        return copy;
      });

      setFeedback({ type: 'success', text: `Data pengguna "${updated.displayName}" berhasil diperbarui!` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Gagal memperbarui data pengguna: ' + err.message });
    } finally {
      setSavingId(null);
    }
  };

  if (currentUser.role !== 'Admin') {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center font-sans">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-9 w-9" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Akses Ditolak (Otoritas Terbatas)</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Halaman Manajemen Pengguna dan Otorisasi ini hanya dapat diakses oleh administrator resmi dengan kredensial Superadmin.
        </p>
      </div>
    );
  }

  const roles: UserProfile['role'][] = ['Admin', 'Staf GA', 'Pegawai', 'Tamu'];
  const divisions = ['Sistem', 'Asrama', 'Kesiswaan', 'Umum', 'Akademik', 'Sarana & Prasarana', 'Keamanan'];

  return (
    <div id="superadmin-user-management" className="max-w-7xl mx-auto px-4 py-8 font-sans">
      
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600 shrink-0" />
            Manajemen Pengguna & Otorisasi
          </h1>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">
            Kelola hak akses spesifik, peran, divisi, dan modifikasi langsung sandi pengguna dari konsol administrator.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Connection Indicator Alert */}
      <div className="mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 bg-emerald-50 border-emerald-100 text-emerald-800">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold leading-relaxed">
            Sinkronisasi Otomatis Cloud Firestore Aktif. Seluruh perubahan akan langsung direfleksikan secara realtime ke database.
          </span>
        </div>
      </div>

      {/* Operation Feedback */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
          feedback.type === 'success' 
            ? 'bg-blue-50 border-blue-100 text-blue-800' 
            : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {feedback.type === 'success' ? (
            <UserCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-bold leading-relaxed">{feedback.text}</span>
        </div>
      )}

      {/* Desktop List Representation */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center">
          <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Memuat basis data otoritas pengguna...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center text-slate-400">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold">Tidak ditemukan data pengguna terdaftar.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pengguna / Identitas</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Peran & Divisi</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Otoritas Otorisasi (Hak Akses)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kata Sandi</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => {
                  const edited = editStates[u.uid] || {};
                  const activeRole = edited.role !== undefined ? edited.role : u.role;
                  const activeDivision = edited.division !== undefined ? edited.division : (u.division || 'Umum');
                  const activePassword = edited.password !== undefined ? edited.password : (u.password || '');
                  
                  const activePerms = edited.permissions !== undefined ? edited.permissions : u.permissions;
                  const hasUnsavedChanges = Object.keys(edited).length > 0;

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/50 transition">
                      {/* Name / Email Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold border border-slate-200 shadow-inner">
                            {u.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <input
                              type="text"
                              value={edited.displayName !== undefined ? edited.displayName : u.displayName}
                              onChange={(e) => handleFieldChange(u.uid, 'displayName', e.target.value)}
                              className="font-extrabold text-slate-800 bg-transparent border-b border-transparent focus:border-slate-300 focus:bg-white px-1 rounded outline-none transition"
                            />
                            <span className="block text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 shrink-0" />
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Division Dropdowns */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 max-w-[160px]">
                          {/* Role Select */}
                          <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <select
                              value={activeRole}
                              onChange={(e) => handleFieldChange(u.uid, 'role', e.target.value as UserProfile['role'])}
                              className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:outline-none w-full cursor-pointer"
                            >
                              {roles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>

                          {/* Division Select */}
                          <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
                            <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <select
                              value={activeDivision}
                              onChange={(e) => handleFieldChange(u.uid, 'division', e.target.value)}
                              className="bg-transparent border-none text-[11px] font-semibold text-slate-600 focus:outline-none w-full cursor-pointer"
                            >
                              {divisions.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Specific Checkbox Permissions */}
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150 max-w-sm">
                          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={activePerms.canViewDashboard}
                              onChange={(e) => handlePermissionChange(u.uid, 'canViewDashboard', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                            />
                            Dashboard
                          </label>
                          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={activePerms.canManageUsers}
                              onChange={(e) => handlePermissionChange(u.uid, 'canManageUsers', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                            />
                            Kelola Pengguna
                          </label>
                          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={activePerms.canCreateReports}
                              onChange={(e) => handlePermissionChange(u.uid, 'canCreateReports', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                            />
                            Buat Laporan
                          </label>
                          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={activePerms.canApproveRequests}
                              onChange={(e) => handlePermissionChange(u.uid, 'canApproveRequests', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                            />
                            Persetujuan
                          </label>
                          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer col-span-2">
                            <input
                              type="checkbox"
                              checked={activePerms.canEditSettings}
                              onChange={(e) => handlePermissionChange(u.uid, 'canEditSettings', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                            />
                            Pengaturan Sistem
                          </label>
                        </div>
                      </td>

                      {/* Password Management */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <input
                              type={visiblePasswords[u.uid] ? "text" : "password"}
                              value={activePassword}
                              onChange={(e) => handleFieldChange(u.uid, 'password', e.target.value)}
                              className="font-mono text-slate-700 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 px-2.5 py-1 rounded-lg w-28 focus:outline-none transition text-[11px]"
                              placeholder="Ketik sandi baru"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.uid)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition"
                            title="Tampilkan / Sembunyikan"
                          >
                            {visiblePasswords[u.uid] ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Save Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleSaveUser(u.uid)}
                          disabled={savingId === u.uid || !hasUnsavedChanges}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition cursor-pointer shadow-sm ${
                            hasUnsavedChanges
                              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <Save className="h-3 w-3" />
                          {savingId === u.uid ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Panel Guideline footer */}
      <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-200/60 p-5">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Settings className="h-4 w-4 text-blue-600" />
          Panduan Manajemen Otorisasi (RBAC)
        </h3>
        <ul className="text-[11px] text-slate-500 space-y-1.5 leading-relaxed font-semibold list-disc list-inside">
          <li>Perubahan peran pada kolom dropdown akan menyesuaikan hak akses (permissions) default per peran secara instan.</li>
          <li>Hak akses spesifik dapat dikustomisasi lebih lanjut untuk setiap pengguna menggunakan checkbox persetujuan mandiri.</li>
          <li>Password pengguna ditampilkan dalam format terenkripsi/bintang demi alasan kepatuhan internal, namun Anda dapat membukanya menggunakan ikon <strong className="text-slate-600">Eye</strong> untuk keperluan verifikasi audit helpdesk.</li>
        </ul>
      </div>
    </div>
  );
}
