import z from "zod"; 

export const logoutUserBodySchema = z.object({
    refresh_token: z.string()
})