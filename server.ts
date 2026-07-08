import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse incoming JSON payloads
  app.use(express.json());

  // API endpoint for Gemini generation
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;

      if (!prompt) {
        res.status(400).json({ error: "Le prompt est obligatoire." });
        return;
      }

      // Initialize Gemini Client inside request or module load (lazy-init is safer if key is missing on startup)
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "Clé GEMINI_API_KEY manquante sur le serveur." });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "Vous êtes Hinov AI, un assistant financier intelligent intégré dans l'application Hinov de suivi de factures et performance commerciale. Vous aidez à analyser les factures en attente/en retard, la marge réalisée, le reste à recouvrer et la performance d'apport de chaque commercial. Répondez de manière professionnelle, analytique, polie et exclusivement en français.",
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Erreur interne lors de la requête IA." });
    }
  });

  // Vite integration as middleware in development or static server in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started and running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
