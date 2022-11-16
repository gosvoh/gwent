import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import post from "../../../utils/request.manager";

export default NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.username || !credentials.password)
          throw new Error("Missing credentials");
        const res = await post(
          "login",
          credentials.username,
          credentials.password
        );
        if (res[0].ERROR) throw new Error(res[0].ERROR);
        const user = {
          id: "id",
          name: credentials.username,
          email: undefined,
          token: res[0].token,
        };

        if (user) return user;
        return null;
      },
    }),
  ],
  secret: "secret",
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        // @ts-ignore
        token.token = user.token;
      }
      return token;
    },
    session: ({ session, token }) => {
      // @ts-ignore
      session.user.token = token.token;
      return session;
    },
  },
});
