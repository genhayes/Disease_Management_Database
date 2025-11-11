// src/lib/sql.ts
// SQLite database initialization and schema setup

import Database from 'better-sqlite3';

const db: any = new Database("data/warehouse.sqlite");

function init() {
    db.exec(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS disease_dim (
        name TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        laytext TEXT NOT NULL,
        category TEXT CHECK(category IN ('acute','chronic')) NOT NULL,
        is_rare INTEGER NOT NULL,
        is_gender_specific INTEGER NOT NULL,
        is_imm_life_threatening INTEGER NOT NULL,
        is_cant_miss INTEGER NOT NULL,
        risk INTEGER,
        icd10 TEXT,
        loinc TEXT,
        gencount INTEGER
        );
        CREATE TABLE IF NOT EXISTS alias_lookup (
        name TEXT NOT NULL,
        alias TEXT NOT NULL,
        PRIMARY KEY (name, alias),
        FOREIGN KEY (name) REFERENCES disease_dim(name) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS wiki_links (
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        PRIMARY KEY (name, url),
        FOREIGN KEY (name) REFERENCES disease_dim(name) ON DELETE CASCADE
        );
        `);
}

export { db, init };