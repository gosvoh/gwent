import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return;

  const { inviter } = JSON.parse(req.body);
  let result = await getData(req, res, "declineInvite", inviter);
  if (!result) return;
  res.end();
}
