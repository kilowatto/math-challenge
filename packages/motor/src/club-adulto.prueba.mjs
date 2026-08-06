import assert from "node:assert/strict";
import {
  MAX_MIEMBROS_CLUB_ADULTO,
  VENTANA_RETO_CLUB_MS,
  adolescentePuedeEntrar,
  maximoDeClubValido,
  nivelDeClubValido,
  nombreDeClubValido,
  nuevoCodigoClub,
  ventanaDeRetoValida,
} from "./club-adulto.ts";

assert.equal(MAX_MIEMBROS_CLUB_ADULTO, 20);
assert.equal(maximoDeClubValido(20), true);
assert.equal(maximoDeClubValido(21), false);
assert.equal(ventanaDeRetoValida(0, VENTANA_RETO_CLUB_MS), true);
assert.equal(ventanaDeRetoValida(0, VENTANA_RETO_CLUB_MS + 1), false);
assert.equal(nivelDeClubValido(8), true);
assert.equal(nivelDeClubValido(7), false);
assert.equal(adolescentePuedeEntrar("SECUNDARIA"), true);
assert.equal(adolescentePuedeEntrar("PRIMARIA"), false);
assert.equal(nombreDeClubValido("es-MX", "club.sabana"), true);
assert.equal(nombreDeClubValido("es-MX", "texto.libre"), false);
assert.match(nuevoCodigoClub(() => 0), /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
console.log("club-adulto: ok");
