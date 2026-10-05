import React, { useState } from 'react';
import { StaffMember, Role, ContractType } from '../types/roster';
import { X, UserPlus, Users, Trash2, Edit2, Check, UserCheck, Shield, Clock } from 'lucide-react';

interface StaffManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onAddStaff: (newStaff: Omit<StaffMember, 'id' | 'usedVacationDays' | 'recuperoOreBalance'>) => void;
  onUpdateStaffName: (staffId: string, newName: string) => void;
  onDeleteStaff: (staffId: string) => void;
  initialRoleForAdd?: Role;
}

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onAddStaff,
  onUpdateStaffName,
  onDeleteStaff,
  initialRoleForAdd = 'INFERMIERE',
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(initialRoleForAdd);
  const [contractType, setContractType] = useState<ContractType>('FULL_TIME_156');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetHours = contractType === 'PART_TIME_WEEKEND_64' ? 64 : 156;
    onAddStaff({
      name: name.trim(),
      role,
      contractType,
      monthlyTargetHours: targetHours,
      isActive: true,
      totalAnnualVacationDays: contractType === 'PART_TIME_WEEKEND_64' ? 14 : 34,
    });

    setSuccessMessage(`Operatore "${name.trim()}" aggiunto con successo all'equipe! Il planning turni a 156h è stato rigenerato.`);
    setName('');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleStartEdit = (staff: StaffMember) => {
    setEditingId(staff.id);
    setEditingName(staff.name);
  };

  const handleSaveEdit = (staffId: string) => {
    if (editingName.trim()) {
      onUpdateStaffName(staffId, editingName.trim());
    }
    setEditingId(null);
  };

  const nurses = staffList.filter((s) => s.role === 'INFERMIERE');
  const ossList = staffList.filter((s) => s.role === 'OSS');
  const caposala = staffList.find((s) => s.role === 'CAPOSALA');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gestione Equipe Sanitaria & Aggiunta Personale
              </h2>
              <p className="text-xs text-slate-500">
                Aggiungi o rinomina Infermieri e OSS: il sistema ricrea e riequilibra istantaneamente l'intero planning a 156 ore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'add'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Aggiungi Nuovo Operatore
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'list'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Equipe Attuale ({staffList.length} Dipendenti)
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'add' ? (
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome e Cognome */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nome e Cognome dell'Operatore <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Es. Mario Rossi, Beatrice Rinaldi..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Puoi scrivere qualsiasi nome manualmente. Il nuovo operatore verrà integrato automaticamente nella rotazione turni a 156 ore.
                  </p>
                </div>

                {/* Ruolo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ruolo Professionale
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('INFERMIERE');
                        setContractType('FULL_TIME_156');
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                        role === 'INFERMIERE'
                          ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-sky-900">Infermiere / a</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">Staff Infermieristico</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('OSS')}
                      className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                        role === 'OSS'
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-900">Operatore OSS</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">Operatore Socio Sanitario</span>
                    </button>
                  </div>
                </div>

                {/* Tipo Contratto e Target Ore */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contratto & Target Orario Mensile
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setContractType('FULL_TIME_156')}
                      className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                        contractType === 'FULL_TIME_156'
                          ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-indigo-900">Full-Time (156h)</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">Target 156 ore al mese</span>
                    </button>
                    {role === 'OSS' ? (
                      <button
                        type="button"
                        onClick={() => setContractType('PART_TIME_WEEKEND_64')}
                        className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                          contractType === 'PART_TIME_WEEKEND_64'
                            ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold text-purple-900">PT Weekend (64h)</span>
                        <span className="text-[11px] text-slate-500 mt-0.5">Solo Sabato e Domenica</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-slate-200 opacity-60 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-slate-400">Solo Full-Time 156h</span>
                        <span className="text-[10px] text-slate-400">per il personale infermieristico</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informative Banner */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Bilanciamento automatico immediato a 156 ore:</strong> inserendo questo dipendente, il sistema ricalcola istantaneamente tutti i turni del mese garantendo a ciascun operatore a tempo pieno il raggiungimento delle <strong>156 ore contrattuali senza alcuna ora in meno</strong>, le 4 notti mensili e il rispetto del divieto di legge P &rarr; M.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Aggiungi e Ricrea Planning Turni
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-1">
              {/* Caposala */}
              {caposala && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    Coordinamento (Caposala)
                  </h3>
                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{caposala.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Turno di coordinamento Lun-Ven (156h al mese)
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md">
                      Caposala
                    </span>
                  </div>
                </div>
              )}

              {/* Infermieri */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                    Infermieri ({nurses.length}) · Target 156h
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('INFERMIERE');
                      setContractType('FULL_TIME_156');
                      setActiveTab('add');
                    }}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900"
                  >
                    + Aggiungi Infermiere
                  </button>
                </div>
                <div className="space-y-2">
                  {nurses.map((staff) => (
                    <div
                      key={staff.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold">
                          {staff.name.charAt(0)}
                        </div>
                        {editingId === staff.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-2 py-1 text-xs border border-indigo-400 rounded-md focus:outline-hidden"
                            />
                            <button
                              onClick={() => handleSaveEdit(staff.id)}
                              className="p-1 text-emerald-600 hover:text-emerald-800"
                              title="Salva nome"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <span>{staff.name}</span>
                              <button
                                onClick={() => handleStartEdit(staff)}
                                className="text-slate-400 hover:text-slate-600"
                                title="Rinomina operatore"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Full-Time · Target 156h · Ferie: {staff.totalAnnualVacationDays}gg
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-md">
                          156h FT
                        </span>
                        {nurses.length > 3 && (
                          <button
                            onClick={() => {
                              if (confirm(`Confermi di voler rimuovere ${staff.name} dall'equipe? Il planning verrà ricalcolato per i restanti colleghi.`)) {
                                onDeleteStaff(staff.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Rimuovi operatore"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OSS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Operatori Socio Sanitari (OSS - {ossList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('OSS');
                      setActiveTab('add');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    + Aggiungi OSS
                  </button>
                </div>
                <div className="space-y-2">
                  {ossList.map((staff) => (
                    <div
                      key={staff.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                          {staff.name.charAt(0)}
                        </div>
                        {editingId === staff.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-2 py-1 text-xs border border-indigo-400 rounded-md focus:outline-hidden"
                            />
                            <button
                              onClick={() => handleSaveEdit(staff.id)}
                              className="p-1 text-emerald-600 hover:text-emerald-800"
                              title="Salva nome"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <span>{staff.name}</span>
                              <button
                                onClick={() => handleStartEdit(staff)}
                                className="text-slate-400 hover:text-slate-600"
                                title="Rinomina operatore"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {staff.contractType === 'PART_TIME_WEEKEND_64'
                                ? 'Part-Time Weekend · Target 64h (Sabato e Domenica)'
                                : 'Full-Time · Target 156h al mese'}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            staff.contractType === 'PART_TIME_WEEKEND_64'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {staff.contractType === 'PART_TIME_WEEKEND_64' ? '64h PT' : '156h FT'}
                        </span>
                        {ossList.length > 2 && (
                          <button
                            onClick={() => {
                              if (confirm(`Confermi di voler rimuovere ${staff.name} dall'equipe? Il planning verrà ricalcolato per i restanti colleghi.`)) {
                                onDeleteStaff(staff.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Rimuovi operatore"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
