import z from "zod";

export const getAccessTokenHeaderSchema = z.object({
    access_token: z.string()
})