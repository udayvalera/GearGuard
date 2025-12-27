import "dotenv/config";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use("/api/v1/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from Root TypeScript Express!");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});