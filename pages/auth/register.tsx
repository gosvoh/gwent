import { FormEvent, useEffect, useState } from "react";
import styles from "../../styles/auth/Register.module.scss";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";

export default function Register({ context }: any) {
  const [response, setResponse] = useState("");
  useEffect(() => {
    if (response) setTimeout(() => setResponse(""), 5000);
  }, [response]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (response) setResponse("");
    let login = event.currentTarget.login.value;
    let password = event.currentTarget.password.value;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    });

    if (res.status === 200)
      await signIn("credentials", { username: login, password });
    else setResponse(await res.json());
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.header}>Register</h1>
        <p className={styles.error}>{response === "" ? <br /> : response}</p>
        <label htmlFor="login">
          Login
          <input id="login" name="login" type="text" />
        </label>
        <label htmlFor="password">
          Password
          <input id="password" name="password" type="password" />
        </label>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export async function getServerSideProps({ req, res, ...context }: any) {
  let session = await getServerSession(req, res, authOptions);
  if (session)
    return { redirect: { destination: "/", permanent: false }, props: {} };
  return { props: {} };
}
