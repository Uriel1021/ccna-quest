/** Figuras de las lecciones de los módulos 9 a 17. */
import { Net, Seq, Fields, Stack, FigTable, Terminal, Flowchart, NumberLine } from "@/components/figures/engines";
import { IpMask, Ipv6Compress, Eui64, CastTypes, PortRanges, Multiplex, DnsTree, DefenseLayers, QosQueue, CiaTriangle } from "@/components/figures/custom";
import type { FigDef } from "./figure-types";

const TWO_LANS = (labels: { a: string; r: string; b: string }) => (
  <Net h={150} areas={[{ x: 4, y: 18, w: 170, h: 126, l: "Red 192.168.1.0/24" }, { x: 226, y: 18, w: 170, h: 126, l: "Red 10.0.0.0/24", c: "teal" }]}
    nodes={[{ id: "a", k: "pc", x: 50, y: 80, l: "PC-A", s: labels.a }, { id: "r", k: "router", x: 200, y: 80, l: "R1", s: labels.r }, { id: "b", k: "server", x: 350, y: 80, l: "Servidor", s: labels.b }]}
    edges={[{ a: "a", b: "r", lb: "G0/0" }, { a: "r", b: "b", la: "G0/1" }]} flows={[{ path: ["a", "r", "b"], c: "warn" }]} />
);

