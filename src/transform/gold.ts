// src/transform/gold.ts
// Functions to build summary tables in the warehouse database

import { db , init } from "../lib/sql";

function exec(sql: string) {
  try {
    db.exec(sql);
  } catch (e) {
    console.error("SQL failed:\n", sql, "\n---\n", e);
    throw e;
  }
}

export function buildGoldTable() {
    init(); // ensure base tables exist

    // Can't-miss
    exec(`DROP TABLE IF EXISTS mrt_cant_miss;`);
    exec(`
        CREATE TABLE mrt_cant_miss AS
        SELECT name, category, risk, icd10
        FROM disease_dim
        WHERE is_cant_miss = 1
        ORDER BY COALESCE(risk, -1) DESC, name;
    `);

    // Gender x Category summary
    exec(`DROP TABLE IF EXISTS mrt_gender_category_summary;`);
    exec(`
        CREATE TABLE mrt_gender_category_summary AS
        SELECT category,
            is_gender_specific,
            COUNT(*) AS n
        FROM disease_dim
        GROUP BY category, is_gender_specific;
    `);

    // ICD-10 coverage (use CTE to keep the division clean)
    exec(`DROP TABLE IF EXISTS mrt_code_coverage;`);
    exec(`
        CREATE TABLE mrt_code_coverage AS
        WITH base AS (
        SELECT
            category,
            COUNT(*) AS total,
            SUM(CASE WHEN icd10 IS NOT NULL AND icd10 <> '' THEN 1 ELSE 0 END) AS with_icd10
        FROM disease_dim
        GROUP BY category
        )
        SELECT
        category,
        total,
        with_icd10,
        ROUND((with_icd10 * 100.0) / NULLIF(total, 0), 1) AS pct_with_icd10
        FROM base;
    `);

    // Risk buckets
    exec(`DROP TABLE IF EXISTS mrt_risk_buckets;`);
    exec(`
        CREATE TABLE mrt_risk_buckets AS
        SELECT 
        CASE
            WHEN risk IS NULL THEN 'unknown'
            WHEN risk >= 4 THEN 'high'
            WHEN risk >= 2 THEN 'medium'
            ELSE 'low'
        END AS bucket,
        COUNT(*) AS n
        FROM disease_dim
        GROUP BY bucket;
    `);
}

if (require.main === module) buildGoldTable();