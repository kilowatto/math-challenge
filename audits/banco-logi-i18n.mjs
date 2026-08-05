import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { generarBancoLogi } from "../packages/motor/src/banco-logi.ts";
import { validarItem } from "../packages/motor/src/item.ts";

const locales = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const catalogs = Object.fromEntries(locales.map((locale) => [locale, JSON.parse(readFileSync(`apps/web/src/i18n/reto/${locale}.json`, "utf8"))]));
const banco = generarBancoLogi();
if (banco.some((item) => item.rama !== "03")) problems.push("cada reto LOGI debe llevar rama MSC 03");
const problems = banco.flatMap((item) => {
  const keys = [item.enunciado.clave, ...Object.values(item.dibujos ?? {}).map((drawing) => drawing.clave), ...item.errores.map((error) => error.causa), ...(item.tambienCorrectas ?? []).map((answer) => answer.razon)];
  return [...new Set(keys)].flatMap((key) => locales.filter((locale) => typeof catalogs[locale][key] !== "string" && !(Array.isArray(catalogs[locale][key]) && catalogs[locale][key].length === 2)).map((locale) => `${locale}: falta ${key}`));
});
try { execFileSync("node", ["scripts/sembrar-banco-logi.mjs", "--salida", "/tmp/siembra-logi.sql"], { stdio: "ignore" }); } catch { problems.push("la siembra LOGI no pudo ejecutarse"); }
for (const item of banco) problems.push(...validarItem(item).map((error) => `${item.id}: ${error}`));
if (problems.length) { console.error("banco-logi-i18n: FAIL\n- " + problems.join("\n- ")); process.exit(1); }
console.log(`banco-logi-i18n: PASS (${banco.length} ítems × ${locales.length} locales · siembra ejecutada)`);
