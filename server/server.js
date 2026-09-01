import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error("FALTA GEMINI_API_KEY en el archivo .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const mensaje = String(req.body?.mensaje || "").trim();

    if (!mensaje) {
      return res.status(400).json({
        error: "No recibí ningún mensaje."
      });
    }

    let contextoWikipedia = "";

    try {
      const url =
        "https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
        encodeURIComponent(mensaje) +
        "&format=json&origin=*";

      const wiki = await fetch(url);
      const datosWiki = await wiki.json();

      const resultados = datosWiki?.query?.search || [];

      if (resultados.length > 0) {
        contextoWikipedia = resultados
          .slice(0, 3)
          .map((item) => `${item.title}: ${item.snippet.replace(/<[^>]*>/g, "")}`)
          .join("\n");
      }
    } catch {
      contextoWikipedia = "";
    }

    const prompt = `
Eres un asistente de IA útil, claro y amigable.

El usuario preguntó:
${mensaje}

Información complementaria encontrada en Wikipedia:
${contextoWikipedia || "No se encontró información complementaria."}

Responde en español. Usa Wikipedia solo como contexto adicional y no inventes datos.
`;

    const respuesta = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const texto = respuesta.text || "No pude generar una respuesta.";

    res.json({ respuesta: texto });
  } catch (error) {
    console.error("ERROR GEMINI:", error);
    res.status(500).json({
      error: "No pude generar una respuesta."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor IA funcionando en http://localhost:${PORT}`);
});
