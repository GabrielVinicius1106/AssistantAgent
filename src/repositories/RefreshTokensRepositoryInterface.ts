import { CreateRefreshTokenInput } from "@/interfaces/CreateRefreshToken.js";
import { RefreshToken } from "@/interfaces/entities/RefreshToken.js";

export interface RefreshTokensRepositoryInterface {
    create(data: CreateRefreshTokenInput): Promise<RefreshToken>
    
    delete(token_id: string): Promise<void>
    deleteAll(user_id: string): Promise<void>
    
    revoke(token_id: string): Promise<void>
    revokeAll(user_id: string): Promise<void>

    setExpiresAt(token_id: string, expires_at: Date): Promise<void>
    
    findByToken(refresh_token: string): Promise<RefreshToken | null>
}