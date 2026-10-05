import React, { useState } from 'react';
import { StaffMember, ShiftCode, MonthlyRoster, SHIFT_DEFINITIONS } from '../types/roster';
import { findBestSubstitutes } from '../utils/scheduler';
import { AlertCircle, CheckCircle2, UserCheck, X, Sparkles, ArrowRight } from 'lucide-react';

interface SubstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: MonthlyRoster;
  staffList: StaffMember[];
  onApplySubstitution: (day: number, sickStaffId: string, substituteStaffId: string, shift: ShiftCode) => void;
  defaultDay?: number;
  defaultSickStaffId?: string;
}

export const SubstituteModal: React.FC<SubstituteModalProps> = ({
  isOpen,
  onClose,
  roster,
  staffList,
  onApplySubstitution,
  defaultDay = 1,
  defaultSickStaffId,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(defaultDay);
  const [sickStaffId, setSickStaffId] = useState<string>(
    defaultSickStaffId || staffList.find(s => s.role !== 'CAPOSALA' && s.isActive)?.id || ''
  );
  const [chosenSubstituteId, setChosenSubstituteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDaySchedule = roster.days.find(d => d.day === selectedDay) || roster.days[0];
  const prevDaySchedule = roster.days.find(d => d.day === selectedDay - 1);
  const nextDaySchedule = roster.days.find(d => d.day === selectedDay + 1);

  const sickStaff = staffList.find(s => s.id === sickStaffId);
  const currentShiftToCover = sickStaff ? (currentDaySchedule.assignments[sickStaff.id] || 'R') : 'R';

  // Only meaningful if the sick staff had a working shift (M, P, N)
  const isWorkingShift = currentShiftToCover === 'M' || currentShiftToCover === 'P' || currentShiftToCover === 'N';

  const candidates = sickStaff && isWorkingShift
    ? findBestSubstitutes(
        currentDaySchedule,
        prevDaySchedule,
        nextDaySchedule,
        sickStaff,
        currentShiftToCover,
        staffList,
        roster.stats
      )
    : [];

  const handleApply = () => {
    if (!chosenSubstituteId || !sickStaff || !isWorkingShift) return;
    onApplySubstitution(selectedDay, sickStaff.id, chosenSubstituteId, currentShiftToCover);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-rose-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Gestione Mutua & Sostituto Intelligente</h2>
              <p className="text-xs text-slate-600">
                Individua automaticamente il miglior collega compatibile senza modificare i turni degli altri.
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

        {/* Form Controls */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Day selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giorno del Mese ({roster.monthName} {roster.year})
              </label>
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(Number(e.target.value));
                  setChosenSubstituteId(null);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {roster.days.map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.dayName} {d.day} {roster.monthName} {d.isWeekend ? '(Fine Settimana)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Sick Staff selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dipendente in Mutua
              </label>
              <select
                value={sickStaffId}
                onChange={(e) => {
                  setSickStaffId(e.target.value);
                  setChosenSubstituteId(null);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <optgroup label="Infermieri">
                  {staffList
                    .filter((s) => s.role === 'INFERMIERE')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="OSS">
                  {staffList
                    .filter((s) => s.role === 'OSS' && s.isActive)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Current Shift Summary */}
          {sickStaff && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Turno programmato da coprire:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${SHIFT_DEFINITIONS[currentShiftToCover]?.bgColor} ${SHIFT_DEFINITIONS[currentShiftToCover]?.textColor}`}>
                    {currentShiftToCover} - {SHIFT_DEFINITIONS[currentShiftToCover]?.label}
                  </span>
                  <span className="text-xs text-slate-600">
                    ({SHIFT_DEFINITIONS[currentShiftToCover]?.startTime} - {SHIFT_DEFINITIONS[currentShiftToCover]?.endTime})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Ruolo da sostituire:</span>
                <div className="text-xs font-semibold text-slate-800">{sickStaff.role}</div>
              </div>
            </div>
          )}

          {/* If the employee was already on rest */}
          {!isWorkingShift && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Il dipendente era già a riposo ({currentShiftToCover}) in questo giorno.</strong>
                <p className="mt-1 text-amber-700">
                  Non è necessaria alcuna sostituzione attiva per la clinica. Il sistema registrerà semplicemente la mutua (MUT) sul registro presenze.
                </p>
              </div>
            </div>
          )}

          {/* Candidate Substitutes */}
          {isWorkingShift && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Candidati Sostituti Analizzati dall'Algoritmo
                </h3>
                <span className="text-xs text-slate-500">
                  {candidates.filter(c => c.isEligible).length} idonei con rispetto 12h
                </span>
              </div>

              {candidates.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 border border-dashed rounded-lg">
                  Nessun collega disponibile nello stesso ruolo per questo giorno.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {candidates.map((cand, idx) => {
                    const isSelected = chosenSubstituteId === cand.staff.id || (chosenSubstituteId === null && idx === 0 && cand.isEligible);
                    return (
                      <div
                        key={cand.staff.id}
                        onClick={() => {
                          if (cand.isEligible) setChosenSubstituteId(cand.staff.id);
                        }}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          !cand.isEligible
                            ? 'bg-slate-50/60 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              {cand.staff.name}
                            </span>
                            {idx === 0 && cand.isEligible && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-sm">
                                Miglior Scelta
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 space-y-0.5">
                            {cand.reasons.map((r, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                {cand.isEligible ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                )}
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-4">
                          {cand.isEligible ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setChosenSubstituteId(cand.staff.id);
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? 'Selezionato' : 'Scegli'}
                            </button>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400">Non Idoneo</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {chosenSubstituteId || (candidates[0]?.isEligible && candidates[0]?.staff.id) ? (
              <span>
                Sostituzione pronta: <strong>{sickStaff?.name}</strong> (MUT) <ArrowRight className="inline w-3 h-3" />{' '}
                <strong>
                  {staffList.find(s => s.id === (chosenSubstituteId || candidates[0]?.staff.id))?.name}
                </strong>{' '}
                prende turno <strong>{currentShiftToCover}</strong>.
              </span>
            ) : (
              <span>Seleziona un sostituto idoneo per procedere</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleApply}
              disabled={!isWorkingShift || (!chosenSubstituteId && !candidates[0]?.isEligible)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              Conferma e Applica Sostituzione
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
