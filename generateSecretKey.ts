import { randomBytes } from "node:crypto";

// Generate Secret Keys

const secretKey = randomBytes(32).toString("hex")

console.log(secretKey);