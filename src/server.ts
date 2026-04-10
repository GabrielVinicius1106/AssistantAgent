import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { appRoutes } from "./http/routes.js";

const server = fastify()

server.register(appRoutes)

// GET Hello World :)
server.get('/api', (req: FastifyRequest, res: FastifyReply) => {
    return res.status(200).send("Hello World :)")
})

export { server }