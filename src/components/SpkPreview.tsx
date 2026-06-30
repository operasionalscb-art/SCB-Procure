import { SPK } from '../types';
import { ArrowLeft, Printer, Download, Calendar, ShieldCheck, CheckSquare, Square, Building } from 'lucide-react';

interface SpkPreviewProps {
  spk: SPK;
  onBack: () => void;
}

export default function SpkPreview({ spk, onBack }: SpkPreviewProps) {
  
  // Format Currency to Indonesian Rupiah (IDR)
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Convert numbers to Indonesian text words (Terbilang) for formal contract
  const terbilang = (nilai: number): string => {
    const bilangan = [
      '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
      'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
    ];
    
    const konversi = (n: number): string => {
      if (n < 12) return bilangan[n];
      if (n < 20) return bilangan[n - 10] + ' Belas';
      if (n < 100) return bilangan[Math.floor(n / 10)] + ' Puluh ' + bilangan[n % 10];
      if (n < 200) return 'Seratus ' + konversi(n - 100);
      if (n < 1000) return bilangan[Math.floor(n / 100)] + ' Ratus ' + konversi(n % 100);
      if (n < 2000) return 'Seribu ' + konversi(n - 1000);
      if (n < 1000000) return konversi(Math.floor(n / 1000)) + ' Ribu ' + konversi(n % 1000);
      if (n < 1000000000) return konversi(Math.floor(n / 1000000)) + ' Juta ' + konversi(n % 1000000);
      return konversi(Math.floor(n / 1000000000)) + ' Milyar ' + konversi(n % 1000000000);
    };

    const hasil = konversi(nilai).trim().replace(/\s+/g, ' ');
    return hasil ? hasil + ' Rupiah' : 'Nol Rupiah';
  };

  // Formats date to Indonesian style (e.g. "29 Juni 2026")
  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Action Buttons Bar - Hidden during printing */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm hover:shadow"
          >
            <Printer className="h-4 w-4" />
            Cetak / Ekspor PDF
          </button>
        </div>
      </div>

      {/* Official SPK Document Layout */}
      {/* Optimized for A4 size, padded and bordered like a real physical paper */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 text-slate-900 leading-relaxed text-sm">
        
        {/* KOP SURAT (Official Corporate/School Header) */}
        <div className="text-center space-y-1 mb-6 border-b-4 border-double border-slate-950 pb-4">
          <h1 className="text-xl font-extrabold tracking-wide uppercase text-slate-950">
            SEKOLAH CENDEKIA BAZNAS
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Jalan Cirangkong No. 14, Desa Cemplang, Kecamatan Cibungbulang, Kabupaten Bogor
          </p>
          <p className="text-[10px] text-slate-500">
            Website: cendekiabaznas.sch.id | Email: info@cendekiabaznas.sch.id
          </p>
        </div>

        {/* DOCUMENT TITLE */}
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-base font-extrabold tracking-widest text-slate-950 underline uppercase">
            SURAT PERINTAH KERJA (SPK)
          </h2>
          <div className="text-xs font-mono font-bold text-slate-800">
            NOMOR: {spk.nomorSpk}
          </div>
        </div>

        {/* PREAMBLE */}
        <div className="space-y-4 mb-6 text-xs sm:text-sm text-justify">
          <p>
            Yang bertanda tangan di bawah ini selaku <strong>Pejabat Pembuat Komitmen (PPK)</strong> Sekolah Cendekia BAZNAS, selanjutnya disebut sebagai <strong>Pihak Kesatu</strong>, memberikan perintah kerja kepada:
          </p>

          <div className="pl-6 grid grid-cols-3 gap-2">
            <span className="font-bold">Nama Penyedia / Vendor</span>
            <span className="col-span-2">: <strong>{spk.namaVendor || '-'}</strong></span>
            
            <span className="font-bold">Alamat Penyedia</span>
            <span className="col-span-2">: Kompleks Perkantoran Harmoni Baru Blok C No. 12, Jakarta Barat</span>

            <span className="font-bold">Penanggung Jawab</span>
            <span className="col-span-2">: Direktur Utama / Pimpinan Cabang</span>
          </div>

          <p>
            Selanjutnya disebut sebagai <strong>Pihak Kedua (Penyedia Jasa)</strong>. Kedua belah pihak setuju untuk melaksanakan paket pekerjaan berdasarkan syarat dan ketentuan yang tercantum dalam SPK ini:
          </p>
        </div>

        {/* TECHNICAL METADATA TABLE */}
        <div className="border border-slate-950 rounded-lg overflow-hidden mb-6 text-xs sm:text-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-950 text-slate-950 font-bold">
                <th className="p-3 border-r border-slate-950 w-1/3">Rincian Kontrak</th>
                <th className="p-3">Keterangan Pekerjaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-950">
              <tr>
                <td className="p-3 font-semibold border-r border-slate-950 bg-slate-50/50">Nama Paket Pekerjaan</td>
                <td className="p-3 font-bold text-slate-950">{spk.namaPaket}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold border-r border-slate-950 bg-slate-50/50">Nilai Kontrak Pengadaan</td>
                <td className="p-3 font-extrabold text-slate-950">
                  {formatIDR(spk.nilaiPengadaan)} 
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5 uppercase tracking-wide">
                    (Terbilang: {terbilang(spk.nilaiPengadaan)})
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold border-r border-slate-950 bg-slate-50/50">Jangka Waktu Pelaksanaan</td>
                <td className="p-3 font-semibold text-slate-800">
                  {formatTanggalIndo(spk.tanggalMulai)} s/d {formatTanggalIndo(spk.tanggalSelesai)}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold border-r border-slate-950 bg-slate-50/50">Sumber Dana</td>
                <td className="p-3 text-slate-700">Anggaran Operasional Sekolah Cendekia BAZNAS Tahun 2026</td>
              </tr>
              {spk.nomorRekening && (
                <tr>
                  <td className="p-3 font-semibold border-r border-slate-950 bg-slate-50/50">Rekening Pembayaran Vendor</td>
                  <td className="p-3 text-slate-800 font-bold">
                    {spk.namaBank || 'BSI'} - No. Rekening: {spk.nomorRekening} <span className="font-normal text-slate-600 block text-xs">Atas Nama: {spk.atasNamaRekening || spk.namaVendor}</span>
                  </td>
                </tr>
              )}
              <tr>
                <td className="p-3 font-semibold border-r border-slate-950 bg-slate-50/50">Status Progress Saat Ini</td>
                <td className="p-3 font-bold text-slate-900">{spk.status}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SPECIFICATION SECTION */}
        <div className="space-y-2 mb-6">
          <h3 className="font-extrabold text-slate-950 border-b border-slate-950 pb-1 text-xs sm:text-sm uppercase tracking-wide">
            I. Ruang Lingkup & Spesifikasi Teknis Pekerjaan
          </h3>
          <div className="pl-2 whitespace-pre-line text-xs sm:text-sm text-slate-800">
            {spk.detailSpesifikasi || 'Spesifikasi detail belum ditentukan untuk paket ini.'}
          </div>
        </div>

        {/* MILESTONES PROGRESS FOR ATTACHMENT */}
        {spk.milestones && spk.milestones.length > 0 && (
          <div className="space-y-2 mb-8 page-break-inside-avoid">
            <h3 className="font-extrabold text-slate-950 border-b border-slate-950 pb-1 text-xs sm:text-sm uppercase tracking-wide">
              II. Rencana Milestones & Tahapan Penyerahan
            </h3>
            <div className="grid grid-cols-1 gap-2 pl-2">
              {spk.milestones.map((m, idx) => (
                <div key={m.id} className="flex items-start gap-2.5 text-xs">
                  <div className="mt-0.5 text-slate-700">
                    {m.completed ? (
                      <span className="font-bold text-emerald-600">[✓]</span>
                    ) : (
                      <span className="font-bold text-slate-400">[ ]</span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Tahap {idx + 1}: {m.title}</span>
                    <span className="text-slate-500 block text-[10px]">Tenggat Waktu: {formatTanggalIndo(m.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TERMS & CONDITIONS CLOSING */}
        <div className="text-xs text-justify space-y-2 mb-10 page-break-inside-avoid">
          <p>
            Pihak Kedua berkewajiban untuk menyelesaikan pekerjaan tersebut di atas sesuai dengan rincian spesifikasi teknis dan jangka waktu kontrak yang telah disepakati bersama. Segala bentuk keterlambatan akan dikenakan denda administratif sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.
          </p>
          <p>
            Demikian Surat Perintah Kerja ini dibuat dalam rangkap 2 (dua) yang masing-masing bermaterai cukup dan mempunyai kekuatan hukum yang sama untuk dilaksanakan dengan penuh rasa tanggung jawab.
          </p>
        </div>

        {/* SIGNATURE BLOCKS */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs sm:text-sm pt-4 page-break-inside-avoid">
          {/* First Party (PPK) Sign */}
          <div className="space-y-16">
            <div className="space-y-1">
              <p className="font-bold">PIHAK KESATU</p>
              <p className="text-xs text-slate-600">Pejabat Pembuat Komitmen (PPK)</p>
            </div>
            <div className="space-y-1">
              <p className="font-extrabold underline text-slate-950">{spk.namaPihakKesatu || 'Ahmad Fauzi, S.Pd., M.M.'}</p>
              <p className="text-[11px] text-slate-500">{spk.jabatanPihakKesatu || 'Kabag Keuangan & Sarana Prasarana SCB'}</p>
            </div>
          </div>

          {/* Second Party (Vendor) Sign */}
          <div className="space-y-16">
            <div className="space-y-1">
              <p className="font-bold">PIHAK KEDUA</p>
              <p className="text-xs text-slate-600">Penyedia Jasa (Vendor)</p>
            </div>
            <div className="space-y-1">
              <p className="font-extrabold underline text-slate-950">{spk.namaVendor || '...........................................'}</p>
              <p className="text-[11px] text-slate-500">Direktur / Pimpinan Perusahaan</p>
            </div>
          </div>
        </div>

      </div>

      {/* Helpful Hint on Exporting to PDF - Hidden on printing */}
      <div className="mt-4 p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2 print:hidden">
        <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold text-slate-800 block">Petunjuk Cetak / Ekspor PDF:</span>
          <span>Saat kotak dialog cetak browser muncul, aktifkan opsi <strong>"Simpan sebagai PDF"</strong> atau <strong>"Save as PDF"</strong>. Aktifkan juga opsi <strong>"Cetak Latar Belakang" (Background Graphics)</strong> agar aksen kop surat dan tabel terformat dengan sempurna pada kertas A4.</span>
        </div>
      </div>

    </div>
  );
}
