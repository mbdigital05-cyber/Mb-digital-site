import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { GoogleGenAI, Modality } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Firebase config safely across CJS/ESM contexts
const firebaseConfig = JSON.parse(
  readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8")
);

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Initialize server-side Gemini client
const googleAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const MOBI_SYSTEM_INSTRUCTION = `
You are Mobi, the expert AI Voice Strategist for MB Digital, a senior creative strategy and full-service digital agency based in Abuja, Nigeria.

Your goal is to converse with users via voice or text, answer questions about MB Digital, and consult on their digital goals.
Since you are a VOICE agent, keep your responses exceptionally SHORT, conversational, and direct (1-3 lines / maximum 35 words per turn). This is absolutely critical because long text sounds mechanical and breaks the flow of active voice conversation. Avoid markdown lists, bullet points, or giant nested paragraphs under all circumstances. Speak like a real human strategist on a live phone or video call!

Key Info about MB Digital:
- Location: Abuja, Nigeria (Suite 304, capital Plaza, Central Business District, Abuja).
- Specializations: Corporate branding, scalable high-performance web development, mobile app development, UX design and prototyping (Figma), data-driven social media management, laser-targeted performance digital advertising (Google, Meta, LinkedIn), and intelligent business automation.
- Testimonials: We have delivered high-performing platforms increasing inbound leads by 150% (Chioma Adeyemi, CMO of NovaTech Africa; Seun Olatunji, Founder of Elevate NG; Nneka Okafor, Zenith Ventures).
- Call-to-action: Offer to guide them to our Contact page or take down their info so our human consultants can call them.

Guidelines:
1. Always be professional, creative, welcoming, and tech-forward.
2. Infuse a friendly local touch (warm Abuja hospitality, e.g., "Welcome!" or "How can we help your business thrive today?").
3. Actively invite collaboration. For example: "We can build you a high-converting website! Would you like me to tell you more about our web development projects?"
4. Avoid structural or punctuation symbols (like asterisks, hashtags, or bracket notes) that make speech synthesizers sound glitchy. Use standard, conversational English.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Voice Agent - Assistant Chat Route
  app.post("/api/assistant/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    try {
      const formattedContents = [];
      
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          formattedContents.push({
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.text }]
          });
        }
      }
      
      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await googleAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: MOBI_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "I'm here to help. Could you repeat that?";
      res.json({ text: responseText });
    } catch (err: any) {
      console.error("AI Assistant Chat Error:", err);
      res.status(500).json({ error: err.message || "Failed to process chat with Gemini AI" });
    }
  });

  // AI Voice Agent - Text to Speech Route (Generates high-quality base64 PCM audio)
  app.post("/api/assistant/tts", async (req, res) => {
    const { text, voice } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text specified for speech synthesis" });
    }

    try {
      const response = await googleAI.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || "Zephyr" }, // Puck, Charon, Kore, Fenrir, Zephyr
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio payload returned from Gemini TTS model");
      }

      res.json({ audio: base64Audio });
    } catch (err: any) {
      console.error("AI Assistant TTS error:", err);
      res.status(500).json({ error: err.message || "Failed to synthesize speech using Gemini TTS" });
    }
  });

  // Backend contact lead webhook / endpoint
  app.post("/api/contact", async (req, res) => {
    const { name, email, phone, services, message } = req.body;
    if (!name || !email || !message || !services || services.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const contactsCol = collection(db, "contacts");
      const newDoc = await addDoc(contactsCol, {
        name,
        email,
        phone: phone || "",
        services,
        message,
        createdAt: Timestamp.now(),
      });
      res.status(201).json({ success: true, id: newDoc.id });
    } catch (err: any) {
      console.error("Server API Contact Firestore Error:", err);
      res.status(500).json({ error: "Failed to persist contact submission safely" });
    }
  });

  // Backend retrieve lead endpoint
  app.get("/api/admin/messages", async (req, res) => {
    try {
      const contactsCol = collection(db, "contacts");
      const q = query(contactsCol, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        let dateStr = new Date().toISOString();
        if (docData.createdAt) {
          if (typeof docData.createdAt.toDate === "function") {
            dateStr = docData.createdAt.toDate().toISOString();
          } else if (docData.createdAt.seconds) {
            dateStr = new Date(docData.createdAt.seconds * 1000).toISOString();
          } else {
            dateStr = new Date(docData.createdAt).toISOString();
          }
        }
        return {
          id: doc.id,
          name: docData.name,
          email: docData.email,
          phone: docData.phone,
          services: docData.services || [],
          message: docData.message,
          createdAt: dateStr
        };
      });
      res.json(data);
    } catch (err: any) {
      console.error("Server API Admin Messages Firestore Error:", err);
      res.status(500).json({ error: "Failed to retrieve contact submissions safely" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support React Router for static files
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
