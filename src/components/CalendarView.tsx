import { useState } from 'react';
import { SPK, Milestone } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Play, 
  User, 
  Building2,
  CalendarDays,
  Pin
} from 'lucide-react';

interface CalendarViewProps {
  spks: SPK[];
  onNavigateToPreview: (spk: SPK) => void;
}

export default function CalendarView({ spks, onNavigateToPreview }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 29)); // Default to June 2026 based on mock data timeline
  const [selectedDay, setSelectedDay] = useState<number | null>(29); // Pre-select today
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const IndonesianMonths = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleGoToToday = () => {
    const today = new Date(); // Or hardcoded mock timeline
    setCurrentDate(new Date(2026, 5, 29));
    setSelectedDay(29);
  };

  // Helper: get first day of month index (0-6)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Helper: get total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Helper: get total days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Calendar days array
  const calendarDays: { day: number; isCurrentMonth: boolean; dateString: string }[] = [];

  // Padded previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevMonthStr = month === 0 ? 11 : month - 1;
    const prevYearStr = month === 0 ? year - 1 : year;
    const mStr = String(prevMonthStr + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateString: `${prevYearStr}-${mStr}-${dStr}`
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      dateString: `${year}-${mStr}-${dStr}`
    });
  }

  // Padded next month days to complete grid (multiples of 7)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthStr = month === 11 ? 0 : month + 1;
    const nextYearStr = month === 11 ? year + 1 : year;
    const mStr = String(nextMonthStr + 1).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      dateString: `${nextYearStr}-${mStr}-${dStr}`
    });
  }

  // Filter SPK based on status select
  const filteredSpks = spks.filter(s => statusFilter === 'All' ? true : s.status === statusFilter);

  // Helper to fetch events for a specific date
  const getEventsForDate = (dateStr: string) => {
    const events: { type: 'start' | 'end' | 'milestone'; title: string; spk: SPK; milestoneId?: string }[] = [];

    filteredSpks.forEach(spk => {
      // Contract Start
      if (spk.tanggalMulai === dateStr) {
        events.push({
          type: 'start',
          title: `Mulai: ${spk.namaPaket}`,
          spk
        });
      }
      
      // Contract Deadline / End
      if (spk.tanggalSelesai === dateStr) {
        events.push({
          type: 'end',
          title: `Deadline: ${spk.namaPaket}`,
          spk
        });
      }

      // Milestones
      if (spk.milestones) {
        spk.milestones.forEach(m => {
          if (m.date === dateStr) {
            events.push({
              type: 'milestone',
              title: `📍 ${m.title}`,
              spk,
              milestoneId: m.id
            });
          }
        });
      }
    });

    return events;
  };

  // Pre-calculate selected day details
  const selectedDayString = selectedDay 
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : '';

  const selectedDayEvents = selectedDayString ? getEventsForDate(selectedDayString) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans space-y-6">
      
      {/* Calendar Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Kalender Kontrak & Timeline SPK
          </h1>
          <p className="text-xs text-slate-500">
            Visualisasikan tenggat waktu kontrak, tanggal mulai kerja, dan target milestones pencapaian vendor.
          </p>
        </div>

        {/* Filter on Calendar Statuses */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              statusFilter === 'All' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('In Progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              statusFilter === 'In Progress' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Berjalan
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              statusFilter === 'Pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              statusFilter === 'Completed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar left & Selected Day details right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Calendar Left Panel */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          
          {/* Month Navigator Toolbar */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-mono tracking-wide">
              {IndonesianMonths[month]} {year}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 bg-white transition cursor-pointer"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={handleGoToToday}
                className="text-xs font-semibold px-2.5 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700 border border-slate-200 bg-white transition cursor-pointer"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 bg-white transition cursor-pointer"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Monthly grid */}
          <div className="grid grid-cols-7 gap-1 border border-slate-150 rounded-2xl overflow-hidden bg-slate-100">
            {/* Days of week headers */}
            {daysOfWeek.map((day, idx) => (
              <div 
                key={idx} 
                className={`py-2 text-center text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-150 ${
                  day === 'Min' ? 'bg-red-50 text-red-600' : 'bg-slate-50'
                }`}
              >
                {day}
              </div>
            ))}

            {/* Days list */}
            {calendarDays.map((cell, idx) => {
              const dateEvents = getEventsForDate(cell.dateString);
              const isSelected = cell.isCurrentMonth && selectedDay === cell.day;
              const hasEvents = dateEvents.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => cell.isCurrentMonth && setSelectedDay(cell.day)}
                  className={`min-h-[90px] p-1.5 flex flex-col justify-between cursor-pointer transition group border-r border-b border-slate-150 bg-white ${
                    !cell.isCurrentMonth ? 'bg-slate-50/50 text-slate-300 pointer-events-none' : ''
                  } ${
                    isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50/10 z-10' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Day number with markers */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold font-mono h-6 w-6 flex items-center justify-center rounded-full ${
                      isSelected 
                        ? 'bg-indigo-600 text-white' 
                        : cell.isCurrentMonth && daysOfWeek[new Date(year, month, cell.day).getDay()] === 'Min'
                          ? 'text-red-500'
                          : 'text-slate-800'
                    }`}>
                      {cell.day}
                    </span>

                    {hasEvents && (
                      <span className="inline-flex gap-0.5">
                        {dateEvents.some(e => e.type === 'start') && (
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full block"></span>
                        )}
                        {dateEvents.some(e => e.type === 'end') && (
                          <span className="h-1.5 w-1.5 bg-red-500 rounded-full block"></span>
                        )}
                        {dateEvents.some(e => e.type === 'milestone') && (
                          <span className="h-1.5 w-1.5 bg-purple-500 rounded-full block"></span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Little events items list */}
                  <div className="mt-1 space-y-1 flex-1 overflow-hidden flex flex-col justify-end">
                    {dateEvents.slice(0, 2).map((ev, evIdx) => (
                      <div 
                        key={evIdx}
                        className={`text-[8px] px-1 py-0.5 rounded leading-tight font-bold truncate ${
                          ev.type === 'start' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : ev.type === 'end'
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}
                        title={ev.title}
                      >
                        {ev.type === 'start' ? 'Mulai' : ev.type === 'end' ? 'Deadline' : 'Milestone'}
                      </div>
                    ))}
                    {dateEvents.length > 2 && (
                      <div className="text-[7px] text-slate-400 font-bold text-right pr-0.5">
                        +{dateEvents.length - 2} Event
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Color Codes Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-slate-500 border-t border-slate-100">
            <span className="font-bold text-slate-700">Legenda:</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Tanggal Mulai SPK
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Tenggat Waktu / Deadline SPK
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              Milestone / Sasaran Kerja
            </span>
          </div>

        </div>

        {/* Selected Day Events Details Right Panel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Agenda Tanggal</h3>
                <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">
                  {selectedDay ? `${selectedDay} ${IndonesianMonths[month]} ${year}` : 'Pilih Hari'}
                </p>
              </div>
            </div>

            {selectedDayEvents.length > 0 ? (
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {selectedDayEvents.map((ev, index) => (
                  <div 
                    key={index} 
                    className={`p-3.5 rounded-xl border space-y-2 hover:shadow-sm transition ${
                      ev.type === 'start' 
                        ? 'bg-emerald-50/20 border-emerald-100' 
                        : ev.type === 'end'
                          ? 'bg-red-50/20 border-red-100'
                          : 'bg-purple-50/20 border-purple-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ev.type === 'start'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.type === 'end'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}>
                        {ev.type === 'start' ? 'Kontrak Mulai' : ev.type === 'end' ? 'Deadline' : 'Milestone'}
                      </span>
                      
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        ev.spk.status === 'Completed'
                          ? 'bg-emerald-500'
                          : ev.spk.status === 'In Progress'
                            ? 'bg-indigo-500 animate-pulse'
                            : 'bg-amber-500'
                      }`} title={`Status SPK: ${ev.spk.status}`}></span>
                    </div>

                    <p 
                      className="font-bold text-slate-800 text-xs hover:text-blue-600 cursor-pointer line-clamp-2" 
                      title={ev.title}
                      onClick={() => onNavigateToPreview(ev.spk)}
                    >
                      {ev.title}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1 font-medium">
                        <Building2 className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{ev.spk.namaVendor}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{ev.spk.nomorSpk}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <p className="text-xs">Tidak ada agenda atau tenggat waktu khusus pada hari ini.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
            💡 Tips: Klik pada nama paket pekerjaan di panel detail ini untuk langsung melihat dokumen Surat Perintah Kerja (SPK).
          </div>

        </div>

      </div>
    </div>
  );
}
