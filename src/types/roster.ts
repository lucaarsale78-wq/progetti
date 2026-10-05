export type Role = 'INFERMIERE' | 'OSS' | 'CAPOSALA';

export type ShiftCode = 'M' | 'P' | 'N' | 'S' | 'R' | 'FE' | 'REC' | 'MUT';

export interface ShiftDefinition {
  code: ShiftCode;
  label: string;
  shortLabel: string;
  startTime: string;
  endTime: string;
  hours: number;
  bgColor: string;
  textColor: string;
  borderColor: string;
  isWorkingShift: boolean;
}

export const SHIFT_DEFINITIONS: Record<ShiftCode, ShiftDefinition> = {
  M: {
    code: 'M',
    label: 'Mattino',
    shortLabel: 'M',
    startTime: '06:30',
    endTime: '14:30',
    hours: 8,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    isWorkingShift: true,
  },
  P: {
    code: 'P',
    label: 'Pomeriggio',
    shortLabel: 'P',
    startTime: '14:00',
    endTime: '22:30',
    hours: 8.5,
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-300',
    isWorkingShift: true,
  },
  N: {
    code: 'N',
    label: 'Notte',
    shortLabel: 'N',
    startTime: '22:00',
    endTime: '06:30',
    hours: 8.5,
    bgColor: 'bg-indigo-900',
    textColor: 'text-indigo-100',
    borderColor: 'border-indigo-700',
    isWorkingShift: true,
  },
  S: {
    code: 'S',
    label: 'Smonto Notte',
    shortLabel: 'S',
    startTime: '-',
    endTime: '06:30',
    hours: 0,
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300',
    isWorkingShift: false,
  },
  R: {
    code: 'R',
    label: 'Riposo',
    shortLabel: 'R',
    startTime: '-',
    endTime: '-',
    hours: 0,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
    isWorkingShift: false,
  },
  FE: {
    code: 'FE',
    label: 'Ferie',
    shortLabel: 'FE',
    startTime: '-',
    endTime: '-',
    hours: 8,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    isWorkingShift: false,
  },
  REC: {
    code: 'REC',
    label: 'Recupero Ore',
    shortLabel: 'REC',
    startTime: '-',
    endTime: '-',
    hours: 0,
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-800',
    borderColor: 'border-violet-300',
    isWorkingShift: false,
  },
  MUT: {
    code: 'MUT',
    label: 'Mutua / Malattia',
    shortLabel: 'MUT',
    startTime: '-',
    endTime: '-',
    hours: 0,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-300',
    isWorkingShift: false,
  },
};

export type ContractType = 'FULL_TIME_156' | 'FULL_TIME_164' | 'PART_TIME_WEEKEND_64';

export interface StaffMember {
  id: string;
  name: string;
  role: Role;
  contractType: ContractType;
  monthlyTargetHours: number; // 156 hours standard, 64 hours part-time weekend
  isActive: boolean; // For OSS 8 who is in mutua prolungata
  isProlongedSickLeave?: boolean;
  notes?: string;
  totalAnnualVacationDays: number; // 34 days
  usedVacationDays: number;
  recuperoOreBalance: number; // in hours
}

export interface DayShiftAssignment {
  staffId: string;
  shift: ShiftCode;
  note?: string;
  isSubstituted?: boolean;
  originalStaffId?: string; // If this shift was assigned as substitute for sick staff
  customHours?: string;
}

export interface DaySchedule {
  day: number; // 1 to 31
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 4 = Thursday, 5 = Friday, 6 = Saturday
  dayName: string; // Lun, Mar, Mer, Gio, Ven, Sab, Dom
  isWeekend: boolean;
  isThursdayOrFriday: boolean;
  assignments: Record<string, ShiftCode>; // staffId -> ShiftCode
  customNotes?: Record<string, string>;
}

export interface MonthlyRoster {
  year: number;
  month: number; // 1 to 12
  monthName: string;
  days: DaySchedule[];
  stats: Record<string, StaffMonthlyStats>;
}

export interface StaffMonthlyStats {
  staffId: string;
  name: string;
  role: Role;
  contractType: ContractType;
  monthlyTargetHours: number; // 156 or 64
  totalWorkingShifts: number;
  morningCount: number;
  afternoonCount: number;
  nightCount: number; // Target ~4
  smontoCount: number; // Smonto Notte (S)
  restCount: number;
  vacationCount: number;
  recuperoOreCount: number;
  sickCount: number;
  freeWeekendsCount: number; // Saturdays + Sundays both off in month
  compliance12h: boolean;
  totalHours: number;
  hoursDelta: number; // totalHours - monthlyTargetHours
}

export interface YearSchedule {
  year: number;
  months: Record<number, MonthlyRoster>; // 1 to 12
  staffList: StaffMember[];
}

export interface SubstitutionCandidate {
  staff: StaffMember;
  currentShift: ShiftCode;
  isEligible: boolean;
  reasons: string[];
  score: number; // Higher is better
}
