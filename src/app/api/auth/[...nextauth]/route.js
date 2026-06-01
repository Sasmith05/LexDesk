import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Automatically resolve simple usernames (like 'admin') to their database email keys
        const resolvedEmail = credentials.email.includes("@")
          ? credentials.email.trim()
          : `${credentials.email.trim().toLowerCase()}@lexdesk.com`;

        const user = await prisma.user.findUnique({
          where: { email: resolvedEmail },
        });

        if (!user) return null;

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!passwordValid) return null;

        // Compute a clean, friendly capitalized username display name
        const prefix = user.email.split("@")[0];
        const displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);

        return {
          id: user.id,
          name: displayName,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: user is available
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
