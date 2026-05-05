import { LogoutUserInput } from "@/interfaces/LogoutUser.js";
import { redis } from "@/lib/redis.js";
import { RefreshTokensRepositoryInterface } from "@/repositories/RefreshTokensRepositoryInterface.js";
import { redisClone } from "@/tools/redisClone.js";


export class LogoutUserService {

    constructor(private refreshTokensRepository: RefreshTokensRepositoryInterface){}

    async execute({ access_token, refresh_token }: LogoutUserInput){

        if(!refresh_token) return "Logged Out."

        const token = await this.refreshTokensRepository.findByToken(refresh_token)

        redisClone.SET(access_token, true, 900)

        // Armazenar access_token na Black List por 15min
        await redis.set(access_token, "true", {
            expiration: {
                type: "EX",
                value: 900
            }
        } )
        
        // Invalid Token ALREADY DELETED
        if(!token) return "Logged Out."
        
        const token_id = token.id

        await this.refreshTokensRepository.revoke(token_id)

        return "Logged Out."
    }

}