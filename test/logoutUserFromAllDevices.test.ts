import { describe, expect, test } from "vitest"

import { MemoryUsersRepository } from "@/repositories/memory/MemoryUsersRepository.js"
import { CreateUserRequest, CreateUserService } from "@/services/createUserService.js"
import { LoginUserService } from "@/services/loginUserService.js"
import { MemoryRefreshTokensRepository } from "@/repositories/memory/MemoryRefreshTokensRepository.js"
import { LogoutUserFromAllDevicesService } from "@/services/logoutUserFromAllDevicesService.js"
import { redisClone } from "@/tools/redisClone.js"
import { LoginUserInput } from "@/interfaces/LoginUser.js"
import { LogoutUserInput } from "@/interfaces/LogoutUser.js"
import { InvalidTokenError } from "@/services/errors/InvalidTokenError.js"


describe("Logout User From All Devices Tests", () => {

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

        // III) Logout User From All Devices
        const logoutUserFromAllDevicesService = new LogoutUserFromAllDevicesService(refreshTokensRepository)

        const logoutUserInput: LogoutUserInput = {
            access_token,
            refresh_token
        }

        await logoutUserFromAllDevicesService.execute(logoutUserInput)

        expect(redisClone.GET(access_token)?.value).toBe(true)
        expect(redisClone.TTL(access_token)).toBeLessThanOrEqual(900.0)

    })

    test("should throw InvalidTokenError if refresh_token is not provided", async () => {

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

        // III) Logout User From All Devices without refresh_token
        const logoutUserFromAllDevicesService = new LogoutUserFromAllDevicesService(refreshTokensRepository)

        const logoutUserInput = {
            access_token,
            refresh_token: ""
        }

        await expect(logoutUserFromAllDevicesService.execute(logoutUserInput)).rejects.toThrow(InvalidTokenError)

    })

    test("should throw InvalidTokenError if refresh_token is invalid or doesn't exist", async () => {

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

        // III) Logout User From All Devices with invalid refresh_token
        const logoutUserFromAllDevicesService = new LogoutUserFromAllDevicesService(refreshTokensRepository)

        const logoutUserInput = {
            access_token,
            refresh_token: "invalid-token-12345678"
        }

        await expect(logoutUserFromAllDevicesService.execute(logoutUserInput)).rejects.toThrow(InvalidTokenError)

    })

    test("should revoke all refresh tokens for the user and return correct message", async () => {

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

        // II) Login User multiple times to simulate multiple devices
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)

        const loginUserInput = {
            email: "johndoe@gmail.com",
            password: "0123456789"
        }

        await loginUserService.execute(loginUserInput)
        await loginUserService.execute(loginUserInput)
        const { access_token, refresh_token } = await loginUserService.execute(loginUserInput)

        // III) Logout User From All Devices
        const logoutUserFromAllDevicesService = new LogoutUserFromAllDevicesService(refreshTokensRepository)

        const logoutUserInput = {
            access_token,
            refresh_token
        }

        const response = await logoutUserFromAllDevicesService.execute(logoutUserInput)

        expect(response).toBe("Logged Out from All Devices.")

    })

})
