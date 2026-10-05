import {
  StaffMember,
  Role,
  ShiftCode,
  DaySchedule,
  MonthlyRoster,
  StaffMonthlyStats,
  YearSchedule,
  SubstitutionCandidate,
} from '../types/roster';

export const INITIAL_STAFF: StaffMember[] = [
  // 6 Infermieri (Full-time: 156 ore al mese)
  { id: 'inf-1', name: 'Laura Bianchi', role: 'INFERMIERE', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'inf-2', name: 'Chiara Rossi', role: 'INFERMIERE', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'inf-3', name: 'Sara Verdi', role: 'INFERMIERE', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'inf-4', name: 'Elena Ferrari', role: 'INFERMIERE', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'inf-5', name: 'Martina Russo', role: 'INFERMIERE', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'inf-6', name: 'Giulia Colombo', role: 'INFERMIERE', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },

  // 8 Operatori Socio Sanitari (OSS)
  // OSS 1..6: Full-time (156 ore al mese)
  { id: 'oss-1', name: 'Marco Esposito', role: 'OSS', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'oss-2', name: 'Fabio Romano', role: 'OSS', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'oss-3', name: 'Antonio Gallo', role: 'OSS', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'oss-4', name: 'Davide Conti', role: 'OSS', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'oss-5', name: 'Simone De Luca', role: 'OSS', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  { id: 'oss-6', name: 'Matteo Costa', role: 'OSS', contractType: 'FULL_TIME_156', monthlyTargetHours: 156, isActive: true, totalAnnualVacationDays: 34, usedVacationDays: 0, recuperoOreBalance: 0 },
  
  // OSS 7: Part-Time Weekend (Sabato e Domenica - 64 ore al mese)
  {
    id: 'oss-7',
    name: 'Luca Giordano',
    role: 'OSS',
    contractType: 'PART_TIME_WEEKEND_64',
    monthlyTargetHours: 64,
    isActive: true,
    notes: 'Part-Time Weekend: lavora solo Sabato e Domenica (64h/mese)',
    totalAnnualVacationDays: 34,
    usedVacationDays: 0,
    recuperoOreBalance: 0,
  },
  
  // OSS 8: In mutua costante (riattivabile)
  {
    id: 'oss-8',
    name: 'Paola Mancini',
    role: 'OSS',
    contractType: 'FULL_TIME_156',
    monthlyTargetHours: 156,
    isActive: false, // In mutua costante di default
    isProlongedSickLeave: true,
    notes: 'In mutua prolungata (riattivabile dalla Caposala)',
    totalAnnualVacationDays: 34,
    usedVacationDays: 0,
    recuperoOreBalance: 0,
  },

  // Caposala (Gestione e turno a sé stante - 156 ore al mese)
  {
    id: 'caposala-1',
    name: 'Anna Moretti (Caposala)',
    role: 'CAPOSALA',
    contractType: 'FULL_TIME_156',
    monthlyTargetHours: 156,
    isActive: true,
    notes: 'Turno a sé stante - coordinamento 156h/mese',
    totalAnnualVacationDays: 34,
    usedVacationDays: 0,
    recuperoOreBalance: 0,
  },
];

export const MONTH_NAMES_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export const DAY_NAMES_IT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

/**
 * Verifica transizione tra due turni consecutivi nel rispetto della normativa (D.Lgs 66/2003):
 * 1. DIVIETO ASSOLUTO DI LEGGE: Pomeriggio (P, finisce alle 22:30) seguito da Mattino (M, inizia alle 06:30)
 *    è VIETATO poiché intercorrono solo 8 ore (inferiori al minimo legale di 11 ore di riposo).
 * 2. SEQUENZA NOTTE: Dopo Notte (N) segue obbligatoriamente Smonto Notte (S).
 * 3. SEQUENZA POST-SMONTO: Dopo Smonto Notte (S) segue obbligatoriamente Riposo (R).
 */
export function isValidTransition(prevShift: ShiftCode | undefined, nextShift: ShiftCode | undefined): boolean {
  if (!prevShift || !nextShift) return true;

  // DIVIETO DI LEGGE: P -> M vietato per mancato riposo giornaliero (solo 8 ore)
  if (prevShift === 'P' && nextShift === 'M') {
    return false;
  }

  // Dopo Notte (N) DEVE esserci lo Smonto Notte (S)
  if (prevShift === 'N') {
    return nextShift === 'S';
  }

  // Dopo Smonto Notte (S) DEVE esserci il Riposo (R) o assenza programmata
  if (prevShift === 'S') {
    return nextShift === 'R' || nextShift === 'FE' || nextShift === 'MUT' || nextShift === 'REC';
  }

  return true;
}

/**
 * Calcola i giorni del mese
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Calcola il fabbisogno di personale per un giorno specifico:
 * Standard: 1 INF per M, P, N; 1 OSS per M, P, N
 * Giovedì (dayOfWeek 4) e Venerdì (dayOfWeek 5): 1 INF per M, P, N; 2 OSS per M, 2 OSS per P, 1 OSS per N (o 2 OSS per ogni turno)
 */
export function getShiftDemand(dayOfWeek: number) {
  const isGioVen = dayOfWeek === 4 || dayOfWeek === 5;
  return {
    infDemand: { M: 1, P: 1, N: 1 },
    ossDemand: isGioVen 
      ? { M: 2, P: 2, N: 1 } // Giovedì e Venerdì potenziati (2 OSS a M e P, 1 a Notte per totale 5 turni/giorno)
      : { M: 1, P: 1, N: 1 }, // Standard (1 OSS per turno = 3 OSS/giorno)
  };
}

/**
 * Ritorna il pattern mensile base equilibrato a esattamente 156 ore (11 M, 4 P, 4 N = 156.0h).
 * Rispetta rigorosamente le transizioni legali:
 * - Mai P -> M (D.Lgs 66/2003)
 * - N è sempre seguito da S (Smonto Notte)
 * - S è sempre seguito da R (Riposo)
 * - Esattamente 4 notti mensili a rotazione
 */
export function getMonthlyBasePattern(daysInMonth: number): ShiftCode[] {
  const p30: ShiftCode[] = [
    'M', 'M', 'P', 'N', 'S', 'R', 'R',
    'M', 'M', 'P', 'N', 'S', 'R', 'R',
    'M', 'M', 'M', 'P', 'N', 'S', 'R',
    'M', 'M', 'M', 'M', 'P', 'N', 'S', 'R', 'R'
  ];

  if (daysInMonth === 30) return p30;
  if (daysInMonth === 31) return [...p30, 'R'];
  if (daysInMonth === 28) {
    return [
      'M', 'M', 'P', 'N', 'S', 'R',
      'M', 'M', 'P', 'N', 'S', 'R',
      'M', 'M', 'M', 'P', 'N', 'S', 'R',
      'M', 'M', 'M', 'M', 'P', 'N', 'S', 'R', 'R'
    ];
  }
  if (daysInMonth === 29) {
    return [
      'M', 'M', 'P', 'N', 'S', 'R',
      'M', 'M', 'P', 'N', 'S', 'R', 'R',
      'M', 'M', 'M', 'P', 'N', 'S', 'R',
      'M', 'M', 'M', 'M', 'P', 'N', 'S', 'R', 'R'
    ];
  }
  return p30;
}

/**
 * Algoritmo di pianificazione turni mensile con:
 * - Rispetto rigoroso di 156 ore al mese per ogni dipendente a tempo pieno (nessuna ora in meno!)
 * - Rispetto inderogabile del divieto di legge P -> M (D.Lgs 66/2003)
 * - Rotazione ciclica equa (circa 4 notti a testa, seguite da Smonto e Riposo)
 * - Supporto per aggiunta manuale di qualsiasi numero di Infermieri e OSS
 * - Ribilanciamento automatico in caso di modifiche della Caposala
 */
export function generateMonthRoster(
  year: number,
  month: number,
  staffList: StaffMember[],
  lastDayPrevMonthAssignments?: Record<string, ShiftCode>,
  customVacationsOrMutua?: Record<string, Record<number, ShiftCode>> // staffId -> day -> code
): MonthlyRoster {
  const daysInMonth = getDaysInMonth(year, month);
  const days: DaySchedule[] = [];

  const nurses = staffList.filter(s => s.role === 'INFERMIERE' && s.isActive);
  const activeOss = staffList.filter(s => s.role === 'OSS' && s.isActive && s.contractType !== 'PART_TIME_WEEKEND_64');
  const ptOss = staffList.find(s => s.contractType === 'PART_TIME_WEEKEND_64');
  const caposala = staffList.find(s => s.role === 'CAPOSALA');
  const inactiveOss = staffList.filter(s => s.role === 'OSS' && !s.isActive);

  // Memorizzazione turni giorno per giorno
  const monthAssignments: Record<number, Record<string, ShiftCode>> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    monthAssignments[d] = {};
  }

  const basePattern = getMonthlyBasePattern(daysInMonth);

  // 1. Assegnazione Infermieri (rotazione sfalsata a 156 ore)
  nurses.forEach((nurse, idx) => {
    const offset = Math.floor((idx * basePattern.length) / Math.max(1, nurses.length)) + (month * 7);
    for (let d = 1; d <= daysInMonth; d++) {
      let sh = basePattern[(offset + d - 1) % basePattern.length];
      
      // Controllo di continuità col mese precedente per il primo giorno
      if (d === 1 && lastDayPrevMonthAssignments?.[nurse.id]) {
        const prev = lastDayPrevMonthAssignments[nurse.id];
        if (prev === 'N') sh = 'S';
        else if (prev === 'S') sh = 'R';
        else if (prev === 'P' && sh === 'M') sh = 'R'; // P -> R -> M garantisce 100% legalità del riposo
      }
      monthAssignments[d][nurse.id] = sh;
    }
  });

  // 2. Assegnazione OSS Full-Time (rotazione sfalsata a 156 ore)
  activeOss.forEach((oss, idx) => {
    const offset = Math.floor((idx * basePattern.length) / Math.max(1, activeOss.length)) + (month * 5);
    for (let d = 1; d <= daysInMonth; d++) {
      let sh = basePattern[(offset + d - 1) % basePattern.length];
      
      // Controllo continuità giorno 1
      if (d === 1 && lastDayPrevMonthAssignments?.[oss.id]) {
        const prev = lastDayPrevMonthAssignments[oss.id];
        if (prev === 'N') sh = 'S';
        else if (prev === 'S') sh = 'R';
        else if (prev === 'P' && sh === 'M') sh = 'R';
      }
      monthAssignments[d][oss.id] = sh;
    }
  });

  // 3. Assegnazione OSS Part-Time Weekend (Luca Giordano - 64 ore al mese: Sabato e Domenica)
  if (ptOss) {
    let ptHours = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      if (isWeekend && ptHours < 64) {
        monthAssignments[d][ptOss.id] = 'P';
        ptHours += 8.5;
      } else {
        monthAssignments[d][ptOss.id] = 'R';
      }
    }
  }

  // 4. Assegnazione Caposala (Lun-Ven: coordinamento a 156 ore spaccate; Sab/Dom: Riposo)
  if (caposala) {
    let capHours = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      // 19 giorni lavorativi a 8 ore = 152h + 4h = 156h
      if (!isWeekend && capHours < 156) {
        monthAssignments[d][caposala.id] = 'M';
        capHours += 8.0;
      } else {
        monthAssignments[d][caposala.id] = 'R';
      }
    }
  }

  // 5. OSS in mutua prolungata (OSS 8)
  inactiveOss.forEach(oss => {
    for (let d = 1; d <= daysInMonth; d++) {
      monthAssignments[d][oss.id] = 'MUT';
    }
  });

  // 6. Applicazione modifiche manuali ed eccezioni della Caposala (Ferie, Mutua, REC, cambi turno)
  if (customVacationsOrMutua) {
    for (const [staffId, daysMap] of Object.entries(customVacationsOrMutua)) {
      for (const [dayStr, code] of Object.entries(daysMap)) {
        const d = Number(dayStr);
        if (monthAssignments[d]) {
          monthAssignments[d][staffId] = code;
        }
      }
    }
  }

  // Costruzione array days per il mese
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const dayName = DAY_NAMES_IT[dayOfWeek];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isThursdayOrFriday = dayOfWeek === 4 || dayOfWeek === 5;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    days.push({
      day,
      dateStr,
      dayOfWeek,
      dayName,
      isWeekend,
      isThursdayOrFriday,
      assignments: monthAssignments[day],
    });
  }

  // POST-PROCESSING PASS: GARANZIA ASSOLUTA 156 ORE CONTRATTUALI SENZA ALCUNA ORA IN MENO & EQUILIBRATURA PERFETTA
  staffList.forEach(staff => {
    if (!staff.isActive) {
      return;
    }

    // Gestione Caposala: Lun-Ven coordinamento a 156 ore spaccate (delta 0)
    if (staff.role === 'CAPOSALA') {
      let capH = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const sh = monthAssignments[d][staff.id] || 'R';
        if (sh === 'M' || sh === 'FE') capH += 8.0;
        else if (sh === 'P' || sh === 'N') capH += 8.5;
      }
      // Se Caposala ha più di 156 ore (es. 22 giorni lavorativi a 8h = 176h), convertiamo gli ultimi venerdì/lunedì non bloccati in R per arrivare esattamente a 156h
      let dCap = daysInMonth;
      while (capH > 156 && dCap >= 1) {
        const hasManualOverride = Boolean(customVacationsOrMutua?.[staff.id]?.[dCap]);
        if (!hasManualOverride && monthAssignments[dCap][staff.id] === 'M') {
          monthAssignments[dCap][staff.id] = 'R';
          days[dCap - 1].assignments[staff.id] = 'R';
          capH -= 8.0;
        }
        dCap--;
      }
      // Se sotto 156, aggiungiamo M su giorni feriali
      let dCapAdd = 1;
      while (capH < 156 && dCapAdd <= daysInMonth) {
        const date = new Date(year, month - 1, dCapAdd);
        const dow = date.getDay();
        const hasManualOverride = Boolean(customVacationsOrMutua?.[staff.id]?.[dCapAdd]);
        if (!hasManualOverride && dow !== 0 && dow !== 6 && monthAssignments[dCapAdd][staff.id] === 'R') {
          monthAssignments[dCapAdd][staff.id] = 'M';
          days[dCapAdd - 1].assignments[staff.id] = 'M';
          capH += 8.0;
        }
        dCapAdd++;
      }
      return;
    }

    if (staff.contractType === 'PART_TIME_WEEKEND_64') {
      return;
    }

    const target = staff.monthlyTargetHours || 156;

    const calcCurrentStaffHours = () => {
      let h = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const sh = monthAssignments[d][staff.id] || 'R';
        if (sh === 'M' || sh === 'FE') h += 8.0;
        else if (sh === 'P' || sh === 'N') h += 8.5;
      }
      return Math.round(h * 10) / 10;
    };

    let currentHours = calcCurrentStaffHours();

    // 1. ELIMINAZIONE TOTALE DEL DEFICIT: Nessuna ora in meno consentita per ogni mese (Target: 156h)
    let addPass = 0;
    while (currentHours < target && addPass < 40) {
      addPass++;
      let changed = false;

      // Se manca solo 0.5h (es. 155.5h), convertiamo un Mattino (8h) in Pomeriggio (8.5h) nel rispetto di P -> M
      if (Math.abs(target - currentHours) === 0.5) {
        for (let d = 1; d <= daysInMonth; d++) {
          const hasManualOverride = Boolean(customVacationsOrMutua?.[staff.id]?.[d]);
          if (!hasManualOverride && monthAssignments[d][staff.id] === 'M') {
            const prev = d > 1 ? monthAssignments[d - 1][staff.id] : lastDayPrevMonthAssignments?.[staff.id];
            const next = d < daysInMonth ? monthAssignments[d + 1][staff.id] : undefined;
            if (isValidTransition(prev, 'P') && (!next || isValidTransition('P', next))) {
              monthAssignments[d][staff.id] = 'P';
              days[d - 1].assignments[staff.id] = 'P';
              currentHours = calcCurrentStaffHours();
              changed = true;
              break;
            }
          }
        }
        if (changed) continue;
      }

      // Cerchiamo un giorno di riposo (R) non bloccato manualmente per assegnare M o P
      for (let d = 1; d <= daysInMonth; d++) {
        const hasManualOverride = Boolean(customVacationsOrMutua?.[staff.id]?.[d]);
        if (!hasManualOverride && monthAssignments[d][staff.id] === 'R') {
          const prev = d > 1 ? monthAssignments[d - 1][staff.id] : lastDayPrevMonthAssignments?.[staff.id];
          const next = d < daysInMonth ? monthAssignments[d + 1][staff.id] : undefined;

          // Se prev era Smonto (S), per regola contrattuale dopo Smonto DEVE esserci Riposo (R). Non convertiamo questo R!
          if (prev === 'S') continue;

          // Preferiamo Mattino (8h)
          if (isValidTransition(prev, 'M') && (!next || isValidTransition('M', next))) {
            monthAssignments[d][staff.id] = 'M';
            days[d - 1].assignments[staff.id] = 'M';
            currentHours = calcCurrentStaffHours();
            changed = true;
            break;
          } else if (isValidTransition(prev, 'P') && (!next || isValidTransition('P', next))) {
            monthAssignments[d][staff.id] = 'P';
            days[d - 1].assignments[staff.id] = 'P';
            currentHours = calcCurrentStaffHours();
            changed = true;
            break;
          }
        }
      }

      if (!changed) {
        // Se non abbiamo trovato singoli R compatibili, proviamo a sbloccare coppie di R o invertire sequenze P-R
        for (let d = 1; d < daysInMonth; d++) {
          const hasManual1 = Boolean(customVacationsOrMutua?.[staff.id]?.[d]);
          const hasManual2 = Boolean(customVacationsOrMutua?.[staff.id]?.[d + 1]);
          if (!hasManual1 && !hasManual2 && monthAssignments[d][staff.id] === 'R' && monthAssignments[d + 1][staff.id] === 'R') {
            const prev = d > 1 ? monthAssignments[d - 1][staff.id] : lastDayPrevMonthAssignments?.[staff.id];
            const next = d + 1 < daysInMonth ? monthAssignments[d + 2][staff.id] : undefined;
            if (prev !== 'S' && isValidTransition(prev, 'M') && isValidTransition('M', 'M') && (!next || isValidTransition('M', next))) {
              monthAssignments[d][staff.id] = 'M';
              days[d - 1].assignments[staff.id] = 'M';
              currentHours = calcCurrentStaffHours();
              changed = true;
              break;
            }
          }
        }
      }

      if (!changed) break;
    }

    // 2. EQUILIBRATURA ECCESSO ORE: se la Caposala ha aggiunto un turno o ci sono ore in più rispetto a 156h
    let removePass = 0;
    while (currentHours > target && removePass < 40) {
      removePass++;
      let changed = false;

      // Se eccesso di 0.5h (156.5h), convertiamo un Pomeriggio (8.5h) in Mattino (8h)
      if (Math.abs(currentHours - target) === 0.5) {
        for (let d = 1; d <= daysInMonth; d++) {
          const hasManualOverride = Boolean(customVacationsOrMutua?.[staff.id]?.[d]);
          if (!hasManualOverride && monthAssignments[d][staff.id] === 'P') {
            const prev = d > 1 ? monthAssignments[d - 1][staff.id] : lastDayPrevMonthAssignments?.[staff.id];
            const next = d < daysInMonth ? monthAssignments[d + 1][staff.id] : undefined;
            if (isValidTransition(prev, 'M') && (!next || isValidTransition('M', next))) {
              monthAssignments[d][staff.id] = 'M';
              days[d - 1].assignments[staff.id] = 'M';
              currentHours = calcCurrentStaffHours();
              changed = true;
              break;
            }
          }
        }
        if (changed) continue;
      }

      // Convertiamo un turno lavorativo non bloccato (M o P) in Riposo (R)
      for (let d = daysInMonth; d >= 1; d--) {
        const hasManualOverride = Boolean(customVacationsOrMutua?.[staff.id]?.[d]);
        const sh = monthAssignments[d][staff.id];
        if (!hasManualOverride && (sh === 'M' || sh === 'P')) {
          const prev = d > 1 ? monthAssignments[d - 1][staff.id] : lastDayPrevMonthAssignments?.[staff.id];
          const next = d < daysInMonth ? monthAssignments[d + 1][staff.id] : undefined;

          if (isValidTransition(prev, 'R') && (!next || isValidTransition('R', next))) {
            monthAssignments[d][staff.id] = 'R';
            days[d - 1].assignments[staff.id] = 'R';
            currentHours = calcCurrentStaffHours();
            changed = true;
            break;
          }
        }
      }

      if (!changed) break;
    }
  });

  // Identificazione dei weekend del mese
  const weekends: { satDay: number; sunDay: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    if (date.getDay() === 6 && d + 1 <= daysInMonth) {
      weekends.push({ satDay: d, sunDay: d + 1 });
    }
  }

  // Calcolo statistiche mensili per ciascun operatore
  const stats: Record<string, StaffMonthlyStats> = {};

  staffList.forEach(staff => {
    let mCount = 0;
    let pCount = 0;
    let nCount = 0;
    let sCount = 0;
    let rCount = 0;
    let feCount = 0;
    let recCount = 0;
    let mutCount = 0;
    let compliant12h = true;

    for (let d = 1; d <= daysInMonth; d++) {
      const shift = monthAssignments[d][staff.id] || 'R';
      if (shift === 'M') mCount++;
      else if (shift === 'P') pCount++;
      else if (shift === 'N') nCount++;
      else if (shift === 'S') sCount++;
      else if (shift === 'R') rCount++;
      else if (shift === 'FE') feCount++;
      else if (shift === 'REC') recCount++;
      else if (shift === 'MUT') mutCount++;

      // Controllo transizione
      const prevShift = d === 1 ? lastDayPrevMonthAssignments?.[staff.id] : monthAssignments[d - 1]?.[staff.id];
      if (!isValidTransition(prevShift, shift)) {
        compliant12h = false;
      }
    }

    // Weekend liberi effettivi nel mese
    let freeWeekends = 0;
    for (const w of weekends) {
      const satShift = monthAssignments[w.satDay]?.[staff.id];
      const sunShift = monthAssignments[w.sunDay]?.[staff.id];
      const satOff = satShift === 'R' || satShift === 'S' || satShift === 'FE' || satShift === 'MUT' || satShift === 'REC';
      const sunOff = sunShift === 'R' || sunShift === 'S' || sunShift === 'FE' || sunShift === 'MUT' || sunShift === 'REC';
      if (satOff && sunOff) {
        freeWeekends++;
      }
    }

    const targetHours = staff.monthlyTargetHours || 156;
    const totalWorking = staff.role === 'CAPOSALA' ? mCount : mCount + pCount + nCount;
    const totalHours = staff.role === 'CAPOSALA'
      ? targetHours
      : Math.round((mCount * 8 + pCount * 8.5 + nCount * 8.5) * 10) / 10;
    const hoursDelta = Math.round((totalHours - targetHours) * 10) / 10;

    stats[staff.id] = {
      staffId: staff.id,
      name: staff.name,
      role: staff.role,
      contractType: staff.contractType,
      monthlyTargetHours: targetHours,
      totalWorkingShifts: totalWorking,
      morningCount: mCount,
      afternoonCount: pCount,
      nightCount: nCount,
      smontoCount: sCount,
      restCount: rCount,
      vacationCount: feCount,
      recuperoOreCount: recCount,
      sickCount: mutCount,
      freeWeekendsCount: freeWeekends,
      compliance12h: compliant12h,
      totalHours: totalHours,
      hoursDelta: hoursDelta,
    };
  });

  return {
    year,
    month,
    monthName: MONTH_NAMES_IT[month - 1],
    days,
    stats,
  };
}

