import { hash } from "bcryptjs"
import { UserRepositoryInterface } from "@/repositories/UsersRepositoryInterface.js"
import { UserAlreadyExistsError } from "./errors/UserAlreadyExistsError.js"
import { InvalidPasswordLengthError } from "./errors/InvalidPasswordLengthError.js"

interface CreateUserRequest {
    name: string
    email: string
    password: string
}

export class CreateUserService {

    constructor(private usersRepository: UserRepositoryInterface){}

    async execute({ name, email, password }: CreateUserRequest){

        if(password.length < 6) throw new InvalidPasswordLengthError()
        
        const password_hash = await hash(password, 12)
    
        const userWithSameEmail = await this.usersRepository.findByEmail(email)
    
        if(userWithSameEmail) throw new UserAlreadyExistsError()
    
        const user = await this.usersRepository.create({
            name,
            email,
            password_hash
        })
    }
}
