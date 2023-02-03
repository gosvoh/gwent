import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getData } from "../../utils/utils";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return;

  const { login, fraction } = JSON.parse(req.body);
  const session = await getServerSession(req, res, authOptions);
  let result = await getData(session, "createInvite", login, fraction);
  if (!result) return;
  res.json(result);
  res.end();
}
