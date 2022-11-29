import { requireAuth } from "../../utils/utils";
import styles from "../../styles/Games.module.scss";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

export default function Games({
  authSession: session,
  games,
}: {
  authSession: Session;
  games: any;
}) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isDirty) {
      router.replace(router.asPath);
      setIsDirty(false);
    }
  }, [isDirty, router]);

  async function handleDeleteGame(game_id: number) {
    await fetch("http://localhost:3000/api/deleteGame", {
      method: "POST",
      body: JSON.stringify({ game_id }),
    });
    setIsDirty(true);
  }

  return (
    <div className="width-container">
      <h1 className={styles.title}>Games</h1>
      <table className={styles.gameList}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Opponent</th>
            <th>Turn</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 && (
            <tr>
              <td colSpan={4}>No games</td>
            </tr>
          )}
          {games.map((game: any) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{game.opponent}</td>
              <td>{game.turn === null ? session.user.name : game.turn}</td>
              <td>
                <button
                  onClick={async () => await router.push("/games/" + game.id)}
                >
                  Start
                </button>
                <button onClick={() => handleDeleteGame(game.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  return requireAuth(context, async ({ session }: any) => {
    let games = await fetch("http://localhost:3000/api/showGames", {
      headers: {
        cookie: context.req.headers.cookie,
      },
    }).then((res) => res.json());
    return {
      props: { authSession: session, games },
    };
  });
}
