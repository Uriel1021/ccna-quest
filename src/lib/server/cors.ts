import "server-only";
/* CORS: la APK (Capacitor) llama a la API de Vercel desde https://localhost. */
const ALLOWED_ORIGINS = new Set(["https://localhost", "capacitor://localhost", "http://localhost"]);

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export const preflight = (req: Request) => new Response(null, { status: 204, headers: corsHeaders(req) });

/** Envuelve un handler para añadir CORS y evitar que la respuesta se guarde en caché. */
export function withCors(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    const res = await handler(req);
    for (const [k, v] of Object.entries(corsHeaders(req))) res.headers.set(k, v);
    res.headers.set("Cache-Control", "no-store");
    return res;
  };
}
