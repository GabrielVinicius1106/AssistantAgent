import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../env/index.js";

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL })
})

export { prisma }