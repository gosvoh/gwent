import NextAuth, { DefaultSession } from "next-auth";

type CustomUser = {
  name: string;
  token: string;
};

declare module "next-auth" {
  interface User extends CustomUser {}

  interface Session {
    user: CustomUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    token: string;
  }
}
