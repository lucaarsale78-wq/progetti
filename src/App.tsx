import React, { useState, useMemo } from 'react';
import {
  StaffMember,
  ShiftCode,
  Role,
  MonthlyRoster,
  YearSchedule,
} from './types/roster';
import {
  INITIAL_STAFF,
  generateFullYearSchedule,
  rebalanceStaffSchedule,
} from './utils/scheduler';
import { Navbar } from './components/Navbar';
import { RosterTable } from './components/RosterTable';
import { StatsCards } from './components/StatsCards';
import { ShiftLegendAndRules } from './components/ShiftLegendAndRules';
import { PhpViewerModal } from './components/PhpViewerModal';
import { SubstituteModal } from './components/SubstituteModal';
import { VacationModal } from './components/VacationModal';
import { RecuperoOreModal } from './components/RecuperoOreModal';
import { CellEditPopover } from './components/CellEditPopover';
import { StaffManagementModal } from './components/StaffManagementModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // Ottobre 2026

  // Staff state (allowing manual addition of indeterminate nurses and OSS)
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const isOss8Active = useMemo(() => {
    return staffList.find((s) => s.id === 'oss-8')?.isActive ?? false;
  }, [staffList]);

  // Overrides map: staffId -> "YYYY-MM-DD" -> ShiftCode
  const [customOverrides, setCustomOverrides] = useState<
    Record<string, Record<string, ShiftCode>>
  >({});

  // Modals state
  const [isPhpModalOpen, setIsPhpModalOpen] = useState(false);
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [isRecuperoModalOpen, setIsRecuperoModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [initialRoleForAdd, setInitialRoleForAdd] = useState<Role>('INFERMIERE');

  // Quick feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Cell popover state
  const [selectedCell, setSelectedCell] = useState<{
    staff: StaffMember;
    day: number;
    currentShift: ShiftCode;
  } | null>(null);

  // Generate the full 12 months with cross-month continuity and 156h guarantee
  const fullYearSchedule: YearSchedule = useMemo(() => {
    return generateFullYearSchedule(currentYear, staffList, customOverrides);
  }, [currentYear, staffList, customOverrides]);

  const currentRoster: MonthlyRoster = useMemo(() => {
    return fullYearSchedule.months[currentMonth] || fullYearSchedule.months[1];
  }, [fullYearSchedule, currentMonth]);

  // Toggle OSS 8 between active and prolonged sick leave
  const handleToggleOss8 = () => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === 'oss-8') {
          const nextActive = !s.isActive;
          return {
            ...s,
            isActive: nextActive,
            name: nextActive ? 'Paola Mancini (OSS 8)' : 'Paola Mancini (OSS 8 - Mutua)',
          };
        }
        return s;
      })
    );
    showToast(isOss8Active ? 'OSS 8 impostata in mutua prolungata.' : 'OSS 8 riattivata in servizio.');
  };

  // Modify shift on a specific day with automatic planning rebalancing to 156h
  const handleSaveShift = (staffId: string, day: number, newShift: ShiftCode) => {
    const nextOverrides = rebalanceStaffSchedule(
      currentYear,
      currentMonth,
      staffId,
      newShift,
      day,
      customOverrides,
      staffList
    );
    setCustomOverrides(nextOverrides);
    const staff = staffList.find((s) => s.id === staffId);
    showToast(`Turno di ${staff?.name || 'dipendente'} impostato su "${newShift}". Il sistema ha riequilibrato l'intero planning a 156h.`);
  };

  // Add new nurse or OSS manually: recreates the whole schedule
  const handleAddStaff = (
    newStaffData: Omit<StaffMember, 'id' | 'usedVacationDays' | 'recuperoOreBalance'>
  ) => {
    const prefix = newStaffData.role === 'INFERMIERE' ? 'inf' : 'oss';
    const newId = `${prefix}-${Date.now()}`;
    const newMember: StaffMember = {
      ...newStaffData,
      id: newId,
      usedVacationDays: 0,
      recuperoOreBalance: 0,
    };
    setStaffList((prev) => [...prev, newMember]);
    setIsStaffModalOpen(false);
    showToast(`Nuovo operatore "${newMember.name}" aggiunto con successo! L'intera schermata turni è stata ricreata e bilanciata a 156h.`);
  };

  // Rename staff member inline
  const handleUpdateStaffName = (staffId: string, newName: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, name: newName } : s))
    );
    showToast(`Nome operatore aggiornato in "${newName}".`);
  };

  // Delete staff member: recreates schedule for remaining team
  const handleDeleteStaff = (staffId: string) => {
    const member = staffList.find((s) => s.id === staffId);
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    setCustomOverrides((prev) => {
      const next = { ...prev };
      delete next[staffId];
      return next;
    });
    showToast(`Operatore "${member?.name || staffId}" rimosso. Il planning è stato ricreato a 156h per i restanti colleghi.`);
  };

  // Smart substitution when staff is sick
  const handleApplySubstitution = (
    day: number,
    sickStaffId: string,
    substituteStaffId: string,
    shift: ShiftCode
  ) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setCustomOverrides((prev) => {
      const nextMap = { ...prev };
      if (!nextMap[sickStaffId]) nextMap[sickStaffId] = {};
      if (!nextMap[substituteStaffId]) nextMap[substituteStaffId] = {};

      nextMap[sickStaffId][dateStr] = 'MUT';
      nextMap[substituteStaffId][dateStr] = shift;
      return nextMap;
    });
    showToast('Sostituzione registrata con successo.');
  };

  // Assign vacation days (34 quota)
  const handleApplyVacation = (staffId: string, days: number[]) => {
    setCustomOverrides((prev) => {
      const nextMap = { ...prev };
      if (!nextMap[staffId]) nextMap[staffId] = {};

      days.forEach((day) => {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        nextMap[staffId][dateStr] = 'FE';
      });

      return nextMap;
    });

    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            usedVacationDays: Math.min(34, s.usedVacationDays + days.length),
          };
        }
        return s;
      })
    );
    showToast('Giorni di ferie registrati e monte ore ricalcolato.');
  };

  // Apply Recupero Ore
  const handleApplyRecuperoOre = (
    staffId: string,
    hoursDelta: number,
    markDayAsRec?: number
  ) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            recuperoOreBalance: Math.round((s.recuperoOreBalance + hoursDelta) * 10) / 10,
          };
        }
        return s;
      })
    );

    if (markDayAsRec) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(markDayAsRec).padStart(2, '0')}`;
      setCustomOverrides((prev) => {
        const nextMap = { ...prev };
        if (!nextMap[staffId]) nextMap[staffId] = {};
        nextMap[staffId][dateStr] = 'REC';
        return nextMap;
      });
    }
    showToast('Recupero ore aggiornato nella banca ore.');
  };

  // Reset entire schedule
  const handleResetYear = () => {
    if (window.confirm('Vuoi davvero ripristinare la turnistica annuale ai valori generati a 156 ore?')) {
      setCustomOverrides({});
      setStaffList(INITIAL_STAFF);
      showToast('Planning annuale ripristinato con successo.');
    }
  };

  // Export CSV for Excel
  const handleExportCsv = () => {
    const daysInMonth = currentRoster.days.length;
    let csv = `\uFEFFPianificazione Turni Clinica - ${currentRoster.monthName} ${currentYear}\n`;

    csv += 'Operatore;Ruolo;Contratto;';
    for (let d = 1; d <= daysInMonth; d++) {
      csv += `${d} (${currentRoster.days[d - 1].dayName});`;
    }
    csv += 'Totale Turni;Notti (Target 4);Mattino (M);Pomeriggio (P);Smonto (S);Riposi (R);Weekend Liberi;Ferie Godute;Target Ore;Ore Lavorate;Saldo Ore;Banca Ore\n';

    staffList.forEach((staff) => {
      const stat = currentRoster.stats[staff.id];
      const contractLabel = staff.contractType === 'PART_TIME_WEEKEND_64' ? 'PT Weekend (64h)' : 'Full-Time (156h)';
      csv += `"${staff.name}";"${staff.role}";"${contractLabel}";`;
      for (let d = 1; d <= daysInMonth; d++) {
        const sh = currentRoster.days[d - 1].assignments[staff.id] || 'R';
        csv += `${sh};`;
      }
      csv += `${stat?.totalWorkingShifts ?? 0};`;
      csv += `${stat?.nightCount ?? 0};`;
      csv += `${stat?.morningCount ?? 0};`;
      csv += `${stat?.afternoonCount ?? 0};`;
      csv += `${stat?.smontoCount ?? 0};`;
      csv += `${stat?.restCount ?? 0};`;
      csv += `${stat?.freeWeekendsCount ?? 0};`;
      csv += `${stat?.vacationCount ?? 0};`;
      csv += `${stat?.monthlyTargetHours ?? 156}h;`;
      csv += `${stat?.totalHours ?? 0}h;`;
      csv += `${(stat?.hoursDelta ?? 0) > 0 ? `+${stat?.hoursDelta}` : (stat?.hoursDelta ?? 0)}h;`;
      csv += `${staff.recuperoOreBalance}h\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Turni_Clinica_${currentRoster.monthName}_${currentYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentMonth={currentMonth}
        currentYear={currentYear}
        totalNurses={staffList.filter((s) => s.role === 'INFERMIERE').length}
        totalOss={staffList.filter((s) => s.role === 'OSS').length}
        onSelectMonth={setCurrentMonth}
        onSelectYear={setCurrentYear}
        onOpenStaffModal={() => {
          setInitialRoleForAdd('INFERMIERE');
          setIsStaffModalOpen(true);
        }}
        onOpenPhpModal={() => setIsPhpModalOpen(true)}
        onOpenVacationModal={() => setIsVacationModalOpen(true)}
        onOpenSubstituteModal={() => setIsSubstituteModalOpen(true)}
        onOpenRecuperoModal={() => setIsRecuperoModalOpen(true)}
        onExportCsv={handleExportCsv}
        onPrint={handlePrint}
        onResetYear={handleResetYear}
        isOss8Active={isOss8Active}
        onToggleOss8={handleToggleOss8}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* KPI / Compliance Summary */}
        <StatsCards
          roster={currentRoster}
          staffList={staffList}
          isOss8Active={isOss8Active}
        />

        {/* The Master Roster Table */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Prospetto Turni: {currentRoster.monthName} {currentYear}
              </h2>
              <p className="text-xs text-slate-500">
                Clicca su qualsiasi cella per modificare il turno: il sistema riequilibra automaticamente a 156 ore senza deficit.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 hidden sm:block">
              ✓ Target 156h garantito · 0 ore in meno · Divieto P → M attivo
            </div>
          </div>

          <RosterTable
            roster={currentRoster}
            staffList={staffList}
            onCellClick={(staff, day, currentShift) => {
              setSelectedCell({ staff, day, currentShift });
            }}
            onToggleOss8={handleToggleOss8}
            isOss8Active={isOss8Active}
            onOpenAddStaffModal={(role) => {
              setInitialRoleForAdd(role || 'INFERMIERE');
              setIsStaffModalOpen(true);
            }}
            onUpdateStaffName={handleUpdateStaffName}
            onDeleteStaff={handleDeleteStaff}
          />
        </section>

        {/* Legend and Clinic Operational Rules */}
        <ShiftLegendAndRules />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        Clinica Privata · Sistema Gestionale Turnistica Equipe · Target 156h/mese · Equilibratura Automatica · Divieto di Legge P &rarr; M
      </footer>

      {/* Modals */}
      <StaffManagementModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staffList={staffList}
        onAddStaff={handleAddStaff}
        onUpdateStaffName={handleUpdateStaffName}
        onDeleteStaff={handleDeleteStaff}
        initialRoleForAdd={initialRoleForAdd}
      />

      <PhpViewerModal
        isOpen={isPhpModalOpen}
        onClose={() => setIsPhpModalOpen(false)}
      />

      <SubstituteModal
        isOpen={isSubstituteModalOpen}
        onClose={() => setIsSubstituteModalOpen(false)}
        roster={currentRoster}
        staffList={staffList}
        onApplySubstitution={handleApplySubstitution}
        defaultDay={selectedCell?.day}
        defaultSickStaffId={selectedCell?.staff.id}
      />

      <VacationModal
        isOpen={isVacationModalOpen}
        onClose={() => setIsVacationModalOpen(false)}
        staffList={staffList}
        roster={currentRoster}
        onApplyVacation={handleApplyVacation}
        defaultStaffId={selectedCell?.staff.id}
      />

      <RecuperoOreModal
        isOpen={isRecuperoModalOpen}
        onClose={() => setIsRecuperoModalOpen(false)}
        staffList={staffList}
        roster={currentRoster}
        onApplyRecuperoOre={handleApplyRecuperoOre}
        defaultStaffId={selectedCell?.staff.id}
      />

      {/* Quick Cell Edit Popover */}
      {selectedCell && (
        <CellEditPopover
          isOpen={Boolean(selectedCell)}
          onClose={() => setSelectedCell(null)}
          staff={selectedCell.staff}
          day={selectedCell.day}
          dayName={currentRoster.days[selectedCell.day - 1]?.dayName || ''}
          monthName={currentRoster.monthName}
          currentShift={
            currentRoster.days[selectedCell.day - 1]?.assignments[selectedCell.staff.id] || 'R'
          }
          prevShift={
            selectedCell.day > 1
              ? currentRoster.days[selectedCell.day - 2]?.assignments[selectedCell.staff.id]
              : undefined
          }
          nextShift={
            selectedCell.day < currentRoster.days.length
              ? currentRoster.days[selectedCell.day]?.assignments[selectedCell.staff.id]
              : undefined
          }
          onSaveShift={handleSaveShift}
          onOpenSubstituteModal={(staffId, day) => {
            setSelectedCell(null);
            setIsSubstituteModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
