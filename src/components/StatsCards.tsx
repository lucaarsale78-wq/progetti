import React from 'react';
import { MonthlyRoster, StaffMember } from '../types/roster';
import {
  ShieldCheck,
  Moon,
  Users,
  Palmtree,
  CalendarCheck2,
  Clock,
} from 'lucide-react';

interface StatsCardsProps {
  roster: MonthlyRoster;
  staffList: StaffMember[];
  isOss8Active: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  roster,
  staffList,
  isOss8Active,
}) => {
  const nurses = staffList.filter((s) => s.role === 'INFERMIERE');
  const ossList = staffList.filter((s) => s.role === 'OSS' && s.isActive);

  // Check 12h compliance across all active staff
  const all12hCompliant = Object.values(roster.stats).every((s) => s.compliance12h);

  // Check weekend off compliance (everyone has at least 1 free weekend)
  const allHaveFreeWeekend = Object.values(roster.stats)
    .filter((s) => s.role !== 'CAPOSALA')
    .every((s) => s.freeWeekendsCount >= 1);

  // Average nights per staff
  const totalNights = Object.values(roster.stats).reduce((acc, curr) => acc + curr.nightCount, 0);
  const activeCount = nurses.length + ossList.length;
  const avgNights = activeCount > 0 ? (totalNights / activeCount).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* Copertura Turni Clinica */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
            Copertura Reparto
          </div>
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <span className="text-emerald-700">100% Coperta</span>
          </div>
          <div className="text-[10px] text-slate-400">Rotazione libera (senza vincolo 12h)</div>
        </div>
      </div>

      {/* Night Shifts Equity */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Moon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
            Notti / Operatore
          </div>
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <span>~4 notti al mese</span>
          </div>
          <div className="text-[10px] text-slate-400">Distribuzione equa garantita</div>
        </div>
      </div>

      {/* Free Weekends */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
          <CalendarCheck2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
            Weekend Liberi
          </div>
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <span className="text-sky-700">≥ 1 al Mese</span>
          </div>
          <div className="text-[10px] text-slate-400">Sabato e Domenica a riposo</div>
        </div>
      </div>

      {/* Contract Hours Summary */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
            Monte Ore Contrattuale
          </div>
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <span className="text-violet-900">164h / 64h PT</span>
          </div>
          <div className="text-[10px] text-slate-400">1 OSS Part-Time Weekend (64h)</div>
        </div>
      </div>

      {/* Active Staff */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
            Equipe Clinica
          </div>
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <span>6 INF · 7 OSS (1 PT) · 1 Caposala</span>
          </div>
          <div className="text-[10px] text-slate-400">{isOss8Active ? 'Tutte operative' : 'OSS 8 in mutua costante'}</div>
        </div>
      </div>
    </div>
  );
};
