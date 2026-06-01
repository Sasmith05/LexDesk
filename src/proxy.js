import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // NextAuth middleware checks session; return true to allow.
    authorized: ({ token }) => token != null,
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/clients/:path*", "/api/clients/:path*"],
};
