import { hash } from "bcryptjs"
import { UserRepositoryInterface } from "@/repositories/UsersRepositoryInterface.js"
import { UserAlreadyExistsError } from "./errors/UserAlreadyExistsError.js"

interface CreateUserRequest {
    name: string
    email: string
    password: string
}

export class CreateUserService {

    constructor(private usersRepository: UserRepositoryInterface){}

    async execute({ name, email, password }: CreateUserRequest){
        
        const password_hash = await hash(password, 6) 
    
        const userWithSameEmail = await this.usersRepository.findByEmail(email)
    
        if(userWithSameEmail){
            throw new UserAlreadyExistsError()
        }
    
        const user = await this.usersRepository.create({
            name,
            email,
            password_hash
        })
    }
}
