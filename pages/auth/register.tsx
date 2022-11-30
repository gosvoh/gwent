import { FormEvent, useState } from "react";
import styles from "../../styles/auth/Register.module.scss";
import { signIn } from "next-auth/react";
import { requireNonAuth } from "../../utils/auth.utils";

export default function Register({ context }: any) {
  const [response, setResponse] = useState("");

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.header}>Register</h1>
      {response === "" ? <></> : <p className={styles.error}>{response}</p>}
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
  );
}

export async function getServerSideProps(context: any) {
  let red = await requireNonAuth(context);
  if (red) return { redirect: red.redirect, props: {} };
  return {
    props: {},
  };
}
