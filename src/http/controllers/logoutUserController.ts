import { getAccessToken } from "@/lib/getAccessToken.js"
import { DatabaseRefreshTokensRepository } from "@/repositories/database/DatabaseRefreshTokensRepository.js"
import { logoutUserCookiesSchema } from "@/schemas/logoutUserCookiesSchema.js"
import { LogoutUserService } from "@/services/logoutUserService.js"
import { FastifyReply, FastifyRequest } from "fastify"

async function logoutUserController(req: FastifyRequest, res: FastifyReply){
    
    // Implement Fetch REFRESH TOKEN by Cookies 

    const access_token = getAccessToken(req)!

    const { refresh_token } = logoutUserCookiesSchema.parse(req.cookies)

    try {

        const refreshTokensRepository = new DatabaseRefreshTokensRepository()
        const logoutUserService = new LogoutUserService(refreshTokensRepository)

        // Remove the COOKIE for the REFRESH TOKEN
        res.clearCookie("refresh_token")

        await logoutUserService.execute({ access_token, refresh_token })

    } catch(error){

        throw error
    }

    return res.status(200).send({ message: "Logged Out." })
}

export { logoutUserController }