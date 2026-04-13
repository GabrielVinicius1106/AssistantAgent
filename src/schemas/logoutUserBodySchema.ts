import z from "zod"; 

export const logoutUserBodySchema = z.object({
    token: z.string()
})