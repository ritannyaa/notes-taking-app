const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

// Helper for DB connection check
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database not connected. Please ensure MongoDB Atlas IP is whitelisted (0.0.0.0/0) or local MongoDB is running.",
    });
  }
  next();
};

// API Endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Get all notes
app.get("/api/notes", checkDbConnection, async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a note
app.post("/api/notes", checkDbConnection, async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title,
      content: req.body.content,
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a note
app.put("/api/notes/:id", checkDbConnection, async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
      },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a note
app.delete("/api/notes/:id", checkDbConnection, async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

async function startServer() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/notesdb";

  console.log("🔄 Connecting to MongoDB...");
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    console.log("✅ MongoDB connected successfully to Atlas/configured URI!");
  } catch (error) {
    console.warn("⚠️ MongoDB Primary Connection failed:", error.message);
    console.warn("💡 Atlas Tip: Ensure your current IP is whitelisted (0.0.0.0/0) in MongoDB Atlas Security settings.");

    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      console.log("⚡ Starting fallback local In-Memory MongoDB instance...");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log("✅ Connected to local fallback In-Memory MongoDB!");
    } catch (memErr) {
      console.error("❌ Local fallback DB unavailable:", memErr.message);
    }
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();