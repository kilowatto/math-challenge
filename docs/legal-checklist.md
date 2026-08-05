# Checklist legal interno — Math Challenge

**Fecha de revisión:** 2026-08-05  
**Alcance:** producto web y flujos de menores en los siete locales.  
**Responsable:** revisión interna del producto, no asesoría legal.

Este documento registra controles de producto y exposiciones conocidas. No
declara conformidad legal por sí solo. La primera queja formal, multa concreta o
contrato escolar que exija documentación dispara revisión con abogado externo,
como fija D-126.

## COPPA

| Control | Estado | Evidencia / exposición |
|---|---|---|
| Consentimiento parental verificable antes de divulgar datos del menor | **cumple en producto; verificar operación** | `child_consents` y rutas F2/F9; la operación de verificación debe conservar evidencia por mercado. |
| No biometría, cámara ni micrófono para el menor | **cumple** | Auditores `voz-solo-salida`, `telemetria-infantil`, `kinder-sin-examen`; la cámara de adulto es una excepción separada (D-075). |
| Minimización y separación de datos | **cumple en código; revisar retención** | Datos de menor separados de Analytics y push; ejecutar el runbook de borrado antes de declarar cumplimiento operativo. |
| Programa de seguridad escrito | **exposición aceptada por ahora** | El repo tiene controles técnicos, pero no hay personal ni calendario de revisión de incidentes documentados. |

## GDPR y Children’s Code

| Control | Estado | Evidencia / exposición |
|---|---|---|
| Privacidad por defecto y sin nudges | **cumple en producto; revisión humana pendiente** | `limite-no-rompe-el-dia`, `recordatorio-sin-culpa` y opt-out permanente; falta recorrido manual por locale. |
| Sin perfilado conductual de menores | **cumple en diseño** | D-020/D-037: solo señales derivadas; no se guardan teclas, audio ni identificadores en telemetría. |
| Base jurídica, derechos y DPIA | **exposición aceptada por ahora** | Falta revisión jurídica externa y un canal operativo de solicitudes por mercado. |
| Retención y borrado | **verificar operación** | El código tiene rutas y auditores; falta evidencia de ejecución en producción con datos reales. |

## LGPD (Brasil)

| Control | Estado | Evidencia / exposición |
|---|---|---|
| Consentimiento parental específico y destacado | **cumple en producto; revisar copy** | Flujo de consentimiento separado; la revisión nativa del copy `pt-BR` sigue pendiente. |
| No exigir datos innecesarios para jugar | **cumple en diseño** | No se exige push, cámara, micrófono ni ranking para practicar. |
| Esfuerzos razonables de verificación | **exposición aceptada por ahora** | T-5 sigue abierta para adultos sin escuela verificada y clubs de familias. |

## México (LFPDPPP)

| Control | Estado | Evidencia / exposición |
|---|---|---|
| Aviso de privacidad y consentimiento | **verificar publicación** | El producto separa consentimiento infantil y adulto; este checklist no sustituye el aviso publicado. |
| Capacidad y representación del adulto | **exposición aceptada por ahora** | T-5 no está cerrada: correo/teléfono y señales declaradas no equivalen a identidad verificada. |
| Estado regulatorio aplicable | **[unverified]** | Requiere revisión jurídica mexicana antes de afirmar una interpretación del marco posterior al INAI. |

## EAA / EN 301 549

| Control | Estado | Evidencia / exposición |
|---|---|---|
| WCAG 2.2 AA en el producto | **verificación manual pendiente** | La flota automática corre en `audits/run.mjs`; #426 exige teclado, VoiceOver, TalkBack, zoom y contraste en dispositivos reales. |
| Alternativa sin reloj y foco visible | **cumple en diseño; verificar pantallas nuevas** | D-024/D-045 y auditorías de reto; F10/F11 deben repetir la revisión al aterrizar. |
| Producto sin tienda ni compra | **no aplica hoy** | No hay checkout ni comercio; cualquier futura monetización reabre este control. |

## Premios, azar y consideración

| Control | Estado | Evidencia / exposición |
|---|---|---|
| La plataforma no toca dinero ni bienes | **cumple en producto** | No hay cobros, apuestas, premios ni intercambio de valor. |
| No hay azar pagado ni recompensa por ranking | **cumple en producto** | D-014, D-028 y D-119; las actividades de clubs no tienen celda de perdedor. |
| Mapa regulatorio estadounidense actualizado | **[unverified]** | Montana SB 555 y cualquier cambio estatal requieren revisión externa antes de operar una promoción o premio. |

## Zaraz / GA4

| Control | Estado | Evidencia / exposición |
|---|---|---|
| Telemetría infantil minimizada | **cumple en diseño** | `telemetria-infantil.mjs` bloquea superficies de menor y D-037 limita el índice a señales agregadas. |
| Consentimiento y transferencia internacional | **exposición aceptada por ahora** | La excepción de analítica declarada en D-076 necesita revisión jurídica y configuración por mercado antes de ampliar tráfico. |

## Condición de escalamiento

Este checklist queda **interno y no certificante** hasta que exista revisión
externa. Se abre una tarea legal inmediata ante: (1) primera queja formal, (2)
primera multa o requerimiento concreto, o (3) primer contrato escolar que pida
papel. Ningún estado «cumple en producto» autoriza por sí solo un lanzamiento
regulado.
