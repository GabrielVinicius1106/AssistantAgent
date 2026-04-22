import { CreateUserInput } from "@/interfaces/CreateUser.js"
import { LoginUserInput } from "@/interfaces/LoginUser.js"
import { MemoryRefreshTokensRepository } from "@/repositories/memory/MemoryRefreshTokensRepository.js"
import { MemoryUsersRepository } from "@/repositories/memory/MemoryUsersRepository.js"
import { CreateUserRequest, CreateUserService } from "@/services/createUserService.js"
import { InvalidCredentialsError } from "@/services/errors/InvalidCredentialsError.js"
import { LoginUserService } from "@/services/loginUserService.js"
import { PassThrough } from "node:stream"
import { test, describe, expect, beforeEach } from "vitest"

describe("Login User Tests", () => {

    test("shouldn't be able to find a user with an invalid email", async () => {
        
        const usersRepository = new MemoryUsersRepository()
        const refreshTokensRepository = new MemoryRefreshTokensRepository() 
        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)

        const data: LoginUserInput = {
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        await expect(async () => {
            await loginUserService.execute(data)
        }).rejects.toBeInstanceOf(InvalidCredentialsError)

    })

    test("shouldn't be able to find a user with an invalid password", async () => {

        const usersRepository = new MemoryUsersRepository()
        const refreshTokensRepository = new MemoryRefreshTokensRepository() 

        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)
        const createUserService = new CreateUserService(usersRepository)

        const data: CreateUserRequest = {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        // Create an User
        await createUserService.execute(data)

        const request = {
            email: "johndoe@gmail.com",
            password: "123456"
        }

        await expect(async () => {
            await loginUserService.execute(request)
        }).rejects.toBeInstanceOf(InvalidCredentialsError)


    })

    test("should return the access_token and the refresh_token correctly", async () => {

        const usersRepository = new MemoryUsersRepository()
        const refreshTokensRepository = new MemoryRefreshTokensRepository() 

        const loginUserService = new LoginUserService(usersRepository, refreshTokensRepository)
        const createUserService = new CreateUserService(usersRepository)

        const data: CreateUserRequest = {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        // Create an User
        await createUserService.execute(data)

        const request = {
            email: "johndoe@gmail.com",
            password: "12345678"
        }

        const response = await loginUserService.execute(request)

        expect(response.access_token).toStrictEqual(expect.any(String))
        expect(response.refresh_token).toStrictEqual(expect.any(String))

    })




})