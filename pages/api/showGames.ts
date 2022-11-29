import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let games = await getData(req, res, "showGames");
  if (!games) return;

  res.json(games);
  res.end();
}
