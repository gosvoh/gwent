import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let invites = await getData(req, res, "showInvites");
  if (!invites) return;

  res.json(invites);
  res.end();
}
