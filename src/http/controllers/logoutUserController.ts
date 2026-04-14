import { DatabaseRefreshTokensRepository } from "@/repositories/database/DatabaseRefreshTokensRepository.js"
import { logoutUserBodySchema } from "@/schemas/logoutUserBodySchema.js"
import { logoutUserHeaderSchema } from "@/schemas/logoutUserHeaderSchema.js"
import { LogoutUserService } from "@/services/logoutUserService.js"
import { FastifyReply, FastifyRequest } from "fastify"

async function logoutUserController(req: FastifyRequest, res: FastifyReply){
    
    const { access_token } = logoutUserHeaderSchema.parse(req.headers)
    const { refresh_token } = logoutUserBodySchema.parse(req.body)

    try {

        const refreshTokensRepository = new DatabaseRefreshTokensRepository()
        const loginUserService = new LogoutUserService(refreshTokensRepository)

        await loginUserService.execute({ access_token, refresh_token })

    } catch(error){

        // Faz com que a CAMADA ACIMA LIDE com este ERRO
        throw error
    }

    return res.status(200).send({ message: "Logged Out." })
}

export { logoutUserController }