import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getData } from "../../utils/utils";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let gameId = req.query.gameId as string;
  const session = await getServerSession(req, res, authOptions);
  let cards = await getData(session, "showDeck", gameId);
  if (!cards) return;

  res.json(cards);
  res.end();
}
