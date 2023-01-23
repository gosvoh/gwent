import { randomBytes } from "crypto";
import { Session } from "next-auth";
import Image from "next/image";
import { useRouter } from "next/router";
import { CSSProperties, useEffect, useRef, useState } from "react";
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
  skipped: boolean;
};

type Card = {
  name: string;
  type?: "squad" | "special";
  selected?: boolean;
  row?: "Осадный" | "Дальнобойный" | "Рукопашный" | null;
  player?: string;
};

interface GameProps {
  authSession: Session;
  playerInfo: Player[];
  deck: Card[];
  availableCards: Card[];
  cardsInRows: Card[];
}

export default function Game({
  authSession,
  playerInfo,
  deck,
  availableCards,
  cardsInRows,
}: GameProps) {
  let opponent: Player =
    playerInfo[0].login === authSession.user.name
      ? playerInfo[1]
      : playerInfo[0];
  let me: Player =
    playerInfo[0].login === authSession.user.name
      ? playerInfo[0]
      : playerInfo[1];

  if (opponent.tokens === 0) return <Winner winner={me.login} />;
  if (me.tokens === 0) return <Winner winner={opponent.login} />;

  if (deck.length === 0 && cardsInRows.length === 0) {
    if (me.ready) return <Waiting />;
    if (cardsInRows.length === 0)
      return (
        <SelectCards availableCards={availableCards} fraction={me.fraction} />
      );
  } else
    return (
      <GameField
        me={me}
        opponent={opponent}
        deck={deck}
        cardsInRows={cardsInRows}
      />
    );
}

function Winner({ winner }: { winner: string }) {
  return <p>{winner} won!</p>;
}

function Waiting() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.replace(router.asPath), 10000);
    return () => clearInterval(interval);
  }, []);
  return <p>Waiting for opponent</p>;
}

interface GameFieldProps {
  opponent: Player;
  me: Player;
  deck: Card[];
  cardsInRows: Card[];
}

function GameField({ opponent, me, deck, cardsInRows }: GameFieldProps) {
  const [normalizedDeck, setNormalizedDeck] = useState<Card[]>([]);
  const myOSRef = useRef<HTMLDivElement>(null);
  const myDBRef = useRef<HTMLDivElement>(null);
  const myRPRef = useRef<HTMLDivElement>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("me, opponent", me, opponent);
  }, [me, opponent]);

  useEffect(() => {
    const interval = setInterval(() => router.replace(router.asPath), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (deck.length === 0) return;

    let uniqueDuplicates = findDuplicates(deck.map((card) => card.name));
    let newDeck = [...deck];
    if (uniqueDuplicates.length > 0) {
      let index = deck.findIndex((card) => card.name === uniqueDuplicates[0]);
      newDeck.splice(index, 1);
    }
    setNormalizedDeck(newDeck);
    console.log("deck, newDeck", deck, newDeck);
  }, [deck]);

  function handleSkipRound() {
    fetch(`/api/skipRound?game_id=${router.query.id}`, {
      method: "POST",
    });
    router.replace(router.asPath);
  }

  return (
    <div className={styles.field}>
      <div className={styles.players}>
        <div className={styles.player}>
          <CardComponent
            card={{ name: opponent.leader }}
            fraction={opponent.fraction}
            className={
              styles.playerLeader + (opponent.ready ? " " + styles.active : "")
            }
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
            className={
              styles.playerLeader + (me.ready ? " " + styles.active : "")
            }
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
              <button disabled={opponent.ready}>End turn</button>
              <button onClick={handleSkipRound} disabled={me.skipped}>
                End round
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.rows}>
        <div onClick={() => placeCard(selectedCard, "Осадный")}>
          <p>Осадный ряд</p>
          {cardsInRows.map((card) => {
            if (card.row === "Осадный" && card.player === opponent.login)
              return (
                <CardComponent
                  card={card}
                  fraction={opponent.fraction}
                  className={styles.card}
                  key={randomBytes(16).toString("hex")}
                />
              );
          })}
        </div>
        <div onClick={() => placeCard(selectedCard, "Дальнобойный")}>
          <p>Дальнобойный ряд</p>
          {cardsInRows.map((card) => {
            if (card.row === "Дальнобойный" && card.player === opponent.login)
              return (
                <CardComponent
                  card={card}
                  fraction={opponent.fraction}
                  className={styles.card}
                  key={randomBytes(16).toString("hex")}
                />
              );
          })}
        </div>
        <div onClick={() => placeCard(selectedCard, "Рукопашный")}>
          <p>Рукопашный ряд</p>
          {cardsInRows.map((card) => {
            if (card.row === "Рукопашный" && card.player === opponent.login)
              return (
                <CardComponent
                  card={card}
                  fraction={opponent.fraction}
                  className={styles.card}
                  key={randomBytes(16).toString("hex")}
                />
              );
          })}
        </div>
        <div
          ref={myRPRef}
          onClick={() => placeCard(selectedCard, "Рукопашный")}
        >
          <p>Рукопашный ряд</p>
          {cardsInRows.map((card) => {
            if (card.row === "Рукопашный" && card.player === me.login)
              return (
                <CardComponent
                  card={card}
                  fraction={me.fraction}
                  className={styles.card}
                  key={randomBytes(16).toString("hex")}
                />
              );
          })}
        </div>
        <div
          ref={myDBRef}
          onClick={() => placeCard(selectedCard, "Дальнобойный")}
        >
          <p>Дальнобойный ряд</p>
          {cardsInRows.map((card) => {
            if (card.row === "Дальнобойный" && card.player === me.login)
              return (
                <CardComponent
                  card={card}
                  fraction={me.fraction}
                  className={styles.card}
                  key={randomBytes(16).toString("hex")}
                />
              );
          })}
        </div>
        <div ref={myOSRef} onClick={() => placeCard(selectedCard, "Осадный")}>
          <p>Осадный ряд</p>
          {cardsInRows.map((card) => {
            if (card.row === "Осадный" && card.player === me.login)
              return (
                <CardComponent
                  card={card}
                  fraction={me.fraction}
                  className={styles.card}
                  key={randomBytes(16).toString("hex")}
                />
              );
          })}
        </div>
      </div>
      <div className={styles.deckGrid}>
        {normalizedDeck.map((card) => {
          return (
            <CardComponent
              card={card}
              key={randomBytes(16).toString("hex")}
              fraction={me.fraction}
              onClick={() => selectCard(card)}
            />
          );
        })}
      </div>
    </div>
  );

  function findDuplicates(arr: any[]) {
    return arr.filter((item, index) => arr.indexOf(item) != index);
  }

  async function placeCard(card: Card | null, row: string) {
    if (!card) return;
    let test = deck.filter((c) => c.row === row && c.name === card.name);
    if (test.length === 0) return;

    let res = await fetch(
      `http://localhost:3000/api/addCardToRow?gameId=${router.query.id}`,
      {
        method: "POST",
        body: JSON.stringify({
          card: card.name,
          row,
        }),
      }
    );

    card.selected = false;
    setSelectedCard(null);
    clearRefs();

    await router.replace(router.asPath);
  }

  function clearRefs() {
    myDBRef.current?.classList.remove(styles.canBePlaced);
    myOSRef.current?.classList.remove(styles.canBePlaced);
    myRPRef.current?.classList.remove(styles.canBePlaced);
  }

  function selectCard(card: Card): void {
    if (!me.ready) return;
    if (selectedCard) {
      if (selectedCard.name === card.name) {
        selectedCard.selected = false;
        setSelectedCard(null);
        clearRefs();
        return;
      }
    }
    selectedCard?.selected && (selectedCard.selected = false);
    setSelectedCard(card);
    card.selected = true;

    clearRefs();

    let selectedCards = deck.filter((c) => c.name === card.name);
    selectedCards.forEach((c) => {
      if (c.row === "Дальнобойный")
        myDBRef.current?.classList.add(styles.canBePlaced);
      if (c.row === "Осадный")
        myOSRef.current?.classList.add(styles.canBePlaced);
      if (c.row === "Рукопашный")
        myRPRef.current?.classList.add(styles.canBePlaced);
      if (c.row === null) {
        myRPRef.current?.classList.add(styles.canBePlaced);
        myOSRef.current?.classList.add(styles.canBePlaced);
        myDBRef.current?.classList.add(styles.canBePlaced);
      }
    });
  }
}

