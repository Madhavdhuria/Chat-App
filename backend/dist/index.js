"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ws_1 = __importDefault(require("ws"));
dotenv_1.default.config();
console.log("hlo");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
app.get("/", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = req.user;
    const userInfo = yield prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    return res.json({ userInfo });
}));
const getMessagesForUser = (selectedUser, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield prisma.p2p_Message.findMany({
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
});
app.get("/getmessages/:selectedUser", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = req.user;
    const selectedUser = req.params.selectedUser;
    const messages = yield getMessagesForUser(Number(selectedUser), userId);
    res.json({ messages });
}));
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    let existingUser = yield prisma.user.findFirst({ where: { name } });
    if (existingUser) {
        return res.status(400).json({ message: "Try Using Different name" });
    }
    existingUser = yield prisma.user.findFirst({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: "Try Using Different email" });
    }
    // Instead of hashing password with bcrypt, you can store it directly
    const newUser = yield prisma.user.create({
        data: { name, email, password }, // Assuming 'password' here is a plain text
    });
    const { id } = newUser;
    const username = newUser.name;
    if (newUser) {
        const token = jsonwebtoken_1.default.sign({ userId: id, name: username }, JWT_SECRET);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
        });
        return res.json({ id, name: username });
    }
    return res.status(500).json({ message: "Error while adding" });
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Instead of bcrypt, compare passwords directly
            if (password === existingUser.password) {
                const token = jsonwebtoken_1.default.sign({ userId: existingUser.id, name: existingUser.name }, JWT_SECRET);
                res.cookie("token", token, {
                    secure: false,
                    sameSite: "strict",
                });
                return res.json({
                    success: true,
                });
            }
            else {
                return res.json({
                    success: false,
                    error: "Invalid credentials!",
                });
            }
        }
        else {
            return res.json({
                success: false,
                error: "Invalid credentials!",
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Something is up with the server",
        });
    }
}));
const server = app.listen(3000, () => {
    console.log("App is listening at port 3000");
});
const wss = new ws_1.default.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
    var _a;
    const allcookies = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.cookie;
    const tokencookie = allcookies === null || allcookies === void 0 ? void 0 : allcookies.split(";").find((cookie) => cookie.trim().startsWith("token="));
    const cookievalue = tokencookie === null || tokencookie === void 0 ? void 0 : tokencookie.split("=")[1];
    if (cookievalue) {
        jsonwebtoken_1.default.verify(cookievalue, JWT_SECRET, (err, user) => {
            if (err)
                throw err;
            const { userId, name } = user;
            connection.userId = userId;
            connection.name = name;
            const broadcastClientInfo = () => {
                const clientsInfo = [];
                wss.clients.forEach((client) => {
                    const customClient = client;
                    clientsInfo.push({
                        userId: customClient.userId,
                        username: customClient.name,
                    });
                });
                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({
                        online: clientsInfo,
                    }));
                });
            };
            connection.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
                const { messagedata } = JSON.parse(message.toString());
                const { recipientId, text, senderId } = messagedata;
                if (recipientId && text) {
                    yield prisma.p2p_Message.create({
                        data: {
                            recipientId: Number(recipientId),
                            senderId,
                            message: text,
                        },
                    });
                    const RecipientFound = [...wss.clients].filter((client) => {
                        const customClient = client;
                        return String(customClient.userId) === String(recipientId);
                    });
                    RecipientFound.forEach((c) => {
                        const customClient = c;
                        customClient.send(JSON.stringify({
                            senderId,
                            data: text,
                        }));
                    });
                }
            }));
            broadcastClientInfo();
            connection.on("close", () => {
                broadcastClientInfo();
            });
        });
    }
});
