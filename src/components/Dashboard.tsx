import { useState } from 'react';
import { SPK, UserProfile } from '../types';
import { 
  FileText, 
  Clock, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle,
  Building2,
  DollarSign,
  CalendarDays
} from 'lucide-react';

interface DashboardProps {
  spks: SPK[];
  currentUser: UserProfile;
  onNavigateToForm: (spkToEdit?: SPK) => void;
  onNavigateToPreview: (spk: SPK) => void;
  onDeleteSpk: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: SPK['status']) => Promise<void>;
  onInitiateLogin?: () => void;
}

export default function Dashboard({ 
  spks, 
  currentUser, 
  onNavigateToForm, 
  onNavigateToPreview, 
  onDeleteSpk,
  onUpdateStatus,
  onInitiateLogin
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [vendorFilter, setVendorFilter] = useState<string>('All');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Formatting Currency to Indonesian Rupiah (IDR)
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Metrics Calculations
  const totalSpk = spks.length;
  const pendingCount = spks.filter(s => s.status === 'Pending').length;
  const inProgressCount = spks.filter(s => s.status === 'In Progress').length;
  const completedCount = spks.filter(s => s.status === 'Completed').length;
  const totalBudget = spks.reduce((sum, s) => sum + s.nilaiPengadaan, 0);
  const completedBudget = spks.filter(s => s.status === 'Completed').reduce((sum, s) => sum + s.nilaiPengadaan, 0);
  
  // Get unique vendors list for filtering
  const uniqueVendors = Array.from(new Set(spks.map(s => s.namaVendor))).filter(Boolean);

  // Filter SPK Data
  const filteredSpks = spks.filter(spk => {
    const matchesSearch = 
      spk.namaPaket.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spk.nomorSpk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spk.namaVendor.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' ? true : spk.status === statusFilter;
    const matchesVendor = vendorFilter === 'All' ? true : spk.namaVendor === vendorFilter;
    
    // For vendor user, restrict view or prioritize their projects if requested (here we show all, but highlight vendor's own)
    return matchesSearch && matchesStatus && matchesVendor;
  });

  const handleDeleteClick = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen SPK ini? Tindakan ini tidak dapat dibatalkan.')) {
      setIsDeletingId(id);
      try {
        await onDeleteSpk(id);
      } catch (e) {
        alert('Gagal menghapus SPK.');
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: SPK['status']) => {
    try {
      await onUpdateStatus(id, newStatus);
    } catch (e) {
      alert('Gagal mengubah status.');
    }
  };

  // Safe checks for permissions (Admin & Staf GA/authorized roles can create/edit/delete)
  const canModify = currentUser.role === 'Admin' || (currentUser.permissions && currentUser.permissions.canApproveRequests);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      
      {/* GUEST BANNER WARNING */}
      {currentUser.role === 'Tamu' && (
        <div id="guest-alert-banner" className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex gap-3.5">
            <div className="h-10 w-10 bg-amber-100 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">Akses Peninjau Terbatas (Mode Tamu)</h3>
              <p className="text-xs text-amber-800 leading-relaxed font-semibold mt-1">
                Anda sedang berselancar sebagai <strong className="text-amber-950 font-bold">Pengunjung Anonim</strong>. Anda hanya dapat memantau analisis statistik dan visualisasi data pengadaan. Silakan melakukan login atau pendaftaran mandiri untuk dapat menggunakan fitur interaktif seperti pengisian dokumen SPK, pelaporan, dan persetujuan.
              </p>
            </div>
          </div>
          {onInitiateLogin && (
            <button
              type="button"
              onClick={onInitiateLogin}
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm transition whitespace-nowrap cursor-pointer hover:shadow-md"
            >
              Daftar / Masuk Akun &rarr;
            </button>
          )}
        </div>
      )}
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 pointer-events-none">
          <FileText className="w-80 h-80" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 bg-blue-500/30 text-blue-100 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-400/20">
              Dashboard Utama
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {currentUser.role === 'Tamu' 
                ? 'Portal Publik SPK Pengadaan' 
                : `Selamat Datang, ${currentUser.displayName}`}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
              {currentUser.role === 'Tamu' ? (
                <span>Anda masuk sebagai <strong>Tamu / Pengunjung</strong>. Silakan login untuk mendapatkan hak akses pengelolaan (membuat, memperbarui, atau menghapus) Surat Perintah Kerja (SPK).</span>
              ) : (
                <span>Peran Anda: <strong className="bg-blue-800/40 px-2 py-0.5 rounded border border-blue-400/10">{currentUser.role}</strong>. Pantau, buat, dan kendalikan progress Surat Perintah Kerja (SPK) secara real-time.</span>
              )}
            </p>
          </div>
          
          {currentUser.role === 'Tamu' && onInitiateLogin && (
            <button
              type="button"
              onClick={onInitiateLogin}
              className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg whitespace-nowrap self-start md:self-auto cursor-pointer"
            >
              Masuk / Login Akun
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SPK */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total SPK</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalSpk}</p>
          </div>
        </div>

        {/* Pending SPK */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Draft / Pending</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{pendingCount}</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
            <Play className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Berjalan</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{inProgressCount}</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Financial Overview & Status Graph Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Stats Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-950 text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Realisasi Anggaran Pengadaan
            </h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Tahun Anggaran 2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-medium text-slate-500 block">Total Nilai Pagu SPK</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block">{formatIDR(totalBudget)}</span>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-xs font-medium text-emerald-700 block">Realisasi SPK Selesai</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-800 mt-1 block">{formatIDR(completedBudget)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
              <span>Efisiensi Realisasi Fisik (Selesai)</span>
              <span>{totalBudget > 0 ? Math.round((completedBudget / totalBudget) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${totalBudget > 0 ? (completedBudget / totalBudget) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Interactive SVG Proportion Ring Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-slate-950 text-base mb-4">Proporsi Status Pekerjaan</h3>
          
          <div className="flex items-center justify-around gap-2 flex-1">
            {totalSpk > 0 ? (
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.2" />
                  
                  {/* Pending Circle */}
                  <circle 
                    cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.2" 
                    strokeDasharray={`${(pendingCount / totalSpk) * 100} ${100 - (pendingCount / totalSpk) * 100}`}
                    strokeDashoffset="100"
                  />
                  {/* In Progress Circle */}
                  <circle 
                    cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" strokeWidth="3.2" 
                    strokeDasharray={`${(inProgressCount / totalSpk) * 100} ${100 - (inProgressCount / totalSpk) * 100}`}
                    strokeDashoffset={`${100 - (pendingCount / totalSpk) * 100}`}
                  />
                  {/* Completed Circle */}
                  <circle 
                    cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.2" 
                    strokeDasharray={`${(completedCount / totalSpk) * 100} ${100 - (completedCount / totalSpk) * 100}`}
                    strokeDashoffset={`${100 - (pendingCount / totalSpk) * 100 - (inProgressCount / totalSpk) * 100}`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-extrabold text-slate-800">{totalSpk}</span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">SPK</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">Tidak ada data visualisasi</div>
            )}

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-amber-500 rounded-md block"></span>
                <span className="text-slate-600 font-medium">Pending ({pendingCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-indigo-500 rounded-md block"></span>
                <span className="text-slate-600 font-medium">Berjalan ({inProgressCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-emerald-500 rounded-md block"></span>
                <span className="text-slate-600 font-medium">Selesai ({completedCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content section (Bento block) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filters & Actions Toolbar */}
        <div className="p-6 border-b border-slate-150 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daftar Dokumen SPK Pengadaan</h2>
              <p className="text-xs text-slate-500">Kelola dan update status dokumen Surat Perintah Kerja yang aktif.</p>
            </div>
            
            {canModify && (
              <button
                type="button"
                onClick={() => onNavigateToForm()}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition self-start sm:self-auto cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" />
                Buat SPK Baru
              </button>
            )}
          </div>

          {/* Search, Filter inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Cari paket, nomor SPK, vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 w-full border border-slate-250 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            {/* Filter Status */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 pointer-events-none">
                <Filter className="h-3.5 w-3.5" />
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-3 py-2 w-full border border-slate-250 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 appearance-none"
              >
                <option value="All">Semua Status Pekerjaan</option>
                <option value="Pending">Draft / Pending</option>
                <option value="In Progress">Sedang Berjalan</option>
                <option value="Completed">Selesai Kontrak</option>
              </select>
            </div>

            {/* Filter Vendor */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 pointer-events-none">
                <Building2 className="h-3.5 w-3.5" />
              </span>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="pl-9 pr-3 py-2 w-full border border-slate-250 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 appearance-none"
              >
                <option value="All">Semua Penyedia / Vendor</option>
                {uniqueVendors.map((vendor, idx) => (
                  <option key={idx} value={vendor}>{vendor}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          {filteredSpks.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  <th className="py-3.5 px-6">Nomor & Paket Pekerjaan</th>
                  <th className="py-3.5 px-4">Penyedia / Vendor</th>
                  <th className="py-3.5 px-4 text-right">Nilai Kontrak</th>
                  <th className="py-3.5 px-4">Jangka Waktu</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSpks.map((spk) => {
                  const milestonesCount = spk.milestones?.length || 0;
                  const completedMilestones = spk.milestones?.filter(m => m.completed).length || 0;
                  const percentComplete = milestonesCount > 0 ? Math.round((completedMilestones / milestonesCount) * 100) : 0;

                  return (
                    <tr key={spk.id} className="hover:bg-slate-50/50 transition">
                      {/* Package Name and SPK Number */}
                      <td className="py-4 px-6 max-w-sm">
                        <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer block truncate" onClick={() => onNavigateToPreview(spk)}>
                          {spk.namaPaket}
                        </div>
                        <div className="text-xs font-mono text-slate-500 mt-1 flex items-center gap-1.5">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600">NO</span>
                          {spk.nomorSpk}
                        </div>
                      </td>

                      {/* Vendor name */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[160px]">{spk.namaVendor || 'Belum Ditunjuk'}</span>
                        </div>
                        {milestonesCount > 0 && (
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <span>Milestones: {completedMilestones}/{milestonesCount}</span>
                            <div className="w-12 bg-slate-150 h-1.5 rounded-full overflow-hidden inline-block">
                              <div className="bg-indigo-500 h-full" style={{ width: `${percentComplete}%` }}></div>
                            </div>
                            <span>{percentComplete}%</span>
                          </div>
                        )}
                      </td>

                      {/* Contract Value */}
                      <td className="py-4 px-4 text-right font-bold text-slate-900">
                        {formatIDR(spk.nilaiPengadaan)}
                      </td>

                      {/* Jangka Waktu */}
                      <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          <span>{spk.tanggalMulai}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pl-4.5 mt-0.5">s/d {spk.tanggalSelesai}</div>
                      </td>

                      {/* Status Tag */}
                      <td className="py-4 px-4">
                        {canModify ? (
                          <div className="relative inline-block">
                            <select
                              value={spk.status}
                              onChange={(e) => handleQuickStatusChange(spk.id, e.target.value as SPK['status'])}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                spk.status === 'Completed' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : spk.status === 'In Progress' 
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                            spk.status === 'Completed' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : spk.status === 'In Progress' 
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {spk.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Pratinjau Cetak / PDF"
                            onClick={() => onNavigateToPreview(spk)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                          
                          {canModify && (
                            <>
                              <button
                                type="button"
                                title="Edit Dokumen"
                                onClick={() => onNavigateToForm(spk)}
                                className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-800 transition cursor-pointer"
                              >
                                <Edit className="h-4.5 w-4.5" />
                              </button>
                              
                              <button
                                type="button"
                                title="Hapus Dokumen"
                                disabled={isDeletingId === spk.id}
                                onClick={() => handleDeleteClick(spk.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-800 transition cursor-pointer disabled:opacity-50"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">Tidak Ada Dokumen Ditemukan</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Coba sesuaikan pencarian Anda atau filter status untuk menemukan dokumen SPK yang Anda cari.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
