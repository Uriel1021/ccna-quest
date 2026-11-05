import { Layers, Binary, Network, Route, type LucideIcon } from "lucide-react";
import type { Tint } from "@/components/ui/apple";

export type GameSlug = "torre-osi" | "binario-relampago" | "subnet-sprint" | "ruta-del-paquete";

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
];

export const gameBySlug = (slug: string) => GAMES.find((g) => g.slug === slug);
export const gamesForModule = (moduleId: number) => GAMES.filter((g) => g.module === moduleId);
