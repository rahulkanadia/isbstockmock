import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extending the built-in session user object
   */
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    isAdmin: boolean;
    username: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extending the built-in JWT object
   */
  interface JWT {
    uid?: string;
  }
}