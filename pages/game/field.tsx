// @ts-ignore
import styles from "../../styles/Field.module.scss";

export default function Field() {
  return (
    <div className={styles.field}>
      <div className={styles.players}>
        <div>Enemy</div>
        <div>Me</div>
      </div>
      <div className={styles.rows}>
        <div>Enemy os</div>
        <div>Enemy db</div>
        <div>Enemy rp</div>
        <div>Weather</div>
        <div>My rp</div>
        <div>My db</div>
        <div>My os</div>
      </div>
    </div>
  );
}
