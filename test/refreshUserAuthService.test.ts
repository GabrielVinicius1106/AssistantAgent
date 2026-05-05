import { LoginUserInput } from "@/interfaces/LoginUser.js"
import { RefreshTokenInput } from "@/interfaces/RefreshToken.js"
import { MemoryRefreshTokensRepository } from "@/repositories/memory/MemoryRefreshTokensRepository.js"
import { MemoryUsersRepository } from "@/repositories/memory/MemoryUsersRepository.js"
import { CreateUserRequest, CreateUserService } from "@/services/createUserService.js"
import { UnauthorizedError } from "@/services/errors/UnauthorizedError.js"
import { LoginUserService } from "@/services/loginUserService.js"
import { RefreshUserAuthService } from "@/services/refreshUserAuthService.js"
import { TokenRevokedError } from "@/services/errors/TokenRevokedError.js"
import { TokenExpiredError } from "@/services/errors/TokenExpiredError.js"
import { describe, expect, test } from "vitest"

describe("Refresh User's Auth Tests", () => {

    test("should return unauthorized error without token", async () => {

        const refreshTokensRepository = new MemoryRefreshTokensRepository()
        const refreshUserAuthService = new RefreshUserAuthService(refreshTokensRepository)

        const refreshUserAuthInput: RefreshTokenInput = {
            token: "123"
        }

        await expect( async () => {
            await refreshUserAuthService.execute(refreshUserAuthInput)
        }).rejects.toThrow(UnauthorizedError)
    })

    test("should return token expired error", async () => {

        // I) Create a User
        const usersRepository = new MemoryUsersRepository()
        const createUserService = new CreateUserService(usersRepository)

        const createUserInput: CreateUserRequest = {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        await createUserService.execute(createUserInput)

        // II) Login User
        const refreshTokensRepository = new MemoryRefreshTokensRepository()
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)

        const loginUserInput: LoginUserInput = {
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        const { refresh_token } = await loginUserService.execute(loginUserInput)

         const refreshTokenInput: RefreshTokenInput = {
            token: refresh_token
        }

        const refreshUserAuthService = new RefreshUserAuthService(refreshTokensRepository)
        
        await refreshUserAuthService.execute(refreshTokenInput)

        // III) Expire Token

        const response = await refreshTokensRepository.findByToken(refresh_token)

        expect(response).not.toBeNull()

        const token_id = response!.id

        await refreshTokensRepository.setExpiresAt(token_id, new Date(1995, 11, 17))

        // IV) Refresh User's Auth
   
        await expect( async () => {
            await refreshUserAuthService.execute(refreshTokenInput)
        }).rejects.toThrow(TokenExpiredError)
   
    })

    test("should return token revoked error", async () => {

        // I) Create a User
        const usersRepository = new MemoryUsersRepository()
        const createUserService = new CreateUserService(usersRepository)

        const createUserInput: CreateUserRequest = {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        await createUserService.execute(createUserInput)

        // II) Login User
        const refreshTokensRepository = new MemoryRefreshTokensRepository()
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)

        const loginUserInput: LoginUserInput = {
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        const { refresh_token } = await loginUserService.execute(loginUserInput)


        // III) Revoke Token

        const response = await refreshTokensRepository.findByToken(refresh_token)
        await refreshTokensRepository.revoke(response?.id!)

        // IV) Refresh User's Auth
        const refreshUserAuthService = new RefreshUserAuthService(refreshTokensRepository)

        const refreshTokenInput: RefreshTokenInput = {
            token: refresh_token
        }

        await expect( async () => {
            await refreshUserAuthService.execute(refreshTokenInput)
        }).rejects.toThrow(TokenRevokedError)

    })

    test("should revoke the unused token", async () => {

        // I) Create a User
        const usersRepository = new MemoryUsersRepository()
        const createUserService = new CreateUserService(usersRepository)

        const createUserInput: CreateUserRequest = {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        await createUserService.execute(createUserInput)

        // II) Login User
        const refreshTokensRepository = new MemoryRefreshTokensRepository()
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)

        const loginUserInput: LoginUserInput = {
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        const { refresh_token } = await loginUserService.execute(loginUserInput)

        // III) Refresh User's Auth
        const refreshUserAuthService = new RefreshUserAuthService(refreshTokensRepository)

        const refreshTokenInput: RefreshTokenInput = {
            token: refresh_token
        }

        await refreshUserAuthService.execute(refreshTokenInput)

        // IV) Revoke Past Token

        const response = await refreshTokensRepository.findByToken(refresh_token)

        expect(response?.revoked!).toBe(true)
    })

    test("should create a new valid refresh token", async () => {

        // I) Create a User
        const usersRepository = new MemoryUsersRepository()
        const createUserService = new CreateUserService(usersRepository)

        const createUserInput: CreateUserRequest = {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        await createUserService.execute(createUserInput)

        // II) Login User
        const refreshTokensRepository = new MemoryRefreshTokensRepository()
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)

        const loginUserInput: LoginUserInput = {
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        const { access_token, refresh_token } = await loginUserService.execute(loginUserInput)

        // III) Refresh User's Auth
        const refreshUserAuthService = new RefreshUserAuthService(refreshTokensRepository)

        const refreshTokenInput: RefreshTokenInput = {
            token: refresh_token
        }

        const { access_token: access_token_response, refresh_token: refresh_token_response } = await refreshUserAuthService.execute(refreshTokenInput)

        expect(refresh_token_response).not.toEqual(refresh_token)        
        expect(access_token_response).not.toEqual(access_token)

    })

})