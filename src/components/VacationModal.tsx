import React, { useState } from 'react';
import { StaffMember, MonthlyRoster, ShiftCode } from '../types/roster';
import { Calendar, Palmtree, X, Check, AlertCircle } from 'lucide-react';

interface VacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  roster: MonthlyRoster;
  onApplyVacation: (staffId: string, days: number[]) => void;
  defaultStaffId?: string;
}

export const VacationModal: React.FC<VacationModalProps> = ({
  isOpen,
  onClose,
  staffList,
  roster,
  onApplyVacation,
  defaultStaffId,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    defaultStaffId || staffList[0]?.id || ''
  );
  const [startDay, setStartDay] = useState<number>(1);
  const [endDay, setEndDay] = useState<number>(1);

  if (!isOpen) return null;

  const staff = staffList.find(s => s.id === selectedStaffId) || staffList[0];
  const daysInMonth = roster.days.length;

  // Selected days array
  const requestedDays: number[] = [];
  const minD = Math.min(startDay, endDay);
  const maxD = Math.max(startDay, endDay);
  for (let d = minD; d <= maxD; d++) {
    requestedDays.push(d);
  }

  const remainingQuota = staff.totalAnnualVacationDays - staff.usedVacationDays;

  const handleConfirm = () => {
    onApplyVacation(selectedStaffId, requestedDays);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-emerald-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pianificazione Ferie Annuali (34 gg)</h2>
              <p className="text-xs text-slate-600">
                Inserimento ferie (FE) con ricalcolo e riallocazione automatica dei turni scoperti.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Staff selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dipendente Richiedente
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <optgroup label="Infermieri (6)">
                {staffList
                  .filter((s) => s.role === 'INFERMIERE')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.totalAnnualVacationDays - s.usedVacationDays} gg residui)
                    </option>
                  ))}
              </optgroup>
              <optgroup label="OSS (8)">
                {staffList
                  .filter((s) => s.role === 'OSS' && s.isActive)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.totalAnnualVacationDays - s.usedVacationDays} gg residui)
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Caposala">
                {staffList
                  .filter((s) => s.role === 'CAPOSALA')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Quota Counter Card */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-800 font-semibold">Monte Ferie Annuale per Contratto:</div>
              <div className="text-xs text-emerald-700 mt-0.5">
                34 giorni annui spettanti per ogni Infermiere e OSS
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-900">{remainingQuota}</span>
              <span className="text-xs text-emerald-700 font-medium"> / 34 rimasti</span>
            </div>
          </div>

          {/* Date range picker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giorno Inizio ({roster.monthName})
              </label>
              <select
                value={startDay}
                onChange={(e) => setStartDay(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {roster.days.map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.dayName} {d.day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giorno Fine ({roster.monthName})
              </label>
              <select
                value={endDay}
                onChange={(e) => setEndDay(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {roster.days.map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.dayName} {d.day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              Verranno contrassegnati <strong>{requestedDays.length} giorni</strong> di ferie dal{' '}
              <strong>{minD}</strong> al <strong>{maxD} {roster.monthName}</strong>. Lo script riassegnerà
              automaticamente i turni lavorativi scoperti agli altri colleghi a riposo senza rompere i vincoli delle 12 ore.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            Applica Ferie e Ricalcola Turni
          </button>
        </div>
      </div>
    </div>
  );
};
