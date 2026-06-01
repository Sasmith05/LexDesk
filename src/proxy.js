import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    // NextAuth middleware checks session; return true to allow.
    authorized: ({ token }) => token != null,
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
