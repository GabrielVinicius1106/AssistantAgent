import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { publicRoutes, privateRoutes } from "./http/routes.js";

const server = fastify()

server.register(publicRoutes)
server.register(privateRoutes)

// GET Hello World :)
server.get('/api', (_, res: FastifyReply) => {
    return res.status(200).send("Hello from Lynq :)")
})

export { server }