import React from 'react';
import { SHIFT_DEFINITIONS, ShiftCode } from '../types/roster';
import { ShieldCheck, Moon, Sun, Sunset, Coffee, Palmtree, Clock, HeartPulse, Sparkles, UserCheck } from 'lucide-react';

export const ShiftLegendAndRules: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Turni e Orari */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-600" />
          Turni di Lavoro e Orari della Clinica
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {(Object.keys(SHIFT_DEFINITIONS) as ShiftCode[]).map((code) => {
            const def = SHIFT_DEFINITIONS[code];
            return (
              <div
                key={code}
                className={`p-2.5 rounded-lg border flex flex-col justify-between ${def.bgColor} ${def.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-xs font-black rounded-md ${def.textColor} bg-white/80 shadow-2xs`}>
                    {def.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700">{def.label}</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-600 font-mono">
                  {def.startTime !== '-' ? `${def.startTime} - ${def.endTime}` : 'Non lavorativo'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regole & Vincoli Rispettati dall'Algoritmo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            1. Divieto di Legge P → M & Sequenza N → S → R
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Per legge (D.Lgs 66/2003) è <strong>tassativamente vietato Pomeriggio seguito da Mattino (P → M)</strong> per mancato riposo giornaliero (solo 8h di stacco). Dopo ogni <strong>Notte (N)</strong> segue obbligatoriamente <strong>Smonto (S)</strong> e poi <strong>Riposo (R)</strong>.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-indigo-600" />
            2. Fabbisogno & Giovedì/Venerdì
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Standard: <strong>1 Infermiere + 1 OSS</strong> per turno (M, P, N).
            Nei giorni di <strong>Giovedì e Venerdì</strong> scatta il potenziamento a <strong>1 Infermiere + 2 OSS</strong>. Target 4 notti al mese.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            3. Mutua & Sostituzioni Smart
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Se un collega va in mutua, il sistema individua istantaneamente il sostituto migliore a riposo senza toccare i turni degli altri colleghi, garantendo continuità perfetta.
          </p>
        </div>
      </div>
    </div>
  );
};
