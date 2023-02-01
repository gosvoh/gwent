import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import styles from "../styles/Navbar.module.scss";
import Logout from "./logout";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export default function Navbar({
  authSession: session,
}: {
  authSession: Session | null;
}) {
  return (
    <nav className={styles.navbar}>
      <Link href={"/"}>Home</Link>
      {session ? <LoggedLayout session={session} /> : <DefaultLayout />}
    </nav>
  );
}

function DefaultLayout() {
  return (
    <>
      <Link href={""} onClick={() => signIn()}>
        Sign in
      </Link>
      <Link href={"/auth/register"}>Register</Link>
    </>
  );
}

function LoggedLayout({ session }: { session: Session }) {
  return (
    <>
      <Link href={"/games"}>Show games</Link>
      <Link href={"/invites"}>Invites</Link>
      <Link href={"/players"}>Players</Link>
      <Logout token={session.user.token} />
      <p className={styles.player}>{session.user.name}</p>
    </>
  );
}

export async function getServerSideProps({ req, res }: any) {
  let authSession = await getServerSession(req, res, authOptions);
  return {
    props: { authSession },
  };
}
