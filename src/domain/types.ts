// src/domain/types.ts
// Type definitions for disease management database

export type Category = "acute" | "chronic";

export type DiseaseRaw = {
    name: string;
    text?: string;
    laytext?: string;
    category?: string;
    alias?: string;
    wiki?: string; wiki2?: string; wiki3?: string; wiki4?: string;
    IsRare?: boolean; IsGenderSpecific?: boolean;
    IsImmLifeThreatening?: boolean; IsCantMiss?: boolean;
    Risk?: number; gencount?: number;
    ICD10?: string; LOINC?: string;
};

export type Disease = {
name: string; text: string; laytext: string; category: Category;
is_rare: boolean; is_gender_specific: boolean;
is_imm_life_threatening: boolean; is_cant_miss: boolean;
risk: number | null; icd10: string | null; loinc: string | null; gencount: number | null;
};

export type Alias = { name: string; alias: string };
export type WikiLink = { name: string; url: string };
