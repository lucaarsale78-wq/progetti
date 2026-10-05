<?php

require_once __DIR__ . '/turni_clinica.php';

$s = new ClinicaScheduler();
$s->generateYearSchedule(2026);

$totalNon156 = 0;
$totalViol = 0;
$unpairedDays = 0;

for ($m = 1; $m <= 12; $m++) {
    $data = $s->schedule[$m];
    $dim = $data['days_in_month'];

    // Check hours
    foreach ($data['stats'] as $id => $st) {
        if ($st['role'] !== 'CAPOSALA' && $id !== 'oss-7' && $id !== 'oss-8') {
            if (abs($st['total_hours'] - 156.0) > 0.01) {
                echo "Month $m - {$st['name']} ($id): {$st['total_hours']}h\n";
                $totalNon156++;
            }
        }
    }

    // Check pairing
    for ($d = 1; $d <= $dim; $d++) {
        if (!$data['daily_coverage'][$d]['is_paired']) {
            $unpairedDays++;
            echo "Unpaired Month $m, Day $d\n";
        }
    }

    // Check transition
    foreach ($s->staff as $staffMember) {
        $sid = $staffMember['id'];
        for ($d = 1; $d < $dim; $d++) {
            $c1 = $data['assignments'][$d][$sid];
            $c2 = $data['assignments'][$d+1][$sid];
            if (!ClinicaScheduler::isValidTransition($c1, $c2)) {
                echo "Viol Month $m, Day $d->$c1 to Day " . ($d+1) . "->$c2 for $sid\n";
                $totalViol++;
            }
        }
    }
}

echo "Summary over all 12 months (365 days):\n";
echo "  - Non-156h occurrences: $totalNon156\n";
echo "  - Transition violations (e.g. P->M): $totalViol\n";
echo "  - Unpaired shifts days: $unpairedDays\n";
if ($totalNon156 === 0 && $totalViol === 0 && $unpairedDays === 0) {
    echo ">>> 100% PERFECT COMPLIANCE ACROSS THE ENTIRE YEAR! <<<\n";
}
