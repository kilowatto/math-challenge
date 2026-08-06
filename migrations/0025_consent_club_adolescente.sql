-- 0025 — F10 · consentimiento explícito para membresía adolescente (D-051)

INSERT INTO consent_type_catalog (code, description, legal_basis, required, created_at)
VALUES (
  'CHILD_ADULT_CLUB_JOIN',
  'Permitir que el perfil adolescente entre en un club de adultos',
  'CONSENT',
  0,
  unixepoch()
);
