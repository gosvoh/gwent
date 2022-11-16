import { getSession } from "next-auth/react";

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
