import { GenerateTokensOutput } from "@/interfaces/GenerateTokens.js"
import { randomBytes } from "node:crypto"

import jwt from "jsonwebtoken"

function generateTokens(user_id: string, secret: string): GenerateTokensOutput {

    const payload = {
        id: user_id
    }

    const access_token = jwt.sign(payload, secret, { expiresIn:"15min" })

    const refresh_token = randomBytes(32).toString("hex")

    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + 30) // Expires in 30 Days

    return {
        access_token,
        refresh_token,
        expires_at
    }


}

export { generateTokens }