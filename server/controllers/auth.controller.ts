import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Initialize Prisma
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ error: "Name, email, and password are required" });
            return;
        }

        // Check if employee exists
        const existingEmployee = await prisma.employee.findUnique({ where: { email } });
        if (existingEmployee) {
            res.status(400).json({ error: "Employee already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Employee
        // Note: In a real app, you might restrict who can set the 'role' here.
        const employee = await prisma.employee.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "EMPLOYEE", // Defaults to EMPLOYEE if not sent
            },
        });

        // Generate Token
        const token = jwt.sign(
            { id: employee.id, email: employee.email, role: employee.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Set Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000, // 1 hour
            sameSite: "strict"
        });

        res.status(201).json({ 
            message: "User created successfully", 
            user: { 
                id: employee.id, 
                name: employee.name, 
                email: employee.email, 
                role: employee.role 
            } 
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        // Find Employee
        const employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        // Generate Token
        const token = jwt.sign(
            { id: employee.id, email: employee.email, role: employee.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Set Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000, // 1 hour
            sameSite: "strict"
        });

        res.status(200).json({ 
            message: "Login successful", 
            user: { 
                id: employee.id, 
                name: employee.name,
                email: employee.email, 
                role: employee.role 
            } 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const logout = (req: Request, res: Response): void => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: number }; // ID is Int in your schema

        const employee = await prisma.employee.findUnique({
            where: { id: decoded.id },
            select: { 
                id: true, 
                name: true,
                email: true, 
                role: true, 
                maintenance_team_id: true,

            }
        });

        if (!employee) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json({ user: employee });
    } catch (error) {
        // console.error("GetMe error:", error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};