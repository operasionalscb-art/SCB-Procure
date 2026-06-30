import { useState, useEffect, FormEvent } from 'react';
import { SPK, Milestone, UserProfile } from '../types';
import { 
  FileText, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Building2, 
  ListChecks, 
  Info,
  CalendarCheck2,
  UserCheck
} from 'lucide-react';

interface SpkFormProps {
  spkToEdit?: SPK;
  currentUser: UserProfile;
  onSave: (spkData: Omit<SPK, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

export default function SpkForm({ spkToEdit, currentUser, onSave, onCancel }: SpkFormProps) {
  const [nomorSpk, setNomorSpk] = useState('');
  const [namaPaket, setNamaPaket] = useState('');
  const [nilaiPengadaan, setNilaiPengadaan] = useState<number>(0);
  const [namaVendor, setNamaVendor] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [detailSpesifikasi, setDetailSpesifikasi] = useState('');
  const [status, setStatus] = useState<SPK['status']>('Pending');
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // New fields for Vendor's Bank Account Details
  const [nomorRekening, setNomorRekening] = useState('');
  const [namaBank, setNamaBank] = useState('');
  const [atasNamaRekening, setAtasNamaRekening] = useState('');

  // New fields for Pihak Kesatu Signature (First Party)
  const [namaPihakKesatu, setNamaPihakKesatu] = useState('Ahmad Fauzi, S.Pd., M.M.');
  const [jabatanPihakKesatu, setJabatanPihakKesatu] = useState('Kabag Keuangan & Sarana Prasarana SCB');

  // Temp state for adding a new milestone
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hydrate form if editing
  useEffect(() => {
    if (spkToEdit) {
      setNomorSpk(spkToEdit.nomorSpk);
      setNamaPaket(spkToEdit.namaPaket);
      setNilaiPengadaan(spkToEdit.nilaiPengadaan);
      setNamaVendor(spkToEdit.namaVendor);
      setTanggalMulai(spkToEdit.tanggalMulai);
      setTanggalSelesai(spkToEdit.tanggalSelesai);
      setDetailSpesifikasi(spkToEdit.detailSpesifikasi);
      setStatus(spkToEdit.status);
      setMilestones(spkToEdit.milestones || []);
      setNomorRekening(spkToEdit.nomorRekening || '');
      setNamaBank(spkToEdit.namaBank || '');
      setAtasNamaRekening(spkToEdit.atasNamaRekening || '');
      setNamaPihakKesatu(spkToEdit.namaPihakKesatu || 'Ahmad Fauzi, S.Pd., M.M.');
      setJabatanPihakKesatu(spkToEdit.jabatanPihakKesatu || 'Kabag Keuangan & Sarana Prasarana SCB');
    } else {
      // Set some nice default template format for Nomor SPK
      const year = new Date().getFullYear();
      setNomorSpk(`/${year}`);
      
      // Default dates
      const today = new Date().toISOString().split('T')[0];
      setTanggalMulai(today);
      
      setNomorRekening('');
      setNamaBank('');
      setAtasNamaRekening('');
      setNamaPihakKesatu('Ahmad Fauzi, S.Pd., M.M.');
      setJabatanPihakKesatu('Kabag Keuangan & Sarana Prasarana SCB');

      // Default milestones template
      setMilestones([
        { id: 'm-def-1', title: 'Penandatanganan Kontrak & Kickoff', date: today, completed: true }
      ]);
    }
  }, [spkToEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!nomorSpk || nomorSpk.trim() === '' || nomorSpk === `/${new Date().getFullYear()}`) {
      setError('Nomor SPK wajib diisi dengan format yang benar.');
      return;
    }
    if (!namaPaket || namaPaket.trim() === '') {
      setError('Nama Paket Pekerjaan wajib diisi.');
      return;
    }
    if (nilaiPengadaan <= 0) {
      setError('Nilai Pengadaan harus lebih besar dari Rp 0.');
      return;
    }
    if (!namaVendor || namaVendor.trim() === '') {
      setError('Nama Penyedia / Vendor wajib diisi.');
      return;
    }
    if (!tanggalMulai || !tanggalSelesai) {
      setError('Tanggal Mulai dan Tanggal Selesai wajib ditentukan.');
      return;
    }
    if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
      setError('Tanggal Mulai tidak boleh lebih lambat dari Tanggal Selesai.');
      return;
    }

    setLoading(true);
    try {
      const payload: Omit<SPK, 'id' | 'createdAt'> = {
        nomorSpk,
        namaPaket,
        nilaiPengadaan,
        namaVendor,
        tanggalMulai,
        tanggalSelesai,
        detailSpesifikasi,
        status,
        createdBy: currentUser.displayName || 'Staf GA',
        milestones,
        nomorRekening,
        namaBank,
        atasNamaRekening,
        namaPihakKesatu,
        jabatanPihakKesatu
      };
      
      await onSave(payload);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data SPK.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    if (!newMilestoneDate) {
      alert('Tentukan tanggal milestone terlebih dahulu.');
      return;
    }

    const newM: Milestone = {
      id: 'm-user-' + Date.now(),
      title: newMilestoneTitle,
      date: newMilestoneDate,
      completed: false
    };

    // Sort milestones by date
    const updated = [...milestones, newM].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setMilestones(updated);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones(milestones.map(m => {
      if (m.id === id) {
        return { ...m, completed: !m.completed };
      }
      return m;
    }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      
      {/* Top Breadcrumb Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition border border-slate-200 bg-white cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {spkToEdit ? 'Ubah Dokumen SPK' : 'Buat SPK Baru'}
          </h1>
          <p className="text-xs text-slate-500">
            {spkToEdit ? 'Edit informasi draf / dokumen SPK yang sudah tersimpan.' : 'Masukkan rincian informasi untuk membuat dokumen Surat Perintah Kerja baru.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
          <Info className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div>
            <span className="font-semibold block">Validasi Formulir Gagal:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Form Split Columns */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: General Info Details */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Informasi Umum Dokumen
          </h3>

          {/* Nomor SPK */}
          <div>
            <label htmlFor="nomorSpk" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Nomor Surat Perintah Kerja (SPK)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="nomorSpk"
                type="text"
                required
                value={nomorSpk}
                onChange={(e) => setNomorSpk(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono text-slate-800"
                placeholder="Contoh: 024/SPK-PBJ/DISKOMINFO/2026"
              />
            </div>
          </div>

          {/* Nama Paket Pekerjaan */}
          <div>
            <label htmlFor="namaPaket" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Nama Paket Pekerjaan
            </label>
            <div className="mt-1">
              <input
                id="namaPaket"
                type="text"
                required
                value={namaPaket}
                onChange={(e) => setNamaPaket(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800"
                placeholder="Contoh: Pengadaan Meja & Kursi Kerja Kantor Camat Baru"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nilai Pengadaan */}
            <div>
              <label htmlFor="nilaiPengadaan" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Nilai Pengadaan / Pagu (IDR)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold">
                  Rp
                </div>
                <input
                  id="nilaiPengadaan"
                  type="number"
                  required
                  min="0"
                  value={nilaiPengadaan || ''}
                  onChange={(e) => setNilaiPengadaan(Number(e.target.value))}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-slate-900"
                  placeholder="Contoh: 150000000"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic pl-1">
                Terformat: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(nilaiPengadaan || 0)}
              </p>
            </div>

            {/* Nama Penyedia / Vendor */}
            <div>
              <label htmlFor="namaVendor" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Nama Penyedia / Vendor
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  id="namaVendor"
                  type="text"
                  required
                  value={namaVendor}
                  onChange={(e) => setNamaVendor(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800"
                  placeholder="Contoh: CV. Prima Mandiri Sejahtera"
                />
              </div>
            </div>
          </div>

          {/* Informasi Rekening Bank Vendor */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              Informasi Rekening Bank Vendor (Untuk Syarat Pembayaran)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nama Bank */}
              <div>
                <label htmlFor="namaBank" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Nama Bank
                </label>
                <input
                  id="namaBank"
                  type="text"
                  value={namaBank}
                  onChange={(e) => setNamaBank(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 bg-white"
                  placeholder="Contoh: BSI, Mandiri, BCA"
                />
              </div>

              {/* Nomor Rekening */}
              <div>
                <label htmlFor="nomorRekening" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Nomor Rekening
                </label>
                <input
                  id="nomorRekening"
                  type="text"
                  value={nomorRekening}
                  onChange={(e) => setNomorRekening(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 bg-white"
                  placeholder="Contoh: 7123456789"
                />
              </div>

              {/* Atas Nama Rekening */}
              <div>
                <label htmlFor="atasNamaRekening" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Atas Nama Rekening
                </label>
                <input
                  id="atasNamaRekening"
                  type="text"
                  value={atasNamaRekening}
                  onChange={(e) => setAtasNamaRekening(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 bg-white"
                  placeholder="Contoh: CV. Prima Mandiri Sejahtera"
                />
              </div>
            </div>
          </div>

          {/* Penandatangan Pihak Kesatu (PPK / Pejabat) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-slate-500" />
              Penandatangan Pihak Kesatu (Pejabat Pembuat Komitmen / PPK)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap & Gelar */}
              <div>
                <label htmlFor="namaPihakKesatu" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Nama Lengkap & Gelar
                </label>
                <input
                  id="namaPihakKesatu"
                  type="text"
                  value={namaPihakKesatu}
                  onChange={(e) => setNamaPihakKesatu(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 bg-white"
                  placeholder="Contoh: Ahmad Fauzi, S.Pd., M.M."
                />
              </div>

              {/* Jabatan Resmi */}
              <div>
                <label htmlFor="jabatanPihakKesatu" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Jabatan / Keterangan
                </label>
                <input
                  id="jabatanPihakKesatu"
                  type="text"
                  value={jabatanPihakKesatu}
                  onChange={(e) => setJabatanPihakKesatu(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 bg-white"
                  placeholder="Contoh: Kabag Keuangan & Sarana Prasarana SCB"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tanggal Mulai */}
            <div>
              <label htmlFor="tanggalMulai" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Tanggal Mulai Pekerjaan
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  id="tanggalMulai"
                  type="date"
                  required
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800"
                />
              </div>
            </div>

            {/* Tanggal Selesai */}
            <div>
              <label htmlFor="tanggalSelesai" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Tanggal Selesai Kontrak
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  id="tanggalSelesai"
                  type="date"
                  required
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Detail Spesifikasi */}
          <div>
            <label htmlFor="detailSpesifikasi" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Detail Spesifikasi & Deskripsi Pekerjaan
            </label>
            <div className="mt-1">
              <textarea
                id="detailSpesifikasi"
                rows={6}
                value={detailSpesifikasi}
                onChange={(e) => setDetailSpesifikasi(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800"
                placeholder="Rincian spesifikasi barang/jasa, kuantitas, jaminan, dan ketentuan penyerahan lainnya..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Form column: Status & Milestones */}
        <div className="space-y-6">
          
          {/* Status Panel Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
              Status Pekerjaan
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-amber-150 hover:bg-amber-50/20 cursor-pointer transition">
                <input
                  type="radio"
                  name="status"
                  value="Pending"
                  checked={status === 'Pending'}
                  onChange={() => setStatus('Pending')}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-amber-800 block">Pending / Draft</span>
                  <span className="text-[10px] text-slate-500 block">Dokumen disiapkan, pengerjaan belum dimulai</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-indigo-150 hover:bg-indigo-50/20 cursor-pointer transition">
                <input
                  type="radio"
                  name="status"
                  value="In Progress"
                  checked={status === 'In Progress'}
                  onChange={() => setStatus('In Progress')}
                  className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-indigo-800 block">In Progress</span>
                  <span className="text-[10px] text-slate-500 block">Sedang dikerjakan oleh Penyedia / Vendor</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-emerald-150 hover:bg-emerald-50/20 cursor-pointer transition">
                <input
                  type="radio"
                  name="status"
                  value="Completed"
                  checked={status === 'Completed'}
                  onChange={() => setStatus('Completed')}
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-emerald-800 block">Completed</span>
                  <span className="text-[10px] text-slate-500 block">Serah terima selesai 100% dan terverifikasi</span>
                </div>
              </label>
            </div>
          </div>

          {/* Interactive Milestones Builder Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <ListChecks className="h-4 w-4 text-indigo-600" />
              Target & Milestones
            </h3>
            
            {/* Milestone List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {milestones.length > 0 ? (
                milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 group">
                    <div className="flex items-center gap-2 max-w-[80%]">
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => handleToggleMilestone(m.id)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <div className="truncate">
                        <span className={`text-xs block truncate ${m.completed ? 'line-through text-slate-400' : 'text-slate-700 font-semibold'}`}>
                          {m.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium block">
                          Target: {m.date}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(m.id)}
                      className="p-1 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">
                  Belum ada milestones ditentukan. Buat di bawah ini.
                </div>
              )}
            </div>

            {/* Quick Add Milestone inputs */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div>
                <input
                  type="text"
                  placeholder="Nama Tahapan/Milestone..."
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-2 rounded-lg transition flex items-center justify-center cursor-pointer"
                  title="Tambah Milestone"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions footer block */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 text-center py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Menyimpan...' : 'Simpan SPK'}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
