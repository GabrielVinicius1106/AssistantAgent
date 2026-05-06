import { FastifyReply, FastifyRequest } from "fastify";
import { DatabaseRefreshTokensRepository } from "@/repositories/database/DatabaseRefreshTokensRepository.js";
import { RefreshUserAuthService } from "@/services/refreshUserAuthService.js";
import { UnauthorizedError } from "@/services/errors/UnauthorizedError.js";
import { TokenExpiredError } from "@/services/errors/TokenExpiredError.js";
import { TokenRevokedError } from "@/services/errors/TokenRevokedError.js";
import { getRefreshToken } from "@/lib/getRefreshToken.js";
import { getAccessToken } from "@/lib/getAccessToken.js";

async function refreshUserAuthController(req: FastifyRequest, res: FastifyReply){
    
    const access_token = getAccessToken(req)
    const refresh_token = getRefreshToken(req)
    
    if(!access_token || !refresh_token) return res.status(401).send({ message: "Unauthorized." })

    try {

        const refreshTokensRepository = new DatabaseRefreshTokensRepository()
        const loginUserService = new RefreshUserAuthService(refreshTokensRepository)

        const { access_token, refresh_token: refresh_token_refreshed } = await loginUserService.execute({ token: refresh_token })

        // Set a COOKIE for the REFRESH TOKEN
        res.setCookie("refresh_token", refresh_token_refreshed, {
            httpOnly: true
        })

        return res.status(200).send({
            access_token
        })

    } catch(error){

        // Unauthorized
        if(error instanceof UnauthorizedError){
            return res.status(401).send({ 
                data: {
                    message: error.message,
                    code: "Unauthorized"
                }
             })
        }

        // Expired Token 
        if(error instanceof TokenExpiredError){
            return res.status(401).send({ 
                data: {
                    message: error.message,
                    code: "Expired"
                }
             })
        }

        // Revoked Token
        if(error instanceof TokenRevokedError){
            return res.status(401).send({ 
                data: {
                    message: error.message,
                    code: "Revoked"
                }
             })
        }

        throw error
    }

}

export { refreshUserAuthController }