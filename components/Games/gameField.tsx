import PlayerType from "../../types/player";
import CardType from "../../types/card";
import { Dispatch, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Field.module.scss";
import CardComponent from "./card";
import Image from "next/image";

interface GameFieldProps {
  opponent: PlayerType;
  me: PlayerType;
  deck: CardType[];
  cardsInRows: CardType[];
  beat: CardType[];
  // medic: boolean;
}

export default function GameField({
  opponent,
  me,
  deck,
  cardsInRows,
  beat,
}: // medic,
GameFieldProps) {
  const [normalizedDeck, setNormalizedDeck] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showBeat, setShowBeat] = useState<boolean>(false);
  const myOSRef = useRef<HTMLDivElement>(null);
  const myDBRef = useRef<HTMLDivElement>(null);
  const myRPRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.replace(router.asPath), 10000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (deck.length === 0) return;

    let uniqueDuplicates = findDuplicates(deck.map((card) => card.name));
    let newDeck = [...deck];
    if (uniqueDuplicates.length > 0) {
      let index = deck.findIndex((card) => card.name === uniqueDuplicates[0]);
      newDeck.splice(index, 1);
    }
    setNormalizedDeck(newDeck);
  }, [deck]);

  // useEffect(() => {
  //   if (!medic) return;
  //   if (showBeat) return;

  //   fetch(`/api/clearMedic?game_id=${router.query.id}`, {
  //     method: "POST",
  //   }).then(() => router.replace(router.asPath));
  // }, [showBeat, medic]);

  async function handleSkipRound() {
    await fetch(`/api/skipRound?game_id=${router.query.id}`, {
      method: "POST",
    });
    router.replace(router.asPath);
  }

  function findDuplicates(arr: any[]) {
    return arr.filter((item, index) => arr.indexOf(item) != index);
  }

  async function placeCard(card: CardType | null, row: string) {
    if (!card) return;
    let test = deck.filter((c) => c.row === row && c.name === card.name);
    if (test.length === 0) return;

    let res = await fetch(`/api/addCardToRow?gameId=${router.query.id}`, {
      method: "POST",
      body: JSON.stringify({
        card: card.id,
        row,
      }),
    });

    card.selected = false;
    setSelectedCard(null);
    clearRefs();

    router.replace(router.asPath);
  }

  function clearRefs() {
    myDBRef.current?.classList.remove(styles.canBePlaced);
    myOSRef.current?.classList.remove(styles.canBePlaced);
    myRPRef.current?.classList.remove(styles.canBePlaced);
  }

  function selectCard(card: CardType): void {
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
              <button onClick={() => setShowBeat(!showBeat)}>
                {showBeat ? "Close" : "Show"} beat
              </button>
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
                  key={card.id}
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
                  key={card.id}
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
                  key={card.id}
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
                  key={card.id}
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
                  key={card.id}
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
                  key={card.id}
                />
              );
          })}
        </div>
      </div>
      <div className={styles.deckGrid}>
        {showBeat ? (
          <Beat beat={beat} player={me} selectCard={selectCard} />
        ) : (
          <GameDeck
            deck={deck}
            fraction={me.fraction}
            selectCard={selectCard}
          />
        )}
      </div>
    </div>
  );
}

function GameDeck({
  deck,
  fraction,
  selectCard,
}: {
  deck: CardType[];
  fraction: string;
  selectCard: Dispatch<any>;
}) {
  return (
    <>
      <p>Your deck</p>
      {deck.map((card) => {
        return (
          <CardComponent
            card={card}
            key={card.id}
            fraction={fraction}
            onClick={() => selectCard(card)}
          />
        );
      })}
    </>
  );
}

function Beat({
  beat,
  player,
  selectCard,
}: {
  beat: CardType[];
  player: PlayerType;
  selectCard: Dispatch<any>;
}) {
  return (
    <>
      <p>Your beat</p>
      {beat.map((card) => {
        return (
          <CardComponent
            card={card}
            key={card.id}
            fraction={player.fraction}
            onClick={() => selectCard(card)}
          />
        );
      })}
    </>
  );
}
