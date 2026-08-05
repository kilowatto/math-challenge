import { registrarPiso } from "./anti-trampa.ts";

const ok = (condicion, mensaje) => {
  if (!condicion) throw new Error(mensaje);
  console.log(`  ✓ ${mensaje}`);
};

let estado = { consecutivas: 0 };
let resultado = registrarPiso(estado, "PRIMARIA", 100);
estado = resultado.estado;
ok(!resultado.señal && estado.consecutivas === 1, "una respuesta rápida solo registra una señal parcial");
resultado = registrarPiso(estado, "PRIMARIA", 200);
estado = resultado.estado;
ok(!resultado.señal && estado.consecutivas === 2, "dos respuestas rápidas todavía no generan nota");
resultado = registrarPiso(estado, "PRIMARIA", 299);
estado = resultado.estado;
ok(resultado.señal && estado.consecutivas === 3, "tres respuestas rápidas consecutivas generan señal derivada");
resultado = registrarPiso(estado, "PRIMARIA", 300);
ok(!resultado.señal && resultado.estado.consecutivas === 0, "una respuesta no rápida reinicia la racha de señal");
resultado = registrarPiso({ consecutivas: 2 }, "KINDER", 1);
ok(!resultado.señal && resultado.estado.consecutivas === 0, "KINDER nunca genera señal de velocidad");

console.log("✓ anti-trampa — solo señal derivada, nunca penalización");
