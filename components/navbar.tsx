import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import styles from "../styles/Navbar.module.scss";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className={styles.navbar}>
      <Link href={"/"}>Home</Link>
      {session ? (
        <Link href={""} onClick={() => signOut()}>
          Sign out
        </Link>
      ) : (
        <Link href={""} onClick={() => signIn()}>
          Sign in
        </Link>
      )}
    </nav>
  );
}
