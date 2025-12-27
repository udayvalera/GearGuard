import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        const existingEmployee = await prisma.employee.findUnique({ where: { email } });
        if (existingEmployee) {
            res.status(400).json({ error: "Employee already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Note: For security, real apps should restrict setting 'role' here, 
        // but we allow it for Phase 2 testing.
        const employee = await prisma.employee.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "EMPLOYEE",
            },
        });

        const token = jwt.sign(
            { id: employee.id, email: employee.email, role: employee.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000, // 1 hour
            sameSite: "strict"
        });

        res.status(201).json({
            message: "User created successfully",
            user: { id: employee.id, name: employee.name, email: employee.email, role: employee.role }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token = jwt.sign(
            { id: employee.id, email: employee.email, role: employee.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
            sameSite: "strict"
        });

        res.status(200).json({
            message: "Login successful",
            user: { id: employee.id, name: employee.name, email: employee.email, role: employee.role }
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
        // REFACTOR: Use req.user set by authenticate middleware
        const userPayload = (req as any).user;

        if (!userPayload) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }

        const employee = await prisma.employee.findUnique({
            where: { id: userPayload.id },
            select: {
                id: true, name: true, email: true, role: true,
                maintenance_team_id: true
            }
        });

        if (!employee) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json({ user: employee });
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Invalid token" });
    }
};