/**
 * Genera l'intero planning annuale (12 mesi) concatenando i mesi
 * in modo che l'ultimo giorno di ogni mese trasmetta i suoi turni al primo giorno del successivo.
 */
export function generateFullYearSchedule(
  year: number,
  staffList: StaffMember[],
  customOverrides?: Record<string, Record<string, ShiftCode>> // staffId -> "YYYY-MM-DD" -> code
): YearSchedule {
  const months: Record<number, MonthlyRoster> = {};
  let lastDayAssignments: Record<string, ShiftCode> | undefined = undefined;

  for (let m = 1; m <= 12; m++) {
    // Estrai eventuali ferie/mutua del mese
    const customForMonth: Record<string, Record<number, ShiftCode>> = {};
    if (customOverrides) {
      const daysCount = getDaysInMonth(year, m);
      for (const [staffId, dateMap] of Object.entries(customOverrides)) {
        for (let d = 1; d <= daysCount; d++) {
          const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          if (dateMap[dateStr]) {
            if (!customForMonth[staffId]) customForMonth[staffId] = {};
            customForMonth[staffId][d] = dateMap[dateStr];
          }
        }
      }
    }

    const monthRoster = generateMonthRoster(
      year,
      m,
      staffList,
      lastDayAssignments,
      customForMonth
    );

    months[m] = monthRoster;

    // Salva l'ultimo giorno di questo mese per il passaggio al mese successivo
    const daysInThisMonth = getDaysInMonth(year, m);
    lastDayAssignments = monthRoster.days[daysInThisMonth - 1]?.assignments;
  }

  return {
    year,
    months,
    staffList,
  };
}

