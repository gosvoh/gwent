import { getServerSession, Session } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getData, useMap } from "../utils/utils";
import styles from "../styles/Invites.module.scss";
import { authOptions } from "./api/auth/[...nextauth]";
import InviteType from "../types/invite";
import Link from "next/link";
import post from "../utils/request.adapter";

// const fractions = [
//   "Монстры",
//   "Нильфгаард",
//   "Королевства Севера",
//   "Скеллиге",
//   "Скоя'таэли",
// ];

export default function Invites({
  authSession: session,
  invites,
  fractions,
}: {
  authSession: Session;
  invites: InviteType[];
  fractions: string[];
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [login, setLogin] = useState("");
  const [fraction, setFraction] = useState(fractions[0]);
  const [isDirty, setIsDirty] = useState(false);
  const [inviteFractions, setInviteFractions] = useMap<string, string>();

  useEffect(() => {
    invites.forEach((invite) => {
      setInviteFractions.set(
        invite.dt.toString(),
        fractions[
          (fractions.indexOf(invite.inviter_fraction) + 1) % fractions.length
        ]
      );
    });
  }, [invites]);

  useEffect(() => {
    if (isDirty) {
      router.replace(router.asPath);
      setIsDirty(false);
    }
  }, [isDirty, router, setInviteFractions]);

  useEffect(() => {
    if (errorMessage) setTimeout(() => setErrorMessage(""), 5000);
  }, [errorMessage]);

  async function handleCancelInvite(invited: string) {
    await fetch("/api/cancelInvite", {
      method: "POST",
      body: JSON.stringify({ invited }),
    });
    setIsDirty(true);
  }

  async function handleDeclineInvite(inviter: string) {
    await fetch("/api/declineInvite", {
      method: "POST",
      body: JSON.stringify({ inviter }),
    });
    setIsDirty(true);
  }

  async function handleAcceptInvite(key: string, inviter: string) {
    const res = await fetch("/api/acceptInvite", {
      method: "POST",
      body: JSON.stringify({
        inviter,
        fraction: inviteFractions.get(key) || fractions[0],
      }),
    });
    setIsDirty(true);
  }

  async function handleCreateInvite(login: string, fraction: string) {
    const res = await fetch("/api/createInvite", {
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
            <th>Your fraction</th>
          </tr>
        </thead>
        <tbody>
          {invites.length === 0 && (
            <tr>
              <td colSpan={4}>
                No invites. <Link href="/players">Show players</Link>
              </td>
            </tr>
          )}
          {invites.map((invite: InviteType) => {
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
                      {fractions.map((fraction) => {
                        if (fraction === invite.inviter_fraction) return;
                        return (
                          <option key={fraction} value={fraction}>
                            {fraction}
                          </option>
                        );
                      })}
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
          Invite:
          <input
            type="text"
            id="invite"
            onInput={(e) => setLogin(e.currentTarget.value)}
          />
        </label>
        <label htmlFor="fraction">
          Fraction:
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

export async function getServerSideProps({ req, res }: any) {
  let authSession = await getServerSession(req, res, authOptions);
  let invites = await getData<InviteType>(authSession, "showInvites");
  let fractionsData = await post<{ name: string }>("getFractions");
  let fractions = fractionsData.map((fraction) => fraction.name);

  return {
    props: {
      authSession,
      invites,
      fractions,
    },
  };
}
