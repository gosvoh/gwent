import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return;

  const { login, fraction } = JSON.parse(req.body);
  console.log("login", login);
  console.log("fraction", fraction);
  let result = await getData(req, res, "createInvite", login, fraction);
  if (!result) return;
  console.log(result);
  res.json(result);
  res.end();
}
