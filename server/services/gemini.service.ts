import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("❌ Missing GEMINI_API_KEY environment variable");
}

// Initialize Genkit + Gemini
const ai = genkit({
    plugins: [
        googleAI({
            apiKey: GEMINI_API_KEY,
        }),
    ],
});

// Hard-coded latest stable Gemini model
const MODEL_ID = "googleai/gemini-2.5-flash";

export async function generateResponse(prompt: string): Promise<string> {
    try {
        const response = await ai.generate({
            model: MODEL_ID,
            prompt,
        });

        return response.text;
    } catch (err) {
        console.error("Genkit Gemini Error:", err);
        throw new Error("Failed to generate response from Gemini via Genkit");
    }
}
