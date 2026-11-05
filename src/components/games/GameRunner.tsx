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
};

export function GameRunner({ slug }: { slug: GameSlug }) {
  return <GameFrame meta={gameBySlug(slug)!} Game={GAMES[slug]} />;
}
