import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import post from "./request.manager";

export const requireAuth = async (context: any, callback: any) => {
  const session = await getSession(context);

  if (!session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  return callback({ session });
};

export const requireNonAuth = async (context: any, callback?: any) => {
  const session = await getSession(context);

  if (session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  if (callback) return callback({ session });
};

// TODO change this to a better name
export async function getData<T>(
  req: NextApiRequest,
  res: NextApiResponse<T | any>,
  procedureName: string,
  ...args: string[]
) {
  const token = await getToken({ req });
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    res.end();
    return null;
  }
  const data = await post(procedureName, token.token, ...args);
  if (data[0] && data[0].ERROR) res.status(401);
  else res.status(200);
  return data;
}