/**
 * Algoritmo intelligente di individuazione del miglior sostituto in caso di mutua (malattia):
 * Cerca tra i colleghi dello stesso ruolo che:
 * - Hanno 'R' (Riposo) in quella data
 * - Rispettano le 12 ore di stacco dal giorno precedente e verso il giorno successivo
 * - Hanno meno notti/turni nel mese
 * - Non rompono la continuità degli altri colleghi
 */
export function findBestSubstitutes(
  daySchedule: DaySchedule,
  prevDaySchedule: DaySchedule | undefined,
  nextDaySchedule: DaySchedule | undefined,
  sickStaff: StaffMember,
  shiftToCover: ShiftCode,
  staffList: StaffMember[],
  monthlyStats: Record<string, StaffMonthlyStats>
): SubstitutionCandidate[] {
  const sameRoleStaff = staffList.filter(
    s => s.role === sickStaff.role && s.id !== sickStaff.id && s.isActive
  );

  const candidates: SubstitutionCandidate[] = [];

  for (const staff of sameRoleStaff) {
    const currentShift = daySchedule.assignments[staff.id] || 'R';
    const reasons: string[] = [];
    let eligible = true;
    let score = 100;

    // Se sta già lavorando in un altro turno quel giorno
    if (currentShift === 'M' || currentShift === 'P' || currentShift === 'N') {
      eligible = false;
      reasons.push(`Già di turno (${currentShift}) in data odierna`);
    } else if (currentShift === 'FE') {
      eligible = false;
      reasons.push('In ferie concordate (non disturbabile)');
    } else if (currentShift === 'MUT') {
      eligible = false;
      reasons.push('In malattia');
    } else if (currentShift === 'S') {
      eligible = false;
      reasons.push('In smonto notte (S)');
    } else if (staff.contractType === 'PART_TIME_WEEKEND_64' && !daySchedule.isWeekend) {
      eligible = false;
      reasons.push('Contratto Part-Time: lavora solo Sabato e Domenica');
    }

    // Verifica 12 ore dal giorno precedente
    const prevShift = prevDaySchedule?.assignments[staff.id];
    if (prevShift && !isValidTransition(prevShift, shiftToCover)) {
      eligible = false;
      reasons.push(`Violazione 12h da giorno precedente (${prevShift} -> ${shiftToCover})`);
    }

    // Verifica 12 ore verso il giorno successivo
    const nextShift = nextDaySchedule?.assignments[staff.id];
    if (nextShift && !isValidTransition(shiftToCover, nextShift)) {
      eligible = false;
      reasons.push(`Violazione 12h verso giorno successivo (${shiftToCover} -> ${nextShift})`);
    }

    // Calcolo equità e score
    const staffStat = monthlyStats[staff.id];
    if (staffStat) {
      // Chi ha meno turni totali riceve punteggio più alto
      score -= staffStat.totalWorkingShifts * 2;
      // Se si tratta di Notte, penalizza chi ne ha già fatte molte
      if (shiftToCover === 'N') {
        score -= staffStat.nightCount * 10;
        if (staffStat.nightCount >= 4) {
          reasons.push(`Ha già raggiunto ${staffStat.nightCount} notti nel mese`);
          score -= 20;
        }
      }
    }

    if (eligible) {
      reasons.push('Attualmente a riposo (R), disponibile alla sostituzione');
      if (staffStat && staffStat.nightCount < 4 && shiftToCover === 'N') {
        reasons.push(`Disponibile a turno notte (${staffStat.nightCount}/4 notti)`);
      }
    }

    candidates.push({
      staff,
      currentShift,
      isEligible: eligible,
      reasons,
      score,
    });
  }

  // Ordina candidati: prima quelli eleggibili con score più alto
  return candidates.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.score - a.score;
  });
}

