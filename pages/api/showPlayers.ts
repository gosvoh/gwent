import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

type Player = {
  login: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Player[]>
) {
  let players = await getData<Player[]>(req, res, "showPlayers");
  if (!players) return;

  res.json(players);
  res.end();
}
