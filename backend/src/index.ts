import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", async (req, res) => {
  const { userId } = req.cookies;
  if (userId) {
    const userInfo = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });
    return res.json({ userInfo });
  } else {
    return res.json({
      message: "failed to get info",
    });
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  let existingUser = await prisma.user.findFirst({ where: { name } });
  if (existingUser) {
    return res.status(400).json({ message: "Try Using Different name" });
  }

  existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "Try Using Different email" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
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
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const matched = await bcrypt.compare(password, existingUser.password);
      if (matched) {
        res.cookie("userId", existingUser.id, {
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


app.listen(3000, () => {
  console.log("App is listening at port 3000");
});
