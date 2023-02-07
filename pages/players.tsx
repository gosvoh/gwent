import { getServerSession, Session } from "next-auth";
import { getData, useMap } from "../utils/utils";
import styles from "../styles/Players.module.scss";
import { authOptions } from "./api/auth/[...nextauth]";
import InviteType from "../types/invite";
import PlayerType from "../types/player";
import Link from "next/link";
import { useRouter } from "next/router";

const fractions = [
  "Монстры",
  "Нильфгаард",
  "Королевства Севера",
  "Скеллиге",
  "Скоя'таэли",
];

export default function PlayersList({
  authSession: session,
  players,
  invites,
}: {
  authSession: Session;
  players: PlayerType[];
  invites: InviteType[];
}) {
  const [inviteFractions, setInviteFractions] = useMap<string, string>();
  const [errorMessages, setErrorMessages] = useMap<string, string>();
  const router = useRouter();

  async function handleInvite(login: string) {
    let res = await fetch("/api/createInvite", {
      method: "POST",
      body: JSON.stringify({
        login,
        fraction: inviteFractions.get(login) || fractions[0],
      }),
    });
    let data = await res.json();
    if (res.status !== 200) setErrorMessages.set(login, data[0].ERROR);
    else router.replace(router.asPath);
    setTimeout(() => setErrorMessages.remove(login), 5000);
  }

  return (
    <div className="width-container">
      <h1>Players</h1>
      <table className={styles.list}>
        <thead>
          <tr>
            <th>Login</th>
            <th>Fraction</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {players.length === 1 && (
            <tr>
              <td colSpan={3}>No players except you</td>
            </tr>
          )}
          {players.map((player) => {
            if (player.login === session.user.name) return null;
            return (
              <tr key={player.login}>
                <td>{player.login}</td>
                <td>
                  {player.login !== session.user.name &&
                    !invites.some(
                      (invite) =>
                        invite.inviter === player.login ||
                        invite.invited === player.login
                    ) && (
                      <select
                        value={inviteFractions.get(player.login)}
                        onChange={(e) =>
                          setInviteFractions.set(player.login, e.target.value)
                        }
                      >
                        {fractions.map((fraction) => (
                          <option key={fraction} value={fraction}>
                            {fraction}
                          </option>
                        ))}
                      </select>
                    )}
                </td>
                <td className={styles.action}>
                  {invites.some((invite) => {
                    return (
                      invite.inviter === player.login ||
                      invite.invited === player.login
                    );
                  }) ? (
                    <Link href="/invites">Go to invites</Link>
                  ) : (
                    <>
                      {player.login !== session.user.name && (
                        <button onClick={() => handleInvite(player.login)}>
                          Invite
                        </button>
                      )}
                      {errorMessages.get(player.login) && (
                        <div>{errorMessages.get(player.login)}</div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export async function getServerSideProps({ req, res }: any) {
  let authSession = await getServerSession(req, res, authOptions);
  let players = await getData<PlayerType>(authSession, "showPlayers");
  let invites = await getData<InviteType>(authSession, "showInvites");

  return {
    props: {
      authSession,
      players,
      invites,
    },
  };
}
