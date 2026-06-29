import { useState, FormEvent } from 'react';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';
import { FileText, Lock, Mail, User, ShieldCheck, HelpCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  isFirebaseActive: boolean;
  onCancel?: () => void;
}

export default function Login({ onLoginSuccess, isFirebaseActive, onCancel }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Pejabat Pembuat Komitmen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!email || !password || !displayName) {
          throw new Error('Semua kolom pendaftaran wajib diisi.');
        }
        if (password.length < 6) {
          throw new Error('Kata sandi minimal harus 6 karakter.');
        }
        const profile = await storageService.register(email, password, displayName, role);
        onLoginSuccess(profile);
      } else {
        if (!email || !password) {
          throw new Error('Email dan kata sandi wajib diisi.');
        }
        const profile = await storageService.login(email, password);
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string) => {
    setError('');
    setLoading(true);
    try {
      const profile = await storageService.login(presetEmail, 'anypassword');
      onLoginSuccess(profile);
    } catch (err: any) {
      setError(err.message || 'Gagal login cepat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* App Logo & Header */}
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md text-white">
            <FileText className="h-9 w-9" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Sistem Informasi SPK
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Surat Perintah Kerja Pengadaan Barang & Jasa
        </p>
        
        {/* Mode Indicator */}
        <div className="mt-3 flex justify-center">
          {isFirebaseActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Firebase Terhubung (Real-time)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              Offline Sandbox Mode (Local Storage)
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-150">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-slate-700">
                    Nama Lengkap
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50 focus:bg-white"
                      placeholder="Contoh: Ir. Rahmat Hidayat"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                    Peran / Jabatan
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50 focus:bg-white"
                    >
                      <option value="Pejabat Pembuat Komitmen">Pejabat Pembuat Komitmen (PPK)</option>
                      <option value="Penyedia">Penyedia / Vendor</option>
                      <option value="Admin">Admin Pengadaan</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Alamat Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50 focus:bg-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Kata Sandi
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50 focus:bg-white"
                  placeholder={isRegister ? 'Minimal 6 karakter' : '••••••••'}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Memproses...' : isRegister ? 'Daftar Akun Baru' : 'Masuk Ke Aplikasi'}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 cursor-pointer"
            >
              {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar gratis di sini'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 border-t border-slate-100 pt-3 cursor-pointer"
              >
                &larr; Lanjutkan Sebagai Tamu / Pengunjung
              </button>
            )}
          </div>

          {/* Quick Preset Accounts Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
              Demo Akun Instan (Klik untuk Masuk)
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('operasional.scb@gmail.com')}
                className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 text-xs text-left hover:bg-blue-50 hover:border-blue-200 transition text-slate-700 cursor-pointer group"
              >
                <div>
                  <span className="font-bold block text-slate-800">operasional.scb@gmail.com</span>
                  <span className="text-slate-500">Pejabat Pembuat Komitmen (PPK)</span>
                </div>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 font-semibold transition">Pilih &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ppk@spk.go.id')}
                className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 text-xs text-left hover:bg-blue-50 hover:border-blue-200 transition text-slate-700 cursor-pointer group"
              >
                <div>
                  <span className="font-bold block text-slate-800">ppk@spk.go.id</span>
                  <span className="text-slate-500">Ir. Budi Hermawan (PPK)</span>
                </div>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 font-semibold transition">Pilih &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('vendor@spk.go.id')}
                className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 text-xs text-left hover:bg-blue-50 hover:border-blue-200 transition text-slate-700 cursor-pointer group"
              >
                <div>
                  <span className="font-bold block text-slate-800">vendor@spk.go.id</span>
                  <span className="text-slate-500">PT Solusi Teknologi (Vendor/Penyedia)</span>
                </div>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 font-semibold transition">Pilih &rarr;</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
