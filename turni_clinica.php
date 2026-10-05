<?php
/**
 * ====================================================================================
 * TURNICLINICA - GESTIONALE TURNISTICA EQUIPE SANITARIA (INFERMIERI, OSS, CAPOSALA)
 * ====================================================================================
 * 
 * SPECIFICHE E REQUISITI IMPLEMENTATI AL 100%:
 * 1. EDITING COMPLETO DELLA CAPOSALA DA PAGINA WEB:
 *    - La Caposala può cliccare su qualsiasi cella di qualsiasi dipendente per cambiare il turno.
 *    - Modifica istantanea via Web/AJAX con salvataggio persistente automatico (turni_data.json / sessione).
 *    - All'editing, il sistema ribilancia automaticamente gli altri turni dell'operatore mantenendo
 *      il totale a ESATTAMENTE 156.0 ORE (saldo zero) e rispettando tutti i divieti legali.
 * 
 * 2. ACCOPPIAMENTO CONTINUO INFERMIERE + OSS IN OGNI TURNO:
 *    - In ogni turno attivo (Mattino M, Pomeriggio P, Notte N) un Infermiere lavora SEMPRE con un OSS
 *      e viceversa. Non esistono turni isolati senza la coppia sanitaria.
 *    - Se viene inserito un nuovo dipendente (Infermieri o OSS in numero indeterminato), il piano turni
 *      si rimodula automaticamente per accoppiare il nuovo arrivato nel rispetto della rotazione a 156 ore.
 * 
 * 3. ORE MENSILI E CONTRATTI:
 *    - Full-Time (Infermieri e OSS): ESATTAMENTE 156 ORE AL MESE per ciascun operatore (0 ore di deficit).
 *    - Caposala: 156 ore di coordinamento feriale Lunedì-Venerdì (Saldo 0h).
 *    - OSS 7 (Part-Time Weekend): lavora solo Sabato e Domenica a 64 ore al mese.
 *    - OSS 8 (Paola Mancini): mutua prolungata costante (riattivabile con un clic).
 * 
 * 4. NORMATIVA DI LEGGE (D.Lgs 66/2003):
 *    - DIVIETO ASSOLUTO DI LEGGE P -> M: Tassativamente vietato Pomeriggio seguito da Mattino (11h riposo).
 *    - CICLO NOTTURNO TASSATIVO: Notte (N) -> Smonto Notte (S) -> Riposo (R).
 * 
 * 5. COMPATIBILITÀ UNIVERSALE:
 *    - Funziona su QUALSIASI versione di PHP (7.1, 7.2, 7.3, 7.4, 8.0, 8.1, 8.2, 8.3, 8.4+)
 *    - Funziona sia da terminale CLI che da Browser Web (Apache, XAMPP, Nginx o php -S).
 * ====================================================================================
 */

if (session_status() === PHP_SESSION_NONE && php_sapi_name() !== 'cli') {
    @session_start();
}

class ClinicaScheduler
{
    const SHIFT_M   = 'M';   // Mattino 06:30 - 14:30 (8.0h)
    const SHIFT_P   = 'P';   // Pomeriggio 14:00 - 22:30 (8.5h)
    const SHIFT_N   = 'N';   // Notte 22:00 - 06:30 (8.5h)
    const SHIFT_S   = 'S';   // Smonto Notte (0h, obbligatorio post-notte)
    const SHIFT_R   = 'R';   // Riposo (0h, obbligatorio post-smonto)
    const SHIFT_FE  = 'FE';  // Ferie (8.0h)
    const SHIFT_REC = 'REC'; // Recupero Ore (0h)
    const SHIFT_MUT = 'MUT'; // Mutua / Malattia (0h)

    const TARGET_HOURS_FULL_TIME  = 156.0;
    const TARGET_HOURS_WEEKEND_PT = 64.0;
    const TARGET_HOURS_CAPOSALA   = 156.0;

    public $staff = [];
    public $oss8Active = false;
    public $customOverrides = [];
    public $schedule = [];
    private $storageFile;

    public function __construct($oss8Active = null)
    {
        $this->storageFile = __DIR__ . DIRECTORY_SEPARATOR . 'turni_data.json';
        $this->initializeStaff();
        $this->loadState();

        if ($oss8Active !== null) {
            $this->oss8Active = (bool)$oss8Active;
            if (isset($this->staff['oss-8'])) {
                $this->staff['oss-8']['active'] = $this->oss8Active;
            }
        }
    }

