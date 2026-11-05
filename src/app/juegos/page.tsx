import { LargeTitle } from "@/components/ui/apple";
import { GameList } from "@/components/games/GameList";
export const metadata = { title: "Juegos" };
export default function Page() {
  return (
    <>
      <LargeTitle title="Juegos" subtitle="Aprende jugando: arma, convierte, calcula y enruta." />
      <GameList />
    </>
  );
}
