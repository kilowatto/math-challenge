import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const route = fs.readFileSync(path.join(root, "apps/web/src/pages/api/push.ts"), "utf8");
const sender = fs.readFileSync(path.join(root, "apps/web/src/lib/push-envio.ts"), "utf8");
const vapid = fs.readFileSync(path.join(root, "apps/web/src/lib/push-vapid.ts"), "utf8");
const migration = fs.readFileSync(path.join(root, "migrations/0014_push_recordatorio_padre.sql"), "utf8");
const sw = fs.readFileSync(path.join(root, "apps/web/public/sw.js"), "utf8");
const codigo = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/^\s*--.*$/gm, "");
const camino = codigo(route + sender + migration);
const problems = [];
if (!/leerSesionAdulto/.test(route) || !/COOKIE_ADULTO/.test(route)) problems.push("la suscripción no exige sesión adulta");
if (/child_profile_id|childProfileId/.test(camino)) problems.push("el camino push contiene identificador de niño");
if (!/VAPID_PUBLIC_KEY|VAPID_PRIVATE_KEY/.test(route + sender + vapid)) problems.push("faltan claves VAPID");
if (!/sinClaves|!claves/.test(sender)) problems.push("sin VAPID no hay degradación segura");
if (!/push_recordatorio|silenciado_at/.test(route + sender + migration)) problems.push("falta silencio o tope persistente");
if (!/push-mensaje/.test(sw) || !/showNotification/.test(sw)) problems.push("el service worker no compone la notificación");
if (problems.length) {
  console.error("✗ push-nunca-al-nino\n\n  · " + problems.join("\n  · "));
  process.exit(1);
}
console.log("push-nunca-al-nino: PASS (adulto · VAPID · payload neutro · silencio)");
