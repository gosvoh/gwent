import post from "./request.manager";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export async function requireAuth(context: any, callback: any) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const redirect = {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };

  if (!session) return redirect;

  try {
    const token = await post("checkToken", session.user.token);
    if (!token[0] || !token[0].token) return redirect;
  } catch (error) {
    return redirect;
  }

  return callback({ session });
}

export async function requireNonAuth(context: any, callback?: any) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  if (callback) return callback({ session });
}
