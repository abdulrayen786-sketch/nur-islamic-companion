import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

dotenv.config();

const configuredPort = Number.parseInt(process.env.PORT || "3000", 10);
const PORT = Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : 3000;
const HOST = process.env.HOST || "0.0.0.0";
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
);

// Lazy initialization of Gemini client to prevent crashes if key is missing during startup
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

const SYSTEM_INSTRUCTION = `You are the Muslim AI Companion inside NUR (نُور), a serene Islamic personal companion application.

Guiding Principles:
1. Manner & Tone: Speak with warmth, humility, tranquility, and respect. Begin answers with a gentle greeting like "Assalamu Alaikum wa Rahmatullahi wa Barakatuh" or a polite respectful greeting when appropriate.
2. Verified Grounding: Draw purely from verified Qur'anic verses, authentic Hadith (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah), authentic Duas, and respected mainstream scholarship (Tafsir Ibn Kathir, Al-Jalalayn, Al-Sa'di). Never invent or hallucinate Qur'anic verses or Hadith.
3. Scholarly Humility & Disclaimer: You are an educational and spiritual companion, NOT a qualified Islamic jurist or Mufti. For specific legal rulings, marital/financial Fatawa, or sensitive personal fiqh questions, always include a humble recommendation to consult a qualified local Islamic scholar.
4. Differences of Opinion: When classical scholars differ (e.g. madhahib differences on certain prayer details), neutrally present the main recognized viewpoints with respect.
5. Multilingual Fluency: Always reply in the language the user speaks to you in (English, Arabic, Urdu, Hindi, Gujarati, Bengali, Indonesian, Turkish, French, Spanish, German, etc.).
6. Action Orientation: When the user asks you to create a task, set a reminder, search the Qur'an, open a Surah, or check prayer times, use your tools to perform the action and report the result clearly.`;

// AI Tool Declarations
const searchQuranTool: FunctionDeclaration = {
  name: "search_quran",
  description: "Search for verses, keywords, or topics in the Holy Qur'an.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The search query, topic, or Surah name/number (e.g. 'light', 'patience', 'Surah Al-Kahf', 'Ayat al-Kursi', '2:255').",
      },
    },
    required: ["query"],
  },
};

const getAyahTextTool: FunctionDeclaration = {
  name: "get_ayah_text",
  description: "Retrieve verified Arabic text and translation for a specific Surah and Ayah number.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      surahNumber: { type: Type.INTEGER, description: "Surah number from 1 to 114" },
      ayahNumber: { type: Type.INTEGER, description: "Ayah number within the Surah" },
    },
    required: ["surahNumber", "ayahNumber"],
  },
};

const createTaskTool: FunctionDeclaration = {
  name: "create_task",
  description: "Create a worship, study, work, or personal daily task in NUR.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Task title or description (e.g. 'Read Surah Al-Mulk', 'Fast Monday Sunnah', 'Call parents')" },
      category: {
        type: Type.STRING,
        description: "Category: 'Worship', 'Qur\\'an', 'Study', 'Work', 'Health', 'Family', 'Personal', or 'Custom'",
      },
      priority: { type: Type.STRING, description: "'low', 'medium', or 'high'" },
      time: { type: Type.STRING, description: "Optional time (e.g. '06:00', '21:30')" },
      repeat: { type: Type.STRING, description: "'once', 'daily', 'weekly', or 'weekdays'" },
    },
    required: ["name"],
  },
};

const openAppSectionTool: FunctionDeclaration = {
  name: "open_section",
  description: "Open a specific section inside NUR application.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      section: {
        type: Type.STRING,
        description: "One of: 'home', 'prayer', 'quran', 'duas', 'adhkar', 'tasbih', 'qibla', 'calendar', 'ramadan', 'tasks', 'reflection', 'archive', 'settings'",
      },
      surahNumber: { type: Type.INTEGER, description: "Optional Surah number if opening Qur'an" },
      ayahNumber: { type: Type.INTEGER, description: "Optional Ayah number if opening Qur'an" },
    },
    required: ["section"],
  },
};

