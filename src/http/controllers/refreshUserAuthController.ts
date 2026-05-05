import { FastifyReply, FastifyRequest } from "fastify";
import { refreshUserAuthCookiesSchema } from "@/schemas/refreshUserAuthCookiesSchema.js";
import { DatabaseRefreshTokensRepository } from "@/repositories/database/DatabaseRefreshTokensRepository.js";
import { RefreshUserAuthService } from "@/services/refreshUserAuthService.js";
import { UnauthorizedError } from "@/services/errors/UnauthorizedError.js";
import { TokenExpiredError } from "@/services/errors/TokenExpiredError.js";
import { TokenRevokedError } from "@/services/errors/TokenRevokedError.js";

async function refreshUserAuthController(req: FastifyRequest, res: FastifyReply){
    
    const { token } = refreshUserAuthCookiesSchema.parse(req.cookies)

    try {

        const refreshTokensRepository = new DatabaseRefreshTokensRepository()
        const loginUserService = new RefreshUserAuthService(refreshTokensRepository)

        const { access_token, refresh_token } = await loginUserService.execute({ token })

        // Set a COOKIE for the REFRESH TOKEN
        res.setCookie("refresh_token", refresh_token, {
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