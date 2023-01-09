import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let gameId = req.query.gameId as string;
  let playerInfo = await getData(req, res, "getPlayerInfo", gameId);
  if (!playerInfo) return;

  res.json(playerInfo);
  res.end();
}
