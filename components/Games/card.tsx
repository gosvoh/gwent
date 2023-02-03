import { CSSProperties } from "react";
import Card from "../../types/card";
import styles from "../../styles/Field.module.scss";
import Image from "next/image";

interface CardComponentInterface {
  card: Card;
  fraction: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export default function CardComponent({
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
