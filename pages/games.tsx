import { requireAuth } from "../utils/utils";
import post from "../utils/request.manager";
import styles from "../styles/Games.module.scss";
import { useRouter } from "next/router";
import Logout from "../components/logout";
import { Session } from "next-auth";

export default function Games({
  authSession: session,
  games,
}: {
  authSession: Session;
  games: any;
}) {
  const router = useRouter();

  if (games[0].ERROR) {
    return (
      <div>
        <h1>Games</h1>
        <p>{games[0].ERROR}</p>
        <Logout token={session.user.token} />
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Games</h1>
      <table className={styles.gameList}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Opponent</th>
            <th>Turn</th>
          </tr>
        </thead>
        <tbody>
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
    const games = await post("showGames", session.user.token);
    return {
      props: { authSession: session, games },
    };
  });
}
