import styles from "../styles/Home.module.scss";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

type User = {
  token: string;
};

export default function Home() {
  const { data: session } = useSession();
  // @ts-ignore
  const user: User = { token: session?.user?.name || "" };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Gwent</h1>

        <p className={styles.description}>
          {session ? (
            <>
              Logged as <span className={styles.login}>{user.token}</span>
            </>
          ) : (
            <>Get started</>
          )}
        </p>

        <div className={styles.buttons}>
          {session ? (
            <Link href={"/game/field"}>Go to game</Link>
          ) : (
            <Link href={""} onClick={() => signIn()}>
              Sign in
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
