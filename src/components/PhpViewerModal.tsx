import React, { useState } from 'react';
import { PHP_SCRIPT_CODE } from '../utils/phpCodeString';
import { X, Copy, Check, Download, Terminal, Globe, Code2 } from 'lucide-react';

interface PhpViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhpViewerModal: React.FC<PhpViewerModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'instructions'>('code');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(PHP_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PHP_SCRIPT_CODE], { type: 'application/x-php;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'turni_clinica.php';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Script PHP Standalone Completo (turni_clinica.php)</h2>
              <p className="text-xs text-slate-500">
                Codice PHP compatibile con tutte le versioni di PHP (7.1+ e 8.x): rispetta il divieto di legge P → M, sequenza N → S → R, target 156h a saldo zero, modifiche Caposala e aggiunta indeterminata di operatori.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiato!' : 'Copia Codice'}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Scarica .php
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Header Tabs */}
        <div className="flex items-center gap-4 px-6 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Sorgente PHP Completo (turni_clinica.php)
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'instructions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Istruzioni d'Uso (CLI & Web)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs text-slate-200">
          {activeTab === 'code' ? (
            <pre className="whitespace-pre overflow-x-auto leading-relaxed text-[11px] selection:bg-indigo-600 selection:text-white">
              <code>{PHP_SCRIPT_CODE}</code>
            </pre>
          ) : (
            <div className="font-sans text-sm space-y-6 text-slate-300">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-2 text-sm">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  1. Esecuzione da Riga di Comando (CLI)
                </h3>
                <p className="text-slate-400 text-xs mb-3">
                  È sufficiente avere PHP installato (qualsiasi versione 8.0 o successiva).
                </p>
                <div className="bg-black/60 p-3 rounded font-mono text-xs text-emerald-400 space-y-2 border border-slate-800">
                  <div># Genera e visualizza la tabella del mese corrente:</div>
                  <div className="text-white">php turni_clinica.php</div>
                  <div className="mt-2"># Visualizza un mese specifico (es: Ottobre 2026):</div>
                  <div className="text-white">php turni_clinica.php 10 2026</div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-2 text-sm">
                  <Globe className="w-4 h-4 text-sky-400" />
                  2. Esecuzione via Browser Web (Web Dashboard)
                </h3>
                <p className="text-slate-400 text-xs mb-3">
                  Lo script PHP include un server web dashboard integrato senza bisogno di framework esterni o dipendenze composer.
                </p>
                <div className="bg-black/60 p-3 rounded font-mono text-xs text-sky-300 space-y-2 border border-slate-800">
                  <div># Avvia il server web PHP incorporato nella cartella del file:</div>
                  <div className="text-white">php -S localhost:8000 turni_clinica.php</div>
                  <div className="mt-2"># Apri nel browser:</div>
                  <div className="text-white">http://localhost:8000</div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs space-y-2">
                <h3 className="text-white font-semibold text-sm">Caratteristiche dell'Algoritmo nello Script PHP:</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong className="text-rose-400">Divieto di Legge (D.Lgs 66/2003):</strong> vietato tassativamente Pomeriggio seguito da Mattino (P → M) per rispetto delle 11 ore di riposo minimo consecutivo.</li>
                  <li><strong className="text-teal-400">Sequenza Notte:</strong> dopo ogni Notte (N) segue obbligatoriamente lo Smonto Notte (S) e poi il Riposo (R).</li>
                  <li><strong className="text-violet-400">Monte Ore Contrattuale:</strong> 164 ore al mese per tutti i dipendenti a tempo pieno; 64 ore al mese per l'OSS Part-Time Weekend (Sabato e Domenica).</li>
                  <li><strong>Generazione HTML Automatica:</strong> eseguendo il file in CLI, viene generato in automatico il file visivo <code className="text-sky-300">turni_clinica.html</code> apribile direttamente nel browser.</li>
                  <li><strong>Compatibilità Massima:</strong> nessun pacchetto esterno o estensione opzionale richiesta, funziona nativamente su qualsiasi installazione PHP (XAMPP, WAMP, Linux, Windows, Mac).</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div>Il file <code>turni_clinica.php</code> è salvato e pronto nel progetto.</div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-md transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
