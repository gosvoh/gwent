import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import ErrorContainer from "../components/error.container";
import post from "../utils/request.manager";
import { requireAuth } from "../utils/utils";

export default function PlayersList({
  authSession: session,
  players,
}: {
  authSession: Session;
  players: any[];
}) {
  if (players[0] && players[0].ERROR)
    return (
      <ErrorContainer errorMessage={players[0].ERROR}>
        {players[0].ERROR === "Token has expired" && (
          <button onClick={() => signOut()}>Sign out</button>
        )}
      </ErrorContainer>
    );

  return (
    <div>
      <h1>Players</h1>
      <ul>
        {players.map((player) => (
          <li key={player.login}>{player.login}</li>
        ))}
      </ul>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  return requireAuth(context, async ({ session }: any) => {
    let players = await fetch("http://localhost:3000/api/showPlayers", {
      headers: {
        cookie: context.req.headers.cookie,
      },
    }).then((res) => res.json());

    // players = await players.json();
    return {
      props: {
        authSession: session,
        players,
      },
    };
  });
}
