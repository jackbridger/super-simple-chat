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
  addParticipantsToChannelByID
} from './controllers/channels.controller';
import {  getMessageByID, sendMessageToChannel } from "./controllers/messages.controller";
import { createToken } from "./controllers/authentication.controller";
import { secureClientRoutesWithJWTs } from "./utils/auth";
import {getChannelMessagesByID} from "./controllers/messages.controller";

const app = express();
const server = http.createServer(app);
const ioServer = new Server(server,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
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
app.post("/channels", createChannel);  // ✅
app.post("/messages", sendMessageToChannel) // ✅
app.get("/channels/:channel_id", getChannelByID); //✅
app.get("/channels/:channel_id/messages", getChannelMessagesByID) // ✅
app.get("/channels", getAllChannels) //✅
app.get("/users", getAllUsers); // ✅
app.post("/channels/:channel_id/add-participants", addParticipantsToChannelByID); // ✅

server.listen(process.env.PORT || 3001);
