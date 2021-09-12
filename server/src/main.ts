import * as dotenv from 'dotenv'

dotenv.config()

import * as express from "express"
import * as http from 'http';
import {Express} from "express";
import {Server} from "./server";

import * as cors from 'cors'




const app = express()

app.use(cors())

const server = http.createServer(app)


server.listen(process.env.WS_PORT || 9000, () => console.log(`Server started listening at port ${
    //@ts-ignore
    server.address().port
}`))

new Server(app, server)