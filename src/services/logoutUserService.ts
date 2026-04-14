import { LogoutUserInput } from "@/interfaces/LogoutUser.js";
import { redis } from "@/lib/redis.js";
import { RefreshTokensRepositoryInterface } from "@/repositories/RefreshTokensRepositoryInterface.js";


export class LogoutUserService {

    constructor(private refreshTokensRepository: RefreshTokensRepositoryInterface){}

    async execute({ access_token, refresh_token }: LogoutUserInput){

        const token = await this.refreshTokensRepository.findByToken(refresh_token)

        // Armazenar access_token na Black List por 15min
        await redis.set(access_token, "true", {
            expiration: {
                type: "EX",
                value: 900
            }
        } )
        
        // Invalid Token ALREADY DELETED
        if(!token) return
        
        const token_id = token.id

        await this.refreshTokensRepository.delete(token_id)

        return
    }

}