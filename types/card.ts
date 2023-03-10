type CardType = {
  name: string;
  id?: number;
  type?: "squad" | "special";
  selected?: boolean;
  row?: "Осадный" | "Дальнобойный" | "Рукопашный" | null;
  player?: string;
};

export default CardType;
