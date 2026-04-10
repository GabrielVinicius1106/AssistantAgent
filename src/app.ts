import { server } from "./server.js";
import { env } from "@/env/index.js"

const PORT  = env.PORT

const app = server;

app.listen({
    port: PORT
}).then(() => {
    console.log(`🚀 HTTP Server Running on PORT: ${PORT} \n`);
    console.log(`===========================================\n`);
})