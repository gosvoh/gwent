import { randomBytes } from "crypto";
import { Session } from "next-auth";
import Image from "next/image";
import { useRouter } from "next/router";
import { CSSProperties, forwardRef, Ref, useState } from "react";
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
  type?: "squad" | "special";
  selected?: boolean;
};

interface GameProps {
  authSession: Session;
  playerInfo: Player[];
  deck: Card[];
  cards: Card[];
}

export default function Game({
  authSession,
  playerInfo,
  deck,
  cards,
}: GameProps) {
  let opponent: Player =
    playerInfo[0].login === authSession.user.name
      ? playerInfo[1]
      : playerInfo[0];
  let me: Player =
    playerInfo[0].login === authSession.user.name
      ? playerInfo[0]
      : playerInfo[1];

  if (deck.length === 0) {
    if (me.ready) return <p>Waiting for opponent</p>;
    else return <SelectCards cards={cards} fraction={me.fraction} />;
  } else return <GameField me={me} opponent={opponent} deck={deck} />;
}

interface GameFieldProps {
  opponent: Player;
  me: Player;
  deck: Card[];
}

function GameField({ opponent, me, deck }: GameFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.players}>
        <div className={styles.player}>
          <CardComponent
            card={{ name: opponent.leader }}
            fraction={opponent.fraction}
            className={styles.playerLeader}
          />
          <div className={styles.playerInfo}>
            <p className={styles.playerLogin}>{opponent.login}</p>
            <div className={styles.tokens}>
              {opponent.tokens > 0 &&
                Array(opponent.tokens)
                  .fill(0)
                  .map((_, i) => (
                    <div className={styles.token} key={i}>
                      <Image
                        src={`/assets/${encodeURI(
                          opponent.fraction
                        )}/Фишка.jpeg`}
                        alt="token"
                        fill
                        sizes="100%"
                      />
                    </div>
                  ))}
            </div>
          </div>
        </div>
        <div className={styles.player}>
          <CardComponent
            card={{ name: me.leader }}
            fraction={me.fraction}
            className={styles.playerLeader}
          />
          <div className={styles.playerInfo}>
            <div className={styles.tokens}>
              {me.tokens > 0 &&
                Array(me.tokens)
                  .fill(0)
                  .map((_, i) => (
                    <div className={styles.token} key={i}>
                      <Image
                        src={`/assets/${encodeURI(me.fraction)}/Фишка.jpeg`}
                        alt="token"
                        fill
                        sizes="100%"
                      />
                    </div>
                  ))}
            </div>
            <div className={styles.actions}>
              <button>Show deck</button>
              <button>Show beat</button>
              {opponent.ready ? <button>End turn</button> : null}
            </div>
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
      <div className={styles.deckGrid}>
        {deck.map((card) => (
          <CardComponent
            card={card}
            key={randomBytes(16).toString("hex")}
            fraction={me.fraction}
          />
        ))}
      </div>
    </div>
  );

  function selectCard(card: Card): void {}
}

interface SelectCardsProps {
  cards: Card[];
  fraction: string;
}

function SelectCards({ cards, fraction }: SelectCardsProps) {
  let [squadCards, setSquadCards] = useState<Card[]>([]);
  let [specialCards, setSpecialCards] = useState<Card[]>([]);
  let router = useRouter();
  let iterator = 0;

  return (
    <>
      <div className={styles.cardsGrid}>
        {cards.map((card) => (
          <CardComponent
            card={card}
            fraction={fraction}
            onClick={() => selectCard(card)}
            key={card.name + iterator++}
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

  async function sendCards(): Promise<void> {
    if (squadCards.length < 22) return;
    if (specialCards.length > 10) return;

    // concat both arrays with comma and send to addCardsToDeck api
    let req = await fetch(
      `http://localhost:3000/api/addCardsToDeck?gameId=${router.query.id}`,
      {
        method: "POST",
        body: JSON.stringify({
          cards: [...squadCards, ...specialCards].map((card) => card.name),
        }),
      }
    );

    if (req.status === 200) router.push(`/games/${router.query.id}`);
  }
}

interface CardComponentInterface {
  card: Card;
  fraction: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

function CardComponent({
  card,
  fraction,
  onClick,
  className,
  style,
}: CardComponentInterface) {
  let classNames = [];
  if (className) classNames.push(className);
  else classNames.push(styles.card);
  if (card.selected) classNames.push(styles.selected);

  return (
    <div className={classNames.join(" ")} onClick={onClick} style={style}>
      <Image
        src={`/assets/${encodeURI(fraction)}/${encodeURI(card?.name)}.jpeg`}
        fill
        sizes="100%"
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
      `http://localhost:3000/api/showGameDeck?gameId=${context.params.id}`,
      {
        method: "GET",
        headers: {
          cookie: context.req.headers.cookie,
        },
      }
    );
    let deckData: Card[] = await deck.json();

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
