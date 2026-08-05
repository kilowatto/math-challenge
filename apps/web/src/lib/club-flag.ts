export async function f10PrendasHabilitadas(kv: KVNamespace | undefined): Promise<boolean> {
  if (!kv) return false;
  try {
    return (await kv.get("f10_prendas_enabled")) === "1";
  } catch {
    return false;
  }
}
