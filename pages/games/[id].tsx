import { Session } from "next-auth";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/Field.module.scss";
import { requireAuth } from "../../utils/auth.utils";

type Game = {
  id: number;
  opponent: string;
  turn: string;
};

type Player = {
  login: string;
  tokens: number;
  leader: string;
  fraction: string;
  ready: boolean;
};

type Card = {
  name: string;
  type: "squad" | "special";
  selected: boolean;
};

interface FieldProps {
  authSession: Session;
  playerInfo: Player[];
  deck: Card[];
  cards: Card[];
}

export default function Field({
  authSession,
  playerInfo,
  deck,
  cards,
}: FieldProps) {
  let opponent: Player =
    playerInfo[0].login === authSession.user.name
      ? playerInfo[1]
      : playerInfo[0];
  let me: Player =
    playerInfo[0].login === authSession.user.name
      ? playerInfo[0]
      : playerInfo[1];

  if (deck.length === 0)
    return <SelectCards cards={cards} fraction={me.fraction} />;
  else return <GameField me={me} opponent={opponent} />;
}

interface GameFieldProps {
  opponent: Player;
  me: Player;
}

function GameField({ opponent, me }: GameFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.players}>
        <div className={styles.player}>
          <div
            className={styles.playerLeader}
            style={{
              backgroundImage: `url(/assets/${encodeURI(
                opponent.fraction
              )}/${encodeURI(opponent.leader)}.jpeg)`,
            }}
          ></div>
          <div className={styles.playerInfo}>
            <p>{opponent.login}</p>
            <p>{opponent.tokens}</p>
          </div>
        </div>
        <div className={styles.player}>
          <div
            className={styles.playerLeader}
            style={{
              backgroundImage: `url(/assets/${encodeURI(
                me.fraction
              )}/${encodeURI(me.leader)}.jpeg)`,
            }}
          ></div>
          <div className={styles.playerInfo}>
            <p>{me.tokens}</p>
            <div>Show deck</div>
            <button>Show beat</button>
            {opponent.ready && <button>End turn</button>}
          </div>
        </div>
      </div>
      <div className={styles.rows}>
        <div>Enemy os</div>
        <div>Enemy db</div>
        <div>Enemy rp</div>
        <div>My rp</div>
        <div>My db</div>
        <div>My os</div>
      </div>
    </div>
  );
}

interface SelectCardsProps {
  cards: Card[];
  fraction: string;
}

function SelectCards({ cards, fraction }: SelectCardsProps) {
  let [squadCards, setSquadCards] = useState<Card[]>([]);
  let [specialCards, setSpecialCards] = useState<Card[]>([]);

  return (
    <>
      <div className={styles.cardsGrid}>
        {cards.map((card) => (
          <CardComponent
            card={card}
            fraction={fraction}
            onClick={() => selectCard(card)}
          />
        ))}
      </div>
      <button
        className={
          specialCards.length > 10 || squadCards.length < 22
            ? `${styles.btn} ${styles.disabled}`
            : styles.btn
        }
        onClick={sendCards}
      >
        Send cards
      </button>
    </>
  );

  function selectCard(card: Card): void {
    if (card.type === "special") {
      if (specialCards.length === 10) return;

      if (specialCards.includes(card)) {
        card.selected = false;
        setSpecialCards(specialCards.filter((c) => c !== card));
      } else {
        card.selected = true;
        setSpecialCards([...specialCards, card]);
      }
    }
    if (card.type === "squad") {
      if (squadCards.includes(card)) {
        card.selected = false;
        setSquadCards(squadCards.filter((c) => c !== card));
      } else {
        card.selected = true;
        setSquadCards([...squadCards, card]);
      }
    }
  }

  function sendCards(): void {
    if (squadCards.length < 22) return;
    if (specialCards.length > 10) return;
  }
}

function CardComponent({
  card,
  fraction,
  onClick,
}: {
  card: Card;
  fraction: string;
  onClick?: () => void;
}) {
  let style = [styles.card];
  if (card.selected) style.push(styles.selected);

  return (
    <div className={style.join(" ")} onClick={onClick}>
      <Image
        src={`/assets/${encodeURI(fraction)}/${encodeURI(card.name)}.jpeg`}
        fill
        alt={`${card.name} from ${fraction}`}
      />
    </div>
  );
}

export async function getServerSideProps(context: any) {
  return requireAuth(context, async ({ session }: any) => {
    let playerInfo = await fetch(
      `http://localhost:3000/api/getPlayerInfo?gameId=${context.params.id}`,
      {
        method: "GET",
        headers: {
          cookie: context.req.headers.cookie,
        },
      }
    );
    let playerInfoData: Player[] = await playerInfo.json();

    let deck = await fetch(
      `http://localhost:3000/api/showDeck?gameId=${context.params.id}`,
      {
        method: "GET",
        headers: {
          cookie: context.req.headers.cookie,
        },
      }
    );
    let deckData: string[] = await deck.json();

    let cardsData: Card[] = [];
    if (deckData.length === 0) {
      let cards = await fetch(
        `http://localhost:3000/api/getAvailableCards?gameId=${context.params.id}`,
        {
          method: "GET",
          headers: {
            cookie: context.req.headers.cookie,
          },
        }
      );
      cardsData = await cards.json();
      let squadCards = cardsData.filter((card) => card.type === "squad");
      let specialCards = cardsData.filter((card) => card.type === "special");
      specialCards = [...specialCards, ...specialCards].sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      cardsData = [...squadCards, ...specialCards];
    }

    return {
      props: {
        authSession: session,
        playerInfo: playerInfoData,
        deck: deckData,
        cards: cardsData,
      },
    };
  });
}
