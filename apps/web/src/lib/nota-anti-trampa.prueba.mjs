import { DatabaseSync } from "node:sqlite";
import { escribirNotaPatronInusual, escribirNotaHabilidadPausada } from "./nota-anti-trampa.ts";

const db = new DatabaseSync(":memory:");
db.exec(`
  CREATE TABLE child_diagnostic_notes (
    id TEXT PRIMARY KEY,
    child_profile_id TEXT NOT NULL,
    cause_code TEXT NOT NULL,
    skill_id TEXT,
    created_at INTEGER NOT NULL,
    seen_at INTEGER
  )
`);

const adaptar = {
  prepare(sql) {
    const statement = db.prepare(sql);
    return {
      bind(...values) {
        return {
          async run() {
            statement.run(...values);
          },
        };
      },
    };
  },
};

await escribirNotaPatronInusual(adaptar, "h1", 1000, "n1");
await escribirNotaPatronInusual(adaptar, "h1", 2000, "n2");
const fila = db.prepare("SELECT * FROM child_diagnostic_notes WHERE child_profile_id = 'h1'").all();
if (fila.length !== 1) throw new Error(`esperaba una nota idempotente, encontré ${fila.length}`);
if (fila[0].cause_code !== "PATRON_INUSUAL_PARA_EDAD") throw new Error("causa incorrecta");
if (fila[0].skill_id !== null) throw new Error("la señal global no debe nombrar una habilidad");

await escribirNotaHabilidadPausada(adaptar, "h1", "K03", 3000, "n2");
await escribirNotaHabilidadPausada(adaptar, "h1", "K03", 3001, "n3");
const lateral = db.prepare("SELECT * FROM child_diagnostic_notes WHERE cause_code = 'HABILIDAD_PAUSADA_LATERAL'").all();
if (lateral.length !== 1) throw new Error(`esperaba una nota lateral idempotente, encontré ${lateral.length}`);
if (lateral[0].skill_id !== "K03") throw new Error("la nota lateral debe conservar la habilidad");

console.log("✓ nota anti-trampa — INSERT idempotente, señal global y sin skill_id");
