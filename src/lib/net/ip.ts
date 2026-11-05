/** Utilidades IPv4 (enteros sin signo de 32 bits). */

export const ipToInt = (ip: string) => ip.split(".").reduce((acc, o) => acc * 256 + Number(o), 0) >>> 0;
export const intToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");

export const maskInt = (prefix: number) => (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);
export const maskStr = (prefix: number) => intToIp(maskInt(prefix));

export const networkOf = (ip: number, prefix: number) => (ip & maskInt(prefix)) >>> 0;
export const broadcastOf = (ip: number, prefix: number) => (networkOf(ip, prefix) | (~maskInt(prefix) >>> 0)) >>> 0;

/** Hosts utilizables (se restan la dirección de red y la de broadcast). */
export const usableHosts = (prefix: number) => (prefix >= 31 ? 0 : 2 ** (32 - prefix) - 2);

/** Prefijo más grande (red más pequeña) que alcanza para `hosts` equipos. */
export const prefixForHosts = (hosts: number) => {
  for (let p = 30; p >= 1; p--) if (usableHosts(p) >= hosts) return p;
  return 0;
};

export function parseCidr(cidr: string) {
  const [ip, p] = cidr.split("/");
  return { net: ipToInt(ip), prefix: Number(p) };
}

export const matches = (ip: number, cidr: string) => {
  const { net, prefix } = parseCidr(cidr);
  return networkOf(ip, prefix) === networkOf(net, prefix);
};

/** Coincidencia más larga: la ruta con el prefijo más grande que contiene la IP. */
export function longestPrefixMatch<T extends { net: string }>(routes: T[], ip: string): T | undefined {
  const n = ipToInt(ip);
  return routes
    .filter((r) => matches(n, r.net))
    .sort((a, b) => parseCidr(b.net).prefix - parseCidr(a.net).prefix)[0];
}
