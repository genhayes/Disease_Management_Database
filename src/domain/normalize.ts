// src/domain/normalize.ts
// Functions to normalize raw disease data into structured format

import { DiseaseRaw, Disease, Alias, WikiLink } from "./types";
import { normalizeCategory } from "./schemas";

export function normalizeDisease(r: DiseaseRaw): Disease {
    // This function normalizes a DiseaseRaw object into a Disease object
    const risk = typeof r.Risk === "number" && r.Risk >= 0 && r.Risk <= 10 ? r.Risk : null;
    const clean = (s?: string) => (s ?? "").trim();
    return {
        name: clean(r.name),
        text: clean(r.text) || clean(r.laytext) || clean(r.name),
        laytext: clean(r.laytext) || clean(r.text) || clean(r.name),
        category: normalizeCategory(r.category),
        is_rare: !!r.IsRare,
        is_gender_specific: !!r.IsGenderSpecific,
        is_imm_life_threatening: !!r.IsImmLifeThreatening,
        is_cant_miss: !!r.IsCantMiss,
        risk,
        icd10: clean(r.ICD10) || null,
        loinc: clean(r.LOINC) || null,
        gencount: typeof r.gencount === "number" ? r.gencount : null,
    };
};

export function explodeAliases(name: string, alias?: string): Alias[] {
    // This function splits alias string into multiple Alias objects
    if (!alias) return [];
    return alias.split(/[\,\|]/).map(a => a.trim()).filter(Boolean)
        .map(a => ({ name, alias: a.toLowerCase() }));
};

export function collectWikis(name: string, r: DiseaseRaw): WikiLink[] {
    // This function collects all wiki links from DiseaseRaw into WikiLink objects
    const urls = [r.wiki, r.wiki2, r.wiki3, r.wiki4].filter(Boolean) as string[];
    return urls.filter(u => u.trim().length > 0).map(url => ({ name, url }));
};