import { useState, FormEvent, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  HelpCircle, 
  Cloud, 
  Database, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
}

export default function Login({ 
  onLoginSuccess, 
  onCancel
}: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [division, setDivision] = useState('Asrama');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize DB Seeds on load
  useEffect(() => {
    authService.initializeDatabase().catch(console.error);
  }, []);

  const divisionsList = [
    'Asrama',
    'Kesiswaan',
    'Umum',
    'Akademik',
    'Sarana & Prasarana',
    'Keamanan'
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!email || !password || !displayName) {
          throw new Error('Semua kolom pendaftaran wajib diisi.');
        }
        if (password.length < 5) {
          throw new Error('Kata sandi minimal harus 5 karakter demi keamanan.');
        }
        const profile = await authService.registerUser({
          email,
          password,
          displayName,
          division
        });
        setSuccess('Pendaftaran berhasil! Menyambungkan sesi...');
        setTimeout(() => {
          onLoginSuccess(profile);
        }, 1200);
      } else {
        if (!email || !password) {
          throw new Error('Email dan kata sandi wajib diisi.');
        }
        const profile = await authService.loginUser(email, password);
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string, presetPass: string) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const profile = await authService.loginUser(presetEmail, presetPass);
      onLoginSuccess(profile);
    } catch (err: any) {
      setError(err.message || 'Gagal masuk menggunakan akun instan.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterGuestMode = () => {
    const guestUser: UserProfile = {
      uid: 'guest',
      email: 'tamu@spk.go.id',
      displayName: 'Pengunjung Anonim',
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
    authService.saveSession(guestUser);
    onLoginSuccess(guestUser);
  };

  return (
    <div id="login-screen" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* App Title & Premium Icon Container */}
        <div className="flex justify-center">
          <div className="h-14 w-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
            <ShieldCheck className="h-8 w-8 animate-pulse" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Sistem Portal Otoritas SCB
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
          Gerbang Autentikasi dan Registrasi Mandiri Pengguna Sekolah Cendekia Bersaudara
        </p>
        
        {/* Connection Status Indicator */}
        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <Cloud className="h-3 w-3 text-emerald-500 animate-pulse" />
            Firebase Cloud Terhubung
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 shadow-md sm:rounded-3xl sm:px-10 border border-slate-100">

          {/* Messages Alert Block */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl flex gap-2 items-start">
              <span className="font-extrabold shrink-0">Gagal:</span>
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping shrink-0"></span>
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div>
                  <label htmlFor="displayName" className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Anda
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="displayName"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-slate-50 focus:bg-white transition"
                      placeholder="Contoh: Rendi Rahardian"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="division" className="block text-xs font-bold text-slate-700 mb-1">
                    Divisi Penempatan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <select
                      id="division"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-slate-50 focus:bg-white transition cursor-pointer"
                    >
                      {divisionsList.map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-[9px] text-slate-400 font-semibold leading-relaxed">
                    Pengguna baru akan mendapatkan peran default <strong className="text-slate-600">Pegawai</strong> dengan hak akses dasar.
                  </p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email Resmi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-slate-50 focus:bg-white transition"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-slate-50 focus:bg-white transition"
                  placeholder={isRegister ? 'Sandi minimal 5 karakter' : 'Masukkan sandi Anda'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 border border-transparent rounded-xl shadow text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {loading ? 'Sedang Memproses...' : isRegister ? 'Daftar & Registrasi Sekarang' : 'Masuk Ke Sistem'}
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </form>

          {/* Register vs Login State Switcher Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-500 cursor-pointer hover:underline"
            >
              {isRegister ? 'Sudah mendaftar sebelumnya? Silakan Masuk' : 'Belum memiliki akun? Registrasi Mandiri'}
            </button>
          </div>

          {/* Guest Mode Separator and Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Akses Peninjau Publik
            </p>
            <button
              type="button"
              onClick={handleEnterGuestMode}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-sm hover:shadow"
            >
              Kembali & Lihat Dashboard Analisis
            </button>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Gunakan mode tamu untuk melihat statistik dan visualisasi secara publik tanpa akun.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
