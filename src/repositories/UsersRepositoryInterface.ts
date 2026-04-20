import { CreateUserInput } from "@/interfaces/CreateUser.js";
import { User } from "@/interfaces/entities/User.js";

export interface UsersRepositoryInterface {
    create(data: CreateUserInput): Promise<User>
    findByEmail(email: string): Promise<User | null>
    findById(id: string): Promise<User | null>
}