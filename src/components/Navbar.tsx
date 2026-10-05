import React from 'react';
import { MONTH_NAMES_IT } from '../utils/scheduler';
import {
  Calendar,
  Code2,
  Palmtree,
  AlertCircle,
  Clock,
  Printer,
  FileSpreadsheet,
  RefreshCw,
  Users,
  ShieldCheck,
  Power,
} from 'lucide-react';

interface NavbarProps {
  currentMonth: number;
  currentYear: number;
  totalNurses: number;
  totalOss: number;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  onOpenStaffModal: () => void;
  onOpenPhpModal: () => void;
  onOpenVacationModal: () => void;
  onOpenSubstituteModal: () => void;
  onOpenRecuperoModal: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onResetYear: () => void;
  isOss8Active: boolean;
  onToggleOss8: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  currentYear,
  totalNurses,
  totalOss,
  onSelectMonth,
  onSelectYear,
  onOpenStaffModal,
  onOpenPhpModal,
  onOpenVacationModal,
  onOpenSubstituteModal,
  onOpenRecuperoModal,
  onExportCsv,
  onPrint,
  onResetYear,
  isOss8Active,
  onToggleOss8,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Team summary */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            TC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Clinica Privata · Pianificazione Turni
              </h1>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-slate-700">{totalNurses} Infermieri</span>
              <span>·</span>
              <span className="font-semibold text-slate-700">{totalOss} OSS</span>
              <span>·</span>
              <span>1 Caposala</span>
              <span>·</span>
              <span className="text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">
                Target 156h
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Gestione Equipe & Aggiungi Dipendente */}
          <button
            onClick={onOpenStaffModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            title="Aggiungi o gestisci Infermieri e OSS: il sistema ricrea l'intero planning"
          >
            <Users className="w-4 h-4" />
            Gestione Equipe ({totalNurses + totalOss + 1})
          </button>

          {/* OSS 8 Toggle Button */}
          <button
            onClick={onToggleOss8}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isOss8Active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
            }`}
            title="Clicca per riattivare o rimettere in mutua prolungata l'OSS 8"
          >
            <Power className="w-3.5 h-3.5" />
            {isOss8Active ? 'OSS 8: Attiva' : 'OSS 8: In Mutua'}
          </button>

          {/* PHP Script Viewer Button (Requested by User) */}
          <button
            onClick={onOpenPhpModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            title="Visualizza e scarica lo script PHP standalone completo richiesto"
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            Script PHP
          </button>

          {/* Ferie 34gg */}
          <button
            onClick={onOpenVacationModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
          >
            <Palmtree className="w-3.5 h-3.5 text-emerald-600" />
            Ferie (34gg)
          </button>

          {/* Mutua & Sostituto */}
          <button
            onClick={onOpenSubstituteModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Mutua & Sostituto
          </button>

          {/* Recupero Ore */}
          <button
            onClick={onOpenRecuperoModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-800 bg-violet-50 hover:bg-violet-100 border border-violet-300 rounded-lg transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-violet-600" />
            Recupero Ore
          </button>

          {/* Export CSV / Excel */}
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            title="Scarica tabella in formato CSV per Microsoft Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Excel
          </button>

          {/* Print */}
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            title="Stampa foglio presenze mensile"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            Stampa
          </button>

          {/* Regenerate Year */}
          <button
            onClick={onResetYear}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Rigenera intero anno (12 mesi)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Navigation Strip (1 to 12) */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Mese:
            </span>
            {MONTH_NAMES_IT.map((name, index) => {
              const monthNum = index + 1;
              const isSelected = currentMonth === monthNum;
              return (
                <button
                  key={monthNum}
                  onClick={() => onSelectMonth(monthNum)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  {name.substring(0, 3)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500">Anno:</span>
            <select
              value={currentYear}
              onChange={(e) => onSelectYear(Number(e.target.value))}
              className="text-xs font-bold bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
