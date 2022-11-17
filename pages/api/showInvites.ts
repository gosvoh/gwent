import type { NextApiRequest, NextApiResponse } from "next";
import { getData } from "../../utils/utils";

type Invite = {
  inviter: string;
  invited: string;
  dt: Date;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Invite[]>
) {
  let invites = await getData<Invite[]>(req, res, "showInvites");
  if (!invites) return;

  res.json(invites);
  res.end();
}
