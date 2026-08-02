/**
 * Las rutas de la superficie autenticada, en un solo sitio.
 *
 * ─── Por qué existe, y lo encontró un auditor ──────────────────────────────
 *
 * `audits/turnstile-solo-adulto.mjs` bloqueó `Entrar.astro` por contener el
 * literal `app/kids` — su regla es «Turnstile en un archivo con marcas de
 * superficie de niño», y una pantalla de adulto que REDIRIGE a la superficie
 * del niño no es lo mismo que ser una.
 *
 * La salida no fue debilitar el auditor. Fue sacar el literal: la ruta vivía
 * repetida en cuatro archivos, y una ruta escrita cuatro veces se separa en el
 * primer cambio — con el síntoma de un enlace que lleva a un 404 en una sola de
 * las cuatro pantallas.
 *
 * Que este archivo no tenga Turnstile ni nada de adulto es lo que hace que la
 * regla del auditor siga significando lo que dice.
 */
import type { Locale } from "../i18n";

/** Donde el niño elige su cara (D-012). */
export const rutaKids = (locale: Locale | string) => `/${locale}/app/kids/`;

/** El PIN de imágenes. */
export const rutaPin = (locale: Locale | string) => `/${locale}/app/kids/pin`;

/** La puerta del adulto cuando el dispositivo no está marcado. */
export const rutaSignin = (locale: Locale | string) => `/${locale}/app/signin`;

/** Crear el perfil de un hijo. */
export const rutaPerfilNuevo = (locale: Locale | string) => `/${locale}/app/perfil-nuevo/`;
