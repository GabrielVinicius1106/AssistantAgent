import { FastifyReply, FastifyRequest } from "fastify";
import { DatabaseUsersRepository } from "@/repositories/database/DatabaseUsersRepository.js";
import { loginUserBodySchema } from "@/schemas/loginUserBodyShema.js";
import { LoginUserService } from "@/services/loginUserService.js";
import { InvalidCredentialsError } from "@/services/errors/InvalidCredentialsError.js";
import { DatabaseRefreshTokensRepository } from "@/repositories/database/DatabaseRefreshTokensRepository.js";

async function loginUserController(req: FastifyRequest, res: FastifyReply){
    
    const { email, password } = loginUserBodySchema.parse(req.body)

    try {

        const usersRepository = new DatabaseUsersRepository()
        const refreshTokensRepository = new DatabaseRefreshTokensRepository()
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)

        const { access_token, refresh_token } = await loginUserService.execute({ email, password })

        // Set a COOKIE for the REFRESH TOKEN
        res.setCookie("refresh_token", refresh_token, {
            httpOnly: true
        })

        return res.status(200).send({
            access_token
        })

    } catch(error){

        if(error instanceof InvalidCredentialsError){
            return res.status(400).send({
                message: error.message
            })
        }

        throw error
    }

}

export { loginUserController }