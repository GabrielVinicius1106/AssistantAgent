import { CreateUserInput } from "@/interfaces/CreateUserInput.js";
import { UserRepositoryInterface } from "../UsersRepositoryInterface.js";
import { prisma } from "@/lib/prisma.js";
import { User } from "@/generated/prisma/index.js";

export class DatabaseUsersRepository implements UserRepositoryInterface {
    
    async findByEmail(email: string){

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        return user

    }
    async create(data: CreateUserInput){
        
        const user = await prisma.user.create({
            data
        })

        return user
    }

    async findById(id: string): Promise<User | null> {
        
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })

        return user

    }

}