// Helper for resilient Gemini API calls with exponential backoff and fallback models
async function generateContentWithRetry(
  client: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  const candidateModels = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.error?.code || err?.code;
        const msg = String(err?.message || '');
        const isTransient =
          status === 503 ||
          status === 429 ||
          status === 'UNAVAILABLE' ||
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('resource exhausted') ||
          msg.includes('429');

        if (isTransient && attempt === 0) {
          // Brief exponential backoff delay before retrying
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        // If not transient or second attempt on this model failed, break out to try next candidate model
        break;
      }
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(origin && allowedOrigins.has(origin) ? 204 : 403);
    }
    next();
  });

  // Health check
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.json({
      status: "ok",
      appName: "NUR",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  };
  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  app.get("/api/tts", async (req, res) => {
    const text = typeof req.query.text === "string" ? req.query.text.trim() : "";
    const language = req.query.lang === "ur" ? "ur" : "ar";
    if (!text || text.length > 500) {
      return res.status(400).json({ error: "Text is required and must be 500 characters or fewer." });
    }

    try {
      const upstreamUrl = new URL("https://translate.google.com/translate_tts");
      upstreamUrl.searchParams.set("ie", "UTF-8");
      upstreamUrl.searchParams.set("client", "tw-ob");
      upstreamUrl.searchParams.set("tl", language);
      upstreamUrl.searchParams.set("q", text);
      const upstream = await fetch(upstreamUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!upstream.ok) return res.status(502).send("TTS provider unavailable");
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      res.status(502).send("TTS provider unavailable");
    }
  });

  // AI Chat Endpoint with Tools and Islamic Knowledge Retrieval
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history = [], userPreferences = {} } = req.body || {};

      if (typeof message !== "string" || !message.trim() || message.length > 12_000) {
        return res.status(400).json({ error: "Message prompt is required." });
      }
      if (!Array.isArray(history) || history.length > 20) {
        return res.status(400).json({ error: "Conversation history is invalid." });
      }

      const client = getGeminiClient();

      if (!client) {
        return res.status(503).json({ error: "AI service is not configured." });
      }

      // Build conversation history for Gemini
      const contents: any[] = [];

      // Include contextual memory preferences if provided
      let customInstructions = SYSTEM_INSTRUCTION;
      if (userPreferences.userName) {
        customInstructions += `\nUser's name: ${userPreferences.userName}.`;
      }
      if (userPreferences.quranGoal) {
        customInstructions += `\nUser's daily Qur'an goal: ${userPreferences.quranGoal}.`;
      }
      if (userPreferences.preferredLanguage) {
        customInstructions += `\nPreferred response language: ${userPreferences.preferredLanguage}.`;
      }

      // Add recent history
      history.slice(-6).forEach((h: any) => {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content || '' }],
        });
      });

      // Add user message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      let response;
      try {
        response = await generateContentWithRetry(client, {
          contents,
          config: {
            systemInstruction: customInstructions,
            temperature: 0.6,
            tools: [
              {
                functionDeclarations: [
                  searchQuranTool,
                  getAyahTextTool,
                  createTaskTool,
                  openAppSectionTool,
                ],
              },
            ],
          },
        });
      } catch (err: any) {
        console.warn("Primary generateContent failed with tools, attempting fallback without tool config:", err?.message || err);
        // Fallback try without tool declarations in case tool invocation schema caused the constraint
        response = await generateContentWithRetry(client, {
          contents,
          config: {
            systemInstruction: customInstructions,
            temperature: 0.6,
          },
        });
      }

      let replyText = response.text || '';
      const functionCalls = response.functionCalls || [];
      const toolInvocations: any[] = [];

      // Process any function calls triggered by Gemini
      for (const call of functionCalls) {
        const { name, args } = call;
        toolInvocations.push({
          toolName: name,
          args: args || {},
        });

        if (name === 'create_task') {
          if (!replyText) {
            replyText = `I have scheduled the task "${args.name || args.title}" in your Daily Tasks organizer.`;
          }
        } else if (name === 'open_section') {
          if (!replyText) {
            replyText = `Opening the ${args.section} section for you...`;
          }
        }
      }

      if (!replyText && toolInvocations.length === 0) {
        replyText = "Assalamu Alaikum. How else may I assist your worship and study today?";
      }

      res.json({
        reply: replyText,
        toolInvocations,
        references: [],
      });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({
        reply: "Assalamu Alaikum wa Rahmatullahi wa Barakatuh.\n\nThe AI model is momentarily experiencing unusually high demand. Please feel free to try your question again in a moment, or explore the Qur'an verses and Duas library directly.",
        toolInvocations: [],
        references: [],
      });
    }
  });

  // Ayah Tafsir & Deep Reflection Endpoint
  app.post("/api/gemini/tafsir-ayah", async (req, res) => {
    try {
      const { surahNumber, ayahNumber, arabicText, translationText } = req.body || {};
      if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114 ||
          !Number.isInteger(ayahNumber) || ayahNumber < 1 ||
          typeof arabicText !== "string" || typeof translationText !== "string" ||
          arabicText.length > 20_000 || translationText.length > 20_000) {
        return res.status(400).json({ error: "Ayah data is invalid." });
      }
      const client = getGeminiClient();

      if (!client) {
        return res.status(503).json({ error: "AI service is not configured." });
      }

      const prompt = `Please provide a concise, spiritually uplifting Tafsir commentary and reflection for Surah ${surahNumber}, Ayah ${ayahNumber}:
Arabic: "${arabicText}"
Translation: "${translationText}"

Structure the explanation into:
1. Context of Revelation (Asbab al-Nuzul if applicable)
2. Core Meanings & Classical Tafsir Insights (Ibn Kathir / Al-Sa'di)
3. Practical Application in Daily Life
Keep the tone tranquil, inspiring, and respectful.`;

      const response = await generateContentWithRetry(client, {
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.5,
        },
      });

      res.json({ tafsir: response.text || '' });
    } catch (err: any) {
      console.error("Tafsir generation error:", err);
      res.status(500).json({
        tafsir: "Classical Tafsir commentary is momentarily unavailable due to high demand. Please try reflecting on this verse again in a few moments, or read the translation directly."
      });
    }
  });

  // Vite Middleware for SPA development / production static fallback
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

  const server = app.listen(PORT, HOST, () => {
    console.log(`NUR Server running on ${HOST}:${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}; shutting down NUR server.`);
    server.close(() => process.exit(0));
  };
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

startServer();