interface SelectCardsProps {
  availableCards: Card[];
  fraction: string;
}

function SelectCards({ availableCards, fraction }: SelectCardsProps) {
  let [squadCards, setSquadCards] = useState<Card[]>([]);
  let [specialCards, setSpecialCards] = useState<Card[]>([]);
  let router = useRouter();
  let iterator = 0;

  return (
    <>
      <div className={styles.cardsGrid}>
        {availableCards.map((card) => (
          <CardComponent
            card={card}
            fraction={fraction}
            onClick={() => selectCard(card)}
            key={card.name + iterator++}
          />
        ))}
      </div>
      <button
        disabled={specialCards.length > 10 || squadCards.length < 22}
        onClick={sendCards}
        className={styles.btn}
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
    // @ts-ignore
    if (playerInfoData[0].ERROR)
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };

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

    let cardsInRows = await fetch(
      `http://localhost:3000/api/getCardsInRows?gameId=${context.params.id}`,
      {
        method: "GET",
        headers: {
          cookie: context.req.headers.cookie,
        },
      }
    );
    let cardsInRowsData: Card[] = await cardsInRows.json();

    let availableCardsData: Card[] = [];
    if (deckData.length === 0 && cardsInRowsData.length === 0) {
      let availableCards = await fetch(
        `http://localhost:3000/api/getAvailableCards?gameId=${context.params.id}`,
        {
          method: "GET",
          headers: {
            cookie: context.req.headers.cookie,
          },
        }
      );
      availableCardsData = await availableCards.json();
      let squadCards = availableCardsData.filter(
        (card) => card.type === "squad"
      );
      let specialCards = availableCardsData.filter(
        (card) => card.type === "special"
      );
      specialCards = [...specialCards, ...specialCards].sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      availableCardsData = [...squadCards, ...specialCards];
    }

    return {
      props: {
        authSession: session,
        playerInfo: playerInfoData,
        deck: deckData,
        availableCards: availableCardsData,
        cardsInRows: cardsInRowsData,
      },
    };
  });
}
