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
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.cookies;
    if (userId) {
        const userInfo = yield prisma.user.findUnique({
            where: {
                id: parseInt(userId),
            },
        });
        return res.json({ userInfo });
    }
    else {
        return res.json({
            message: "failed to get info",
        });
    }
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
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const newUser = yield prisma.user.create({
        data: { name, email, password: hashedPassword },
    });
    const { id } = newUser;
    const username = newUser.name;
    if (newUser) {
        res.cookie("userId", id, {
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
            const matched = yield bcrypt_1.default.compare(password, existingUser.password);
            if (matched) {
                res.cookie("userId", existingUser.id, {
                    secure: false,
                    sameSite: "strict",
                });
                return res.json({
                    success: true,
                });
            }
            else {
                return res.status(401).json({
                    error: "Invalid credentials!",
                });
            }
        }
        else {
            return res.status(401).json({
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
app.listen(3000, () => {
    console.log("App is listening at port 3000");
});
