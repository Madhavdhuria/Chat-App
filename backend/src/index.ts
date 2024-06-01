import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import ws from "ws";

dotenv.config();
console.log("hlo");

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

interface UserPayload {
  userId: number;
  name: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: UserPayload;
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user as UserPayload;
    next();
  });
};

app.get("/", authenticateToken, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { userId } = req.user;
  const userInfo = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return res.json({ userInfo });
});

const getMessagesForUser = async (selectedUser: number, userId: number) => {
  const res = await prisma.p2p_Message.findMany({
    where: {
      OR: [
        {
          recipientId: selectedUser,
          senderId: userId,
        },
        {
          recipientId: userId,
          senderId: selectedUser,
        },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return res;
};

app.get("/getmessages/:selectedUser", authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { userId } = req.user;
  const selectedUser = req.params.selectedUser;
  const messages = await getMessagesForUser(Number(selectedUser), userId);
  res.json({ messages });
});

app.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  let existingUser = await prisma.user.findFirst({ where: { name } });
  if (existingUser) {
    return res.status(400).json({ message: "Try Using Different name" });
  }

  existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "Try Using Different email" });
  }

  // Instead of hashing password with bcrypt, you can store it directly
  const newUser = await prisma.user.create({
    data: { name, email, password }, // Assuming 'password' here is a plain text
  });

  const { id } = newUser;
  const username = newUser.name;

  if (newUser) {
    const token = jwt.sign({ userId: id, name: username }, JWT_SECRET);

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
    });
    return res.json({ id, name: username });
  }

  return res.status(500).json({ message: "Error while adding" });
});

app.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Instead of bcrypt, compare passwords directly
      if (password === existingUser.password) {
        const token = jwt.sign(
          { userId: existingUser.id, name: existingUser.name },
          JWT_SECRET
        );
        res.cookie("token", token, {
          secure: false,
          sameSite: "strict",
        });
        return res.json({
          success: true,
        });
      } else {
        return res.json({
          success: false,
          error: "Invalid credentials!",
        });
      }
    } else {
      return res.json({
        success: false,
        error: "Invalid credentials!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Something is up with the server",
    });
  }
});

interface CustomWebSocket extends ws.WebSocket {
  userId?: string;
  name?: string;
}

const server = app.listen(3000, () => {
  console.log("App is listening at port 3000");
});

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection: CustomWebSocket, req) => {
  const allcookies = req?.headers?.cookie;
  const tokencookie = allcookies
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith("token="));

  const cookievalue = tokencookie?.split("=")[1];
  if (cookievalue) {
    jwt.verify(cookievalue, JWT_SECRET, (err: any, user: any) => {
      if (err) throw err;
      const { userId, name } = user;
      connection.userId = userId;
      connection.name = name;
      const broadcastClientInfo = () => {
        const clientsInfo: { userId?: string; username?: string }[] = [];
        wss.clients.forEach((client) => {
          const customClient = client as CustomWebSocket;
          clientsInfo.push({
            userId: customClient.userId,
            username: customClient.name,
          });
        });

        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              online: clientsInfo,
            })
          );
        });
      };

      connection.on("message", async (message) => {
        const { messagedata } = JSON.parse(message.toString());
        const { recipientId, text, senderId } = messagedata;

        if (recipientId && text) {
          await prisma.p2p_Message.create({
            data: {
              recipientId: Number(recipientId),
              senderId,
              message: text,
            },
          });

          const RecipientFound = [...wss.clients].filter((client) => {
            const customClient = client as CustomWebSocket;
            return String(customClient.userId) === String(recipientId);
          });

          RecipientFound.forEach((c) => {
            const customClient = c as CustomWebSocket;
            customClient.send(
              JSON.stringify({
                senderId,
                data: text,
              })
            );
          });
        }
      });

      broadcastClientInfo();
      connection.on("close", () => {
        broadcastClientInfo();
      });
    });
  }
});
