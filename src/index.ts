import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import { getAllUsers, getUserByID, } from './controllers/users.controller';
import Socket from "./utils/socket";

import { 
  createChannel as createChannel, 
  getAllChannels, 
  getChannelByID, 
  getChannelMessages as getMessagesInAChannel, 
} from './controllers/channels.controller';
import {  getMessageByID, sendMessageToChannel } from "./controllers/messages.controller";
import { createToken } from "./controllers/authentication.controller";
import { secureClientRoutesWithJWTs } from "./utils/auth";

const app = express();
const server = http.createServer(app);
const ioServer = new Server(server);
Socket.getInstance(ioServer);

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(cors())

app.use(secureClientRoutesWithJWTs);

app.get("/", function (req:Request, res:Response) {
  return res.sendStatus(200);
});

// MVP endpoints
app.post("/users/token",createToken); // ✅
app.post("/channels", createChannel);  // ❌
app.post("/messages", sendMessageToChannel) // ❌
app.get("/channels/:channel_id", getChannelByID); //❌
app.get("/channels", getAllChannels) //❌
app.get("/users", getAllUsers); // ❌
app.get("/users/:user_id", getUserByID); //  ❌
app.get("/messages/:message_id",getMessageByID); //❌
app.get("/channels/:channel_id/messages", getMessagesInAChannel) // ❌

server.listen(process.env.PORT || 3001);