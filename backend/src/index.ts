import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(cookieParser());

app.get("/", async (req, res) => {
  const allusers = await prisma.user.findMany();
  return res.json({ allusers });
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

  const newuser = await prisma.user.create({
    data: { name, email, password },
  });

  const { id } = newuser;
  const username = newuser.name;

  if (newuser) {
    res.cookie("userId", id, {
      secure: false, 
      sameSite: 'strict',
    });

    return res.json({ id, name: username });
  }

  return res.status(500).json({ message: "Error while adding" });
});

app.listen(3000, () => {
  console.log("App is listening at port 3000");
});
