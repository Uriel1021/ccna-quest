/** Figuras de las lecciones de los módulos 1 a 8. */
import { Net, Seq, Fields, Stack, FigTable, Terminal, Flowchart } from "@/components/figures/engines";
import { IosModes, CommandAnatomy, RamNvram, IpSettings, CastTypes, Signals, BandwidthPipe, CopperTypes, Pinout, FiberModes, BitRow, Topologies, Duplex, SwitchMethods, CiaTriangle, DefenseLayers } from "@/components/figures/custom";
import type { FigDef } from "./figure-types";

export const FIGURES_A: Record<string, FigDef[]> = {
  /* ── Módulo 1 ── */
  "1.1": [{ caption: "Internet es una red de redes: tu casa y tu escuela se conectan a través de proveedores (ISP).", alt: "Red de una casa y red de una escuela conectadas a proveedores de Internet que se unen en Internet.",
    el: <Net h={170} areas={[{ x: 4, y: 20, w: 120, h: 140, l: "Casa" }, { x: 276, y: 20, w: 120, h: 140, l: "Escuela", c: "teal" }]}
      nodes={[{ id: "l", k: "laptop", x: 40, y: 60 }, { id: "p", k: "phone", x: 40, y: 120 }, { id: "r1", k: "router", x: 95, y: 90, l: "Router" },
        { id: "isp1", k: "cloud", x: 160, y: 50, l: "ISP" }, { id: "net", k: "cloud", x: 200, y: 120, l: "Internet" }, { id: "isp2", k: "cloud", x: 240, y: 50, l: "ISP" },
        { id: "r2", k: "router", x: 305, y: 90, l: "Router" }, { id: "s", k: "server", x: 365, y: 60 }, { id: "pc", k: "pc", x: 365, y: 120 }]}
      edges={[{ a: "l", b: "r1", t: "wifi" }, { a: "p", b: "r1", t: "wifi" }, { a: "r1", b: "isp1" }, { a: "isp1", b: "net" }, { a: "net", b: "isp2" }, { a: "isp2", b: "r2" }, { a: "r2", b: "s" }, { a: "r2", b: "pc" }]} /> }],
  "1.2": [{ caption: "Los tres componentes de una red: dispositivos finales, dispositivos intermediarios y medios.", alt: "Laptop, teléfono y servidor conectados por cable y Wi-Fi a un switch, un punto de acceso, un router y un firewall.",
    el: <Net h={190} areas={[{ x: 4, y: 18, w: 112, h: 166, l: "Finales (hosts)", c: "ok" }, { x: 124, y: 18, w: 272, h: 166, l: "Intermediarios", c: "brand" }]}
      nodes={[{ id: "l", k: "laptop", x: 50, y: 58, l: "Laptop" }, { id: "p", k: "phone", x: 50, y: 112, l: "Teléfono" }, { id: "srv", k: "server", x: 50, y: 160 },
        { id: "ap", k: "ap", x: 160, y: 90, l: "Punto de acceso" }, { id: "sw", k: "switch", x: 230, y: 140, l: "Switch" }, { id: "r", k: "router", x: 300, y: 90, l: "Router" }, { id: "fw", k: "firewall", x: 365, y: 140, l: "Firewall" }]}
      edges={[{ a: "l", b: "ap", t: "wifi" }, { a: "p", b: "ap", t: "wifi" }, { a: "srv", b: "sw", l: "cobre" }, { a: "ap", b: "sw" }, { a: "sw", b: "r" }, { a: "r", b: "fw", t: "fiber", l: "fibra" }]} /> }],
  "1.3": [{ caption: "Diagrama de topología lógica: muestra equipos, interfaces y direcciones IP.", alt: "Dos PCs conectadas a un switch y un router con etiquetas de interfaces y direcciones IP.",
    el: <Net h={178} nodes={[{ id: "a", k: "pc", x: 40, y: 50, l: "PC-A", s: "192.168.1.10" }, { id: "b", k: "pc", x: 40, y: 125, l: "PC-B", s: "192.168.1.11" },
        { id: "sw", k: "switch", x: 150, y: 88, l: "S1" }, { id: "r", k: "router", x: 260, y: 88, l: "R1", s: "G0/0: 192.168.1.1" }, { id: "c", k: "cloud", x: 360, y: 88, l: "ISP" }]}
      edges={[{ a: "a", b: "sw", lb: "F0/1" }, { a: "b", b: "sw", lb: "F0/2" }, { a: "sw", b: "r", la: "G0/1", lb: "G0/0" }, { a: "r", b: "c", la: "S0/0/0" }]} /> }],
  "1.4": [{ caption: "Dos LAN unidas por una WAN de un proveedor de servicios.", alt: "LAN de Monterrey y LAN de Guadalajara conectadas por una nube WAN.",
    el: <Net h={150} areas={[{ x: 4, y: 20, w: 140, h: 124, l: "LAN · Monterrey" }, { x: 256, y: 20, w: 140, h: 124, l: "LAN · Guadalajara", c: "teal" }]}
      nodes={[{ id: "p1", k: "pc", x: 35, y: 70 }, { id: "p2", k: "pc", x: 35, y: 120 }, { id: "s1", k: "switch", x: 75, y: 95 }, { id: "r1", k: "router", x: 120, y: 95 },
        { id: "w", k: "cloud", x: 200, y: 95, l: "WAN" }, { id: "r2", k: "router", x: 280, y: 95 }, { id: "s2", k: "switch", x: 325, y: 95 }, { id: "p3", k: "pc", x: 365, y: 70 }, { id: "p4", k: "pc", x: 365, y: 120 }]}
      edges={[{ a: "p1", b: "s1" }, { a: "p2", b: "s1" }, { a: "s1", b: "r1" }, { a: "r1", b: "w", t: "serial" }, { a: "w", b: "r2", t: "serial" }, { a: "r2", b: "s2" }, { a: "s2", b: "p3" }, { a: "s2", b: "p4" }]} /> }],
  "1.5": [{ caption: "Opciones de conexión a Internet para hogares y empresas.", alt: "Un hogar conectado al ISP por cable, DSL, celular o satélite y una empresa por línea dedicada o Metro Ethernet.",
    el: <Net h={150} nodes={[{ id: "h", k: "laptop", x: 50, y: 75, l: "Hogar" }, { id: "isp", k: "cloud", x: 200, y: 75, l: "ISP" }, { id: "e", k: "server", x: 350, y: 75, l: "Empresa" }]}
      edges={[{ a: "h", b: "isp" }, { a: "isp", b: "e", hl: "brand" }]}
      notes={[{ x: 118, y: 34, t: "cable · DSL", c: "muted" }, { x: 118, y: 48, t: "celular · satélite", c: "muted" }, { x: 282, y: 34, t: "línea dedicada", c: "brand" }, { x: 282, y: 48, t: "Metro Ethernet", c: "brand" },
        { x: 200, y: 135, t: "Las empresas pagan más por velocidad y confiabilidad garantizadas", c: "muted", w: 400, s: 9.5 }]} /> }],
  "1.6": [
    { caption: "Tolerancia a fallas: si un enlace se cae, el tráfico toma un camino alterno.", alt: "Dos routers con dos caminos; uno está roto y el tráfico usa el otro.",
      el: <Net h={150} nodes={[{ id: "a", k: "pc", x: 30, y: 75, l: "Origen" }, { id: "r1", k: "router", x: 110, y: 75 }, { id: "r2", k: "router", x: 200, y: 30 }, { id: "r3", k: "router", x: 200, y: 120 }, { id: "r4", k: "router", x: 290, y: 75 }, { id: "b", k: "server", x: 370, y: 75, l: "Destino" }]}
        edges={[{ a: "a", b: "r1" }, { a: "r1", b: "r2", t: "broken" }, { a: "r2", b: "r4" }, { a: "r1", b: "r3", hl: "ok" }, { a: "r3", b: "r4", hl: "ok" }, { a: "r4", b: "b" }]}
        flows={[{ path: ["r1", "r3", "r4"], c: "ok", dy: 18 }]} /> },
    { caption: "Las tres metas de la seguridad de la información (CIA).", alt: "Triángulo con confidencialidad, integridad y disponibilidad.", el: <CiaTriangle /> },
  ],
  "1.7": [{ caption: "Tipos de nube según quién la usa.", alt: "Tabla de nube pública, privada, híbrida y comunitaria.",
    el: <FigTable head={["Nube", "¿Para quién?", "Ejemplo"]} rows={[["Pública", "Cualquier persona u organización", "Google Drive, Microsoft 365"], ["Privada", "Una sola organización", "Centro de datos de un banco"], ["Híbrida", "Combina pública y privada", "Datos sensibles en privada, correo en pública"], ["Comunitaria", "Organizaciones con necesidades comunes", "Hospitales que comparten un sistema"]]} /> }],
  "1.9": [{ caption: "Algunas áreas de trabajo para quien estudia redes.", alt: "Tabla de puestos de trabajo en redes y qué hacen.",
    el: <FigTable head={["Área", "¿Qué hace?"]} rows={[["Soporte técnico", "Resuelve fallas de usuarios y equipos"], ["Administración de redes", "Configura y mantiene routers, switches y Wi-Fi"], ["Ciberseguridad", "Protege la red y responde a incidentes"], ["Nube", "Diseña y opera servicios en centros de datos"], ["Automatización", "Programa la configuración de muchos equipos a la vez"]]} /> }],
  "1.8": [{ caption: "La seguridad se aplica en capas: si una falla, las demás protegen.", alt: "Círculos concéntricos de defensa alrededor de un servidor.", el: <DefenseLayers /> }],

  /* ── Módulo 2 ── */
  "2.1": [{ caption: "Tres formas de entrar a la CLI de un switch.", alt: "Una laptop conectada por cable de consola, otra por SSH a través de la red y otra por Telnet.",
    el: <Net h={160} nodes={[{ id: "c", k: "laptop", x: 50, y: 40, l: "Consola" }, { id: "s", k: "laptop", x: 50, y: 125, l: "Remoto" }, { id: "sw", k: "switch", x: 320, y: 82, l: "Switch (IOS)" }]}
      edges={[{ a: "c", b: "sw", hl: "accent" }, { a: "s", b: "sw", hl: "ok" }]}
      notes={[{ x: 175, y: 38, t: "cable de consola (local)", c: "accent" }, { x: 175, y: 128, t: "SSH ✓ cifrado · Telnet ✗ sin cifrar", c: "ok" }]} /> }],
  "2.2": [{ caption: "Los modos de IOS son como escalones: cada uno da más permisos.", alt: "Escalera con los modos EXEC usuario, privilegiado, configuración global e interfaz.", el: <IosModes /> }],
  "2.3": [{ caption: "Partes de un comando de IOS.", alt: "El comando hostname SW-Aula con la palabra clave y el argumento señalados.", el: <CommandAnatomy /> }],
  "2.4": [{ caption: "Configuración básica de seguridad de un switch.", alt: "Terminal con los comandos hostname, enable secret, line console, service password-encryption y banner motd.",
    el: <Terminal lines={["Switch>enable", "Switch#configure terminal", "Switch(config)#hostname SW-Aula", "SW-Aula(config)#enable secret Cl4se$egura", "SW-Aula(config)#line console 0", "SW-Aula(config-line)#password C0ns0la!", "SW-Aula(config-line)#login", "SW-Aula(config-line)#exit", "SW-Aula(config)#service password-encryption", "SW-Aula(config)#banner motd # Solo personal autorizado #"]} /> }],
  "2.5": [{ caption: "Dónde vive cada configuración y cómo guardarla.", alt: "La running-config en RAM se copia a la startup-config en NVRAM.", el: <RamNvram /> }],
  "2.6": [{ caption: "Las PCs tienen IP y el switch se administra mediante su interfaz virtual (SVI).", alt: "Dos PCs con IP conectadas a un switch cuya interfaz VLAN 1 tiene IP.",
    el: <Net h={150} nodes={[{ id: "a", k: "pc", x: 50, y: 50, l: "PC-A", s: "192.168.1.10/24" }, { id: "b", k: "pc", x: 50, y: 120, l: "PC-B", s: "192.168.1.11/24" }, { id: "sw", k: "switch", x: 250, y: 85, l: "S1", s: "SVI VLAN 1: 192.168.1.2" }]}
      edges={[{ a: "a", b: "sw", lb: "F0/1" }, { a: "b", b: "sw", lb: "F0/2" }]} notes={[{ x: 350, y: 30, t: "VLAN 1 = interfaz", c: "muted", s: 9.5 }, { x: 350, y: 44, t: "virtual del switch", c: "muted", s: 9.5 }]} /> }],
  "2.7": [{ caption: "Los cuatro datos de red que necesita una PC.", alt: "Ventana de configuración con IP, máscara, gateway y DNS.", el: <IpSettings /> }],
  "2.8": [{ caption: "ping envía solicitudes de eco y espera respuestas.", alt: "Diagrama de secuencia: PC-A envía cuatro solicitudes de eco y PC-B responde a cada una.",
    el: <Seq lanes={["PC-A", "PC-B"]} kinds={["pc", "pc"]} msgs={[{ from: 0, to: 1, l: "Solicitud de eco", c: "brand" }, { from: 1, to: 0, l: "Respuesta de eco (tiempo = 2 ms)", c: "ok" }, { from: 0, to: 1, l: "Solicitud de eco", c: "brand" }, { from: 1, to: 0, l: "Respuesta de eco", c: "ok" }]} /> }],

  /* ── Módulo 3 ── */
  "3.1": [{ caption: "Tres formas de entregar un mensaje.", alt: "Un emisor envía a un equipo (unicast), a un grupo (multicast) y a todos (broadcast).", el: <CastTypes /> }],
  "3.2": [{ caption: "Para ver una página web colaboran varios protocolos; cada uno \"habla\" con su par del otro lado.", alt: "Pilas de protocolos HTTP, TCP, IP y Ethernet en cliente y servidor con líneas punteadas entre capas iguales.",
    el: <Stack peers cols={[{ title: "Cliente (navegador)", items: [{ t: "HTTP", c: "brand" }, { t: "TCP", c: "ok" }, { t: "IP", c: "teal" }, { t: "Ethernet", c: "indigo" }] }, { title: "Servidor web", items: [{ t: "HTTP", c: "brand" }, { t: "TCP", c: "ok" }, { t: "IP", c: "teal" }, { t: "Ethernet", c: "indigo" }] }]} /> }],
  "3.3": [{ caption: "Algunos protocolos de la suite TCP/IP por capa.", alt: "Tabla de protocolos por capa del modelo TCP/IP.",
    el: <FigTable head={["Capa TCP/IP", "Protocolos"]} rows={[["Aplicación", "HTTP, HTTPS, DNS, DHCP, SMTP, POP3, IMAP, FTP, SSH"], ["Transporte", "TCP, UDP"], ["Internet", "IPv4, IPv6, ICMP, OSPF"], ["Acceso a la red", "Ethernet, Wi-Fi (802.11), ARP, PPP"]]} /> }],
  "3.4": [{ caption: "Organizaciones que crean los estándares de redes.", alt: "Tabla con IETF, IEEE, ISO, ICANN e IANA y TIA/EIA.",
    el: <FigTable head={["Organización", "¿Qué estandariza?"]} rows={[["IETF", "Protocolos de Internet (documentos RFC)"], ["IEEE", "Ethernet (802.3), Wi-Fi (802.11)"], ["ISO", "Modelo de referencia OSI"], ["ICANN / IANA", "Direcciones IP, dominios y números de puerto"], ["TIA/EIA", "Cableado (TIA-568)"]]} /> }],
  "3.5": [{ caption: "El modelo OSI (7 capas) comparado con el modelo TCP/IP (4 capas).", alt: "Dos columnas: las 7 capas OSI y las 4 capas TCP/IP alineadas por equivalencia.",
    el: <Stack cols={[{ title: "Modelo OSI", items: [{ t: "7 · Aplicación", c: "danger" }, { t: "6 · Presentación", c: "warn" }, { t: "5 · Sesión", c: "pink" }, { t: "4 · Transporte", c: "ok" }, { t: "3 · Red", c: "teal" }, { t: "2 · Enlace de datos", c: "brand" }, { t: "1 · Física", c: "accent" }] },
      { title: "Modelo TCP/IP", items: [{ t: "Aplicación", span: 3, c: "danger", s: "HTTP, DNS, DHCP…" }, { t: "Transporte", c: "ok", s: "TCP, UDP" }, { t: "Internet", c: "teal", s: "IP" }, { t: "Acceso a la red", span: 2, c: "brand", s: "Ethernet, Wi-Fi" }] }]} /> }],
  "3.6": [{ caption: "Encapsulamiento: cada capa envuelve lo que recibe de la capa de arriba.", alt: "Barras que crecen: datos, luego segmento con encabezado TCP, paquete con encabezado IP y trama con encabezado y tráiler Ethernet.",
    el: <Fields side={["Datos", "Segmento", "Paquete", "Trama", "Bits"]} rows={[
      [{ t: "", w: 3 }, { t: "Datos", w: 4, c: "warn" }],
      [{ t: "", w: 2 }, { t: "TCP", w: 1, c: "ok" }, { t: "Datos", w: 4, c: "warn" }],
      [{ t: "", w: 1 }, { t: "IP", w: 1, c: "teal" }, { t: "TCP", w: 1, c: "ok" }, { t: "Datos", w: 4, c: "warn" }],
      [{ t: "Eth", w: 1, c: "brand" }, { t: "IP", w: 1, c: "teal" }, { t: "TCP", w: 1, c: "ok" }, { t: "Datos", w: 4, c: "warn" }, { t: "FCS", w: 1, c: "brand" }],
      [{ t: "0110100101110101001011010010110100…", w: 1, c: "accent" }]]} /> }],
  "3.7": [{ caption: "La IP de origen y destino se mantiene; las MAC cambian en cada tramo.", alt: "PC-A envía a un servidor en otra red pasando por un router; se muestran las direcciones de cada tramo.",
    el: <Net h={190} nodes={[{ id: "a", k: "pc", x: 40, y: 60, l: "PC-A", s: "IP A · MAC 0A" }, { id: "r", k: "router", x: 200, y: 60, l: "R1", s: "MAC R1a | R1b" }, { id: "b", k: "server", x: 360, y: 60, l: "Servidor", s: "IP S · MAC 0S" }]}
      edges={[{ a: "a", b: "r" }, { a: "r", b: "b" }]}
      notes={[{ x: 120, y: 125, t: "Tramo 1", w: 800 }, { x: 120, y: 142, t: "MAC: 0A → R1a", c: "brand", mono: true }, { x: 120, y: 158, t: "IP: A → S", c: "ok", mono: true },
        { x: 280, y: 125, t: "Tramo 2", w: 800 }, { x: 280, y: 142, t: "MAC: R1b → 0S", c: "brand", mono: true }, { x: 280, y: 158, t: "IP: A → S", c: "ok", mono: true },
        { x: 200, y: 182, t: "La IP es la dirección final; la MAC solo sirve dentro de cada red", c: "muted", s: 9.5, w: 400 }]} /> }],

  /* ── Módulo 4 ── */
  "4.1": [{ caption: "La capa física convierte los mismos bits en distintos tipos de señal.", alt: "Los bits 10110100 representados como voltaje en cobre, pulsos de luz en fibra y ondas de radio.", el: <Signals /> }],
  "4.2": [{ caption: "Ancho de banda (capacidad) contra rendimiento (lo que realmente pasa).", alt: "Un tubo de 1 Gb/s por el que solo pasan 650 Mb/s reales.", el: <BandwidthPipe /> }],
  "4.3": [{ caption: "Corte transversal de los cables de cobre más comunes.", alt: "Cables UTP, STP y coaxial vistos de frente.", el: <CopperTypes /> }],
  "4.4": [{ caption: "Orden de los hilos en el conector RJ-45 según TIA/EIA-568 (pin 1 a la izquierda).", alt: "Ocho hilos de colores para T568A y T568B.", el: <Pinout /> }],
  "4.5": [{ caption: "La luz viaja recta en la fibra monomodo y rebotando en la multimodo.", alt: "Dos fibras: una con un rayo recto y otra con un rayo en zigzag.", el: <FiberModes /> }],
  "4.6": [{ caption: "Una red inalámbrica: el punto de acceso conecta los equipos Wi-Fi con la red cableada.", alt: "Un punto de acceso con laptop, teléfono y tablet conectados por Wi-Fi y un cable hacia el switch.",
    el: <Net h={178} nodes={[{ id: "ap", k: "ap", x: 200, y: 70, l: "Punto de acceso" }, { id: "l", k: "laptop", x: 60, y: 40 }, { id: "p", k: "phone", x: 60, y: 120 }, { id: "l2", k: "laptop", x: 340, y: 40 }, { id: "sw", k: "switch", x: 340, y: 125, l: "Red cableada" }]}
      edges={[{ a: "l", b: "ap", t: "wifi" }, { a: "p", b: "ap", t: "wifi" }, { a: "l2", b: "ap", t: "wifi" }, { a: "ap", b: "sw" }]} notes={[{ x: 200, y: 172, t: "802.11 (Wi-Fi) · cobertura limitada por paredes e interferencia", c: "muted", s: 9.5, w: 400 }]} /> }],

  /* ── Módulo 5 ── */
  "5.1": [{ caption: "Cada bit encendido suma su valor: 192 = 128 + 64 y 172 = 128 + 32 + 8 + 4.", alt: "Tabla de valores 128 a 1 con los números 192, 172 y 255 en binario.", el: <BitRow examples={[192, 172, 255]} /> }],
  "5.2": [{ caption: "Cada dígito hexadecimal equivale a 4 bits.", alt: "Tabla de equivalencias de 0 a F entre decimal, hexadecimal y binario.",
    el: <FigTable mono={[1, 2, 4, 5]} head={["Dec", "Hex", "Binario", "Dec", "Hex", "Binario"]} rows={Array.from({ length: 8 }, (_, i) => [i, i.toString(16).toUpperCase(), i.toString(2).padStart(4, "0"), i + 8, (i + 8).toString(16).toUpperCase(), (i + 8).toString(2).padStart(4, "0")])} /> }],

  /* ── Módulo 6 ── */
  "6.1": [{ caption: "Las dos subcapas de la capa de enlace de datos.", alt: "Pila con capa de red, subcapas LLC y MAC, y capa física.",
    el: <Stack cols={[{ title: "Capa de enlace de datos en las LAN (IEEE 802)", items: [{ t: "Capa de red (IPv4 / IPv6)", c: "teal" }, { t: "LLC · comunica con la capa de red", c: "brand" }, { t: "MAC · direcciones y acceso al medio", c: "indigo" }, { t: "Capa física (cobre, fibra, radio)", c: "accent" }] }]} /> }],
  "6.2": [
    { caption: "Topologías WAN más comunes.", alt: "Dibujos de punto a punto, hub and spoke y malla.", el: <Topologies /> },
    { caption: "Half-duplex contra full-duplex.", alt: "Comunicación en un solo sentido a la vez contra ambos sentidos a la vez.", el: <Duplex /> },
  ],
  "6.3": [{ caption: "Estructura general de una trama.", alt: "Trama dividida en encabezado, datos y tráiler.",
    el: <Fields rows={[[{ t: "Encabezado", w: 3, c: "brand", s: "direcciones, tipo, control" }, { t: "Datos", w: 5, c: "warn", s: "el paquete IP" }, { t: "Tráiler", w: 2, c: "accent", s: "FCS" }]]} rowH={46} /> }],

  /* ── Módulo 7 ── */
  "7.1": [{ caption: "Campos de una trama Ethernet (tamaño en bytes).", alt: "Trama Ethernet con preámbulo, MAC destino, MAC origen, tipo, datos y FCS.",
    el: <Fields rowH={44} rows={[[{ t: "Preámb.", w: 7, c: "muted", s: "8" }, { t: "Destino", w: 7, c: "brand", s: "MAC · 6" }, { t: "Origen", w: 7, c: "teal", s: "MAC · 6" }, { t: "Tipo", w: 5, c: "accent", s: "2" }, { t: "Datos", w: 12, c: "ok", s: "46–1500" }, { t: "FCS", w: 5, c: "warn", s: "4" }]]} title="Trama Ethernet: 64 a 1518 bytes (sin contar el preámbulo)" /> }],
  "7.2": [{ caption: "Partes de una dirección MAC de 48 bits.", alt: "La MAC 00-60-2F-3A-07-BC dividida en OUI del fabricante y número de la tarjeta.",
    el: <Fields rowH={46} rows={[[{ t: "00-60-2F", w: 1, c: "brand", s: "OUI · fabricante (24 bits)" }, { t: "3A-07-BC", w: 1, c: "teal", s: "número de la tarjeta (24 bits)" }]]} title="Dirección MAC (12 dígitos hexadecimales)" /> }],
  "7.3": [{ caption: "PC-A envía a PC-C: el switch aprende la MAC de origen y, como no conoce el destino, inunda la trama.", alt: "Switch con cuatro PCs; la trama de PC-A se envía a todos los puertos menos al de entrada; la tabla MAC registra a PC-A en el puerto 1.",
    el: <>
      <Net h={150} nodes={[{ id: "a", k: "pc", x: 40, y: 40, l: "PC-A", s: "MAC AA", hl: true }, { id: "b", k: "pc", x: 40, y: 120, l: "PC-B", s: "MAC BB" }, { id: "sw", k: "switch", x: 200, y: 80, l: "Switch" }, { id: "c", k: "pc", x: 360, y: 40, l: "PC-C", s: "MAC CC" }, { id: "d", k: "pc", x: 360, y: 120, l: "PC-D", s: "MAC DD" }]}
        edges={[{ a: "a", b: "sw", lb: "Fa0/1", hl: "warn" }, { a: "b", b: "sw", lb: "Fa0/2", hl: "warn" }, { a: "c", b: "sw", lb: "Fa0/3", hl: "warn" }, { a: "d", b: "sw", lb: "Fa0/4", hl: "warn" }]} />
      <FigTable head={["Tabla MAC del switch", "Puerto"]} rows={[["AA (aprendida de la trama de PC-A)", "Fa0/1"]]} hl={[0]} mono={[1]} />
    </> }],
  "7.4": [{ caption: "Momento en que cada método de reenvío empieza a enviar la trama.", alt: "Trama Ethernet con marcas para fast-forward, fragment-free y store-and-forward.", el: <SwitchMethods /> }],

  /* ── Módulo 8 ── */
  "8.1": [{ caption: "Características del protocolo IP.", alt: "Tabla con las características sin conexión, máximo esfuerzo e independiente del medio.",
    el: <FigTable head={["Característica", "Qué significa", "Comparación"]} rows={[["Sin conexión", "No avisa antes de enviar", "Mandar una carta sin llamar antes"], ["Máximo esfuerzo", "No garantiza la entrega", "El correo no confirma que llegó"], ["Independiente del medio", "Funciona en cobre, fibra o Wi-Fi", "La carta viaja en camión, avión o barco"]]} /> }],
  "8.2": [{ caption: "Encabezado IPv4 (cada fila = 32 bits).", alt: "Campos del encabezado IPv4 en filas de 32 bits.",
    el: <Fields ruler={["bit 0", "8", "16", "24", "31"]} rows={[
      [{ t: "Versión", w: 4, c: "muted" }, { t: "IHL", w: 4, c: "muted" }, { t: "DS (QoS)", w: 8, c: "accent" }, { t: "Longitud total", w: 16 }],
      [{ t: "Identificación", w: 16 }, { t: "Flags", w: 3 }, { t: "Desplaz. de fragmento", w: 13 }],
      [{ t: "TTL", w: 8, c: "warn" }, { t: "Protocolo", w: 8, c: "ok" }, { t: "Suma de verificación", w: 16 }],
      [{ t: "Dirección IP de origen", w: 32, c: "brand" }], [{ t: "Dirección IP de destino", w: 32, c: "teal" }]]} /> }],
  "8.3": [{ caption: "Encabezado IPv6: más simple, de 40 bytes fijos.", alt: "Campos del encabezado IPv6.",
    el: <Fields ruler={["bit 0", "8", "16", "24", "31"]} rows={[
      [{ t: "Versión", w: 4, c: "muted" }, { t: "Clase de tráfico", w: 8, c: "accent" }, { t: "Etiqueta de flujo", w: 20 }],
      [{ t: "Longitud de carga útil", w: 16 }, { t: "Sig. encabezado", w: 8, c: "ok" }, { t: "Límite de saltos", w: 8, c: "warn" }],
      [{ t: "Dirección de origen (128 bits)", w: 32, c: "brand" }], [{ t: "Dirección de destino (128 bits)", w: 32, c: "teal" }]]} rowH={30} /> }],
  "8.4": [{ caption: "Cómo decide un equipo a quién entregar un paquete.", alt: "Diagrama de flujo: si el destino está en mi red se entrega directo, si no se envía al gateway.",
    el: <Flowchart h={190} nodes={[{ id: "s", x: 200, y: 20, t: "Tengo un paquete", w: 140 }, { id: "q", x: 200, y: 82, t: "¿Destino en mi red?", w: 170, k: "diamond" }, { id: "y", x: 80, y: 160, t: "Entrega directa", w: 130, k: "end" }, { id: "n", x: 320, y: 160, t: "Enviar al gateway", w: 140, k: "end", c: "warn" }]}
      edges={[{ a: "s", b: "q" }, { a: "q", b: "y", l: "Sí", via: [80, 82] }, { a: "q", b: "n", l: "No", via: [320, 82] }]} /> }],
  "8.5": [{ caption: "Tabla de routing de R1. Para el destino 10.1.1.20 coinciden dos rutas y gana la más específica (/24).", alt: "Tabla de routing con rutas conectadas, estáticas, OSPF y por defecto; resaltada la ruta 10.1.1.0/24.",
    el: <FigTable mono={[1, 2]} hl={[3]} head={["Código", "Red", "Salida", "Significado"]} rows={[["C", "192.168.1.0/24", "G0/0", "Directamente conectada"], ["L", "192.168.1.1/32", "G0/0", "IP de la propia interfaz"], ["S", "10.0.0.0/8", "S0/0/0", "Estática (menos específica)"], ["O", "10.1.1.0/24", "G0/1", "Aprendida por OSPF ✓ gana"], ["S*", "0.0.0.0/0", "S0/0/0", "Ruta predeterminada"]]} /> }],
};
