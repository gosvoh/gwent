import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getData } from "../../utils/utils";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return;

  const game_id = req.query.game_id as string;
  const session = await getServerSession(req, res, authOptions);
  let result = await getData(session, "skipRound", game_id);
  console.log("skipRound.ts result: ", result);
  if (!result) return;
  res.end();
}
