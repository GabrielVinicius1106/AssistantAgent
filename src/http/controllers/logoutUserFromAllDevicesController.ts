import { getAccessToken } from "@/lib/getAccessToken.js"
import { getRefreshToken } from "@/lib/getRefreshToken.js"
import { DatabaseRefreshTokensRepository } from "@/repositories/database/DatabaseRefreshTokensRepository.js"
import { LogoutUserFromAllDevicesService } from "@/services/logoutUserFromAllDevicesService.js"
import { FastifyReply, FastifyRequest } from "fastify"

async function logoutUserFromAllDevicesController(req: FastifyRequest, res: FastifyReply){
    
    const access_token = getAccessToken(req)
    const refresh_token = getRefreshToken(req)

    if(!access_token || !refresh_token) return res.status(401).send({ message: "Unauthorized." })

    try {

        const refreshTokensRepository = new DatabaseRefreshTokensRepository()
        const logoutUserFromAllDevicesService = new LogoutUserFromAllDevicesService(refreshTokensRepository)

        // Remove the COOKIE for the REFRESH TOKEN
        res.clearCookie("refresh_token")

        await logoutUserFromAllDevicesService.execute({ access_token, refresh_token })

    } catch(error){

        throw error
    }

    return res.status(200).send({ message: "Logged Out from All Devices." })
}

export { logoutUserFromAllDevicesController }