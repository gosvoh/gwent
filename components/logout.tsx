import { signOut } from "next-auth/react";
import post from "../utils/request.adapter";
import Link from "next/link";

async function handler(token: string) {
  await post("logout", token);
  await signOut({ callbackUrl: "/" });
}

export default function Logout({ token }: { token: string }) {
  return (
    <Link href="" onClick={() => handler(token)}>
      Sign out
    </Link>
  );
}
