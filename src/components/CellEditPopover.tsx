import React from 'react';
import { ShiftCode, SHIFT_DEFINITIONS, StaffMember } from '../types/roster';
import { isValidTransition } from '../utils/scheduler';
import { X, AlertTriangle, Sparkles, Check } from 'lucide-react';

interface CellEditPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember;
  day: number;
  dayName: string;
  monthName: string;
  currentShift: ShiftCode;
  prevShift?: ShiftCode;
  nextShift?: ShiftCode;
  onSaveShift: (staffId: string, day: number, newShift: ShiftCode) => void;
  onOpenSubstituteModal?: (staffId: string, day: number) => void;
}

export const CellEditPopover: React.FC<CellEditPopoverProps> = ({
  isOpen,
  onClose,
  staff,
  day,
  dayName,
  monthName,
  currentShift,
  prevShift,
  nextShift,
  onSaveShift,
  onOpenSubstituteModal,
}) => {
  if (!isOpen) return null;

  const availableShifts: ShiftCode[] = ['M', 'P', 'N', 'S', 'R', 'FE', 'REC', 'MUT'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{staff.name}</h3>
            <p className="text-xs text-slate-500">
              {dayName} {day} {monthName} · Turno attuale:{' '}
              <strong className="text-slate-800">{currentShift} ({SHIFT_DEFINITIONS[currentShift]?.label})</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shift Options */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Seleziona Nuovo Turno:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableShifts.map((code) => {
                const def = SHIFT_DEFINITIONS[code];
                const isSelected = currentShift === code;
                const isIllegalPM = (prevShift === 'P' && code === 'M') || (code === 'P' && nextShift === 'M');
                const isIllegalAfterN = prevShift === 'N' && code !== 'S';
                const isIllegalBeforeS = nextShift === 'S' && code !== 'N';
                const isIllegalAfterS = prevShift === 'S' && (code === 'M' || code === 'P' || code === 'N');
                const isIllegalBeforeN = code === 'S' && prevShift && prevShift !== 'N';
                const isIllegalNightBeforeNonS = code === 'N' && nextShift && nextShift !== 'S';
                const isIllegal = isIllegalPM || isIllegalAfterN || isIllegalBeforeS || isIllegalAfterS || isIllegalBeforeN || isIllegalNightBeforeNonS;

                return (
                  <button
                    key={code}
                    type="button"
                    disabled={isIllegal}
                    onClick={() => {
                      if (isIllegal) return;
                      onSaveShift(staff.id, day, code);
                      if (code === 'MUT' && onOpenSubstituteModal && (currentShift === 'M' || currentShift === 'P' || currentShift === 'N')) {
                        onOpenSubstituteModal(staff.id, day);
                      }
                      onClose();
                    }}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : isIllegal
                        ? 'border-rose-200 bg-rose-50/40 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 flex items-center justify-center text-xs font-black rounded-md border ${def.bgColor} ${def.textColor} ${def.borderColor}`}>
                        {def.shortLabel}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{def.label}</div>
                        <div className="text-[10px] text-slate-500">
                          {isIllegalPM
                            ? 'Vietato per legge (P → M)'
                            : isIllegalAfterN
                            ? 'Dopo Notte solo Smonto (S)'
                            : isIllegalBeforeS
                            ? 'Prima di Smonto solo Notte (N)'
                            : isIllegalAfterS
                            ? 'Dopo Smonto solo Riposo (R)'
                            : isIllegalBeforeN
                            ? 'Smonto (S) solo dopo Notte (N)'
                            : isIllegalNightBeforeNonS
                            ? 'La Notte richiede Smonto (S) l\'indomani'
                            : def.startTime !== '-'
                            ? `${def.startTime} - ${def.endTime}`
                            : 'Non lavorativo'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context Sequence Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="text-slate-500 font-semibold flex items-center justify-between">
              <span>Sequenza Turni Circondante:</span>
              <span className="text-[11px] text-indigo-700 font-medium">Vincolo di Legge P → M vietato</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 pt-1">
              <span>Giorno prima: <strong>{prevShift || 'R'}</strong></span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded-sm font-bold bg-indigo-100 text-indigo-800">{currentShift}</span>
              <span>→</span>
              <span>Giorno dopo: <strong>{nextShift || 'R'}</strong></span>
            </div>
            {prevShift === 'P' && (
              <p className="text-[11px] text-rose-700 font-medium pt-1">
                ⚠️ <strong>Divieto di Legge (D.Lgs 66/2003)</strong>: dopo Pomeriggio (P) non è possibile assegnare Mattino (M) per mancato riposo giornaliero minimo (richieste 11 ore consecutive, qui solo 8 ore).
              </p>
            )}
            {nextShift === 'M' && (
              <p className="text-[11px] text-rose-700 font-medium pt-1">
                ⚠️ <strong>Divieto di Legge (D.Lgs 66/2003)</strong>: il giorno successivo è già programmato Mattino (M), quindi oggi non è consentito assegnare Pomeriggio (P).
              </p>
            )}
          </div>

          {/* If current or target is Mutua */}
          {currentShift !== 'MUT' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onSaveShift(staff.id, day, 'MUT');
                  if (onOpenSubstituteModal) {
                    onOpenSubstituteModal(staff.id, day);
                  }
                  onClose();
                }}
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-rose-600" />
                Segnala Mutua e Cerca Sostituto Intelligente
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
