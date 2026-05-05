import fastify, { FastifyReply } from "fastify";
import cookie from "@fastify/cookie"

import { publicRoutes, privateRoutes } from "./http/routes.js";
import { env } from "./env/index.js";


const server = fastify()

// Set Cookies Fastify's Plugin
server.register(cookie, {
    hook: "onRequest",
    secret: env.COOKIES_SECRET,
    parseOptions: {
        secure: true,
        sameSite: "strict"
    }
})

server.register(publicRoutes)
server.register(privateRoutes)

// GET Hello World :)
server.get('/api', (_, res: FastifyReply) => {
    return res.status(200).send("Hello from Lynq :)")
})

export { server }