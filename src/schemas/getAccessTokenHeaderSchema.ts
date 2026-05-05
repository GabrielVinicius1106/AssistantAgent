import z from "zod";

// Validate the : "Authorization": "Bearer eijh2813jdn72ydhku2h2i7hub..." PATTERN
export const getAccessTokenHeaderSchema = z.string().startsWith("Bearer ").transform((val) => val.split(' ')[1])