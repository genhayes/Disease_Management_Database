// src/orchestration/run_all.ts
// Main orchestration script to run the full ETL process and start the API server

import { loadDiseases } from "../ingest/load_json";
import { buildGoldTable } from "../transform/gold";
import { runQualityChecks } from "../quality/check";
import { start } from "../serve/api";


(async () => {
const { valid, invalid } = await loadDiseases();
console.log({ valid, invalid });
buildGoldTable();
runQualityChecks();
start(3000);
})();