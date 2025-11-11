

import express from "express";
import { db } from "../lib/sql";

const app = express();
app.use(express.json());

// Endpoint to search diseases by name, text, laytext, or alias
app.get("/diseases", (req, res) => {
    const q = ((req.query.q as string) || "").toLowerCase().trim();
    if (!q) {
        const rows = db.prepare(`SELECT name,text,category,risk,is_cant_miss FROM disease_dim LIMIT 50`).all();
        return res.json(rows);
    }
    const stmt = db.prepare(`
        SELECT d.name, d.text, d.category, d.risk, d.is_cant_miss
        FROM disease_dim d
        LEFT JOIN alias_lookup a ON a.name = d.name
        WHERE LOWER(d.name) = ? OR LOWER(d.text) LIKE ? OR LOWER(d.laytext) LIKE ? OR a.alias = ?
        GROUP BY d.name
        LIMIT 50
    `);
    const like = `%${q}%`;
    const rows = stmt.all(q, like, like, q);
    res.json(rows);
});

// Endpoint to get summary metrics about the diseases
app.get("/metrics", (_req, res) => {
    const summary = {
        total: db.prepare(`SELECT COUNT(*) as n FROM disease_dim`).get().n,
        icd10_coverage: db.prepare(`SELECT AVG(CASE WHEN icd10 IS NOT NULL AND icd10 <> '' THEN 1.0 ELSE 0.0 END) as pct FROM disease_dim`).get().pct,
        risk_buckets: db.prepare(`SELECT bucket, n FROM mrt_risk_buckets`).all(),
        by_category: db.prepare(`SELECT category, SUM(n) as n FROM mrt_gender_category_summary GROUP BY category`).all(),
    };
    res.json(summary);
});

// Endpoint to get detailed information about a specific disease by name
app.get("/diseases/:name", (req, res) => {
    const name = req.params.name;
    const d = db.prepare(`SELECT * FROM disease_dim WHERE name = ?`).get(name);
    if (!d) return res.status(404).json({ error: "not found" });
    const aliases = db.prepare(`SELECT alias FROM alias_lookup WHERE name = ?`).all(name).map((r:any)=>r.alias);
    const wikis = db.prepare(`SELECT url FROM wiki_links WHERE name = ?`).all(name).map((r:any)=>r.url);
    res.json({ ...d, aliases, wikis });
});

export function start(port = 3000) {
app.listen(port, () => console.log(`API on http://localhost:${port}`));
}

if (require.main === module) start(3000);
