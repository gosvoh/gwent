import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import post from "../../../utils/request.adapter";

export const authOptions = {
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
          token: res[0].token,
        };

        return user;
      },
    }),
  ],
  secret: "secret",
  session: {
    maxAge: 30 * 60,
  },
  callbacks: {
    async session({ session, token }: any) {
      session.user.token = token.token;
      session.user.email = null;
      session.user.image = null;
      let ret = await post("updateToken", token.token);
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) token.token = user.token;
      return { ...token, ...user };
    },
  },
};

export default NextAuth(authOptions);
