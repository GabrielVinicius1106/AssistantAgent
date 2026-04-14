import z from "zod"; 

export const logoutUserHeaderSchema = z.object({
    access_token: z.string()
})