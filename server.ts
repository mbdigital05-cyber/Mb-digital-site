import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Firebase config safely across CJS/ESM contexts
const firebaseConfig = JSON.parse(
  readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8")
);

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
