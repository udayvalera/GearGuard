import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { AnyZodObject} from 'zod/v3';

export const validate = (schema: AnyZodObject) => 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            return next();
        } catch (error: any) {
            // Log the raw error for debugging if needed
            // console.error("Validation Middleware Caught:", error);

            // Check for ZodError via instanceof OR duck-typing (checking for .issues)
            if (error instanceof ZodError || error.issues) {
                // Zod v3 stores details in .issues. .errors is a getter that might be failing or undefined in some contexts.
                const issues = error.issues || error.errors;

                if (issues && Array.isArray(issues)) {
                    return res.status(400).json({
                        error: "Validation Error",
                        details: issues.map((e: any) => ({
                            path: e.path ? e.path.join('.') : 'unknown',
                            message: e.message
                        }))
                    });
                }
            }
            
            // Fallback for unexpected errors
            console.error("Unexpected Validation Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    };