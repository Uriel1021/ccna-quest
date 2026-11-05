import { notFound } from "next/navigation";
import { GAMES, gameBySlug } from "@/content/games";
import { GameRunner } from "@/components/games/GameRunner";

export const dynamicParams = false;
export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return { title: gameBySlug((await params).slug)?.title ?? "Juego" };
}

export default async function GamePage({ params }: Props) {
  const g = gameBySlug((await params).slug);
  if (!g) notFound();
  return <GameRunner slug={g.slug} />;
}
