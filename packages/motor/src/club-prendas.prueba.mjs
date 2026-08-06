import { formaPrendaValida, promptModeracionPrenda, veredictoPrenda } from "./club-prendas.ts";

const ok = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`✓ ${message}`);
};

ok(formaPrendaValida("colectiva"), "acepta las tres formas autoradas");
ok(!formaPrendaValida("perdedor_paga"), "rechaza una forma con perdedor");
ok(veredictoPrenda('{"veredicto":"pasa"}') === "pasa", "lee el veredicto JSON exacto");
ok(veredictoPrenda('{"mensaje":"pasa y quizá rechaza_contenido"}') === null, "no busca palabras dentro de texto libre");
ok(veredictoPrenda('{"choices":[{"message":{"content":"{\\"veredicto\\":\\"rechaza_persona\\"}"}}]}') === "rechaza_persona", "lee la respuesta compatible con OpenAI");
ok(veredictoPrenda("pasa" ) === null, "falla cerrado ante texto no estructurado");
ok(promptModeracionPrenda("de-DE").includes("Moderieren"), "elige el prompt del locale");
