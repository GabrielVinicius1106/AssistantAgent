import { DatabaseRefreshTokensRepository } from "@/repositories/database/DatabaseRefreshTokensRepository.js"
import { DatabaseUsersRepository } from "@/repositories/database/DatabaseUsersRepository.js"
import { logoutUserBodySchema } from "@/schemas/logoutUserBodySchema.js"
import { LogoutUserService } from "@/services/logoutUserService.js"
import { FastifyReply, FastifyRequest } from "fastify"

async function logoutUserController(req: FastifyRequest, res: FastifyReply){
    
    const { token } = logoutUserBodySchema.parse(req.body)

    try {

        const usersRepository = new DatabaseUsersRepository()
        const refreshTokensRepository = new DatabaseRefreshTokensRepository()
        const loginUserService = new LogoutUserService(refreshTokensRepository)

        await loginUserService.execute({ token })

    } catch(error){

        // Faz com que a CAMADA ACIMA LIDE com este ERRO
        throw error
    }

    return res.status(200).send({ message: "Logged Out." })
}

export { logoutUserController }