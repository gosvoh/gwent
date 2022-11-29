import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return;

  const game_id = JSON.parse(req.body).game_id;
  let result = await getData(req, res, "deleteGame", game_id);
  if (!result) return;
  res.end();
}
