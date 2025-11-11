// src/domain/schemas.ts
// Schema definitions and validation for disease management database

import { z } from 'zod';

const url = z.string().url().optional().transform((val) => val || "");

export const DiseaseRawSchema = z.object({
    name: z.string().min(1),
    text: z.string().optional(),
    laytext: z.string().optional(),
    category: z.string().optional(),
    alias: z.string().optional(),
    wiki: url, wiki2: url, wiki3: url, wiki4: url,
    IsRare: z.boolean().optional(),
    IsGenderSpecific: z.boolean().optional(),
    IsImmLifeThreatening: z.boolean().optional(),
    IsCantMiss: z.boolean().optional(),
    Risk: z.number().int().min(0).max(10).optional(),
    gencount: z.number().int().optional(),
    ICD10: z.string().optional(),
    LOINC: z.string().optional(),
});

export const normalizeCategory = (c?:string): "acute" | "chronic" => {
    const s = (c ?? "").toLowerCase().trim();
    return s === "chronic" ? "chronic" : "acute";
};