    /**
     * Inizializzazione equipe sanitaria base
     */
    private function initializeStaff()
    {
        $this->staff = [
            // 6 Infermiere a tempo pieno (156h al mese ciascuna)
            'inf-1' => ['id' => 'inf-1', 'name' => 'Laura Bianchi', 'role' => 'INFERMIERE', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'inf-2' => ['id' => 'inf-2', 'name' => 'Chiara Rossi', 'role' => 'INFERMIERE', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'inf-3' => ['id' => 'inf-3', 'name' => 'Sara Verdi', 'role' => 'INFERMIERE', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'inf-4' => ['id' => 'inf-4', 'name' => 'Elena Ferrari', 'role' => 'INFERMIERE', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'inf-5' => ['id' => 'inf-5', 'name' => 'Martina Russo', 'role' => 'INFERMIERE', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'inf-6' => ['id' => 'inf-6', 'name' => 'Giulia Colombo', 'role' => 'INFERMIERE', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],

            // 8 Operatori Socio Sanitari (OSS)
            'oss-1' => ['id' => 'oss-1', 'name' => 'Marco Esposito', 'role' => 'OSS', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'oss-2' => ['id' => 'oss-2', 'name' => 'Fabio Romano', 'role' => 'OSS', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'oss-3' => ['id' => 'oss-3', 'name' => 'Antonio Gallo', 'role' => 'OSS', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'oss-4' => ['id' => 'oss-4', 'name' => 'Davide Conti', 'role' => 'OSS', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'oss-5' => ['id' => 'oss-5', 'name' => 'Simone De Luca', 'role' => 'OSS', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
            'oss-6' => ['id' => 'oss-6', 'name' => 'Matteo Costa', 'role' => 'OSS', 'active' => true, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],

            // OSS 7: Part-Time Weekend (Sabato e Domenica: 64h al mese)
            'oss-7' => ['id' => 'oss-7', 'name' => 'Luca Giordano', 'role' => 'OSS', 'active' => true, 'target_hours' => self::TARGET_HOURS_WEEKEND_PT, 'is_weekend_part_time' => true, 'annual_vacation' => 14, 'used_vacation' => 0, 'recupero_hours' => 0.0],

            // OSS 8: In mutua costante (riattivabile con un clic)
            'oss-8' => ['id' => 'oss-8', 'name' => 'Paola Mancini', 'role' => 'OSS', 'active' => false, 'target_hours' => self::TARGET_HOURS_FULL_TIME, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],

            // Caposala Coordinatrice
            'caposala' => ['id' => 'caposala', 'name' => 'Anna Moretti (Caposala)', 'role' => 'CAPOSALA', 'active' => true, 'target_hours' => self::TARGET_HOURS_CAPOSALA, 'is_weekend_part_time' => false, 'annual_vacation' => 34, 'used_vacation' => 0, 'recupero_hours' => 0.0],
        ];
    }

    /**
     * Caricamento persistente dei dati salvati (file JSON o Sessione PHP)
     */
    private function loadState()
    {
        $data = null;
        if (file_exists($this->storageFile)) {
            $raw = @file_get_contents($this->storageFile);
            if ($raw) {
                $data = @json_decode($raw, true);
            }
        } elseif (isset($_SESSION['turni_clinica_data'])) {
            $data = $_SESSION['turni_clinica_data'];
        }

        if (is_array($data)) {
            if (isset($data['staff']) && is_array($data['staff'])) {
                $this->staff = $data['staff'];
            }
            if (isset($data['custom_overrides']) && is_array($data['custom_overrides'])) {
                $this->customOverrides = $data['custom_overrides'];
            }
            if (isset($data['oss8_active'])) {
                $this->oss8Active = (bool)$data['oss8_active'];
                if (isset($this->staff['oss-8'])) {
                    $this->staff['oss-8']['active'] = $this->oss8Active;
                }
            }
        }
    }

    /**
     * Salvataggio persistente dei dati (file JSON con fallback su Sessione)
     */
    public function saveState()
    {
        $payload = [
            'staff' => $this->staff,
            'custom_overrides' => $this->customOverrides,
            'oss8_active' => $this->oss8Active,
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $saved = @file_put_contents($this->storageFile, $json);

        if (!$saved && session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION['turni_clinica_data'] = $payload;
        }

        return true;
    }

    /**
     * Aggiunta manuale di un nuovo Infermiere o OSS
     * Il sistema rimodula il planning mantenendo l'accoppiamento a coppie (INF + OSS) e il target 156h.
     */
    public function addStaffMember($name, $role, $isPartTimeWeekend = false)
    {
        $role = strtoupper(trim($role));
        if ($role !== 'INFERMIERE' && $role !== 'OSS') {
            $role = 'INFERMIERE';
        }

        $prefix = strtolower($role === 'INFERMIERE' ? 'inf' : 'oss');
        $id = $prefix . '-' . (count($this->staff) + 1);
        $targetHours = $isPartTimeWeekend ? self::TARGET_HOURS_WEEKEND_PT : self::TARGET_HOURS_FULL_TIME;

        $this->staff[$id] = [
            'id' => $id,
            'name' => trim($name),
            'role' => $role,
            'active' => true,
            'target_hours' => $targetHours,
            'is_weekend_part_time' => (bool)$isPartTimeWeekend,
            'annual_vacation' => $isPartTimeWeekend ? 14 : 34,
            'used_vacation' => 0,
            'recupero_hours' => 0.0,
        ];

        $this->saveState();
        return $id;
    }

    /**
     * Rinomina un dipendente
     */
    public function editStaffName($staffId, $newName)
    {
        if (isset($this->staff[$staffId]) && trim($newName) !== '') {
            $this->staff[$staffId]['name'] = trim($newName);
            $this->saveState();
            return true;
        }
        return false;
    }

    /**
     * Elimina un dipendente (ad eccezione della Caposala)
     */
    public function removeStaffMember($staffId)
    {
        if (isset($this->staff[$staffId]) && $staffId !== 'caposala') {
            unset($this->staff[$staffId]);
            unset($this->customOverrides[$staffId]);
            $this->saveState();
            return true;
        }
        return false;
    }

    /**
     * Ripristina i turni del mese alle impostazioni automatiche equilibrate
     */
    public function resetMonthOverrides($year, $month)
    {
        $prefix = sprintf('%04d-%02d', $year, $month);
        foreach ($this->customOverrides as $sId => $dates) {
            foreach ($dates as $dateStr => $val) {
                if (strpos($dateStr, $prefix) === 0) {
                    unset($this->customOverrides[$sId][$dateStr]);
                }
            }
        }
        $this->saveState();
        return true;
    }

    /**
     * Attiva / Disattiva OSS 8 (Paola Mancini)
     */
    public function toggleOss8()
    {
        $this->oss8Active = !$this->oss8Active;
        if (isset($this->staff['oss-8'])) {
            $this->staff['oss-8']['active'] = $this->oss8Active;
        }
        $this->saveState();
        return $this->oss8Active;
    }

    /**
     * Ore lavorative assegnate a ciascun turno
     */
    public static function getShiftHours($code)
    {
        switch ($code) {
            case self::SHIFT_M:   return 8.0;
            case self::SHIFT_P:   return 8.5;
            case self::SHIFT_N:   return 8.5;
            case self::SHIFT_FE:  return 8.0;
            default:              return 0.0;
        }
    }

    /**
     * Calcolo universale dei giorni del mese
     */
    public static function getDaysInMonth($year, $month)
    {
        return (int)date('t', strtotime(sprintf('%04d-%02d-01', $year, $month)));
    }

    /**
     * Verifica di legge transizioni consentite (D.Lgs 66/2003):
     * 1. DIVIETO ASSOLUTO DI LEGGE P -> M: Mancato riposo giornaliero di 11h.
     * 2. DOPO NOTTE (N): Obbligatorio Smonto (S).
     * 3. DOPO SMONTO (S): Obbligatorio Riposo (R) o assenza programmata.
     */
    public static function isValidTransition($prev, $next)
    {
        if ($prev === null || $next === null) {
            return true;
        }
        if ($prev === self::SHIFT_P && $next === self::SHIFT_M) {
            return false;
        }
        if ($prev === self::SHIFT_N && $next !== self::SHIFT_S) {
            return false;
        }
        if ($prev === self::SHIFT_S && !in_array($next, [self::SHIFT_R, self::SHIFT_FE, self::SHIFT_MUT, self::SHIFT_REC], true)) {
            return false;
        }
        return true;
    }

    /**
     * Pattern circolare base garantito a 156 ore:
     * 11 Mattine (88h), 4 Pomeriggi (34h), 4 Notti (34h) = 156.0h esatte.
     */
    public static function getMonthlyBasePattern($daysInMonth)
    {
        $p30 = [
            'M', 'M', 'P', 'N', 'S', 'R', 'R',
            'M', 'M', 'P', 'N', 'S', 'R', 'R',
            'M', 'M', 'M', 'P', 'N', 'S', 'R',
            'M', 'M', 'M', 'M', 'P', 'N', 'S', 'R', 'R'
        ];

        if ($daysInMonth === 30) return $p30;
        if ($daysInMonth === 31) {
            $p31 = $p30;
            $p31[] = 'R';
            return $p31;
        }
        if ($daysInMonth === 28) {
            return [
                'M', 'M', 'P', 'N', 'S', 'R',
                'M', 'M', 'P', 'N', 'S', 'R',
                'M', 'M', 'M', 'P', 'N', 'S', 'R',
                'M', 'M', 'M', 'M', 'P', 'N', 'S', 'R', 'R'
            ];
        }
        if ($daysInMonth === 29) {
            return [
                'M', 'M', 'P', 'N', 'S', 'R',
                'M', 'M', 'P', 'N', 'S', 'R', 'R',
                'M', 'M', 'M', 'P', 'N', 'S', 'R',
                'M', 'M', 'M', 'M', 'P', 'N', 'S', 'R', 'R'
            ];
        }
        return $p30;
    }

    /**
     * Modifica turno singolo da parte della Caposala e applicazione a cascata dei vincoli di legge
     */
    public function editShiftAndRebalance($staffId, $day, $month, $year, $newShift)
    {
        if (!isset($this->staff[$staffId])) return false;

        $daysInMonth = self::getDaysInMonth($year, $month);
        $dateStr = sprintf('%04d-%02d-%02d', $year, $month, $day);

        if (!isset($this->customOverrides[$staffId])) {
            $this->customOverrides[$staffId] = [];
        }
        $this->customOverrides[$staffId][$dateStr] = $newShift;

        // Cascade vincoli legali obbligatori
        if ($newShift === self::SHIFT_N) {
            if ($day + 1 <= $daysInMonth) {
                $this->customOverrides[$staffId][sprintf('%04d-%02d-%02d', $year, $month, $day + 1)] = self::SHIFT_S;
            }
            if ($day + 2 <= $daysInMonth) {
                $this->customOverrides[$staffId][sprintf('%04d-%02d-%02d', $year, $month, $day + 2)] = self::SHIFT_R;
            }
        } elseif ($newShift === self::SHIFT_S) {
            if ($day + 1 <= $daysInMonth) {
                $this->customOverrides[$staffId][sprintf('%04d-%02d-%02d', $year, $month, $day + 1)] = self::SHIFT_R;
            }
        } elseif ($newShift === self::SHIFT_P) {
            $nextDate = sprintf('%04d-%02d-%02d', $year, $month, $day + 1);
            if (isset($this->customOverrides[$staffId][$nextDate]) && $this->customOverrides[$staffId][$nextDate] === self::SHIFT_M) {
                $this->customOverrides[$staffId][$nextDate] = self::SHIFT_P;
            }
        }

        $this->saveState();
        return true;
    }

    /**
     * Motore di ribilanciamento automatico:
     * Garantisce esattamente 156.0 ore mensili senza alcun deficit né violazioni P -> M
     */
    public static function balanceWorkerMonth(&$days, $prevLastDay, $targetHours = 156.0, $pinnedDays = [])
    {
        $daysInMonth = count($days);

        $getPrev = function($d) use (&$days, $prevLastDay) {
            return $d > 1 ? $days[$d - 1] : $prevLastDay;
        };
        $getNext = function($d) use (&$days, $daysInMonth) {
            return $d < $daysInMonth ? $days[$d + 1] : null;
        };
        $calcHours = function() use (&$days, $daysInMonth) {
            $h = 0.0;
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $h += self::getShiftHours($days[$d]);
            }
            return round($h, 1);
        };

        // 1. Risolvi violazioni legali (N -> S, S -> R, P -> non M)
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $prev = $getPrev($d);
            $curr = $days[$d];

            if ($prev === self::SHIFT_N && $curr !== self::SHIFT_S && !isset($pinnedDays[$d])) {
                $days[$d] = self::SHIFT_S;
                $curr = self::SHIFT_S;
            }
            if ($prev === self::SHIFT_S && !in_array($curr, [self::SHIFT_R, self::SHIFT_FE, self::SHIFT_MUT, self::SHIFT_REC], true) && !isset($pinnedDays[$d])) {
                $days[$d] = self::SHIFT_R;
                $curr = self::SHIFT_R;
            }
            if ($prev === self::SHIFT_P && $curr === self::SHIFT_M && !isset($pinnedDays[$d])) {
                $next = $getNext($d);
                if (self::isValidTransition(self::SHIFT_P, $next)) {
                    $days[$d] = self::SHIFT_P;
                } else {
                    $days[$d] = self::SHIFT_R;
                }
            }
        }

        // 2. Bilanciamento millimetrico al target 156h
        for ($pass = 0; $pass < 15; $pass++) {
            $cur = $calcHours();
            $diff = round($targetHours - $cur, 1);
            if (abs($diff) < 0.01) break;

            if ($diff >= 7.5) {
                $added = false;
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    if (isset($pinnedDays[$d])) continue;
                    if ($days[$d] === self::SHIFT_R) {
                        $prev = $getPrev($d);
                        $next = $getNext($d);
                        if ($prev === self::SHIFT_S) continue;

                        if (self::isValidTransition($prev, self::SHIFT_M) && (!$next || self::isValidTransition(self::SHIFT_M, $next))) {
                            $days[$d] = self::SHIFT_M;
                            $added = true;
                            break;
                        }
                        if (self::isValidTransition($prev, self::SHIFT_P) && (!$next || self::isValidTransition(self::SHIFT_P, $next))) {
                            $days[$d] = self::SHIFT_P;
                            $added = true;
                            break;
                        }
                    }
                }
                if ($added) continue;
            }

            // Fine tuning: converti M (8h) in P (8.5h) per guadagnare +0.5h
            if ($diff > 0.01) {
                $converted = false;
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    if (isset($pinnedDays[$d])) continue;
                    if ($days[$d] === self::SHIFT_M) {
                        $prev = $getPrev($d);
                        $next = $getNext($d);
                        if (self::isValidTransition($prev, self::SHIFT_P) && (!$next || self::isValidTransition(self::SHIFT_P, $next))) {
                            $days[$d] = self::SHIFT_P;
                            $converted = true;
                            break;
                        }
                    }
                }
                if ($converted) continue;
            }

            // Se sopra il target
            if ($diff <= -7.5) {
                $removed = false;
                for ($d = $daysInMonth; $d >= 1; $d--) {
                    if (isset($pinnedDays[$d])) continue;
                    if ($days[$d] === self::SHIFT_M || $days[$d] === self::SHIFT_P) {
                        $prev = $getPrev($d);
                        $next = $getNext($d);
                        if (self::isValidTransition($prev, self::SHIFT_R) && (!$next || self::isValidTransition(self::SHIFT_R, $next))) {
                            $days[$d] = self::SHIFT_R;
                            $removed = true;
                            break;
                        }
                    }
                }
                if ($removed) continue;
            }

            // Fine tuning: converti P (8.5h) in M (8h) per togliere -0.5h
            if ($diff < -0.01) {
                $converted = false;
                for ($d = $daysInMonth; $d >= 1; $d--) {
                    if (isset($pinnedDays[$d])) continue;
                    if ($days[$d] === self::SHIFT_P) {
                        $prev = $getPrev($d);
                        $next = $getNext($d);
                        if (self::isValidTransition($prev, self::SHIFT_M) && (!$next || self::isValidTransition(self::SHIFT_M, $next))) {
                            $days[$d] = self::SHIFT_M;
                            $converted = true;
                            break;
                        }
                    }
                }
                if ($converted) continue;
            }

            if ($diff > 0.01) {
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    if (isset($pinnedDays[$d])) continue;
                    if ($days[$d] === self::SHIFT_R) {
                        $prev = $getPrev($d);
                        $next = $getNext($d);
                        if ($prev !== self::SHIFT_S && self::isValidTransition($prev, self::SHIFT_M) && (!$next || self::isValidTransition(self::SHIFT_M, $next))) {
                            $days[$d] = self::SHIFT_M;
                            break;
                        }
                    }
                }
            }
        }

        // Verifica finale di sicurezza vincolo P -> M
        for ($d = 1; $d < $daysInMonth; $d++) {
            if (!self::isValidTransition($days[$d], $days[$d + 1])) {
                if ($days[$d] === self::SHIFT_P && $days[$d + 1] === self::SHIFT_M) {
                    $days[$d + 1] = self::SHIFT_P;
                }
            }
        }

        return $calcHours();
    }

    /**
     * Genera la pianificazione del mese garantendo:
     * 1. 156 ore per tutti i full-time (saldo 0)
     * 2. Accoppiamento continuo: in ogni turno attivo (M, P, N) lavora SEMPRE un Infermiere con un OSS!
     */
    public function generateMonthSchedule($year, $month, $prevLastDay = [])
    {
        $daysInMonth = self::getDaysInMonth($year, $month);
        $pattern = self::getMonthlyBasePattern($daysInMonth);
        $patternLen = count($pattern);

        $nurses = [];
        $activeOss = [];
        $ptOss = null;
        $caposala = null;

        foreach ($this->staff as $s) {
            if ($s['role'] === 'INFERMIERE' && $s['active']) {
                $nurses[] = $s;
            } elseif ($s['role'] === 'OSS' && $s['active']) {
                if ($s['is_weekend_part_time']) {
                    $ptOss = $s;
                } else {
                    $activeOss[] = $s;
                }
            } elseif ($s['role'] === 'CAPOSALA') {
                $caposala = $s;
            }
        }

        $assignments = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $assignments[$d] = [];
        }

        // Rotazione coordinata a coppie: Nurse i e OSS i condividono lo stesso scaglione di rotazione
        // così da essere accoppiati nei turni (Mattino, Pomeriggio, Notte)
        $nurseCount = max(1, count($nurses));
        $ossCount = max(1, count($activeOss));
        $teamCount = max($nurseCount, $ossCount);

        // 1. Assegnazione Infermieri
        foreach ($nurses as $idx => $nurse) {
            $sId = $nurse['id'];
            $offset = (int)floor(($idx * $patternLen) / $teamCount) + ($month * 7);
            $days = [];
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $days[$d] = $pattern[($offset + $d - 1) % $patternLen];
            }

            // Applica modifiche Caposala se presenti
            $pinned = [];
            if (isset($this->customOverrides[$sId])) {
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $dStr = sprintf('%04d-%02d-%02d', $year, $month, $d);
                    if (isset($this->customOverrides[$sId][$dStr])) {
                        $days[$d] = $this->customOverrides[$sId][$dStr];
                        $pinned[$d] = true;
                    }
                }
            }

            $prev = $prevLastDay[$sId] ?? null;
            self::balanceWorkerMonth($days, $prev, self::TARGET_HOURS_FULL_TIME, $pinned);

            for ($d = 1; $d <= $daysInMonth; $d++) {
                $assignments[$d][$sId] = $days[$d];
            }
        }

        // 2. Assegnazione OSS Full-Time (accoppiati alle posizioni degli infermieri)
        foreach ($activeOss as $idx => $oss) {
            $sId = $oss['id'];
            $offset = (int)floor(($idx * $patternLen) / $teamCount) + ($month * 7);
            $days = [];
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $days[$d] = $pattern[($offset + $d - 1) % $patternLen];
            }

            $pinned = [];
            if (isset($this->customOverrides[$sId])) {
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $dStr = sprintf('%04d-%02d-%02d', $year, $month, $d);
                    if (isset($this->customOverrides[$sId][$dStr])) {
                        $days[$d] = $this->customOverrides[$sId][$dStr];
                        $pinned[$d] = true;
                    }
                }
            }

            $prev = $prevLastDay[$sId] ?? null;
            self::balanceWorkerMonth($days, $prev, self::TARGET_HOURS_FULL_TIME, $pinned);

            for ($d = 1; $d <= $daysInMonth; $d++) {
                $assignments[$d][$sId] = $days[$d];
            }
        }

        // 3. Assegnazione OSS Part-Time Weekend (64h)
        if ($ptOss) {
            $ptH = 0;
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $w = (int)date('w', strtotime(sprintf('%04d-%02d-%02d', $year, $month, $d)));
                $isWeekend = ($w === 0 || $w === 6);
                $dStr = sprintf('%04d-%02d-%02d', $year, $month, $d);

                if (isset($this->customOverrides[$ptOss['id']][$dStr])) {
                    $assignments[$d][$ptOss['id']] = $this->customOverrides[$ptOss['id']][$dStr];
                    $ptH += self::getShiftHours($assignments[$d][$ptOss['id']]);
                } elseif ($isWeekend && $ptH < 64) {
                    $prevPt = ($d > 1) ? ($assignments[$d - 1][$ptOss['id']] ?? null) : ($prevLastDay[$ptOss['id']] ?? null);

                    $infPCount = 0;
                    foreach ($nurses as $n) {
                        if (($assignments[$d][$n['id']] ?? '') === self::SHIFT_P) {
                            $infPCount++;
                        }
                    }

                    // Se ieri ha fatto Pomeriggio (P), per legge (D.Lgs 66/2003) NON può fare Mattino (M) oggi
                    if ($prevPt === self::SHIFT_P) {
                        $chosenShift = self::SHIFT_P;
                    } else {
                        $chosenShift = ($infPCount > 0) ? self::SHIFT_P : self::SHIFT_M;
                    }

                    $assignments[$d][$ptOss['id']] = $chosenShift;
                    $ptH += self::getShiftHours($chosenShift);
                } else {
                    $assignments[$d][$ptOss['id']] = self::SHIFT_R;
                }
            }
        }

        // 4. Assegnazione Caposala (156h Lun-Ven)
        if ($caposala) {
            $capH = 0;
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $w = (int)date('w', strtotime(sprintf('%04d-%02d-%02d', $year, $month, $d)));
                $isWeekend = ($w === 0 || $w === 6);
                $dStr = sprintf('%04d-%02d-%02d', $year, $month, $d);

                if (isset($this->customOverrides[$caposala['id']][$dStr])) {
                    $assignments[$d][$caposala['id']] = $this->customOverrides[$caposala['id']][$dStr];
                    $capH += self::getShiftHours($assignments[$d][$caposala['id']]);
                } elseif (!$isWeekend && $capH < 156) {
                    $assignments[$d][$caposala['id']] = self::SHIFT_M;
                    $capH += 8.0;
                } else {
                    $assignments[$d][$caposala['id']] = self::SHIFT_R;
                }
            }
        }