export const FIGURES_B: Record<string, FigDef[]> = {
  /* ── Módulo 9 ── */
  "9.1": [{ caption: "Para llegar a otra red, la trama se dirige a la MAC del gateway; la IP de destino sigue siendo la del servidor.", alt: "PC-A en una red envía a un servidor en otra red a través del router.",
    el: <>{TWO_LANS({ a: ".10 · MAC AA", r: ".1 | .1", b: "10.0.0.5 · MAC SS" })}
      <FigTable mono={[1, 2]} head={["Tramo", "MAC destino", "IP destino"]} rows={[["PC-A → R1", "R1 (G0/0)", "10.0.0.5"], ["R1 → Servidor", "SS", "10.0.0.5"]]} /></> }],
  "9.2": [{ caption: "ARP: la solicitud va a todos (broadcast) y solo el dueño de la IP responde (unicast).", alt: "Diagrama de secuencia: PC-A envía una solicitud ARP a PC-B y PC-C; solo PC-B responde con su MAC.",
    el: <Seq lanes={["PC-A", "PC-B", "PC-C"]} kinds={["pc", "pc", "pc"]} msgs={[
      { from: 0, to: [1, 2], l: "¿Quién tiene 192.168.1.11?", s: "solicitud ARP · destino FF-FF-FF-FF-FF-FF", c: "warn" },
      { from: 1, to: 0, l: "Yo: mi MAC es BB-BB-BB…", s: "respuesta ARP · unicast", c: "ok", gap: 44 },
      { from: 0, to: 1, l: "Datos (trama a BB-BB-BB…)", c: "brand", gap: 44 }]} /> }],
  "9.3": [{ caption: "En IPv6 la resolución usa solicitud y anuncio de vecino (ICMPv6).", alt: "Diagrama de secuencia: PC-A envía NS a una dirección multicast y PC-B responde con NA.",
    el: <Seq lanes={["PC-A", "PC-B"]} kinds={["pc", "pc"]} msgs={[
      { from: 0, to: 1, l: "NS: ¿MAC de 2001:db8::b?", s: "a la multicast de nodo solicitado", c: "warn" },
      { from: 1, to: 0, l: "NA: mi MAC es BB-BB-BB…", s: "anuncio de vecino", c: "ok", gap: 44 }]} /> }],

  /* ── Módulo 10 ── */
  "10.1": [{ caption: "Configuración inicial de un router.", alt: "Terminal con hostname, enable secret, contraseñas de consola y VTY, cifrado de contraseñas y banner.",
    el: <Terminal lines={["Router(config)#hostname R1", "R1(config)#enable secret Cl4se$egura", "R1(config)#line console 0", "R1(config-line)#password C0ns0la!", "R1(config-line)#login", "R1(config-line)#line vty 0 4", "R1(config-line)#password R3moto!", "R1(config-line)#login", "R1(config-line)#exit", "R1(config)#service password-encryption", "R1(config)#banner motd # Acceso solo autorizado #", "R1(config)#end", "R1#copy running-config startup-config"]} /> }],
  "10.2": [
    { caption: "Un router con dos interfaces configuradas, cada una en una red distinta.", alt: "Router R1 con G0/0 en 192.168.10.1 y G0/1 en 192.168.11.1, cada una conectada a un switch.",
      el: <Net h={130} nodes={[{ id: "s1", k: "switch", x: 50, y: 60, l: "LAN 1" }, { id: "r", k: "router", x: 200, y: 60, l: "R1" }, { id: "s2", k: "switch", x: 350, y: 60, l: "LAN 2" }]}
        edges={[{ a: "s1", b: "r", lb: "G0/0" }, { a: "r", b: "s2", la: "G0/1" }]} notes={[{ x: 125, y: 100, t: "192.168.10.1/24", mono: true, c: "brand" }, { x: 275, y: 100, t: "192.168.11.1/24", mono: true, c: "teal" }]} /> },
    { caption: "Configurar y verificar una interfaz.", alt: "Terminal configurando G0/0 con ip address y no shutdown y verificando con show ip interface brief.",
      el: <Terminal lines={["R1(config)#interface g0/0", "R1(config-if)#description Enlace a la LAN 1", "R1(config-if)#ip address 192.168.10.1 255.255.255.0", "R1(config-if)#no shutdown", "%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to up", "R1(config-if)#end", "R1#show ip interface brief", "Interface      IP-Address     OK? Method Status  Protocol", "Gig0/0         192.168.10.1   YES manual up      up", "Gig0/1         unassigned     YES unset  administratively down down"]} /> },
  ],
  "10.3": [{ caption: "Todas las PCs de la LAN usan como gateway la IP del router en esa red.", alt: "Dos PCs con gateway 192.168.10.1 conectadas a un switch y al router que sale a Internet.",
    el: <Net h={178} nodes={[{ id: "a", k: "pc", x: 40, y: 45, l: "PC-A", s: "GW 192.168.10.1" }, { id: "b", k: "pc", x: 40, y: 125, l: "PC-B", s: "GW 192.168.10.1" }, { id: "sw", k: "switch", x: 150, y: 85 }, { id: "r", k: "router", x: 260, y: 85, l: "R1", s: "G0/0 = 192.168.10.1", hl: true }, { id: "i", k: "cloud", x: 360, y: 85, l: "Internet" }]}
      edges={[{ a: "a", b: "sw" }, { a: "b", b: "sw" }, { a: "sw", b: "r" }, { a: "r", b: "i" }]} flows={[{ path: ["a", "sw", "r", "i"], c: "warn" }]} /> }],

  /* ── Módulo 11 ── */
  "11.1": [{ caption: "La máscara indica qué bits son de red: al aplicar AND se obtiene la dirección de red.", alt: "IP 192.168.10.77 y máscara /26 en binario; el resultado AND es 192.168.10.64.", el: <IpMask /> }],
  "11.2": [{ caption: "Unicast, multicast y broadcast en IPv4.", alt: "Emisor enviando a uno, a un grupo y a todos.", el: <CastTypes /> }],
  "11.3": [{ caption: "Rangos IPv4 especiales que debes reconocer.", alt: "Tabla de rangos privados, loopback, APIPA y multicast.",
    el: <FigTable mono={[1]} head={["Tipo", "Rango", "Uso"]} rows={[["Privada", "10.0.0.0/8", "Redes internas grandes"], ["Privada", "172.16.0.0/12", "172.16.x.x a 172.31.x.x"], ["Privada", "192.168.0.0/16", "Casas y oficinas"], ["Loopback", "127.0.0.0/8", "El propio equipo (127.0.0.1)"], ["Enlace local (APIPA)", "169.254.0.0/16", "Sin respuesta de DHCP"], ["Multicast", "224.0.0.0/4", "224.x a 239.x · grupos"]]} /> }],
  "11.4": [{ caption: "Segmentar: una red grande se divide en subredes y el router separa sus broadcasts.", alt: "Router con tres subredes: estudiantes, profesores y administración.",
    el: <Net h={188} nodes={[{ id: "r", k: "router", x: 200, y: 40, l: "R1" }, { id: "s1", k: "switch", x: 70, y: 120, l: "Estudiantes", s: "192.168.10.0/24" }, { id: "s2", k: "switch", x: 200, y: 120, l: "Profesores", s: "192.168.20.0/24" }, { id: "s3", k: "switch", x: 330, y: 120, l: "Administración", s: "192.168.30.0/24" }]}
      edges={[{ a: "r", b: "s1" }, { a: "r", b: "s2" }, { a: "r", b: "s3" }]} notes={[{ x: 200, y: 182, t: "Cada subred es un dominio de broadcast independiente", c: "muted", s: 9.5, w: 400 }]} /> }],
  "11.5": [{ caption: "Una /24 dividida en cuatro subredes /26 (bloques de 64). El host .77 cae en la subred .64.", alt: "Recta de 0 a 255 dividida en bloques de 64 con una marca en 77.",
    el: <NumberLine title="Último octeto de 192.168.10.0/24 con máscara /26 (255.255.255.192)" blocks={[0, 64, 128, 192].map((f) => ({ from: f, size: 64, l: `.${f}/26` }))} marker={{ v: 77, l: "192.168.10.77 → red .64 · broadcast .127" }} /> }],
  "11.6": [{ caption: "Con /20 el bloque es 16 en el tercer octeto: 172.16.0.0, 172.16.16.0, 172.16.32.0…", alt: "Recta del tercer octeto dividida en bloques de 16.",
    el: <NumberLine title="Tercer octeto de 172.16.0.0/16 dividido en /20 (255.255.240.0)" blocks={Array.from({ length: 16 }, (_, i) => ({ from: i * 16, size: 16, l: i < 4 ? `.${i * 16}` : "" }))} marker={{ v: 40, l: "172.16.40.9 → red 172.16.32.0/20" }} /> }],
  "11.7": [{ caption: "Cada bit que se pide prestado duplica las subredes y reduce a la mitad los hosts (partiendo de una /24).", alt: "Tabla de prefijos de /25 a /30 con subredes y hosts.",
    el: <FigTable mono={[0, 1]} hl={[1]} head={["Prefijo", "Máscara", "Subredes", "Hosts por subred"]} rows={[["/25", "255.255.255.128", 2, 126], ["/26", "255.255.255.192", 4, 62], ["/27", "255.255.255.224", 8, 30], ["/28", "255.255.255.240", 16, 14], ["/29", "255.255.255.248", 32, 6], ["/30", "255.255.255.252", 64, 2]]} /> }],
  "11.8": [{ caption: "VLSM: cada subred recibe el tamaño que necesita, sin desperdicio.", alt: "Recta de una /24 dividida en una /25, una /26, una /27 y varias /30.",
    el: <NumberLine title="192.168.1.0/24 dividida con VLSM" blocks={[{ from: 0, size: 128, l: "LAN A /25 (126)", c: "brand" }, { from: 128, size: 64, l: "LAN B /26 (62)", c: "teal" }, { from: 192, size: 32, l: "/27", c: "accent" }, { from: 224, size: 4, c: "warn" }, { from: 228, size: 4, c: "warn" }, { from: 232, size: 24, l: "libre", c: "muted" }]} marker={{ v: 226, l: "enlaces entre routers: /30 (2 hosts)" }} /> }],
  "11.9": [{ caption: "Ejemplo de plan de direccionamiento para una LAN /24.", alt: "Tabla con rangos de IP reservados por tipo de dispositivo.",
    el: <FigTable mono={[0]} head={["Rango", "Uso", "Asignación"]} rows={[["192.168.10.1", "Gateway (router)", "Estática"], [".2 – .9", "Switches y puntos de acceso", "Estática"], [".10 – .19", "Servidores", "Estática"], [".20 – .29", "Impresoras", "Estática"], [".100 – .250", "Equipos de usuarios", "DHCP"]]} /> }],

  /* ── Módulo 12 ── */
  "12.1": [{ caption: "IPv4 contra IPv6: la diferencia en cantidad de direcciones es enorme.", alt: "Tabla comparando bits y cantidad de direcciones de IPv4 e IPv6.",
    el: <FigTable head={["", "IPv4", "IPv6"]} rows={[["Bits", "32", "128"], ["Direcciones", "≈ 4 300 millones", "≈ 340 sextillones (3.4 × 10³⁸)"], ["Escritura", "Decimal: 192.168.1.1", "Hexadecimal: 2001:db8::1"], ["¿Necesita NAT?", "Sí, casi siempre", "No"]]} /> }],
  "12.2": [{ caption: "Las dos reglas para abreviar una dirección IPv6.", alt: "Una dirección IPv6 completa, sin ceros a la izquierda y con ::.", el: <Ipv6Compress /> }],
  "12.3": [{ caption: "Tipos de direcciones IPv6.", alt: "Tabla de tipos de direcciones IPv6 con su prefijo.",
    el: <FigTable mono={[1]} head={["Tipo", "Prefijo", "Para qué sirve"]} rows={[["Unicast global (GUA)", "2000::/3", "Enrutable en Internet"], ["Link-local (LLA)", "fe80::/10", "Solo en el enlace local (todos la tienen)"], ["Unique local (ULA)", "fc00::/7", "Uso interno (como las privadas)"], ["Loopback", "::1/128", "El propio equipo"], ["Multicast", "ff00::/8", "Grupos (reemplaza al broadcast)"]]} /> }],
  "12.4": [{ caption: "Estructura de una dirección unicast global (GUA) típica.", alt: "Dirección GUA dividida en prefijo global de 48 bits, ID de subred de 16 bits e ID de interfaz de 64 bits.",
    el: <Fields rowH={46} title="2001:db8:acad : 0001 : 0000:0000:0000:0001" rows={[[{ t: "Prefijo global", w: 48, c: "brand", s: "48 bits (del ISP)" }, { t: "Subred", w: 16, c: "accent", s: "16 bits" }, { t: "ID de interfaz", w: 64, c: "ok", s: "64 bits (el equipo)" }]]} /> }],
  "12.5": [
    { caption: "El anuncio de router (RA) indica cómo obtener la dirección.", alt: "Diagrama de secuencia: la PC envía RS, el router responde RA con el prefijo y el método.",
      el: <Seq lanes={["PC", "Router"]} kinds={["pc", "router"]} msgs={[{ from: 0, to: 1, l: "RS: ¿hay routers?", s: "a ff02::2 (todos los routers)", c: "warn" }, { from: 1, to: 0, l: "RA: prefijo 2001:db8:acad:1::/64", s: "usa SLAAC · gateway = fe80::1", c: "ok", gap: 44 }]} /> },
    { caption: "EUI-64: el ID de interfaz se forma con la MAC.", alt: "Pasos de EUI-64: MAC, insertar FFFE e invertir el séptimo bit.", el: <Eui64 /> },
  ],
  "12.6": [{ caption: "Cómo se forma una dirección link-local automáticamente.", alt: "Prefijo fe80 de 64 bits más ID de interfaz de 64 bits.",
    el: <Fields rowH={46} title="fe80::fe99:47ff:fe75:cee0" rows={[[{ t: "fe80:0000:0000:0000", w: 1, c: "brand", s: "prefijo link-local /64" }, { t: "fe99:47ff:fe75:cee0", w: 1, c: "ok", s: "ID de interfaz (EUI-64 o aleatorio)" }]]} /> }],
  "12.7": [{ caption: "Direcciones multicast de IPv6 bien conocidas.", alt: "Tabla con ff02::1, ff02::2 y la de nodo solicitado.",
    el: <FigTable mono={[0]} head={["Dirección", "Grupo"]} rows={[["ff02::1", "Todos los nodos del enlace"], ["ff02::2", "Todos los routers del enlace"], ["ff02::1:ffXX:XXXX", "Nodo solicitado (últimos 24 bits de la unicast)"]]} /> }],
  "12.8": [{ caption: "Subredes /64 a partir de un prefijo /48: solo se cuenta en el hexteto del ID de subred.", alt: "Lista de subredes IPv6 contando 0000, 0001, 0002.",
    el: <FigTable mono={[0]} head={["Subred", "Uso"]} rows={[["2001:db8:acad:0000::/64", "Administración"], ["2001:db8:acad:0001::/64", "Estudiantes"], ["2001:db8:acad:0002::/64", "Profesores"], ["…", "hasta 65 536 subredes"]]} /> }],

  /* ── Módulo 13 ── */
  "13.1": [{ caption: "Mensajes ICMP más importantes.", alt: "Tabla de mensajes ICMP y cuándo se envían.",
    el: <FigTable head={["Mensaje", "Cuándo aparece"]} rows={[["Solicitud / respuesta de eco", "Al usar ping"], ["Destino inalcanzable", "No hay ruta, o el host o el puerto no existen"], ["Tiempo excedido", "El TTL llegó a 0 (lo usa traceroute)"], ["RS / RA (ICMPv6)", "Descubrir routers y prefijos"], ["NS / NA (ICMPv6)", "Resolver direcciones (reemplazan a ARP)"]]} /> }],
  "13.2": [{ caption: "traceroute aumenta el TTL en cada intento para descubrir cada router del camino.", alt: "Diagrama de secuencia: paquetes con TTL 1, 2 y 3 que provocan respuestas de tiempo excedido de R1 y R2 y la respuesta del destino.",
    el: <Seq lanes={["PC", "R1", "R2", "Destino"]} kinds={["pc", "router", "router", "server"]} msgs={[
      { from: 0, to: 1, l: "TTL=1", c: "brand" }, { from: 1, to: 0, l: "Tiempo excedido (R1)", c: "warn" },
      { from: 0, to: 2, l: "TTL=2", c: "brand" }, { from: 2, to: 0, l: "Tiempo excedido (R2)", c: "warn" },
      { from: 0, to: 3, l: "TTL=3", c: "brand" }, { from: 3, to: 0, l: "Respuesta ✓ (llegó)", c: "ok" }]} /> }],

  /* ── Módulo 14 ── */
  "14.1": [{ caption: "Varias aplicaciones usan la red a la vez gracias a los puertos.", alt: "Navegador, correo y videollamada envían segmentos a la capa de transporte con distintos puertos.", el: <Multiplex /> }],
  "14.2": [{ caption: "Encabezado TCP (cada fila = 32 bits).", alt: "Campos del encabezado TCP.",
    el: <Fields ruler={["bit 0", "8", "16", "24", "31"]} rows={[
      [{ t: "Puerto de origen", w: 16, c: "brand" }, { t: "Puerto de destino", w: 16, c: "teal" }],
      [{ t: "Número de secuencia", w: 32, c: "warn" }], [{ t: "Número de acuse de recibo (ACK)", w: 32, c: "ok" }],
      [{ t: "Long.", w: 4 }, { t: "Res.", w: 3 }, { t: "Banderas", w: 9, c: "accent", s: "SYN ACK FIN RST" }, { t: "Tamaño de ventana", w: 16, c: "pink" }],
      [{ t: "Suma de verificación", w: 16 }, { t: "Puntero urgente", w: 16 }]]} /> }],
  "14.3": [{ caption: "Encabezado UDP: solo 8 bytes.", alt: "Campos del encabezado UDP.",
    el: <Fields ruler={["bit 0", "16", "31"]} rows={[[{ t: "Puerto de origen", w: 1, c: "brand" }, { t: "Puerto de destino", w: 1, c: "teal" }], [{ t: "Longitud", w: 1 }, { t: "Suma de verificación", w: 1 }]]} /> }],
  "14.4": [{ caption: "Rangos de números de puerto y el concepto de socket.", alt: "Barra con los rangos de puertos bien conocidos, registrados y dinámicos.", el: <PortRanges /> }],
  "14.5": [{ caption: "Apertura (3 pasos) y cierre (4 pasos) de una conexión TCP.", alt: "Diagrama de secuencia con SYN, SYN-ACK, ACK, intercambio de datos y FIN, ACK, FIN, ACK.",
    el: <Seq lanes={["Cliente", "Servidor"]} kinds={["laptop", "server"]} msgs={[
      { from: 0, to: 1, l: "SYN", c: "brand", note: "apertura" }, { from: 1, to: 0, l: "SYN, ACK", c: "brand" }, { from: 0, to: 1, l: "ACK", c: "brand" },
      { from: 0, to: 1, l: "Datos ⇄", c: "ok", gap: 40 },
      { from: 0, to: 1, l: "FIN", c: "warn", gap: 40, note: "cierre" }, { from: 1, to: 0, l: "ACK", c: "warn" }, { from: 1, to: 0, l: "FIN", c: "warn" }, { from: 0, to: 1, l: "ACK", c: "warn" }]} /> }],
  "14.6": [{ caption: "El ACK indica el siguiente byte que se espera recibir.", alt: "Diagrama de secuencia: el emisor envía bytes con números de secuencia y el receptor confirma con ACK.",
    el: <Seq lanes={["Emisor", "Receptor"]} kinds={["laptop", "server"]} msgs={[
      { from: 0, to: 1, l: "SEQ=1 · 1000 bytes", c: "brand" }, { from: 0, to: 1, l: "SEQ=1001 · 1000 bytes", c: "brand" },
      { from: 1, to: 0, l: "ACK=2001 · ventana=4000", s: "recibí hasta el 2000; puedes enviar 4000 más", c: "ok", gap: 40 },
      { from: 0, to: 1, l: "SEQ=2001 · 1000 bytes ✕ (se pierde)", c: "danger", gap: 40 }, { from: 0, to: 1, l: "Retransmisión SEQ=2001", c: "warn" }]} /> }],
  "14.7": [{ caption: "UDP solo envía datagramas: no hay saludo, confirmación ni retransmisión.", alt: "Diagrama de secuencia: el cliente envía varios datagramas al servidor sin confirmaciones.",
    el: <Seq lanes={["Cliente", "Servidor"]} kinds={["phone", "server"]} msgs={[{ from: 0, to: 1, l: "Datagrama 1", c: "accent" }, { from: 0, to: 1, l: "Datagrama 2 ✕ (se pierde)", c: "danger" }, { from: 0, to: 1, l: "Datagrama 3", c: "accent" }, { from: 1, to: 0, l: "Respuesta (si la aplicación la necesita)", c: "ok" }]} /> }],

  /* ── Módulo 15 ── */
  "15.1": [{ caption: "Las tres capas superiores de OSI forman la capa de aplicación de TCP/IP.", alt: "Capas de aplicación, presentación y sesión de OSI unidas en la capa de aplicación de TCP/IP.",
    el: <Stack cols={[{ title: "OSI", items: [{ t: "7 · Aplicación", c: "danger", s: "servicios de red" }, { t: "6 · Presentación", c: "warn", s: "formato, compresión, cifrado" }, { t: "5 · Sesión", c: "pink", s: "inicia y cierra diálogos" }] }, { title: "TCP/IP", items: [{ t: "Aplicación", span: 3, c: "danger", s: "HTTP · DNS · DHCP · SMTP · FTP" }] }]} rowH={38} /> }],
  "15.2": [{ caption: "Cliente-servidor contra punto a punto (P2P).", alt: "A la izquierda varios clientes conectados a un servidor; a la derecha equipos conectados entre sí.",
    el: <Net h={160} areas={[{ x: 4, y: 16, w: 186, h: 138, l: "Cliente-servidor" }, { x: 210, y: 16, w: 186, h: 138, l: "Punto a punto (P2P)", c: "accent" }]}
      nodes={[{ id: "s", k: "server", x: 97, y: 60, l: "Servidor" }, { id: "c1", k: "laptop", x: 40, y: 125 }, { id: "c2", k: "pc", x: 97, y: 125 }, { id: "c3", k: "phone", x: 155, y: 125 },
        { id: "p1", k: "pc", x: 260, y: 60 }, { id: "p2", k: "pc", x: 350, y: 60 }, { id: "p3", k: "laptop", x: 260, y: 125 }, { id: "p4", k: "laptop", x: 350, y: 125 }]}
      edges={[{ a: "s", b: "c1" }, { a: "s", b: "c2" }, { a: "s", b: "c3" }, { a: "p1", b: "p2" }, { a: "p1", b: "p3" }, { a: "p2", b: "p4" }, { a: "p3", b: "p4" }, { a: "p1", b: "p4" }]} /> }],
  "15.3": [{ caption: "Recorrido de un correo: SMTP lo envía; POP3 o IMAP lo entregan al lector.", alt: "Ana envía con SMTP a su servidor, que reenvía con SMTP al servidor de Luis; Luis lo lee con IMAP o POP3.",
    el: <Net h={150} nodes={[{ id: "a", k: "laptop", x: 35, y: 70, l: "Ana" }, { id: "s1", k: "server", x: 145, y: 70, l: "Servidor A" }, { id: "s2", k: "server", x: 265, y: 70, l: "Servidor B" }, { id: "b", k: "phone", x: 370, y: 70, l: "Luis" }]}
      edges={[{ a: "a", b: "s1", l: "SMTP (25)", hl: "brand" }, { a: "s1", b: "s2", l: "SMTP (25)", hl: "brand" }, { a: "s2", b: "b", l: "IMAP / POP3", hl: "ok" }]}
      notes={[{ x: 200, y: 136, t: "HTTP (80) y HTTPS (443) se usan en cambio para las páginas web", c: "muted", s: 9.5, w: 400 }]} /> }],
  "15.4": [
    { caption: "DNS es una base de datos jerárquica y distribuida.", alt: "Árbol con la raíz, dominios de nivel superior .com, .mx y .org, y dominios debajo.", el: <DnsTree /> },
    { caption: "DHCP asigna la configuración IP en 4 mensajes (DORA).", alt: "Diagrama de secuencia Discover, Offer, Request y Acknowledgment entre cliente y servidor DHCP.",
      el: <Seq lanes={["Cliente", "Servidor DHCP"]} kinds={["laptop", "server"]} msgs={[{ from: 0, to: 1, l: "DHCPDISCOVER", s: "broadcast: ¿hay servidores DHCP?", c: "warn" }, { from: 1, to: 0, l: "DHCPOFFER", s: "te ofrezco 192.168.1.50", c: "brand", gap: 40 }, { from: 0, to: 1, l: "DHCPREQUEST", s: "acepto esa dirección", c: "warn", gap: 40 }, { from: 1, to: 0, l: "DHCPACK", s: "confirmado por 24 horas", c: "ok", gap: 40 }]} /> },
  ],
  "15.5": [{ caption: "FTP usa dos conexiones: una para comandos y otra para los datos.", alt: "Diagrama de secuencia: conexión de control en el puerto 21 y transferencia de datos en el puerto 20.",
    el: <Seq lanes={["Cliente FTP", "Servidor FTP"]} kinds={["laptop", "server"]} msgs={[{ from: 0, to: 1, l: "Conexión de control → puerto 21", s: "usuario, contraseña, comandos", c: "brand" }, { from: 0, to: 1, l: "Comando: descargar tarea.pdf", c: "brand", gap: 40 }, { from: 1, to: 0, l: "Datos del archivo ← puerto 20", c: "ok", gap: 40 }]} /> }],

  /* ── Módulo 16 ── */
  "16.1": [
    { caption: "Conceptos básicos de seguridad.", alt: "Tabla que define vulnerabilidad, amenaza, ataque y riesgo con ejemplos.",
      el: <FigTable head={["Concepto", "Qué es", "Ejemplo"]} rows={[["Vulnerabilidad", "Una debilidad", "El router usa la contraseña de fábrica"], ["Amenaza", "Algo que puede aprovecharla", "Un atacante que conoce esa contraseña"], ["Ataque", "El aprovechamiento real", "Entra y cambia la configuración"], ["Riesgo", "Probabilidad × impacto", "Alto: se puede caer toda la red"]]} /> },
    { caption: "Las tres metas que protege la seguridad.", alt: "Triángulo de confidencialidad, integridad y disponibilidad.", el: <CiaTriangle /> },
  ],
  "16.2": [{ caption: "Principales tipos de ataques.", alt: "Tabla de tipos de ataques con ejemplos.",
    el: <FigTable head={["Tipo", "Ejemplos"]} rows={[["Malware", "Virus, gusanos, troyanos, ransomware"], ["Reconocimiento", "Barridos de ping, escaneo de puertos"], ["Acceso", "Robo de contraseñas, intermediario (MITM)"], ["Denegación de servicio", "DoS y DDoS (con botnets)"], ["Ingeniería social", "Phishing, llamadas falsas de \"soporte\""]]} /> }],
  "16.3": [{ caption: "Defensa en profundidad: varias capas protegen los datos.", alt: "Círculos concéntricos de defensa alrededor de un servidor.", el: <DefenseLayers /> }],
  "16.4": [{ caption: "Habilitar SSH y frenar los ataques de fuerza bruta en un router.", alt: "Terminal con los comandos para configurar SSH y login block-for.",
    el: <Terminal lines={["R1(config)#ip domain-name escuela.mx", "R1(config)#crypto key generate rsa", "How many bits in the modulus [512]: 2048", "R1(config)#username admin secret Adm1n$egur0", "R1(config)#line vty 0 4", "R1(config-line)#login local", "R1(config-line)#transport input ssh", "R1(config-line)#exec-timeout 5", "R1(config-line)#exit", "R1(config)#login block-for 120 attempts 3 within 60", "R1(config)#security passwords min-length 10"]} /> }],

  /* ── Módulo 17 ── */
  "17.1": [{ caption: "Una red pequeña típica.", alt: "Router conectado a Internet, un switch con PCs, impresora y servidor, y un punto de acceso inalámbrico.",
    el: <Net h={170} nodes={[{ id: "i", k: "cloud", x: 200, y: 22, l: "Internet" }, { id: "r", k: "router", x: 200, y: 66, l: "Router" }, { id: "sw", k: "switch", x: 200, y: 124 }, { id: "p1", k: "pc", x: 50, y: 118 }, { id: "pr", k: "printer", x: 110, y: 155 }, { id: "sv", k: "server", x: 290, y: 155 }, { id: "ap", k: "ap", x: 350, y: 118 }, { id: "ph", k: "phone", x: 370, y: 60 }]}
      edges={[{ a: "i", b: "r" }, { a: "r", b: "sw" }, { a: "sw", b: "p1" }, { a: "sw", b: "pr" }, { a: "sw", b: "sv" }, { a: "sw", b: "ap" }, { a: "ap", b: "ph", t: "wifi" }]} /> }],
  "17.2": [{ caption: "Con QoS, el tráfico de voz sale primero.", alt: "Cola de paquetes donde los de voz se priorizan sobre la web y los archivos.", el: <QosQueue /> }],
  "17.3": [{ caption: "Qué documentar para que la red pueda crecer con orden.", alt: "Tabla de documentación de red.",
    el: <FigTable head={["Documento", "Contenido"]} rows={[["Diagrama de topología", "Equipos, conexiones e interfaces"], ["Inventario de equipos", "Modelo, ubicación, versión de IOS"], ["Plan de direccionamiento", "Subredes y rangos por tipo de equipo"], ["Análisis de tráfico", "Protocolos usados y consumo de ancho de banda"]]} /> }],
  "17.4": [{ caption: "ping y traceroute desde un router Cisco.", alt: "Terminal con un ping exitoso y un traceroute de tres saltos.",
    el: <Terminal lines={["R1#ping 10.1.1.10", "Type escape sequence to abort.", "Sending 5, 100-byte ICMP Echos to 10.1.1.10, timeout is 2 seconds:", "!!!!!", "Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms", "R1#traceroute 10.1.1.10", "  1 192.168.12.2  1 msec", "  2 192.168.23.3  2 msec", "  3 10.1.1.10     3 msec"]} /> }],
  "17.5": [{ caption: "Ver la configuración IP de una PC con Windows.", alt: "Terminal con la salida de ipconfig /all.",
    el: <Terminal title="Símbolo del sistema" lines={["C:\\>ipconfig /all", "Adaptador de Ethernet:", "   Dirección física. . . . . : 00-1A-2B-3C-4D-5E", "   DHCP habilitado . . . . . : sí", "   Dirección IPv4. . . . . . : 192.168.10.105", "   Máscara de subred . . . . : 255.255.255.0", "   Puerta de enlace. . . . . : 192.168.10.1", "   Servidores DNS. . . . . . : 8.8.8.8"]} /> }],
  "17.6": [{ caption: "Proceso general de solución de problemas.", alt: "Diagrama de flujo con los pasos identificar, teoría, probar, solucionar, verificar y documentar.",
    el: <Flowchart h={250} nodes={[{ id: "1", x: 110, y: 22, t: "1. Identificar el problema", w: 190 }, { id: "2", x: 110, y: 72, t: "2. Teoría de la causa", w: 190 }, { id: "3", x: 110, y: 126, t: "¿Se confirma?", w: 160, k: "diamond" }, { id: "4", x: 110, y: 180, t: "4. Planear y aplicar solución", w: 190 }, { id: "5", x: 110, y: 228, t: "5. Verificar y documentar", w: 190, k: "end" }, { id: "x", x: 320, y: 126, t: "Nueva teoría o escalar", w: 150, c: "warn" }]}
      edges={[{ a: "1", b: "2" }, { a: "2", b: "3" }, { a: "3", b: "4", l: "Sí" }, { a: "4", b: "5" }, { a: "3", b: "x", l: "No" }, { a: "x", b: "2", via: [320, 72] }]} /> }],
  "17.7": [{ caption: "Síntomas frecuentes y su causa probable.", alt: "Tabla de síntomas y causas.",
    el: <FigTable head={["Síntoma", "Causa probable"]} rows={[["La PC tiene 169.254.x.x", "No llegó al servidor DHCP"], ["ping por IP funciona, por nombre no", "Problema de DNS"], ["Llega a su red pero no a otras", "Gateway incorrecto o sin ruta"], ["Enlace lento con muchos errores", "Discordancia de dúplex o cable dañado"], ["\"Conflicto de direcciones IP\"", "Dos equipos con la misma IP"]]} /> }],
};
