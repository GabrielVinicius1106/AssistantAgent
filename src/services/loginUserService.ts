import { compare } from "bcryptjs"
import { UsersRepositoryInterface } from "@/repositories/UsersRepositoryInterface.js"
import { InvalidCredentialsError } from "./errors/InvalidCredentialsError.js"
import { env } from "@/env/index.js"
import { RefreshTokensRepositoryInterface } from "@/repositories/RefreshTokensRepositoryInterface.js"
import { LoginUserInput } from "@/interfaces/LoginUser.js"
import { generateTokens } from "@/lib/generateTokens.js"

interface LoginUserRequest {
    email: string
    password: string
}

export class LoginUserService {

    constructor(private usersRepository: UsersRepositoryInterface, private refreshTokensRepository: RefreshTokensRepositoryInterface){}

    async execute({ email, password }: LoginUserRequest){
            
        const user = await this.usersRepository.findByEmail(email)
        
        // Usuário NÃO EXISTE
        if(!user) throw new InvalidCredentialsError()
        
        const user_id = user.id

        const validPassword = await compare(password, user.password_hash)

        // Senha INVÁLIDA
        if(!validPassword) throw new InvalidCredentialsError()
        
        const { access_token, refresh_token, expires_at } = generateTokens(user_id, env.JWT_SECRET) 

        // Criar Refresh Token
        await this.refreshTokensRepository.create({
            token: refresh_token,    
            user_id,
            expires_at
        })

        return {
            access_token,
            refresh_token
        }
        
    }
}
