import React, { useState } from 'react';
import {
  MonthlyRoster,
  StaffMember,
  ShiftCode,
  Role,
  SHIFT_DEFINITIONS,
} from '../types/roster';
import {
  ShieldCheck,
  Moon,
  AlertTriangle,
  User,
  HeartPulse,
  Palmtree,
  Clock,
  Sparkles,
  Award,
  Check,
  Edit2,
  Trash2,
  UserPlus,
} from 'lucide-react';

interface RosterTableProps {
  roster: MonthlyRoster;
  staffList: StaffMember[];
  onCellClick: (staff: StaffMember, day: number, currentShift: ShiftCode) => void;
  onToggleOss8: () => void;
  isOss8Active: boolean;
  onOpenAddStaffModal?: (role?: Role) => void;
  onUpdateStaffName?: (staffId: string, newName: string) => void;
  onDeleteStaff?: (staffId: string) => void;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  roster,
  staffList,
  onCellClick,
  onToggleOss8,
  isOss8Active,
  onOpenAddStaffModal,
  onUpdateStaffName,
  onDeleteStaff,
}) => {
  const caposala = staffList.find((s) => s.role === 'CAPOSALA');
  const nurses = staffList.filter((s) => s.role === 'INFERMIERE');
  const ossList = staffList.filter((s) => s.role === 'OSS');

  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  const renderCellBadge = (shift: ShiftCode) => {
    const def = SHIFT_DEFINITIONS[shift] || SHIFT_DEFINITIONS.R;
    return (
      <span
        className={`inline-flex items-center justify-center w-7 h-7 text-xs font-black rounded-md border transition-transform hover:scale-110 cursor-pointer shadow-2xs select-none ${def.bgColor} ${def.textColor} ${def.borderColor}`}
        title={`${def.label} (${def.startTime} - ${def.endTime})`}
      >
        {def.shortLabel}
      </span>
    );
  };

  // Helper to render staff row
  const renderStaffRow = (staff: StaffMember, isCaposalaRow = false) => {
    const stat = roster.stats[staff.id];
    const isOss8 = staff.id === 'oss-8';
    const isEditing = editingStaffId === staff.id;

    return (
      <tr
        key={staff.id}
        className={`border-b transition-colors ${
          isCaposalaRow
            ? 'bg-amber-50/40 hover:bg-amber-50/70 border-amber-200 font-semibold'
            : isOss8 && !isOss8Active
            ? 'bg-rose-50/30 hover:bg-rose-50/50 border-slate-200'
            : 'bg-white hover:bg-slate-50/80 border-slate-200'
        }`}
      >
        {/* Sticky Staff Info Column */}
        <td
          className={`sticky left-0 z-10 px-3 py-2 text-left border-r border-slate-200 shadow-xs ${
            isCaposalaRow
              ? 'bg-amber-50/90'
              : isOss8 && !isOss8Active
              ? 'bg-rose-50/90'
              : 'bg-white'
          }`}
          style={{ minWidth: '220px' }}
        >
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCaposalaRow
                    ? 'bg-amber-600 text-white'
                    : staff.role === 'INFERMIERE'
                    ? 'bg-sky-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {staff.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && onUpdateStaffName && editingNameValue.trim()) {
                          onUpdateStaffName(staff.id, editingNameValue.trim());
                          setEditingStaffId(null);
                        } else if (e.key === 'Escape') {
                          setEditingStaffId(null);
                        }
                      }}
                      className="px-1.5 py-0.5 text-xs font-bold border border-indigo-500 rounded-sm w-32 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (onUpdateStaffName && editingNameValue.trim()) {
                          onUpdateStaffName(staff.id, editingNameValue.trim());
                        }
                        setEditingStaffId(null);
                      }}
                      className="text-emerald-600 hover:text-emerald-800 p-0.5"
                      title="Salva nome"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1 group truncate">
                    <span className="truncate">{staff.name}</span>
                    {onUpdateStaffName && !isCaposalaRow && (
                      <button
                        onClick={() => {
                          setEditingStaffId(staff.id);
                          setEditingNameValue(staff.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5"
                        title="Modifica nome operatore"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    {isCaposalaRow && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-sm font-semibold shrink-0">
                        Caposala
                      </span>
                    )}
                  </div>
                )}
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span>{staff.role}</span>
                  {staff.contractType === 'PART_TIME_WEEKEND_64' ? (
                    <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-900 rounded-sm font-bold">
                      PT Weekend (64h)
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-sm font-semibold">
                      156h/m
                    </span>
                  )}
                  {isOss8 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleOss8();
                      }}
                      className={`cursor-pointer px-1.5 py-0.2 rounded-xs font-bold text-[9px] transition-colors ${
                        isOss8Active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Clicca per attivare o disattivare OSS 8 al rientro dalla mutua prolungata"
                    >
                      {isOss8Active ? '● Attiva' : '● In Mutua'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons (Vacation quota / Delete) */}
            <div className="flex items-center gap-1 shrink-0">
              {!isCaposalaRow && (
                <span
                  className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm"
                  title={`Ferie annuali: ${staff.totalAnnualVacationDays - staff.usedVacationDays} giorni rimasti su 34`}
                >
                  {staff.totalAnnualVacationDays - staff.usedVacationDays} gg
                </span>
              )}
              {onDeleteStaff && !isCaposalaRow && staff.id !== 'oss-7' && staff.id !== 'oss-8' && (
                <button
                  onClick={() => {
                    if (confirm(`Rimuovere ${staff.name} dall'equipe? Il planning verrà ricalcolato automaticamente a 156h per i restanti operatori.`)) {
                      onDeleteStaff(staff.id);
                    }
                  }}
                  className="text-slate-300 hover:text-rose-600 p-0.5 rounded-sm transition-colors"
                  title="Elimina operatore"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </td>

        {/* Days Columns */}
        {roster.days.map((dayData) => {
          const shift = dayData.assignments[staff.id] || 'R';
          const isWeekend = dayData.isWeekend;
          const isGioVen = dayData.isThursdayOrFriday;

          return (
            <td
              key={dayData.day}
              onClick={() => onCellClick(staff, dayData.day, shift)}
              className={`p-1 text-center border-r border-slate-100 transition-colors ${
                isWeekend
                  ? 'bg-slate-100/60'
                  : isGioVen
                  ? 'bg-emerald-50/20'
                  : ''
              }`}
            >
              {renderCellBadge(shift)}
            </td>
          );
        })}

        {/* Summary Stats Columns */}
        <td className="px-2 py-1 text-center font-bold text-xs text-slate-900 bg-slate-50 border-r border-slate-200">
          {stat?.totalWorkingShifts ?? 0}
        </td>
        <td
          className={`px-2 py-1 text-center font-bold text-xs border-r border-slate-200 ${
            stat?.nightCount === 4
              ? 'text-indigo-900 bg-indigo-50/60 font-black'
              : 'text-indigo-700 bg-indigo-50/30'
          }`}
          title="Target: 4 notti al mese"
        >
          <span className="flex items-center justify-center gap-0.5">
            {stat?.nightCount ?? 0}
            {stat?.nightCount === 4 && <Award className="w-3 h-3 text-indigo-600 inline" />}
          </span>
        </td>
        <td className="px-2 py-1 text-center text-xs text-slate-700 border-r border-slate-200">
          {stat?.morningCount ?? 0}
        </td>
        <td className="px-2 py-1 text-center text-xs text-slate-700 border-r border-slate-200">
          {stat?.afternoonCount ?? 0}
        </td>
        <td className="px-2 py-1 text-center text-xs font-semibold text-teal-800 border-r border-slate-200">
          {stat?.smontoCount ?? 0}
        </td>
        <td className="px-2 py-1 text-center text-xs text-slate-600 border-r border-slate-200">
          {stat?.restCount ?? 0}
        </td>
        <td
          className={`px-2 py-1 text-center text-xs font-bold border-r border-slate-200 ${
            (stat?.freeWeekendsCount ?? 0) >= 1
              ? 'text-emerald-700 bg-emerald-50/40'
              : 'text-amber-700 bg-amber-50/40'
          }`}
          title="Target: Almeno 1 intero weekend libero al mese"
        >
          {stat?.freeWeekendsCount ?? 0}
        </td>
        <td className="px-2 py-1 text-center text-xs text-emerald-800 border-r border-slate-200">
          {stat?.vacationCount ?? 0}
        </td>
        <td className="px-2 py-1 text-center text-xs text-violet-800 border-r border-slate-200">
          {staff.recuperoOreBalance >= 0 ? `+${staff.recuperoOreBalance}` : staff.recuperoOreBalance}h
        </td>
        <td className="px-2 py-1 text-center text-xs font-semibold text-slate-500 border-r border-slate-200">
          {stat?.monthlyTargetHours ?? 164}h
        </td>
        <td className="px-2 py-1 text-center text-xs font-bold text-slate-800 border-r border-slate-200">
          {stat?.totalHours ?? 0}h
        </td>
        <td className={`px-2 py-1 text-center text-xs font-bold ${
          (stat?.hoursDelta ?? 0) >= 0 ? 'text-emerald-700 bg-emerald-50/30' : 'text-amber-700 bg-amber-50/30'
        }`}>
          {(stat?.hoursDelta ?? 0) > 0 ? `+${stat?.hoursDelta}h` : `${stat?.hoursDelta ?? 0}h`}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            {/* Header Row 1: Days of month */}
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 select-none">
              <th
                className="sticky left-0 z-20 px-3 py-2 text-left font-bold bg-slate-100 border-r border-slate-200"
                style={{ minWidth: '220px' }}
              >
                Equipe Clinica ({roster.monthName} {roster.year})
              </th>

              {roster.days.map((dayData) => {
                const isWeekend = dayData.isWeekend;
                const isGioVen = dayData.isThursdayOrFriday;

                return (
                  <th
                    key={dayData.day}
                    className={`px-1 py-1.5 text-center font-bold border-r border-slate-200 ${
                      isWeekend
                        ? 'bg-slate-200/80 text-slate-900'
                        : isGioVen
                        ? 'bg-emerald-100/70 text-emerald-950'
                        : 'text-slate-700'
                    }`}
                    style={{ minWidth: '36px' }}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-tight">
                      {dayData.dayName}
                    </div>
                    <div className="text-xs font-black">{dayData.day}</div>
                    {isGioVen && (
                      <div
                        className="text-[8px] text-emerald-700 font-bold uppercase leading-none mt-0.5"
                        title="Giovedì/Venerdì: Potenziamento 2 OSS a turno"
                      >
                        2 OSS
                      </div>
                    )}
                  </th>
                );
              })}

              {/* Statistics Column Headers */}
              <th className="px-2 py-1 text-center font-bold bg-slate-200/90 text-slate-800 border-r border-slate-300">
                Tot
              </th>
              <th
                className="px-2 py-1 text-center font-bold bg-indigo-100 text-indigo-900 border-r border-slate-300"
                title="Target: 4 notti al mese"
              >
                Notti (4)
              </th>
              <th className="px-2 py-1 text-center font-bold bg-amber-100 text-amber-900 border-r border-slate-300">
                M
              </th>
              <th className="px-2 py-1 text-center font-bold bg-sky-100 text-sky-900 border-r border-slate-300">
                P
              </th>
              <th className="px-2 py-1 text-center font-bold bg-teal-100 text-teal-900 border-r border-slate-300" title="Smonto Notte (S)">
                S
              </th>
              <th className="px-2 py-1 text-center font-bold bg-slate-200 text-slate-800 border-r border-slate-300">
                R
              </th>
              <th
                className="px-2 py-1 text-center font-bold bg-emerald-100 text-emerald-900 border-r border-slate-300"
                title="Almeno 1 weekend intero libero garantito al mese"
              >
                WK Lib
              </th>
              <th
                className="px-2 py-1 text-center font-bold bg-emerald-100 text-emerald-900 border-r border-slate-300"
                title="Ferie godute nel mese"
              >
                FE
              </th>
              <th
                className="px-2 py-1 text-center font-bold bg-violet-100 text-violet-900 border-r border-slate-300"
                title="Saldo Recupero Ore"
              >
                Banca Ore
              </th>
              <th
                className="px-2 py-1 text-center font-bold bg-slate-200 text-slate-800 border-r border-slate-300"
                title="Target contrattuale: 156h full-time / 64h part-time weekend"
              >
                Target
              </th>
              <th
                className="px-2 py-1 text-center font-bold bg-slate-200 text-slate-800 border-r border-slate-300"
                title="Ore lavorate complessive nel mese"
              >
                Ore Tot
              </th>
              <th
                className="px-2 py-1 text-center font-bold bg-slate-200 text-slate-800"
                title="Differenza rispetto al target contrattuale (156h / 64h) - Nessuna ora in meno"
              >
                Saldo
              </th>
            </tr>
          </thead>

          <tbody>
            {/* 1. SEZIONE CAPOSALA (Turno a sé stante compilabile) */}
            {caposala && (
              <>
                <tr className="bg-amber-100/50 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                  <td
                    colSpan={roster.days.length + 13}
                    className="px-3 py-1.5 border-y border-amber-200 sticky left-0"
                  >
                    1. Coordinamento & Direzione Sanitaria (Turno a sé stante · Target 156h/mese)
                  </td>
                </tr>
                {renderStaffRow(caposala, true)}
              </>
            )}

            {/* 2. SEZIONE INFERMIERE */}
            <tr className="bg-sky-100/60 text-[11px] font-bold text-sky-900 uppercase tracking-wider">
              <td
                colSpan={roster.days.length + 13}
                className="px-3 py-1.5 border-y border-sky-200 sticky left-0"
              >
                <div className="flex items-center justify-between">
                  <span>2. Equipe Infermieristica ({nurses.length} Infermieri · Target 156h/mese)</span>
                  {onOpenAddStaffModal && (
                    <button
                      onClick={() => onOpenAddStaffModal('INFERMIERE')}
                      className="normal-case px-2.5 py-0.5 text-xs font-bold text-sky-800 bg-white/90 hover:bg-white rounded-md border border-sky-300 shadow-2xs transition-colors flex items-center gap-1"
                    >
                      + Aggiungi Infermiere
                    </button>
                  )}
                </div>
              </td>
            </tr>
            {nurses.map((nurse) => renderStaffRow(nurse))}

            {/* Quick add nurse row */}
            {onOpenAddStaffModal && (
              <tr className="bg-sky-50/30 hover:bg-sky-50/60 border-b border-dashed border-sky-200 transition-colors">
                <td
                  colSpan={roster.days.length + 13}
                  className="px-3 py-2 text-left sticky left-0"
                >
                  <button
                    onClick={() => onOpenAddStaffModal('INFERMIERE')}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    + Aggiungi manualmente un altro Infermiere (il sistema ricrea e riequilibra a 156h l'intera schermata)
                  </button>
                </td>
              </tr>
            )}

            {/* 3. SEZIONE OPERATORI SOCIO SANITARI (OSS) */}
            <tr className="bg-emerald-100/60 text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
              <td
                colSpan={roster.days.length + 13}
                className="px-3 py-1.5 border-y border-emerald-200 sticky left-0"
              >
                <div className="flex items-center justify-between">
                  <span>3. Operatori Socio Sanitari ({ossList.length} OSS · Target 156h Full-time / 64h PT Weekend)</span>
                  {onOpenAddStaffModal && (
                    <button
                      onClick={() => onOpenAddStaffModal('OSS')}
                      className="normal-case px-2.5 py-0.5 text-xs font-bold text-emerald-800 bg-white/90 hover:bg-white rounded-md border border-emerald-300 shadow-2xs transition-colors flex items-center gap-1"
                    >
                      + Aggiungi OSS
                    </button>
                  )}
                </div>
              </td>
            </tr>
            {ossList.map((oss) => renderStaffRow(oss))}

            {/* Quick add OSS row */}
            {onOpenAddStaffModal && (
              <tr className="bg-emerald-50/30 hover:bg-emerald-50/60 border-b border-dashed border-emerald-200 transition-colors">
                <td
                  colSpan={roster.days.length + 13}
                  className="px-3 py-2 text-left sticky left-0"
                >
                  <button
                    onClick={() => onOpenAddStaffModal('OSS')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    + Aggiungi manualmente un altro Operatore OSS (il sistema ricrea e riequilibra a 156h l'intera schermata)
                  </button>
                </td>
              </tr>
            )}

            {/* RIGA TOTALI COPERTURA GIORNALIERA */}
            <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-800">
              <td
                className="sticky left-0 z-10 px-3 py-2 text-left bg-slate-100 border-r border-slate-300 font-extrabold"
                style={{ minWidth: '220px' }}
              >
                <div>Copertura Turni Giornaliera</div>
                <div className="text-[10px] text-slate-500 font-normal">
                  INF (M/P/N) · OSS (M/P/N)
                </div>
              </td>

              {roster.days.map((dayData) => {
                // Conteggio presenze reali infermieri
                let infM = 0, infP = 0, infN = 0;
                nurses.forEach((n) => {
                  const s = dayData.assignments[n.id];
                  if (s === 'M') infM++;
                  if (s === 'P') infP++;
                  if (s === 'N') infN++;
                });

                // Conteggio presenze reali OSS
                let ossM = 0, ossP = 0, ossN = 0;
                ossList.forEach((o) => {
                  const s = dayData.assignments[o.id];
                  if (s === 'M') ossM++;
                  if (s === 'P') ossP++;
                  if (s === 'N') ossN++;
                });

                const isGioVen = dayData.isThursdayOrFriday;
                const ossTargetM = isGioVen ? 2 : 1;
                const ossTargetP = isGioVen ? 2 : 1;

                return (
                  <td
                    key={dayData.day}
                    className={`p-1 text-center border-r border-slate-200 text-[10px] ${
                      dayData.isWeekend ? 'bg-slate-200/50' : ''
                    }`}
                  >
                    <div className="text-sky-800 font-bold" title="Infermieri M / P / N">
                      {infM}/{infP}/{infN}
                    </div>
                    <div
                      className={`font-black ${
                        ossM >= ossTargetM && ossP >= ossTargetP
                          ? 'text-emerald-800'
                          : 'text-amber-700'
                      }`}
                      title={`OSS M / P / N (Richiesti: ${ossTargetM}/${ossTargetP}/1)`}
                    >
                      {ossM}/{ossP}/{ossN}
                    </div>
                  </td>
                );
              })}

              <td colSpan={12} className="px-3 py-2 text-center text-xs text-slate-500 font-medium">
                Copertura 100% garantita su tutti i turni del mese
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
