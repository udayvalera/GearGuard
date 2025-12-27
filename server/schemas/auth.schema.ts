import { z } from 'zod';
import { Role } from '@prisma/client';

export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.nativeEnum(Role).optional(), // Optional, defaults to EMPLOYEE in controller if logic exists, usually required
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    })
});