import { FastifyReply, FastifyRequest } from "fastify";
import { refreshUserAuthBodySchema } from "@/schemas/refreshUserAuthBodySchema.js";
import { DatabaseRefreshTokensRepository } from "@/repositories/database/DatabaseRefreshTokensRepository.js";
import { RefreshUserAuthService } from "@/services/refreshUserAuthService.js";
import { UnauthorizedError } from "@/services/errors/UnauthorizedError.js";
import { TokenExpiredError } from "@/services/errors/TokenExpiredError.js";
import { TokenRevokedError } from "@/services/errors/TokenRevokedError.js";

async function refreshUserAuthController(req: FastifyRequest, res: FastifyReply){
    
    const { token } = refreshUserAuthBodySchema.parse(req.body)

    try {

        const refreshTokensRepository = new DatabaseRefreshTokensRepository()
        const loginUserService = new RefreshUserAuthService(refreshTokensRepository)

        await loginUserService.execute({ token })

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



        // Faz com que a CAMADA ACIMA LIDE com este ERRO
        throw error
    }

}

export { refreshUserAuthController }