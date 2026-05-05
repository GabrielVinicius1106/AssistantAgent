import { describe, expect, test } from "vitest"

import { MemoryUsersRepository } from "@/repositories/memory/MemoryUsersRepository.js"
import { CreateUserRequest, CreateUserService } from "@/services/createUserService.js"
import { LoginUserService } from "@/services/loginUserService.js"
import { MemoryRefreshTokensRepository } from "@/repositories/memory/MemoryRefreshTokensRepository.js"
import { LogoutUserService } from "@/services/logoutUserService.js"
import { redisClone } from "@/tools/redisClone.js"
import { LoginUserInput } from "@/interfaces/LoginUser.js"
import { LogoutUserInput } from "@/interfaces/LogoutUser.js"


describe("Logout User Tests", () => {

    test("should save the access_token in the black list of redis and time to live should be 15 minutes = 900 seconds", async () => {

        const usersRepository = new MemoryUsersRepository()
        const refreshTokensRepository = new MemoryRefreshTokensRepository()

        
        // I) Create User
        const createUserService = new CreateUserService(usersRepository)
        
        const createUserInput: CreateUserRequest = {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "0123456789"
        }
        
        await createUserService.execute(createUserInput)
        
        // II) Login User
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)
        
        const loginUserInput: LoginUserInput = {
            email: "johndoe@gmail.com",
            password: "0123456789"
        }
        
        const { access_token, refresh_token } = await loginUserService.execute(loginUserInput)

        // III) Logout User
        const logoutUserService = new LogoutUserService(refreshTokensRepository)

        const logoutUserInput: LogoutUserInput = {
            access_token,
            refresh_token
        }

        await logoutUserService.execute(logoutUserInput)

        expect(redisClone.GET(access_token)?.value).toBe(true)
        expect(redisClone.TTL(access_token)).toBeLessThanOrEqual(900.0)
        
    })

    test("should log out user if refresh_token is invalid or doesn't exists", async () => {

        const usersRepository = new MemoryUsersRepository()
        const refreshTokensRepository = new MemoryRefreshTokensRepository()

        
        // I) Create User
        const createUserService = new CreateUserService(usersRepository)
        
        const createUserInput = {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "0123456789"
        }
        
        await createUserService.execute(createUserInput)
        
        // II) Login User
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)
        
        const loginUserInput = {
            email: "johndoe@gmail.com",
            password: "0123456789"
        }
        
        const { access_token } = await loginUserService.execute(loginUserInput)

        // III) Logout User
        const logoutUserService = new LogoutUserService(refreshTokensRepository)

        const logoutUserInput = {
            access_token,
            refresh_token: "12345678"
        }

        const response = await logoutUserService.execute(logoutUserInput)

        expect(response).toBe("Logged Out.")

    })

    test("should log out user correctly", async () => {

        const usersRepository = new MemoryUsersRepository()
        const refreshTokensRepository = new MemoryRefreshTokensRepository()

        
        // I) Create User
        const createUserService = new CreateUserService(usersRepository)
        
        const createUserInput = {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "0123456789"
        }
        
        await createUserService.execute(createUserInput)
        
        // II) Login User
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)
        
        const loginUserInput = {
            email: "johndoe@gmail.com",
            password: "0123456789"
        }
        
        const { access_token, refresh_token } = await loginUserService.execute(loginUserInput)

        // III) Logout User
        const logoutUserService = new LogoutUserService(refreshTokensRepository)

        const logoutUserInput = {
            access_token,
            refresh_token
        }

        const response = await logoutUserService.execute(logoutUserInput)

        expect(response).toBe("Logged Out.")

    })

})