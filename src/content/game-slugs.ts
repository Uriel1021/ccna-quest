/** Lista simple (sin dependencias) para que next.config pueda precachear las páginas de juegos. */
export const GAME_SLUGS = [
  "torre-osi", "binario-relampago", "subnet-sprint", "ruta-del-paquete",
  "crimpa-el-cable", "encapsula", "switch-aprendiz", "puertos-en-caida", "apreton-tcp",
  "compresor-ipv6", "clasifica-la-ip", "terminal-ios", "defiende-la-red", "memorama-protocolos",
] as const;
export type GameSlug = (typeof GAME_SLUGS)[number];
