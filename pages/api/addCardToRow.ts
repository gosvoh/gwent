import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getData, logger } from "../../utils/utils";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return;

  const { card, row } = JSON.parse(req.body);
  const { gameId } = req.query as { gameId: string };
  const session = await getServerSession(req, res, authOptions);
  let result = await getData(session, "addCardToRow", gameId, card, row);
  if (!result) return;
  res.json(result);
  res.end();
}
