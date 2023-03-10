import { getServerSession, Session } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/Field.module.scss";
import { getData, logger } from "../../utils/utils";
import { authOptions } from "../api/auth/[...nextauth]";
import PlayerType from "../../types/player";
import CardType from "../../types/card";
import GameField from "../../components/Games/gameField";
import CardComponent from "../../components/Games/card";
import AlertContainer from "../../components/alert.container";

interface GameProps {
  authSession: Session;
  playerInfo: PlayerType[];
  deck: CardType[];
  availableCards: CardType[];
  cardsInRows: CardType[];
  beat: CardType[];
  medic: boolean;
}

export default function Game({
  authSession,
  playerInfo,
  deck,
  availableCards,
  cardsInRows,
  beat,
  medic,
}: GameProps) {
  let check: any = playerInfo[0];
  if (check.ERROR) return <AlertContainer alertMessage={check.ERROR} />;

  let opponent: PlayerType =
    playerInfo[0].login === authSession.user.name
      ? playerInfo[1]
      : playerInfo[0];
  let me: PlayerType =
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
        beat={beat}
        // medic={medic}
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
  }, [router]);
  return <p>Waiting for opponent</p>;
}

interface SelectCardsProps {
  availableCards: CardType[];
  fraction: string;
}

function SelectCards({ availableCards, fraction }: SelectCardsProps) {
  let [squadCards, setSquadCards] = useState<CardType[]>([]);
  let [specialCards, setSpecialCards] = useState<CardType[]>([]);
  let router = useRouter();
  let iterator = 0;

  function selectCard(card: CardType): void {
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
    let req = await fetch(`/api/addCardsToDeck?gameId=${router.query.id}`, {
      method: "POST",
      body: JSON.stringify({
        cards: [...squadCards, ...specialCards].map((card) => card.name),
      }),
    });

    if (req.status === 200) router.push(`/games/${router.query.id}`);
  }

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
}

export async function getServerSideProps({ req, res, ...context }: any) {
  let authSession = await getServerSession(req, res, authOptions);
  let playerInfo = await getData<PlayerType>(
    authSession,
    "getPlayerInfo",
    context.params.id
  );

  let deck = await getData<CardType>(
    authSession,
    "showGameDeck",
    context.params.id
  );

  let cardsInRows = await getData<CardType>(
    authSession,
    "getCardsInRows",
    context.params.id
  );

  let availableCards: CardType[] = [];
  if (deck.length == 0 && cardsInRows.length == 0) {
    availableCards = await getData<CardType>(
      authSession,
      "getAvailableCards",
      context.params.id
    );

    let squadCards = availableCards.filter((card) => card.type === "squad");
    let specialCards = availableCards.filter((card) => card.type === "special");
    specialCards = [...specialCards, ...specialCards].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    availableCards = [...squadCards, ...specialCards];
  }

  let beat = await getData<CardType>(authSession, "getBeat", context.params.id);

  // Проверяет выложил ли игрок карту из бито на поле после хода карты медика
  // let medic =
  //   (await getData<Array<any>>(authSession, "isMedic", context.params.id))
  //     .length === 0
  //     ? false
  //     : true;

  // logger.warn({ player: authSession.user.name, medic: medic });

  return {
    props: {
      authSession,
      playerInfo,
      deck,
      availableCards,
      cardsInRows,
      beat,
      // medic,
    },
  };
}
