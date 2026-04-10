import { Prisma, User } from "@/generated/prisma/client.js";

export interface UserRepositoryInterface {
    findByEmail(email: string): Promise<User | null>
    create(data: Prisma.UserCreateInput): Promise<User>
    findById(id: string): Promise<User | null>
}