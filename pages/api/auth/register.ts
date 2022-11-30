import type { NextApiRequest, NextApiResponse } from "next";
import post from "../../../utils/request.manager";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return;

  const { login, password } = JSON.parse(req.body);
  post("register", login, password)
    .then((data) => {
      if (data[0] && data[0].ERROR) {
        res.status(400).json(data[0].ERROR);
        return;
      }
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
}
