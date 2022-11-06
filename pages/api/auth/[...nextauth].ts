import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import post from "../../../utils/request.manager";

export default NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials || !credentials.username || !credentials.password)
          // return null;
          throw new Error("Missing credentials");
        const res = await post(
          "login",
          credentials.username,
          credentials.password
        );
        if (res[0].ERROR) return null;
        const user = {
          id: "asd",
          name: "J Smith",
          email: "jsmith@example.com",
          token: res[0].token[0],
        };

        if (user) return user;
        return null;
      },
    }),
  ],
  debug: false,
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
