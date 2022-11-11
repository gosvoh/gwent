import styles from "../../styles/Field.module.scss";

export default function Field() {
  return (
    <div className={styles.field}>
      <div className={styles.players}>
        <div>
          <picture>Enemy picture</picture>
          <p>Enemy tokens</p>
        </div>
        <div>
          <picture>My picture</picture>
          <p>My tokens</p>
          <div>Show deck</div>
          <button>Show beat</button>
          <button>End turn</button>
        </div>
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
