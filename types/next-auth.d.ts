type User = {
  name: string;
  token: string;
};

declare module "next-auth" {
  interface Session {
    user: User;
  }
}
