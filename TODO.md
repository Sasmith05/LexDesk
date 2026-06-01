# Authentication Completion - TODO

- [x] Add Logout button + show logged-in user in sidebar/navbar
  - [x] Update `src/components/sidebar.jsx`

- [x] Create NextAuth middleware protection
  - [x] Add `src/middleware.js` to protect `/dashboard/:path*`

- [x] Replace hardcoded login with PostgreSQL + bcrypt
  - [x] Update `src/app/api/auth/[...nextauth]/route.js`
  - [x] Ensure `bcryptjs` is installed and Prisma user lookup matches schema

- [x] Run local checks
  - [x] `npm run build`
  - [ ] Verify login works
  - [ ] Verify `/dashboard` blocked when logged out
  - [ ] Verify sidebar shows name/email
  - [ ] Verify logout works


