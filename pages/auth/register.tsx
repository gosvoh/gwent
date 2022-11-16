import { FormEvent, useState } from "react";
import post from "../../utils/request.manager";
import styles from "../../styles/auth/Register.module.scss";
import { signIn } from "next-auth/react";
import { requireNonAuth } from "../../utils/utils";

export default function Register() {
  const [response, setResponse] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponse("");
    let login = event.currentTarget.login.value;
    let password = event.currentTarget.password.value;
    let response = await post("register", login, password);
    if (response[0].ERROR) setResponse(response[0].ERROR[0]);
    else await signIn("credentials", { username: login, password });
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
  await requireNonAuth(context);
  return { props: {} };
}
