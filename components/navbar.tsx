import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import styles from "../styles/Navbar.module.scss";
import Logout from "./logout";

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

function LoggedLayout({ session }: { session: any }) {
  return (
    <>
      <Link href={"/games"}>Show games</Link>
      <Logout token={session.user.token} />
    </>
  );
}
