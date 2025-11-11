// src/ingest/to_warehouse.ts
// Functions to upsert normalized disease data into the warehouse database

import { db } from "../lib/sql.js";
import { Disease, Alias, WikiLink } from "../domain/types.js";

// Prepared statements for inserting data into the warehouse database
const insDisease = db.prepare(`
    INSERT OR REPLACE INTO disease_dim (
    name,text,laytext,category,is_rare,is_gender_specific,is_imm_life_threatening,is_cant_miss,risk,icd10,loinc,gencount
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
`);

const insAlias = db.prepare(`
    INSERT OR REPLACE INTO alias_lookup (name, alias) VALUES (?,?)
`);

const insWiki = db.prepare(`
    INSERT OR REPLACE INTO wiki_links (name, url) VALUES (?,?)
`);

export function upsertDisease(d: Disease, aliases: Alias[], wikis: WikiLink[]) {
    insDisease.run(d.name, d.text, d.laytext, d.category,
        d.is_rare ? 1 : 0, d.is_gender_specific ? 1 : 0,
        d.is_imm_life_threatening ? 1 : 0, d.is_cant_miss ? 1 : 0,
        d.risk, d.icd10, d.loinc, d.gencount
    );
    const aliasTxn = db.transaction((rows: Alias[]) => rows.forEach(a => insAlias.run(a.name, a.alias)));
    aliasTxn(aliases);

    const wikiTxn = db.transaction((rows: WikiLink[]) => rows.forEach(w => insWiki.run(w.name, w.url)));
    wikiTxn(wikis);
};