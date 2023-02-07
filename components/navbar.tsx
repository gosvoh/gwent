import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import styles from "../styles/Navbar.module.scss";
import Logout from "./logout";
import { Session } from "next-auth";

export default function Navbar() {
  const { data: session } = useSession();

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
