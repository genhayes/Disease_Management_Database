// src/quality/check.ts
// Functions to run quality checks on the warehouse database and generate a report

import { db } from "../lib/sql";
import fs from "node:fs";

export function runQualityChecks() {
    // Check for total rows, bad categories, empty names, and ICD10 coverage
    const total = db.prepare(`SELECT COUNT(*) as n FROM disease_dim`).get().n as number;
    const badCat = db.prepare(`SELECT COUNT(*) as n FROM disease_dim WHERE category NOT IN ('acute','chronic')`).get().n as number;
    const emptyName = db.prepare(`SELECT COUNT(*) as n FROM disease_dim WHERE name=''`).get().n as number;
    const icdPct = db.prepare(`
        SELECT ROUND(100.0 * SUM(CASE WHEN icd10 IS NOT NULL AND icd10 <> '' THEN 1 ELSE 0 END) / COUNT(*), 1) as pct
        FROM disease_dim
    `).get().pct as number;
    
    // Generate report
    const report = { total_rows: total, bad_category_rows: badCat, empty_name_rows: emptyName, icd10_coverage_pct: icdPct, status: (badCat === 0 && emptyName === 0) ? 'PASS' : 'FAIL' };
    fs.writeFileSync("data/reports/quality_report.json", JSON.stringify(report, null, 2));
    if (report.status === 'FAIL') process.exitCode = 1;
}

if (require.main === module) runQualityChecks();