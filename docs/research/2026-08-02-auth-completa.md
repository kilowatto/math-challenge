# Autenticación completa — investigación y decisiones pendientes

> 2026-08-02 · ~130 fuentes · encargado por el dueño para cerrar F2.
> **Dos de las respuestas que ya dio quedan contradichas por la evidencia.**
> Las marco arriba porque son las que hay que volver a decidir.

## ⚠️ Lo que contradice lo ya decidido

### 1. El enlace de recuperación está PROHIBIDO como autenticador

El dueño eligió «enlace de un solo uso, 15 minutos». La norma no lo permite.

**NIST SP 800-63B-4 §3.1.3.1**, literal:
> «**Email SHALL NOT be used for out-of-band authentication** because it may be
> vulnerable to: Access using only a password; Interception in transit or at
> intermediate mail servers; Rerouting attacks, such as those caused by DNS
> spoofing»

**ASVS v5.0 §6.6** lo repite: «Unsafe out-of-band authentication mechanisms such
as e-mail and VOIP are not permitted.»

Y hay dos fallos de arquitectura, no de norma:

- **Microsoft Defender Safe Links visita el enlace ANTES que el humano.** Supabase
  lo documenta con nombre: el token «is consumed instantly which leads to a
  "Token has expired or is invalid" error». Outlook manda `GET`, no `HEAD`, así
  que el truco de «no consumas en HEAD» no salva nada.
- **En iOS el enlace aterriza en Safari, FUERA de la PWA instalada.** Auth0:
  «both the initial request and its response must take place in the same browser
  or the transaction will fail… iOS automatically opens it in Safari».

**Lo que sí sobrevive: un código de 6 dígitos tecleado dentro de la app.** Nunca
cambia de navegador ni de contexto, y ningún escáner lo puede quemar. Supabase lo
recomienda por escrito exactamente por esto.

Y los parámetros no son opinables:
- **10 minutos**, no 15 — ASVS §6.5.5 y NIST §3.1.3.2 coinciden en la cifra.
- Un solo uso · ligado a la petición original · **respuesta genérica Y de tiempo
  constante** · **no auto-login** (OWASP) · invalidar las demás sesiones · avisar
  por correo · **no bloquear la cuenta** ante un ataque de reset.
- OWASP: «a user **must always** have a way to recover their account».

### 2. `residentKey: "preferred"` está mal — debe ser `"required"`

Es lo que hay hoy en `/app/perfil`. passkeys.dev es unánime:
`residentKey: "required"`, `userVerification: "preferred"`, `excludeCredentials`
poblado, `attestation` sin especificar, `authenticatorAttachment` sin especificar.

Y con `preferred` en UV hay una obligación que hoy NO se cumple: **validar el
flag UV (0x04) en el servidor**. `webauthn.ts` no lo comprueba en ninguna de las
dos ceremonias, así que la verificación de usuario es efectivamente opcional.

## Lo que confirma lo decidido

- **Sesión de 30 días deslizante**: es el techo de AAL1 en NIST 800-63B-4, que
  además **relajó AAL2** (SHALL→SHOULD, 12h→24h) en julio de 2025. Microsoft
  probó acortar tokens y concluyó que degrada la UX «**without eliminating the
  risk**»: la respuesta no es acortar, es **poder revocar** — y hoy no se puede.
- **Ir directo a la casa con sesión viva**: Google Search Central lista
  explícitamente «Redirecting users to an internal page once they are logged in»
  como redirect legítimo. Nueve de trece productos medidos hoy sirven su raíz con
  `no-store`/`private` — el patrón dominante es **render condicional**, no
  redirect. Y la mejor prueba de que el problema existe: Google tuvo que escribir
  en la ayuda de Gmail «If you get a page that describes Gmail instead of the
  sign-in page…».
- **Misma duración instalada que en pestaña**: no hay estudio que respalde la
  diferencia.

## Tres hechos que cambian el diseño y nadie había considerado

### En iOS, instalar la PWA DESLOGUEA al padre

web.dev, literal: «every PWA icon that the user installs will have its own
storage, isolated from Safari's tab… **If your PWA needs a login, the user will
need to log in again.**» Confirmado por un ingeniero de Apple.

