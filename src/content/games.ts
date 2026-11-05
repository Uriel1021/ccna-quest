import { Layers, Binary, Network, Route, Cable, Package, Router, ArrowDownToLine, Handshake, Minimize2, Shapes, SquareTerminal, ShieldCheck, Brain, type LucideIcon } from "lucide-react";
import type { Tint } from "@/components/ui/apple";

import type { GameSlug } from "./game-slugs";
export type { GameSlug };

export type GameMeta = {
  slug: GameSlug;
  title: string;
  tagline: string;
  module: number;          // módulo del temario que refuerza
  icon: LucideIcon;
  tint: Tint;
  minutes: number;
  learn: string;           // qué aprenderás (lenguaje sencillo)
  howTo: string[];         // instrucciones breves (H10)
};

export const GAMES: GameMeta[] = [
  {
    slug: "torre-osi", title: "Torre OSI", tagline: "Arma las 7 capas y acomoda cada pieza en su piso.",
    module: 3, icon: Layers, tint: "orange", minutes: 3,
    learn: "El modelo OSI divide la comunicación en 7 capas, como los pisos de un edificio: cada piso tiene un trabajo.",
    howTo: [
      "Ronda 1: toca las capas en orden, de arriba (7) hacia abajo (1). Toca un piso lleno para regresarlo.",
      "Ronda 2: te mostraremos un protocolo, equipo o dato; elige en qué capa trabaja.",
      "Ganas puntos por lo que aciertes al primer intento.",
    ],
  },
  {
    slug: "binario-relampago", title: "Binario relámpago", tagline: "Enciende bits y convierte números antes de que acabe el tiempo.",
    module: 5, icon: Binary, tint: "green", minutes: 1,
    learn: "Las computadoras cuentan con 0 y 1. Cada bit encendido suma su valor: 128, 64, 32, 16, 8, 4, 2, 1.",
    howTo: [
      "Tienes 60 segundos.",
      "Enciende los bits necesarios para formar el número, o elige la respuesta correcta.",
      "Cada error te quita 3 segundos. ¡Encadena aciertos!",
    ],
  },
  {
    slug: "subnet-sprint", title: "Subnet Sprint", tagline: "Calcula redes, máscaras y hosts como un profesional.",
    module: 11, icon: Network, tint: "indigo", minutes: 4,
    learn: "Dividir una red en subredes es como dividir un edificio en departamentos: cada uno con su rango de direcciones.",
    howTo: [
      "Responde 8 preguntas de subnetting.",
      "Después de cada respuesta verás el procedimiento explicado paso a paso.",
      "Truco: el \"tamaño de bloque\" es 256 menos el último número de la máscara.",
    ],
  },
  {
    slug: "ruta-del-paquete", title: "Ruta del paquete", tagline: "Eres el router: decide por dónde viaja cada paquete.",
    module: 8, icon: Route, tint: "pink", minutes: 4,
    learn: "Un router mira la dirección de destino y busca en su tabla la ruta que coincide con más bits (la más específica).",
    howTo: [
      "El paquete está en el router resaltado. Lee su tabla de routing.",
      "Toca la interfaz por la que debe salir el paquete.",
      "Si hay varias coincidencias, gana la más específica (el prefijo /más grande). Si ninguna coincide, usa la ruta por defecto 0.0.0.0/0.",
    ],
  },
  {
    slug: "crimpa-el-cable", title: "Crimpa el cable", tagline: "Acomoda los 8 hilos en el conector RJ-45 como un técnico.",
    module: 4, icon: Cable, tint: "teal", minutes: 3,
    learn: "Un cable de red UTP tiene 8 hilos en 4 pares de colores. El orden en el conector sigue una norma: T568B o T568A.",
    howTo: [
      "Toca los hilos en el orden correcto: se insertan del pin 1 al 8 (de izquierda a derecha).",
      "Toca un pin para sacar su hilo. Cuando estén los 8, presiona Crimpar.",
      "Al final elige qué tipo de cable usar en cada caso: directo, cruzado o de consola.",
    ],
  },
  {
    slug: "encapsula", title: "Encapsula el mensaje", tagline: "Envuelve tus datos capa por capa, como un regalo.",
    module: 3, icon: Package, tint: "purple", minutes: 3,
    learn: "Al enviar, cada capa le pone su propio encabezado a los datos (encapsular). Al recibir, se quitan en orden inverso.",
    howTo: [
      "Toca los encabezados en el orden en que se agregan al enviar.",
      "Luego desenvuelve el mensaje que llegó: quita primero la envoltura de afuera.",
      "Termina respondiendo cómo se llaman los datos en cada capa.",
    ],
  },
  {
    slug: "switch-aprendiz", title: "Switch aprendiz", tagline: "Aprende direcciones MAC y decide a dónde mandar cada trama.",
    module: 7, icon: Router, tint: "blue", minutes: 4,
    learn: "Un switch anota en su tabla qué MAC vive en qué puerto (mirando la MAC de origen) y usa esa tabla para reenviar.",
    howTo: [
      "Llega una trama: primero indica qué aprende el switch (la MAC de origen y su puerto).",
      "Después decide: si conoce la MAC de destino, la manda solo a ese puerto; si no, la inunda.",
      "Las tramas de broadcast (FF:FF:FF:FF:FF:FF) siempre se inundan.",
    ],
  },
  {
    slug: "puertos-en-caida", title: "Puertos en caída", tagline: "¡Atrapa cada servicio tocando su número de puerto!",
    module: 14, icon: ArrowDownToLine, tint: "orange", minutes: 2,
    learn: "Cada servicio de red escucha en un número de puerto conocido: la web en el 80/443, el correo en el 25, DNS en el 53…",
    howTo: [
      "Un servicio cae desde arriba. Toca su puerto antes de que llegue al suelo.",
      "Tienes 3 vidas: un error o un servicio que toca el suelo te quita una.",
      "Cada vez caen más rápido. ¡Atrapa 20 para la puntuación perfecta!",
    ],
  },
  {
    slug: "apreton-tcp", title: "Apretón TCP", tagline: "Abre la conexión, cuenta bytes y ciérrala sin perder un paso.",
    module: 14, icon: Handshake, tint: "green", minutes: 3,
    learn: "TCP saluda en 3 pasos (SYN, SYN-ACK, ACK), numera los bytes para que nada se pierda y se despide en 4 pasos.",
    howTo: [
      "Elige qué segmento envía cada equipo en su turno.",
      "Calcula el número de ACK: es el siguiente byte que se espera recibir.",
      "Al final decide si cada aplicación usa TCP o UDP.",
    ],
  },
  {
    slug: "compresor-ipv6", title: "Compresor IPv6", tagline: "Acorta direcciones IPv6 gigantes con dos reglas.",
    module: 12, icon: Minimize2, tint: "indigo", minutes: 3,
    learn: "Las direcciones IPv6 son largas, pero hay 2 reglas para abreviarlas: quitar ceros a la izquierda y cambiar UN bloque de grupos en cero por \"::\".",
    howTo: [
      "Regla 1: toca cada grupo que tenga ceros a la izquierda para quitárselos.",
      "Regla 2: toca el inicio del bloque de ceros más largo para cambiarlo por \"::\" (si empatan, el de la izquierda).",
      "Al final, expande direcciones abreviadas.",
    ],
  },
  {
    slug: "clasifica-la-ip", title: "Clasifica la IP", tagline: "¿Privada, pública, loopback…? ¡Clasifica contra reloj!",
    module: 11, icon: Shapes, tint: "blue", minutes: 1,
    learn: "Hay rangos IPv4 especiales: privadas (10.x, 172.16–31.x, 192.168.x), loopback (127.x), enlace local (169.254.x) y multicast (224–239.x).",
    howTo: [
      "Tienes 60 segundos.",
      "Toca la categoría de cada dirección IP.",
      "Cada error resta 3 segundos. ¡Encadena aciertos!",
    ],
  },
  {
    slug: "terminal-ios", title: "Terminal IOS", tagline: "Configura un switch Cisco escribiendo comandos reales.",
    module: 2, icon: SquareTerminal, tint: "gray", minutes: 5,
    learn: "Los equipos Cisco se configuran con comandos en una terminal. Hay modos: usuario (>), privilegiado (#) y configuración ((config)#).",
    howTo: [
      "Escribe comandos para cumplir cada misión. Puedes abreviarlos (conf t = configure terminal).",
      "Escribe ? para ver los comandos disponibles en el modo actual.",
      "Si te atoras, usa Pista (la misión vale menos puntos).",
    ],
  },
  {
    slug: "defiende-la-red", title: "Defiende la red", tagline: "Detén cada ataque con la defensa correcta antes de que llegue.",
    module: 16, icon: ShieldCheck, tint: "red", minutes: 3,
    learn: "Cada amenaza tiene una buena defensa: capacitar contra phishing, SSH en lugar de Telnet, copias de seguridad contra ransomware…",
    howTo: [
      "Un ataque se acerca a tu red. Elige la defensa que lo detiene antes de que se acabe su barra.",
      "Tienes 3 escudos: un error o un ataque que llega te quita uno.",
      "Detén 12 ataques para la puntuación perfecta.",
    ],
  },
  {
    slug: "memorama-protocolos", title: "Memorama de protocolos", tagline: "Voltea cartas y empareja cada protocolo con su trabajo.",
    module: 15, icon: Brain, tint: "purple", minutes: 2,
    learn: "Los protocolos de la capa de aplicación hacen los servicios que usas: DNS traduce nombres, DHCP reparte direcciones IP, SMTP envía correo…",
    howTo: [
      "Toca dos cartas para voltearlas.",
      "Si son pareja (protocolo + su función), se quedan boca arriba.",
      "Encuentra las 6 parejas con la menor cantidad de intentos.",
    ],
  },
];

export const gameBySlug = (slug: string) => GAMES.find((g) => g.slug === slug);
export const gamesForModule = (moduleId: number) => GAMES.filter((g) => g.module === moduleId);
