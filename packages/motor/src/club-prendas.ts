export const FORMAS_PRENDA = ["colectiva", "ganador_elige", "compromiso_propio"] as const;
export type FormaPrenda = (typeof FORMAS_PRENDA)[number];

export const MODELOS_MODERACION_PRENDA = [
  "@cf/openai/gpt-oss-120b",
  "@cf/moonshotai/kimi-k2.6",
] as const;
export type ModeloModeracionPrenda = (typeof MODELOS_MODERACION_PRENDA)[number];

const VEREDICTOS = ["pasa", "rechaza_persona", "rechaza_contenido"] as const;
export type VeredictoPrenda = (typeof VEREDICTOS)[number];

const PROMPTS: Record<string, string> = {
  en: "Moderate a playful stake for adults. Reject targeting or humiliating a person, sex, violence, and degrading content.",
  "es-MX": "Modera una prenda de juego entre adultos. Rechaza señalar o humillar a una persona, sexo explícito, violencia y denigración.",
  "es-ES": "Modera una prenda de juego entre adultos. Rechaza señalar o humillar a una persona, sexo explícito, violencia y denigración.",
  "fr-FR": "Modère un défi ludique entre adultes. Refuse toute attaque ou humiliation d’une personne, le sexe explicite, la violence et le contenu dégradant.",
  "pt-BR": "Modere uma prenda de jogo entre adultos. Rejeite apontar ou humilhar uma pessoa, sexo explícito, violência e conteúdo degradante.",
  "pt-PT": "Modere uma prenda de jogo entre adultos. Rejeite apontar ou humilhar uma pessoa, sexo explícito, violência e conteúdo degradante.",
  "de-DE": "Moderieren Sie eine spielerische Wette unter Erwachsenen. Lehnen Sie das Anvisieren oder Demütigen einer Person, expliziten Sex, Gewalt und erniedrigende Inhalte ab.",
};

export function promptModeracionPrenda(locale: string): string {
  return PROMPTS[locale] ?? PROMPTS.en;
}

export function formaPrendaValida(value: unknown): value is FormaPrenda {
  return typeof value === "string" && (FORMAS_PRENDA as readonly string[]).includes(value);
}

export function veredictoPrenda(value: unknown): VeredictoPrenda | null {
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const direct = record.veredicto ?? record.verdict;
    if (typeof direct === "string" && (VEREDICTOS as readonly string[]).includes(direct)) {
      return direct as VeredictoPrenda;
    }
    const choices = record.choices;
    if (Array.isArray(choices)) {
      for (const choice of choices) {
        const content = (choice as Record<string, unknown> | null)?.message;
        const result = veredictoPrenda(content);
        if (result) return result;
      }
    }
    if ("content" in record) return veredictoPrenda(record.content);
    if ("response" in record) return veredictoPrenda(record.response);
    return null;
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  try {
    return veredictoPrenda(JSON.parse(text));
  } catch {
    return null;
  }
}
