import { LogoutUserInput } from "@/interfaces/LogoutUser.js";
import { redis } from "@/lib/redis.js";
import { RefreshTokensRepositoryInterface } from "@/repositories/RefreshTokensRepositoryInterface.js";
import { redisClone } from "@/tools/redisClone.js";
import { InvalidTokenError } from "./errors/InvalidTokenError.js";


export class LogoutUserFromAllDevicesService {

    constructor(private refreshTokensRepository: RefreshTokensRepositoryInterface){}

    async execute({ access_token, refresh_token }: LogoutUserInput){

        if(!refresh_token) throw new InvalidTokenError

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
        if(!token) throw new InvalidTokenError
        
        const user_id = token.user_id

        await this.refreshTokensRepository.revokeAll(user_id)

        return "Logged Out from All Devices."
    }

}