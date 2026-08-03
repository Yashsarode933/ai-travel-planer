import "next-auth";
 
declare module "next-auth" {
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
 
  interface JWT {
    sub?: string;
  }
}