import { CreateRefreshTokenInput } from "@/interfaces/CreateRefreshToken.js";
import { RefreshToken } from "@/interfaces/entities/RefreshToken.js";
import { RefreshTokensRepositoryInterface } from "../RefreshTokensRepositoryInterface.js";
import { randomUUID } from "node:crypto";

export class MemoryRefreshTokensRepository implements RefreshTokensRepositoryInterface {
    
    private refreshTokens: RefreshToken[] = []
    
    async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
        const { token, user_id, expires_at } = data

        const refreshToken: RefreshToken = {
            id: randomUUID(),
            token,
            created_at: new Date(),
            expires_at,
            revoked: false,
            user_id
        }

        this.refreshTokens.push(refreshToken)

        return refreshToken
    }

    async delete(token_id: string): Promise<void> {
        
        this.refreshTokens = this.refreshTokens.filter((refreshToken) => refreshToken.id !== token_id )

    }

    async deleteAll(user_id: string): Promise<void> {
        
        this.refreshTokens = this.refreshTokens.filter((refreshToken) => refreshToken.user_id !== user_id )

    }

    async revoke(token_id: string): Promise<void> {

        const index = this.refreshTokens.findIndex((refreshToken) => refreshToken.id === token_id )

        if(this.refreshTokens[index]){
            this.refreshTokens[index].revoked = true
        } 
    
    }

    async revokeAll(user_id: string): Promise<void> {

        // Just MODIFY IN PLACE.
        this.refreshTokens.forEach((refreshToken) => {
            if(refreshToken.user_id === user_id) refreshToken.revoked = true
        })
    
    }

    async findByToken(refresh_token: string): Promise<RefreshToken | null> {
        
        const token = this.refreshTokens.find((refreshToken) => refreshToken.token === refresh_token )

        return token ?? null
    }

}