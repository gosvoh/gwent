import styles from "../../styles/Field.module.scss";

type Game = {
  id: number;
  opponent: string;
  turn: string;
};

function Field() {
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

export default function GamePage() {
  return <Field />;
}

// export async function getServerSideProps(context: any) {
//     const { id } = context.params;
//     const game = await post("games/" + id);
//
//     return {
//         props: { game },
//     };
// }
