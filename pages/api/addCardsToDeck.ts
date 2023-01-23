import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return;

  const { cards } = JSON.parse(req.body);
  const { gameId } = req.query as { gameId: string };
  let result = await getData(
    req,
    res,
    "addCardsToDeck",
    gameId,
    cards.join(",")
  );
  if (!result) return;
  res.json(result);
  res.end();
}
