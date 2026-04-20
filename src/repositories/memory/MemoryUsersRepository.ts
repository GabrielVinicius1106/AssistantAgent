import { CreateUserInput } from "@/interfaces/CreateUser.js";
import { User } from "@/interfaces/entities/User.js";
import { UsersRepositoryInterface } from "@/repositories/UsersRepositoryInterface.js"
import { randomUUID } from "node:crypto";

export class MemoryUsersRepository implements UsersRepositoryInterface {
    
    private users: User[] = []
    
    async create(data: CreateUserInput): Promise<User> {

        const { name, email, password_hash  } = data

        const user: User = {
            id: randomUUID(),
            name,
            email,
            password_hash
        }
        
        this.users.push(user)

        return user
    }

    async findByEmail(email: string): Promise<User | null> {

        const user = this.users.find((user) => user.email === email)

        return user ? user : null

    }
    
    async findById(id: string): Promise<User | null> {

        const user = this.users.find((user) => user.id === id)

        return user ? user : null

    }

}