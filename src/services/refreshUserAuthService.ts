import { RefreshTokenInput } from "@/interfaces/RefreshToken.js";

import { UserRepositoryInterface } from "@/repositories/UsersRepositoryInterface.js";
import { RefreshTokensRepositoryInterface } from "@/repositories/RefreshTokensRepositoryInterface.js";
import { UnauthorizedError } from "./errors/UnauthorizedError.js";
import { TokenExpiredError } from "./errors/TokenExpiredError.js";
import { TokenRevokedError } from "./errors/TokenRevokedError.js";

import jwt from "jsonwebtoken"
import { randomBytes } from "node:crypto";
import { env } from "@/env/index.js";
import { generateTokens } from "@/lib/generateTokens.js";

export class RefreshUserAuthService {

    constructor(private refreshTokensRepository: RefreshTokensRepositoryInterface) {}

    async execute({ token }: RefreshTokenInput){

        const refresh_token_response = await this.refreshTokensRepository.findByToken(token)

        // Refresh Token INVÁLIDO 
        if(!refresh_token_response) throw new UnauthorizedError()

        const date = refresh_token_response.expires_at;

        // Refresh Token EXPIRADO
        if(date < new Date()) throw new TokenExpiredError()

        // Refresh Token REVOGADO
        if(refresh_token_response.revoked) throw new TokenRevokedError()

        const user_id = refresh_token_response.user_id

        
        // Revogar TOKEN ANTIGO
        const token_id = refresh_token_response.id
        
        await this.refreshTokensRepository.delete(token_id)

        const payload = {
            user_id
        }

        const { access_token, refresh_token, expires_at } = generateTokens(user_id, env.JWT_SECRET)

        // Criar Refresh Token
        await this.refreshTokensRepository.create({
            user_id,
            expires_at,
            token: refresh_token    
        })

        return {
            access_token,
            refresh_token
        }

    }

}