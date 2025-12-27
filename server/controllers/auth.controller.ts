import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                // role defaults to "user" in schema
            },
        });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000, // 1 hour
        });

        res.status(201).json({ message: "User created successfully", user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000, // 1 hour
        });

        res.status(200).json({ message: "Login successful", user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, createdAt: true, updatedAt: true }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};