Pero el mismo aislamiento **protege**: el tope de 7 días de ITP **no aplica** a
las home screen web apps. Y `HttpOnly` es lo que exime la cookie de ese tope —
WebKit lo dice literal. No es higiene contra XSS: **es lo que hace que `mc_s`
sobreviva en Safari.**

**Consecuencia:** el flujo de instalación tiene que contar con una
reautenticación inmediata en iOS.

### El dato de Yahoo! JAPAN sobre Android

11% de todos sus logins, 2.6× más rápido que SMS OTP, −25% de consultas de
contraseña olvidada. Pero el A/B por plataforma: Windows **+15.35 puntos**,
macOS +8.02, iOS +2.29, **Android sin efecto**. Y: **el 62% de sus usuarios
Android de 2019 había vuelto a SMS en 2022.**

El dispositivo de referencia de este producto es **Android de gama baja**. Y un
Android sin bloqueo de pantalla configurado **no ofrece passkeys en absoluto**.

**Traducción:** passkey primero es correcto por seguridad y por las cifras de
Google (63.8% vs 13.8% de éxito) y Microsoft (98% vs 32%). Pero **la contraseña
de respaldo no es una concesión temporal que se pueda retirar en la v2.**

### El RP ID es la decisión menos reversible del sistema

X forzó un reset de passkeys **de todos sus usuarios** en octubre de 2025 por
migrar `twitter.com` → `x.com`. Hoy `RP_ID = "math.kilowatto.com"`: si la app se
mueve alguna vez, todas las passkeys mueren.

## COPPA: el reloj ya venció

Las enmiendas de 2025 (90 FR 16918) son **exigibles desde el 22 de abril de
2026**. Hoy es 2 de agosto de 2026.

**16 CFR 312.6(a)(3)(i)**: hay que «ensure that the requestor is a parent of that
child» antes de divulgar datos del niño. **Mostrar o exportar el progreso de un
hijo es legalmente una divulgación.** Eso es lo que justifica el step-up ahí, no
una preferencia de UX.

Y sobre «email plus» como consentimiento parental — la FTC, literal: «you must
take an **additional confirming step** after receiving the parent's message
(this is the "plus" factor)». **Un solo correo de confirmación NO es email plus.**

**EDPB Guidelines 01/2022**: verificar con la autenticación **preexistente**, no
pidiendo documento de identidad nuevo. Pedir foto del pasaporte para un DSAR es
peor práctica, no mejor.

## Ventanas de reautenticación medidas

| Producto | Ventana |
|---|---|
| GitHub sudo mode | **2 horas**, cada acción reinicia |
| Google Cloud | **15 minutos** |
| Banca UE (PSD2 art. 10) | **180 días para LEER** |
| Banca UE (art. 4.3) | **5 minutos** en sesión de pago |

No hay estándar: hay un rango de 15 min a 2 h, **y el eje que lo explica es la
reversibilidad del daño**. La banca más regulada de Europa permite 180 días para
consultar y reserva los 5 minutos para la acción con dinero.

**El modo correcto de hacer el step-up:** passkey con `userVerification:
"required"` y challenge fresco. Roce casi cero — cara o huella, sin escribir.

## Errores documentados que conviene no repetir

- **`signalAllAcceptedCredentials` con lista incompleta BORRA passkeys buenas.**
- **Safari 17.4 dejó de respetar `excludeCredentials`** y causó duplicados y
  bloqueos de cuenta, GitHub incluido. Corregido en STP 191.
- **`SameSite=Strict` rompe PWAs** — las cookies no persisten. `Lax` sí.
- **`NotAllowedError` es un cajón de sastre**: cancelación, timeout, origen,
  gesto y rechazo del autenticador comparten código.
- Las passkeys son **por usuario del sistema operativo, no por dispositivo**. No
  existe modelo nativo de «tablet familiar con varios adultos».

## Fuentes bloqueadas, dicho y no rellenado

`ftc.gov` y `federalregister.gov` devuelven 403 (el texto de la FTC se extrajo
con `curl`); `developer.apple.com` sirve SPAs, **así que las cifras de token de
Sign in with Apple quedan sin verificar y no se presentan como hechos**.
**No existe ningún estudio con datos sobre retención de PWA instalada vs
pestaña** — los números que circulan son marketing de proveedores.
