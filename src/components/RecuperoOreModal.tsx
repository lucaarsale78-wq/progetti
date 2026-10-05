import React, { useState } from 'react';
import { StaffMember, MonthlyRoster } from '../types/roster';
import { Clock, X, Check, Plus, Minus } from 'lucide-react';

interface RecuperoOreModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  roster: MonthlyRoster;
  onApplyRecuperoOre: (staffId: string, hoursDelta: number, markDayAsRec?: number) => void;
  defaultStaffId?: string;
}

export const RecuperoOreModal: React.FC<RecuperoOreModalProps> = ({
  isOpen,
  onClose,
  staffList,
  roster,
  onApplyRecuperoOre,
  defaultStaffId,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    defaultStaffId || staffList[0]?.id || ''
  );
  const [hours, setHours] = useState<number>(4);
  const [operationType, setOperationType] = useState<'credit' | 'use_shift'>('credit');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [reason, setReason] = useState<string>('Straordinari reparto clinica');

  if (!isOpen) return null;

  const staff = staffList.find(s => s.id === selectedStaffId) || staffList[0];

  const handleConfirm = () => {
    if (operationType === 'credit') {
      onApplyRecuperoOre(selectedStaffId, hours);
    } else {
      // Fruizione recupero ore come giorno di stacco REC
      onApplyRecuperoOre(selectedStaffId, -hours, selectedDay);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-violet-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Gestione Recupero Ore (R.O.)</h2>
              <p className="text-xs text-slate-600">
                Inserimento ore di recupero/banca ore senza alterare la turnistica già attiva.
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dipendente
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <optgroup label="Infermieri">
                {staffList
                  .filter((s) => s.role === 'INFERMIERE')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Saldo: {s.recuperoOreBalance >= 0 ? `+${s.recuperoOreBalance}` : s.recuperoOreBalance}h)
                    </option>
                  ))}
              </optgroup>
              <optgroup label="OSS">
                {staffList
                  .filter((s) => s.role === 'OSS' && s.isActive)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Saldo: {s.recuperoOreBalance >= 0 ? `+${s.recuperoOreBalance}` : s.recuperoOreBalance}h)
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

          {/* Current balance card */}
          <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg flex items-center justify-between">
            <span className="text-xs text-violet-900 font-medium">
              Saldo attuale Banca Ore di {staff?.name}:
            </span>
            <span className="text-base font-bold text-violet-950">
              {staff?.recuperoOreBalance >= 0 ? `+${staff?.recuperoOreBalance}` : staff?.recuperoOreBalance} ore
            </span>
          </div>

          {/* Operation type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo di Registrazione
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOperationType('credit')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                  operationType === 'credit'
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Accredito Ore Straordinarie
              </button>
              <button
                type="button"
                onClick={() => setOperationType('use_shift')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                  operationType === 'use_shift'
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                Fruizione Giornata di Recupero (REC)
              </button>
            </div>
          </div>

          {/* Hours amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Numero di Ore
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.5"
                step="0.5"
                max="24"
                value={hours}
                onChange={(e) => setHours(Math.max(0.5, Number(e.target.value)))}
                className="w-32 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-xs text-slate-500">ore lavorate / maturate</span>
            </div>
          </div>

          {/* If using as shift REC on a day */}
          {operationType === 'use_shift' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giorno in cui applicare il Recupero Ore (REC)
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {roster.days.map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.dayName} {d.day} {roster.monthName} (Turno attuale: {d.assignments[selectedStaffId] || 'R'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Il turno di quel giorno verrà contrassegnato con la sigla violetta <strong>REC</strong> nel prospetto turni.
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivazione / Note della Caposala
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Es. Sostituzione emergenza, prolungamento turno..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500"
            />
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            Salva Registrazione
          </button>
        </div>
      </div>
    </div>
  );
};
