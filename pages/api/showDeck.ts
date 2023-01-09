import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let gameId = req.query.gameId as string;
  let cards = await getData(req, res, "showDeck", gameId);
  if (!cards) return;

  res.json(cards);
  res.end();
}
