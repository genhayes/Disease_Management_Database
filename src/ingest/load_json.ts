// src/ingest/load_json.ts
// Function to load and process disease data from JSON file into the warehouse database

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { DiseaseRawSchema } from "../domain/schemas";
import { normalizeDisease, explodeAliases, collectWikis } from "../domain/normalize";
import { upsertDisease } from "./to_warehouse";
import { init } from "../lib/sql";

export async function loadDiseases(jsonPath = "data/DiseaseData.json") {
    init();
    const rawTxt = fs.readFileSync(path.resolve(jsonPath), "utf-8");
    const arr = JSON.parse(rawTxt) as unknown[];
    let valid = 0, invalid = 0;

    for (const item of arr) {
        const parsed = DiseaseRawSchema.safeParse(item);
        if (!parsed.success) {
        invalid++;
        fs.writeFileSync(`data/dlq/${Date.now()}-row.json`, JSON.stringify(item, null, 2));
        continue;
        }
        const r = parsed.data;
        // ensure optional string fields are defined to satisfy normalizeDisease's parameter types
        const rSafe = {
            ...r,
            text: (r as any).text ?? "",
            laytext: (r as any).laytext ?? "",
        };
        const d = normalizeDisease(rSafe as any);
        const aliases = explodeAliases(d.name, rSafe.alias);
        const wikis = collectWikis(d.name, rSafe as any);
        upsertDisease(d, aliases, wikis);
        valid++;
    }
    return { valid, invalid };
}


if (require.main === module) {
    loadDiseases().then(console.log).catch(err => { console.error(err); process.exit(1); });
}