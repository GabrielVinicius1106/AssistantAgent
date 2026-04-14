import { FastifyReply } from "fastify";
import { server } from "./server.js";
import { env } from "@/env/index.js"
import z, { ZodError } from "zod";

const PORT  = env.PORT

const app = server;

// Global Error Handler
app.setErrorHandler((error, _, res: FastifyReply) => {

    if(error instanceof ZodError){
        return res.status(400).send({
            message: "Validation Error.",
            issues: z.treeifyError(error)
        })
    }

    if(env.NODE_ENV != "production"){
        console.log(error);
    } else {
        // SOME TOOLING to WATCH THE ERRORS in PRODUCTION
    }

    return res.status(500).send({
        message: "Internal Server Error."
    })


})  

app.listen({
    port: PORT
}).then(() => {
    console.log(`🚀 HTTP Server Running on PORT: ${PORT} \n`);
    console.log(`===========================================\n`);
})