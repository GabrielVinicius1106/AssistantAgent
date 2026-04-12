import { compare, hash } from "bcryptjs"
import jwt from "jsonwebtoken"
import { UserRepositoryInterface } from "@/repositories/UsersRepositoryInterface.js"
import { InvalidCredentialsError } from "./errors/InvalidCredentialsError.js"
import { env } from "@/env/index.js"
import { RefreshTokensRepositoryInterface } from "@/repositories/RefreshTokensRepositoryInterface.js"
import { randomBytes } from "node:crypto"

interface LoginUserRequest {
    email: string
    password: string
}

export class LoginUserService {

    constructor(private usersRepository: UserRepositoryInterface, private refreshTokensRepository: RefreshTokensRepositoryInterface){}

    async execute({ email, password }: LoginUserRequest){
            
        const user = await this.usersRepository.findByEmail(email)
        
        // Usuário NÃO EXISTE
        if(!user) throw new InvalidCredentialsError()
        
        const user_id = user.id

        const validPassword = await compare(password, user.password_hash)

        // Senha INVÁLIDA
        if(!validPassword) throw new InvalidCredentialsError()
        
        const payload = {
            user_id
        }

        const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15min" })

        const refresh_token_string = randomBytes(32).toString("hex")

        const expires_at = new Date()
        expires_at.setDate(expires_at.getDate() + 30) // Validade de 30 Dias para o Refresh Token

        // Criar Refresh Token
        await this.refreshTokensRepository.create({
            user_id,
            expires_at,
            token: refresh_token_string    
        })

        return {
            access_token: token,
            refresh_token: refresh_token_string
        }
        
    }
}
