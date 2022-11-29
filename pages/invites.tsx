import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMap } from "../utils/utils";
import { requireAuth } from "../utils/auth.utils";
import styles from "../styles/Invites.module.scss";

type Invite = {
  ERROR?: string;
  inviter: string;
  invited: string;
  dt: Date;
  inviter_fraction: string;
};

const fractions = [
  "Чудовища",
  "Нильфгаард",
  "Королевства Севера",
  "Скеллиге",
  "Скоя'таэли",
];

export default function Invites({
  authSession: session,
  invites,
}: {
  authSession: Session;
  invites: Invite[];
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [login, setLogin] = useState("");
  const [fraction, setFraction] = useState(fractions[0]);
  const [isDirty, setIsDirty] = useState(false);
  const [inviteFractions, setInviteFractions] = useMap<string, string>();

  useEffect(() => {
    if (isDirty) {
      router.replace(router.asPath);
      setIsDirty(false);
    }
  }, [isDirty, router]);

  useEffect(() => {
    if (errorMessage) setTimeout(() => setErrorMessage(""), 5000);
  }, [errorMessage]);

  async function handleCancelInvite(invited: string) {
    await fetch("http://localhost:3000/api/cancelInvite", {
      method: "POST",
      body: JSON.stringify({ invited }),
    });
    setIsDirty(true);
  }

  async function handleDeclineInvite(inviter: string) {
    await fetch("http://localhost:3000/api/declineInvite", {
      method: "POST",
      body: JSON.stringify({ inviter }),
    });
    setIsDirty(true);
  }

  async function handleAcceptInvite(key: string, inviter: string) {
    const res = await fetch("http://localhost:3000/api/acceptInvite", {
      method: "POST",
      body: JSON.stringify({
        inviter,
        fraction: inviteFractions.get(key) || fractions[0],
      }),
    });
    setIsDirty(true);
  }

  async function handleCreateInvite(login: string, fraction: string) {
    const res = await fetch("http://localhost:3000/api/createInvite", {
      method: "POST",
      body: JSON.stringify({ login, fraction }),
    });
    if (res.status === 200) setIsDirty(true);
    else {
      const data = await res.json();
      setErrorMessage(data[0].ERROR);
    }
  }

  return (
    <div className="width-container">
      <h1 className={styles.title}>Invites</h1>
      <table className={styles.inviteList}>
        <thead>
          <tr>
            <th>Opponent</th>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Fraction</th>
          </tr>
        </thead>
        <tbody>
          {invites.length === 0 && (
            <tr>
              <td colSpan={4}>No invites</td>
            </tr>
          )}
          {invites.map((invite: Invite) => {
            let key = invite.dt.toString();

            return (
              <tr key={key}>
                <td>
                  {invite.inviter === session.user.name
                    ? invite.invited
                    : invite.inviter}
                </td>
                <td>{invite.dt.toString()}</td>
                <td className={styles.actions}>
                  {invite.inviter === session.user.name ? (
                    <button onClick={() => handleCancelInvite(invite.invited)}>
                      Cancel
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAcceptInvite(key, invite.inviter)}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(invite.inviter)}
                      >
                        Decline
                      </button>
                    </>
                  )}
                </td>
                <td>
                  {invite.inviter === session.user.name ? (
                    invite.inviter_fraction
                  ) : (
                    <select
                      value={inviteFractions.get(key)}
                      onChange={(e) =>
                        setInviteFractions.set(key, e.target.value)
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
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.inviteInput}>
        <label htmlFor="invite">
          Invite
          <input
            type="text"
            id="invite"
            onInput={(e) => setLogin(e.currentTarget.value)}
          />
        </label>
        <label htmlFor="fraction">
          Fraction
          <select id="fraction" onChange={(e) => setFraction(e.target.value)}>
            {fractions.map((fraction) => (
              <option key={fraction}>{fraction}</option>
            ))}
          </select>
        </label>

        <button onClick={async () => handleCreateInvite(login, fraction)}>
          Invite
        </button>
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  return requireAuth(context, async ({ session }: any) => {
    let invites = await fetch("http://localhost:3000/api/showInvites", {
      headers: {
        cookie: context.req.headers.cookie,
      },
    }).then((res) => res.json());
    return {
      props: { authSession: session, invites },
    };
  });
}
