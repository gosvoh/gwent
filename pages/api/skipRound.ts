import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return;

  const game_id = req.query.game_id as string;
  let result = await getData(req, res, "skipRound", game_id);
  console.log("skipRound.ts result: ", result);
  if (!result) return;
  res.end();
}
