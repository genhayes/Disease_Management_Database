// src/transform/gold.ts
// Functions to build summary tables in the warehouse database

import { db } from "../lib/sql";

export function buildGoldTable() {
    db.exec(`
        // Create a table for diseases that can't be missed
        DROP TABLE IF EXISTS mrt_cant_miss;
        CREATE TABLE mrt_cant_miss AS
        SELECT name, category, risk, icd10
        FROM disease_dim
        WHERE is_cant_miss = 1
        ORDER BY COALESCE(risk, -1) DESC, name;

        // Create a summary table for gender specific diseases by category
        DROP TABLE IF EXISTS mrt_gender_category_summary;
        CREATE TABLE mrt_gender_category_summary AS
        SELECT category, is_gender_specific, COUNT(*) as n
        FROM disease_dim
        GROUP BY category, is_gender_specific;

        // Create a table summarizing ICD10 code coverage by category
        DROP TABLE IF EXISTS mrt_code_coverage;
        CREATE TABLE mrt_code_coverage AS
        SELECT category,
                COUNT(*) as total,
                SUM(CASE WHEN icd10 IS NOT NULL AND icd10 <> '' THEN 1 ELSE 0 END) as with_icd10,
                ROUND(100.0 * SUM(CASE WHEN icd10 IS NOT NULL AND icd10 <> '' THEN 1 ELSE 0 END) / COUNT(*), 1) as pct_with_icd10
        FROM disease_dim
        GROUP BY category;

        // Create a risk bucket summary table
        DROP TABLE IF EXISTS mrt_risk_buckets;
        CREATE TABLE mrt_risk_buckets AS
        SELECT
            CASE
                WHEN risk IS NULL THEN 'unknown'
                WHEN risk >= 4 THEN 'high'
                WHEN risk >= 2 THEN 'medium'
                ELSE 'low'
        END as bucket,
        COUNT(*) as n
        FROM disease_dim
        GROUP BY bucket;
    `);
}

if (require.main === module) buildGoldTable();