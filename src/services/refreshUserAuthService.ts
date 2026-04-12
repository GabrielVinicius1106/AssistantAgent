import { RefreshTokenInput } from "@/interfaces/RefreshToken.js";

import { UserRepositoryInterface } from "@/repositories/UsersRepositoryInterface.js";
import { RefreshTokensRepositoryInterface } from "@/repositories/RefreshTokensRepositoryInterface.js";
import { UnauthorizedError } from "./errors/UnauthorizedError.js";
import { TokenExpiredError } from "./errors/TokenExpiredError.js";
import { TokenRevokedError } from "./errors/TokenRevokedError.js";

import jwt from "jsonwebtoken"
import { randomBytes } from "node:crypto";
import { env } from "@/env/index.js";

export class RefreshUserAuthService {

    constructor(private refreshTokensRepository: RefreshTokensRepositoryInterface) {}

    async execute({ token }: RefreshTokenInput){

        const refresh_token = await this.refreshTokensRepository.findByToken(token)

        // Refresh Token INVÁLIDO 
        if(!refresh_token) throw new UnauthorizedError()

        const date = refresh_token.expires_at;

        // Refresh Token EXPIRADO
        if(date < new Date()) throw new TokenExpiredError()

        // Refresh Token REVOGADO
        if(refresh_token.revoked) throw new TokenRevokedError()

        const user_id = refresh_token.user_id

        
        // Revogar TOKEN ANTIGO
        const token_id = refresh_token.id
        
        await this.refreshTokensRepository.delete(token_id)

        const payload = {
            user_id
        }

        const new_token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15min" })

        const refresh_token_string = randomBytes(32).toString("hex")

        const expires_at = new Date()
        expires_at.setDate(expires_at.getDate() + 30) // Validade de 30 Dias para o Refresh Token

        // Criar Refresh Token
        await this.refreshTokensRepository.create({
            user_id,
            expires_at,
            token: refresh_token_string    
        })

        return {
            access_token: new_token,
            refresh_token: refresh_token_string
        }

    }

}