/** Icono de la app (estilo iOS: degradado + glifo blanco). Se renderiza a PNG con next/og. */
export function AppIcon({ size, maskable = false }: { size: number; maskable?: boolean }) {
  const s = size;
  const g = maskable ? s * 0.5 : s * 0.62; // zona segura para iconos "maskable"
  return (
    <div style={{ width: s, height: s, display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #34aadc 0%, #007aff 55%, #5856d6 100%)",
      borderRadius: maskable ? 0 : s * 0.225 }}>
      <svg width={g} height={g} viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="24" y="6" width="16" height="12" rx="3" />
        <rect x="6" y="46" width="16" height="12" rx="3" />
        <rect x="42" y="46" width="16" height="12" rx="3" />
        <path d="M32 18v10M14 46v-9h36v9" />
      </svg>
    </div>
  );
}
