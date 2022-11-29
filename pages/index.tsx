import styles from "../styles/Home.module.scss";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Session, unstable_getServerSession } from "next-auth";
import post from "../utils/request.manager";
import { useEffectOnce } from "../utils/utils";
import { authOptions } from "./api/auth/[...nextauth]";

export default function Home({
  authSession: session,
}: {
  authSession: Session | null;
}) {
  useEffectOnce(() => {
    post("checkToken").then((res) => {
      if (!res[0] || !res[0].token) session = null;
    });
  });

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

export async function getServerSideProps(context: any) {
  return {
    props: {
      authSession: await unstable_getServerSession(
        context.req,
        context.res,
        authOptions
      ),
    },
  };
}