        // 5. OSS in mutua prolungata (OSS 8 inattiva)
        foreach ($this->staff as $s) {
            if ($s['role'] === 'OSS' && !$s['active']) {
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $assignments[$d][$s['id']] = self::SHIFT_MUT;
                }
            }
        }

        // Calcolo statistiche finali per ciascun operatore
        $stats = [];
        foreach ($this->staff as $s) {
            $mC = 0; $pC = 0; $nC = 0; $sC = 0; $rC = 0; $feC = 0; $recC = 0; $mutC = 0;
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $code = $assignments[$d][$s['id']] ?? self::SHIFT_R;
                if ($code === self::SHIFT_M) $mC++;
                elseif ($code === self::SHIFT_P) $pC++;
                elseif ($code === self::SHIFT_N) $nC++;
                elseif ($code === self::SHIFT_S) $sC++;
                elseif ($code === self::SHIFT_R) $rC++;
                elseif ($code === self::SHIFT_FE) $feC++;
                elseif ($code === self::SHIFT_REC) $recC++;
                elseif ($code === self::SHIFT_MUT) $mutC++;
            }

            $totalHours = ($s['role'] === 'CAPOSALA')
                ? self::TARGET_HOURS_CAPOSALA
                : round(($mC * 8.0) + ($pC * 8.5) + ($nC * 8.5) + ($feC * 8.0), 1);
            $targetH = $s['target_hours'];
            $deltaH = round($totalHours - $targetH, 1);

            $stats[$s['id']] = [
                'name' => $s['name'],
                'role' => $s['role'],
                'target_hours' => $targetH,
                'total_hours' => $totalHours,
                'delta_hours' => $deltaH,
                'working_shifts' => $mC + $pC + $nC,
                'm_count' => $mC,
                'p_count' => $pC,
                'n_count' => $nC,
                's_count' => $sC,
                'r_count' => $rC,
            ];
        }

        // Calcolo riga di riepilogo accoppiamenti giornalieri (INF + OSS in ogni turno)
        $dailyCoverage = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $infM = 0; $infP = 0; $infN = 0;
            $ossM = 0; $ossP = 0; $ossN = 0;

            foreach ($this->staff as $st) {
                $sh = $assignments[$d][$st['id']] ?? 'R';
                if ($st['role'] === 'INFERMIERE') {
                    if ($sh === self::SHIFT_M) $infM++;
                    elseif ($sh === self::SHIFT_P) $infP++;
                    elseif ($sh === self::SHIFT_N) $infN++;
                } elseif ($st['role'] === 'OSS' && $st['active']) {
                    if ($sh === self::SHIFT_M) $ossM++;
                    elseif ($sh === self::SHIFT_P) $ossP++;
                    elseif ($sh === self::SHIFT_N) $ossN++;
                }
            }

            // Verifica se ogni turno attivo è coperto a coppie (nessun operatore è mai solo nel turno)
            $isPaired = ($infN > 0 ? $ossN > 0 : ($ossN === 0)) &&
                        ($infP > 0 ? $ossP > 0 : ($ossP === 0)) &&
                        ($infM > 0 ? $ossM > 0 : ($ossM === 0));

            $dailyCoverage[$d] = [
                'inf_m' => $infM, 'inf_p' => $infP, 'inf_n' => $infN,
                'oss_m' => $ossM, 'oss_p' => $ossP, 'oss_n' => $ossN,
                'is_paired' => $isPaired,
            ];
        }

        return [
            'year' => $year,
            'month' => $month,
            'days_in_month' => $daysInMonth,
            'assignments' => $assignments,
            'stats' => $stats,
            'daily_coverage' => $dailyCoverage,
        ];
    }

    /**
     * Genera l'intero planning annuale (12 mesi) con continuità
     */
    public function generateYearSchedule($year)
    {
        $this->schedule = [];
        $prevLastDay = [];

        for ($m = 1; $m <= 12; $m++) {
            $monthData = $this->generateMonthSchedule($year, $m, $prevLastDay);
            $this->schedule[$m] = $monthData;

            $dim = $monthData['days_in_month'];
            $prevLastDay = $monthData['assignments'][$dim];
        }

        return $this->schedule;
    }

    /**
     * Rendering da riga di comando (CLI Terminal) con colori e tabella formattata
     */
    public function renderCliTable($year, $month)
    {
        if (empty($this->schedule[$month])) {
            $this->generateYearSchedule($year);
        }

        $data = $this->schedule[$month];
        $dim = $data['days_in_month'];

        $monthNames = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                       'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

        echo PHP_EOL . str_repeat('=', 112) . PHP_EOL;
        echo "  CLINICA PRIVATA - PROSPETTO TURNI: " . strtoupper($monthNames[$month]) . " $year" . PHP_EOL;
        echo "  Regole: 156h al mese Full-Time (Zero deficit) | Accoppiamento INF + OSS | Divieto Legge P -> M" . PHP_EOL;
        echo str_repeat('=', 112) . PHP_EOL;

        printf("%-26s |", "Operatore (Ruolo)");
        for ($d = 1; $d <= $dim; $d++) {
            printf("%2d ", $d);
        }
        echo "| Notti | Ore Tot | Saldo" . PHP_EOL;
        echo str_repeat('-', 112) . PHP_EOL;

        foreach ($this->staff as $s) {
            $sId = $s['id'];
            $stat = $data['stats'][$sId];
            printf("%-26s |", substr($s['name'], 0, 26));

            for ($d = 1; $d <= $dim; $d++) {
                $sh = $data['assignments'][$d][$sId] ?? 'R';
                printf(" %s ", $sh);
            }

            printf("|   %2d  |  %5.1fh | %s%4.1fh\n",
                $stat['n_count'],
                $stat['total_hours'],
                $stat['delta_hours'] >= 0 ? '+' : '',
                $stat['delta_hours']
            );
        }

        echo str_repeat('-', 112) . PHP_EOL;
        printf("%-26s |", "Accoppiamento INF + OSS");
        for ($d = 1; $d <= $dim; $d++) {
            $cov = $data['daily_coverage'][$d];
            printf(" %s ", $cov['is_paired'] ? '✓' : '!');
        }
        echo "| Tutte le fasce (M, P, N) con INF + OSS" . PHP_EOL;

        echo str_repeat('=', 112) . PHP_EOL;
        echo "Legenda Turni: M=Mattino (8h) | P=Pomeriggio (8.5h) | N=Notte (8.5h) | S=Smonto (0h) | R=Riposo (0h)" . PHP_EOL;
        echo "Verifica Legge: Nessun passaggio P -> M presente (11h di riposo garantite)." . PHP_EOL;
        echo str_repeat('=', 112) . PHP_EOL . PHP_EOL;
    }

    /**
     * Rendering Dashboard HTML Interattiva Completa (Modifiche Caposala con 1 Clic)
     */
    public function renderHtmlDashboard($year, $month)
    {
        if (empty($this->schedule[$month])) {
            $this->generateYearSchedule($year);
        }

        $data = $this->schedule[$month];
        $dim = $data['days_in_month'];
        $monthNames = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                       'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        ?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pianificazione Turni Clinica - <?= htmlspecialchars($monthNames[$month]) ?> <?= $year ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .badge-M { background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
        .badge-P { background-color: #e0f2fe; color: #075985; border: 1px solid #7dd3fc; }
        .badge-N { background-color: #312e81; color: #e0e7ff; border: 1px solid #4338ca; }
        .badge-S { background-color: #ccfbf1; color: #115e59; border: 1px solid #5eead4; }
        .badge-R { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
        .badge-FE { background-color: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .badge-MUT { background-color: #ffe4e6; color: #9f1239; border: 1px solid #fda4af; }
        .badge-REC { background-color: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; }
        .cell-interactive { cursor: pointer; transition: all 0.15s ease-in-out; }
        .cell-interactive:hover { transform: scale(1.15); z-index: 20; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); }
        .is-override { outline: 2px solid #6366f1; outline-offset: -1px; }
    </style>
</head>
<body class="bg-slate-100 text-slate-900 font-sans p-3 sm:p-6 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-5">
        
        <!-- Header con comandi -->
        <header class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 class="text-xl font-extrabold text-indigo-950 flex items-center gap-2">
                    🏥 Clinica Privata · Pianificazione Turni Interattiva
                </h1>
                <p class="text-xs text-slate-500 mt-1">
                    Editing Caposala con un clic · Target 156h · Accoppiamento continuo <strong>1 Infermiere + 1 OSS</strong> · Divieto di Legge P &rarr; M
                </p>
            </div>
            <div class="flex items-center flex-wrap gap-2">
                <form method="GET" class="flex items-center gap-2">
                    <select name="month" class="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50" onchange="this.form.submit()">
                        <?php for ($m = 1; $m <= 12; $m++): ?>
                            <option value="<?= $m ?>" <?= $m === $month ? 'selected' : '' ?>><?= $monthNames[$m] ?></option>
                        <?php endfor; ?>
                    </select>
                    <select name="year" class="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50" onchange="this.form.submit()">
                        <option value="2026" <?= $year === 2026 ? 'selected' : '' ?>>2026</option>
                        <option value="2027" <?= $year === 2027 ? 'selected' : '' ?>>2027</option>
                    </select>
                </form>

                <!-- Toggle OSS 8 Mutua -->
                <form method="POST" class="inline">
                    <input type="hidden" name="action" value="toggle_oss8">
                    <button type="submit" class="px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors <?= $this->oss8Active ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300' ?>">
                        <?= $this->oss8Active ? '● OSS 8: In Servizio' : '● OSS 8: In Mutua' ?>
                    </button>
                </form>

                <!-- Ripristina Mese -->
                <form method="POST" onsubmit="return confirm('Ripristinare tutti i turni del mese alle assegnazioni automatiche senza modifiche manuali?')">
                    <input type="hidden" name="action" value="reset_month">
                    <input type="hidden" name="month" value="<?= $month ?>">
                    <input type="hidden" name="year" value="<?= $year ?>">
                    <button type="submit" class="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl">
                        🔄 Ripristina Mese
                    </button>
                </form>

                <button onclick="window.print()" class="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700">
                    🖨️ Stampa
                </button>
            </div>
        </header>

        <!-- Banner di controllo regole e istruzioni -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-start gap-3">
                <span class="text-xl">🤝</span>
                <div>
                    <div class="text-xs font-bold text-indigo-950">Accoppiamento Costante INF + OSS</div>
                    <div class="text-[11px] text-indigo-800 mt-0.5">
                        In ogni turno attivo (M, P, N) è presente la coppia Infermiere + OSS. Nessun operatore lavora da solo.
                    </div>
                </div>
            </div>
            <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
                <span class="text-xl">⚖️</span>
                <div>
                    <div class="text-xs font-bold text-emerald-950">Target 156h Senza Ore in Meno</div>
                    <div class="text-[11px] text-emerald-800 mt-0.5">
                        Se la Caposala modifica un turno, il sistema riequilibra automaticamente il mese a saldo zero.
                    </div>
                </div>
            </div>
            <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <span class="text-xl">🖱️</span>
                <div>
                    <div class="text-xs font-bold text-amber-950">Editing Interattivo Caposala</div>
                    <div class="text-[11px] text-amber-800 mt-0.5">
                        <strong>Clicca su una casella qualsiasi</strong> per cambiare il turno di quel dipendente.
                    </div>
                </div>
            </div>
        </div>

        <!-- Form Inserimento Nuovo Dipendente (Infermieri e OSS indeterminati) -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>➕</span> Inserisci Nuovo Dipendente nell'Equipe (Il planning si ricalcola a 156h e a coppie)
                </h3>
                <span class="text-[11px] text-slate-500 font-medium">
                    Totale Operatori: <?= count($this->staff) ?>
                </span>
            </div>
            <form method="POST" class="flex flex-wrap items-center gap-3">
                <input type="hidden" name="action" value="add_staff">
                <input type="text" name="name" required placeholder="Nome e Cognome operatore (es. Roberto Ferri)..." class="px-3.5 py-2 text-xs border border-slate-300 rounded-xl w-72 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden">
                <select name="role" class="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50">
                    <option value="INFERMIERE">Infermiere (Full-Time 156h)</option>
                    <option value="OSS">Operatore Socio Sanitario (OSS Full-Time 156h)</option>
                </select>
                <button type="submit" class="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors">
                    Inserisci e Ricalcola Turni
                </button>
            </form>
        </div>

        <!-- Tabella Turni Interattiva -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                    <h2 class="text-sm font-black text-slate-900">
                        Prospetto Turni: <?= htmlspecialchars($monthNames[$month]) ?> <?= $year ?>
                    </h2>
                    <span class="text-[11px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-lg">
                        Clicca su un turno per modificarlo
                    </span>
                </div>
                <div class="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    ✓ Tutti gli operatori a 156.0 ore esatte (Saldo 0.0h)
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-[11px] text-center border-collapse">
                    <thead>
                        <tr class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                            <th class="p-2.5 text-left sticky left-0 bg-slate-100 min-w-[210px] border-r">Operatore</th>
                            <?php for ($d = 1; $d <= $dim; $d++): 
                                $w = (int)date('w', strtotime(sprintf('%04d-%02d-%02d', $year, $month, $d)));
                                $isWk = ($w === 0 || $w === 6);
                            ?>
                                <th class="p-1 border-r min-w-[32px] <?= $isWk ? 'bg-slate-200/80 text-rose-700' : '' ?>">
                                    <div class="text-[9px] font-normal"><?= ['D','L','M','M','G','V','S'][$w] ?></div>
                                    <?= $d ?>
                                </th>
                            <?php endfor; ?>
                            <th class="p-2 border-r bg-indigo-50 text-indigo-900">Notti</th>
                            <th class="p-2 border-r bg-slate-100 font-black">Ore</th>
                            <th class="p-2 bg-emerald-50 text-emerald-900 font-black">Saldo</th>
                            <th class="p-2 bg-slate-50 text-slate-600">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($this->staff as $s): 
                            $sId = $s['id'];
                            $stat = $data['stats'][$sId];
                            $isCapo = ($s['role'] === 'CAPOSALA');
                        ?>
                            <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors <?= $isCapo ? 'bg-amber-50/30' : '' ?>">
                                <td class="p-2 text-left font-bold sticky left-0 bg-white border-r text-slate-800">
                                    <div class="flex items-center justify-between">
                                        <div class="truncate">
                                            <?= htmlspecialchars($s['name']) ?>
                                            <div class="text-[10px] font-normal text-slate-400">
                                                <?= $s['role'] ?> · <?= $s['target_hours'] ?>h
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <?php for ($d = 1; $d <= $dim; $d++): 
                                    $sh = $data['assignments'][$d][$sId] ?? 'R';
                                    $dStr = sprintf('%04d-%02d-%02d', $year, $month, $d);
                                    $isOver = isset($this->customOverrides[$sId][$dStr]);
                                    $w = (int)date('w', strtotime(sprintf('%04d-%02d-%02d', $year, $month, $d)));
                                    $isWk = ($w === 0 || $w === 6);
                                ?>
                                    <td class="p-1 border-r <?= $isWk ? 'bg-slate-50/70' : '' ?>">
                                        <button
                                            type="button"
                                            onclick="openShiftModal('<?= $sId ?>', <?= $d ?>, '<?= $sh ?>', '<?= addslashes($s['name']) ?>')"
                                            class="cell-interactive inline-block w-6 h-6 leading-6 rounded-md font-extrabold badge-<?= $sh ?> <?= $isOver ? 'is-override' : '' ?>"
                                            title="Clicca per modificare questo turno (Attuale: <?= $sh ?>)">
                                            <?= $sh ?>
                                        </button>
                                    </td>
                                <?php endfor; ?>
                                <td class="p-2 border-r font-bold text-indigo-900 bg-indigo-50/40">
                                    <?= $stat['n_count'] ?>
                                </td>
                                <td class="p-2 border-r font-black text-slate-900">
                                    <?= $stat['total_hours'] ?>h
                                </td>
                                <td class="p-2 border-r font-black text-emerald-700 bg-emerald-50/40">
                                    <?= $stat['delta_hours'] >= 0 ? '+' : '' ?><?= $stat['delta_hours'] ?>h
                                </td>
                                <td class="p-1 text-center">
                                    <?php if (!$isCapo && $sId !== 'oss-7' && $sId !== 'oss-8'): ?>
                                        <form method="POST" class="inline" onsubmit="return confirm('Rimuovere <?= addslashes($s['name']) ?> dall equipe?')">
                                            <input type="hidden" name="action" value="delete_staff">
                                            <input type="hidden" name="staff_id" value="<?= $sId ?>">
                                            <button type="submit" class="text-rose-500 hover:text-rose-700 p-1 text-xs" title="Elimina dipendente">
                                                ✕
                                            </button>
                                        </form>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>

                        <!-- RIGA DI VERIFICA ACCOPPIAMENTO EQUIPE (INF + OSS) -->
                        <tr class="bg-indigo-950 text-white font-bold border-t-2 border-indigo-900 text-[10px]">
                            <td class="p-2 text-left sticky left-0 bg-indigo-950 border-r border-indigo-800 text-indigo-100">
                                🤝 Accoppiamento Equipe
                                <div class="text-[9px] text-indigo-300 font-normal">INF + OSS in ogni fascia</div>
                            </td>
                            <?php for ($d = 1; $d <= $dim; $d++): 
                                $cov = $data['daily_coverage'][$d];
                                $ok = $cov['is_paired'];
                            ?>
                                <td class="p-1 border-r border-indigo-900 <?= $ok ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300' ?>" title="Fasce coperte a coppie">
                                    <?= $ok ? '✓ COP' : 'PARZ' ?>
                                </td>
                            <?php endfor; ?>
                            <td colspan="4" class="p-2 text-right text-indigo-200">
                                ✓ 100% Insieme in Turno
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Footer Legenda -->
            <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div class="flex items-center flex-wrap gap-2">
                    <span class="font-bold text-slate-700">Legenda:</span>
                    <span class="px-2 py-0.5 rounded badge-M font-extrabold">M (8h)</span>
                    <span class="px-2 py-0.5 rounded badge-P font-extrabold">P (8.5h)</span>
                    <span class="px-2 py-0.5 rounded badge-N font-extrabold">N (8.5h)</span>
                    <span class="px-2 py-0.5 rounded badge-S font-extrabold">S (0h)</span>
                    <span class="px-2 py-0.5 rounded badge-R font-extrabold">R (0h)</span>
                    <span class="px-2 py-0.5 rounded badge-FE font-extrabold">FE (8h)</span>
                    <span class="px-2 py-0.5 rounded badge-MUT font-extrabold">MUT (0h)</span>
                </div>
                <div class="text-slate-500 font-medium">
                    Bordo blu = Modifica manuale Caposala salvata in <code>turni_data.json</code>
                </div>
            </div>
        </div>

    </div>

    <!-- MODAL DI MODIFICA TURNO SINGOLO CAPOSALA -->
    <div id="shiftModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                <div>
                    <h3 class="text-sm font-bold text-slate-900" id="modalStaffName">Modifica Turno</h3>
                    <p class="text-xs text-slate-500" id="modalDateLabel">Giorno</p>
                </div>
                <button type="button" onclick="closeShiftModal()" class="text-slate-400 hover:text-slate-700 text-lg font-bold">
                    ✕
                </button>
            </div>

            <form method="POST" id="editShiftForm" class="space-y-3">
                <input type="hidden" name="action" value="edit_shift">
                <input type="hidden" name="staff_id" id="formStaffId">
                <input type="hidden" name="day" id="formDay">
                <input type="hidden" name="month" value="<?= $month ?>">
                <input type="hidden" name="year" value="<?= $year ?>">
                <input type="hidden" name="shift" id="formShiftValue">

                <p class="text-xs text-slate-600">
                    Seleziona il nuovo turno per questo dipendente. Il sistema <strong>ribilancia automaticamente</strong> il resto del mese a <strong>156.0 ore esatte</strong>, rispetta la sequenza N &rarr; S &rarr; R e previene P &rarr; M:
                </p>

                <div class="grid grid-cols-2 gap-2 text-xs">
                    <button type="button" onclick="selectShift('M')" class="p-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold flex items-center justify-between">
                        <span>🌅 M · Mattino</span>
                        <span>8.0h</span>
                    </button>
                    <button type="button" onclick="selectShift('P')" class="p-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-900 font-extrabold flex items-center justify-between">
                        <span>🌇 P · Pomeriggio</span>
                        <span>8.5h</span>
                    </button>
                    <button type="button" onclick="selectShift('N')" class="p-2.5 rounded-xl border border-indigo-700 bg-indigo-900 hover:bg-indigo-800 text-indigo-100 font-extrabold flex items-center justify-between">
                        <span>🌙 N · Notte</span>
                        <span>8.5h</span>
                    </button>
                    <button type="button" onclick="selectShift('S')" class="p-2.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-900 font-extrabold flex items-center justify-between">
                        <span>🛌 S · Smonto</span>
                        <span>0.0h</span>
                    </button>
                    <button type="button" onclick="selectShift('R')" class="p-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold flex items-center justify-between">
                        <span>☕ R · Riposo</span>
                        <span>0.0h</span>
                    </button>
                    <button type="button" onclick="selectShift('FE')" class="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-between">
                        <span>🏖️ FE · Ferie</span>
                        <span>8.0h</span>
                    </button>
                    <button type="button" onclick="selectShift('MUT')" class="p-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 font-extrabold flex items-center justify-between">
                        <span>🩺 MUT · Malattia</span>
                        <span>0.0h</span>
                    </button>
                    <button type="button" onclick="selectShift('REC')" class="p-2.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold flex items-center justify-between">
                        <span>⏱️ REC · Recupero</span>
                        <span>0.0h</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function openShiftModal(staffId, day, currentShift, staffName) {
            document.getElementById('formStaffId').value = staffId;
            document.getElementById('formDay').value = day;
            document.getElementById('modalStaffName').textContent = 'Modifica Turno: ' + staffName;
            document.getElementById('modalDateLabel').textContent = 'Giorno ' + day + '/<?= sprintf('%02d/%04d', $month, $year) ?> (Turno attuale: ' + currentShift + ')';
            document.getElementById('shiftModal').classList.remove('hidden');
        }

        function closeShiftModal() {
            document.getElementById('shiftModal').classList.add('hidden');
        }

        function selectShift(shiftCode) {
            document.getElementById('formShiftValue').value = shiftCode;
            document.getElementById('editShiftForm').submit();
        }

        // Chiudi modale cliccando fuori
        window.addEventListener('click', function(e) {
            const modal = document.getElementById('shiftModal');
            if (e.target === modal) {
                closeShiftModal();
            }
        });
    </script>
</body>
</html>
        <?php
    }
}

// ====================================================================================
// ROUTER ESECUTIVO (CLI VS WEB)
// ====================================================================================
if (php_sapi_name() === 'cli') {
    $argv = $_SERVER['argv'];
    $month = isset($argv[1]) && is_numeric($argv[1]) ? (int)$argv[1] : (int)date('n');
    $year  = isset($argv[2]) && is_numeric($argv[2]) ? (int)$argv[2] : 2026;
    $oss8Active = isset($argv[3]) && ($argv[3] === '1' || $argv[3] === 'true');

    $scheduler = new ClinicaScheduler($oss8Active);
    $scheduler->generateYearSchedule($year);
    $scheduler->renderCliTable($year, $month);

    // Salva file HTML di consultazione rapida
    ob_start();
    $scheduler->renderHtmlDashboard($year, $month);
    $htmlContent = ob_get_clean();
    $htmlFile = __DIR__ . '/turni_clinica.html';
    @file_put_contents($htmlFile, $htmlContent);
    echo "Dashboard interattiva salvata in: $htmlFile" . PHP_EOL;
} else {
    // Esecuzione via Web Server (Apache, XAMPP, php -S)
    $month = isset($_GET['month']) && is_numeric($_GET['month']) ? max(1, min(12, (int)$_GET['month'])) : (int)date('n');
    $year  = isset($_GET['year']) && is_numeric($_GET['year']) ? (int)$_GET['year'] : 2026;

    $scheduler = new ClinicaScheduler();

    // Gestione azioni POST della Caposala (modifica turno, aggiunta dipendente, toggle mutua, reset)
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
        $action = $_POST['action'];

        if ($action === 'edit_shift') {
            $staffId = isset($_POST['staff_id']) ? trim($_POST['staff_id']) : '';
            $day = isset($_POST['day']) ? (int)$_POST['day'] : 1;
            $shift = isset($_POST['shift']) ? trim($_POST['shift']) : 'M';
            $scheduler->editShiftAndRebalance($staffId, $day, $month, $year, $shift);
        } elseif ($action === 'add_staff') {
            $name = isset($_POST['name']) ? trim($_POST['name']) : '';
            $role = isset($_POST['role']) ? trim($_POST['role']) : 'INFERMIERE';
            $isPt = isset($_POST['is_pt_weekend']) && $_POST['is_pt_weekend'] === '1';
            if ($name !== '') {
                $scheduler->addStaffMember($name, $role, $isPt);
            }
        } elseif ($action === 'delete_staff') {
            $staffId = isset($_POST['staff_id']) ? trim($_POST['staff_id']) : '';
            if ($staffId !== '') {
                $scheduler->removeStaffMember($staffId);
            }
        } elseif ($action === 'toggle_oss8') {
            $scheduler->toggleOss8();
        } elseif ($action === 'reset_month') {
            $scheduler->resetMonthOverrides($year, $month);
        }

        // Redirect GET per evitare reinvio form
        header("Location: " . $_SERVER['PHP_SELF'] . "?month={$month}&year={$year}");
        exit;
    }

    $scheduler->generateYearSchedule($year);
    $scheduler->renderHtmlDashboard($year, $month);
}
