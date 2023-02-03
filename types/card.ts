type CardType = {
  name: string;
  type?: "squad" | "special";
  selected?: boolean;
  row?: "Осадный" | "Дальнобойный" | "Рукопашный" | null;
  player?: string;
};

export default CardType;
