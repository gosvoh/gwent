import Link from "next/link";
import styles from "../styles/Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Link href={"https://github.com/gosvoh"}>gosvoh 2022</Link>
    </footer>
  );
}
