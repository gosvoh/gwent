import { useSession, signIn, getSession } from "next-auth/react";
import Router from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { requireAuth } from "../utils/utils";

type Game = {
  id: number;
  opponent: string;
  turn: string;
};

export default function Games({ session }: { session: Session }) {
  const [games, setGames] = useState<Game[]>([]);

  return (
    <div>
      <h1>Games</h1>
      {/* {games.map((game) => (
        <div key={game.id}>
          <Link href={`/games/${game.id}`}>{game.id}</Link>
        </div>
      ))} */}
    </div>
  );
}

export async function getServerSideProps(context: any) {
  return requireAuth(context, ({ session }: any) => {
    return {
      props: { session },
    };
  });
}
