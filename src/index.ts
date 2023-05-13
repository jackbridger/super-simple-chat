import express, { Request, Response } from "express";
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { config } from "dotenv";

import Socket from "./utils/socket";
import { errorHandler } from "./middleware/error-handler";
import { rateLimiter } from "./middleware/rate-limiter";
import { requestLogger } from "./middleware/request-logger";
import { validateInput } from "./middleware/validate-input";

import { createToken } from "./controllers/authentication.controller";

import { 
  createChannel, 
  getAllChannels, 
  getChannelByID, 
  getChannelMessages as getMessagesInAChannel, 
  addParticipantsToChannelByID
} from './controllers/channels.controller';

import { 
  getAllUsers, 
  getUserByID, 
} from './controllers/users.controller';

import { 
  getMessageByID, 
  sendMessageToChannel, 
  getChannelMessagesByID
} from "./controllers/messages.controller";

import { 
  secureClientRoutesWithJWTs 
} from "./utils/auth";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ?? "http://localhost:3000";


config();

const app = express();
const server = http.createServer(app);
const ioServer = new Server(server,{
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

Socket.getInstance(ioServer);

app.use(express.json());
app.use(cors())

app.use(rateLimiter);
app.use(requestLogger);
app.use(validateInput);

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


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
