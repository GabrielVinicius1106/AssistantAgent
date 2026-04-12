import "dotenv/config"
import z from "zod";

const envSchema = z.object({
    PORT: z.coerce.number(),
    NODE_ENV: z.string(),
    JWT_SECRET: z.string(),
    DATABASE_URL: z.string()
})

const _env = envSchema.safeParse(process.env)

if(_env.success == false) throw new Error(`ERRO: Falha ao carregar Variáveis de Ambiente... \n ${_env.error}`) 

const env = _env.data

export { env }