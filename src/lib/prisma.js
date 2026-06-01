import dns from "node:dns";
import { PrismaClient } from "@prisma/client";

// Solve Supabase pooled connection timeouts on Windows environments by prioritizing IPv4 lookups
if (dns && typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}