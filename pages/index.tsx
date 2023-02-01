import styles from "../styles/Home.module.scss";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { getData } from "../utils/utils";

export default function Home({
  authSession: session,
}: {
  authSession: Session | null;
}) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Gwent</h1>

        {session ? <LoggedLayout session={session} /> : <DefaultLayout />}
      </main>
    </div>
  );
}

function DefaultLayout() {
  return (
    <>
      <p className={styles.description}>Get started</p>

      <div className={styles.buttons}>
        <Link href={""} onClick={() => signIn()}>
          Sign in
        </Link>
      </div>
    </>
  );
}

function LoggedLayout({ session }: { session: Session }) {
  return (
    <>
      <p className={styles.description}>
        Logged as <span className={styles.login}>{session.user.name}</span>
      </p>

      <div className={styles.buttons}>
        <Link href={"/games"}>Show games</Link>
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res }: any) {
  let authSession = await getServerSession(req, res, authOptions);
  let token = await getData<string>(authSession, "checkToken");
  if (!token || !token[0] || !token[0].token) authSession = null;

  return {
    props: {
      authSession,
    },
  };
}
