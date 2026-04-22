import { CreateRefreshTokenInput } from "@/interfaces/CreateRefreshToken.js";

import { RefreshTokensRepositoryInterface } from "../RefreshTokensRepositoryInterface.js";
import { RefreshToken } from "@/interfaces/entities/RefreshToken.js";

import { prisma } from "@/lib/prisma.js";

export class DatabaseRefreshTokensRepository implements RefreshTokensRepositoryInterface {
    
    async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {

        const token = await prisma.refreshToken.create({ data })

        return token
    }

    async delete(token_id: string): Promise<void> {
        
        await prisma.refreshToken.delete({
            where: { id: token_id }
        })

    }
    
    
    async deleteAll(user_id: string): Promise<void> {
        
        await prisma.refreshToken.deleteMany({
            where: { user_id }
        })

    }
    


    async revoke(token_id: string): Promise<void> {
        
        await prisma.refreshToken.update({
            where: { id: token_id },
            data: { revoked: true }
        })

    }

    async revokeAll(user_id: string): Promise<void> {

        await prisma.refreshToken.updateMany({
            where: { user_id },
            data: { revoked: true }
        })

    }
    
    async findByToken(token: string): Promise<RefreshToken | null> {
        
        const refresh_token = await prisma.refreshToken.findUnique({
            where: { token }
        })

        return refresh_token

    }   

}