// [1]
import NextAuth, { DefaultSession } from "next-auth";
// Why: Redefining module types allows us to inject custom RBAC fields
// into the session securely without breaking NextAuth's internal typing.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // How: Replaced the binary boolean with a hierarchical 1-4 scale
// [11]
      adminLevel: number;
      username: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    adminLevel: number;
    username: string;
  }
// [21]
}
declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    adminLevel?: number;
  }
}
// [31]