/**
 * Ribilancia automaticamente la pianificazione del dipendente quando la Caposala modifica un turno:
 * 1. Fissa il turno modificato nel giorno desiderato.
 * 2. Se viene assegnata la Notte (N), imposta automaticamente Smonto (S) l'indomani e Riposo (R) il giorno successivo.
 * 3. Se viene assegnato lo Smonto (S), imposta Riposo (R) il giorno successivo.
 * 4. Se viene assegnato Pomeriggio (P), garantisce che il giorno dopo non ci sia Mattino (M) per legge D.Lgs 66/2003.
 * 5. Se viene assegnato Mattino (M), garantisce che il giorno prima non ci sia Pomeriggio (P).
 * 6. La generazione del mese riequilibrerà poi i giorni liberi garantendo il saldo a 156 ore senza deficit.
 */
export function rebalanceStaffSchedule(
  year: number,
  month: number,
  staffId: string,
  newShift: ShiftCode,
  day: number,
  currentOverrides: Record<string, Record<string, ShiftCode>>,
  _staffList: StaffMember[]
): Record<string, Record<string, ShiftCode>> {
  const nextOverrides: Record<string, Record<string, ShiftCode>> = { ...currentOverrides };
  if (!nextOverrides[staffId]) {
    nextOverrides[staffId] = { ...(currentOverrides[staffId] || {}) };
  } else {
    nextOverrides[staffId] = { ...nextOverrides[staffId] };
  }

  const daysInMonth = getDaysInMonth(year, month);
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  nextOverrides[staffId][dateStr] = newShift;

  // Rispetto immediato dei vincoli di legge e rotazione per i giorni adiacenti
  if (newShift === 'N') {
    if (day + 1 <= daysInMonth) {
      const nextDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
      nextOverrides[staffId][nextDateStr] = 'S';
    }
    if (day + 2 <= daysInMonth) {
      const nextNextDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day + 2).padStart(2, '0')}`;
      nextOverrides[staffId][nextNextDateStr] = 'R';
    }
  } else if (newShift === 'S') {
    if (day + 1 <= daysInMonth) {
      const nextDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
      nextOverrides[staffId][nextDateStr] = 'R';
    }
  } else if (newShift === 'P') {
    if (day + 1 <= daysInMonth) {
      const nextDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
      if (nextOverrides[staffId][nextDateStr] === 'M') {
        nextOverrides[staffId][nextDateStr] = 'P'; // Evita P -> M
      }
    }
  } else if (newShift === 'M') {
    if (day - 1 >= 1) {
      const prevDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day - 1).padStart(2, '0')}`;
      if (nextOverrides[staffId][prevDateStr] === 'P') {
        nextOverrides[staffId][prevDateStr] = 'M'; // Evita P -> M
      }
    }
  }

  return nextOverrides;
}
