import { RefreshTokenInput } from "@/interfaces/RefreshToken.js";

import { RefreshTokensRepositoryInterface } from "@/repositories/RefreshTokensRepositoryInterface.js";
import { UnauthorizedError } from "./errors/UnauthorizedError.js";
import { TokenExpiredError } from "./errors/TokenExpiredError.js";
import { TokenRevokedError } from "./errors/TokenRevokedError.js";

import { env } from "@/env/index.js";
import { generateTokens } from "@/lib/generateTokens.js";

export class RefreshUserAuthService {

    constructor(private refreshTokensRepository: RefreshTokensRepositoryInterface) {}

    async execute({ token }: RefreshTokenInput){

        const refresh_token_response = await this.refreshTokensRepository.findByToken(token)

        // Refresh Token INVÁLIDO 
        if(!refresh_token_response) throw new UnauthorizedError()
        
        const date = refresh_token_response.expires_at;

        const user_id = refresh_token_response.user_id

        // Refresh Token EXPIRADO. Invalida TODAS as SESSÕES de USUÁRIO.
        if(date < new Date()){
            this.refreshTokensRepository.deleteAll(user_id)
            throw new TokenExpiredError()
        }

        // Refresh Token REVOGADO. Invalida TODAS as SESSÕES de USUÁRIO.
        if(refresh_token_response.revoked){ 
            this.refreshTokensRepository.deleteAll(user_id)
            throw new TokenRevokedError()
        }

        
        // Revogar TOKEN ANTIGO
        const token_id = refresh_token_response.id
        
        await this.refreshTokensRepository.revoke(token_id)

        const payload = user_id

        const { access_token, refresh_token, expires_at } = generateTokens(payload, env.JWT_SECRET)

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