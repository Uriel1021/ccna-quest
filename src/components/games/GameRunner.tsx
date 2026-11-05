"use client";
import dynamic from "next/dynamic";
import { gameBySlug, type GameSlug } from "@/content/games";
import { GameFrame, type GameProps } from "./GameFrame";

/* Cada juego se descarga solo cuando se abre (la app sigue ligera). */
const Loading = () => <p className="py-10 text-center text-muted">Cargando juego…</p>;
const GAMES: Record<GameSlug, React.ComponentType<GameProps>> = {
  "torre-osi": dynamic(() => import("./TorreOsi"), { loading: Loading }),
  "binario-relampago": dynamic(() => import("./BinarioRelampago"), { loading: Loading }),
  "subnet-sprint": dynamic(() => import("./SubnetSprint"), { loading: Loading }),
  "ruta-del-paquete": dynamic(() => import("./RutaDelPaquete"), { loading: Loading }),
  "crimpa-el-cable": dynamic(() => import("./CrimpaCable"), { loading: Loading }),
  "encapsula": dynamic(() => import("./Encapsula"), { loading: Loading }),
  "switch-aprendiz": dynamic(() => import("./SwitchAprendiz"), { loading: Loading }),
  "puertos-en-caida": dynamic(() => import("./PuertosEnCaida"), { loading: Loading }),
  "apreton-tcp": dynamic(() => import("./ApretonTcp"), { loading: Loading }),
  "compresor-ipv6": dynamic(() => import("./CompresorIpv6"), { loading: Loading }),
  "clasifica-la-ip": dynamic(() => import("./ClasificaIp"), { loading: Loading }),
  "terminal-ios": dynamic(() => import("./TerminalIos"), { loading: Loading }),
  "defiende-la-red": dynamic(() => import("./DefiendeRed"), { loading: Loading }),
  "memorama-protocolos": dynamic(() => import("./Memorama"), { loading: Loading }),
};

export function GameRunner({ slug }: { slug: GameSlug }) {
  return <GameFrame meta={gameBySlug(slug)!} Game={GAMES[slug]} />;
}
