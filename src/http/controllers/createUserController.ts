import { FastifyReply, FastifyRequest } from "fastify";
import { createUserBodySchema } from "@/schemas/createUserBodySchema.js";
import { DatabaseUsersRepository } from "@/repositories/database/DatabaseUsersRepository.js";
import { CreateUserService } from "@/services/createUserService.js";
import { UserAlreadyExistsError } from "@/services/errors/UserAlreadyExistsError.js";
import { InvalidPasswordLengthError } from "@/services/errors/InvalidPasswordLengthError.js";

async function createUserController(req: FastifyRequest, res: FastifyReply){
    
    const { email, name, password } = createUserBodySchema.parse(req.body)

    try {

        const usersRepository = new DatabaseUsersRepository()
        const createUserService = new CreateUserService(usersRepository)

        await createUserService.execute({ email, name, password })

    } catch(error){

        if(error instanceof UserAlreadyExistsError){
            return res.status(409).send({
                message: error.message
            })
        }

        if(error instanceof InvalidPasswordLengthError){
            return res.status(400).send({
                message: error.message
            })
        }

        // Faz com que a CAMADA ACIMA LIDE com este ERRO
        throw error
    }

    return res.status(201).send("User Created.")

}

export { createUserController }