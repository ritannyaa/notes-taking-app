# 📝 QuickNotes - MongoDB Notes Taking Application

A full-stack notes taking application built using **Node.js**, **Express**, **MongoDB (Mongoose)**, and **React (Vite)**.

## 🚀 Features

- **Full CRUD Operations**: Create, view, edit, and delete notes in real time.
- **MongoDB Integration**: Notes are persisted using Mongoose models.
- **Search & Filter**: Real-time keyword filtering across titles and note contents.
- **Clipboard Action**: Copy note content with a single click.
- **Responsive Dark Theme**: Modern UI designed with glassmorphism card layouts and toast notifications.

---

## 📁 Project Structure

```text
exp 6/
├── backend/
│   ├── server.js          # Express server & API routes
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Environment variables template
│   └── .env               # Active environment variables (gitignored)
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main React component
    │   ├── App.css        # Styles for Notes App
    │   ├── index.css      # Base CSS variables & resets
    │   └── main.jsx       # App entry point
    ├── index.html         # Application HTML template
    └── package.json       # Frontend dependencies
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, CSS3 (Custom Properties & Flexbox/Grid)
- **Backend**: Node.js, Express.js, Cors, Dotenv
- **Database**: MongoDB (Mongoose ORM)

---

## ⚡ Quick Start

### 1. Setup Backend
```bash
cd backend
npm install
npm start
```
*The server will run on `http://localhost:5000`.*

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notes` | Fetch all notes sorted by newest first |
| `POST` | `/api/notes` | Create a new note `{ title, content }` |
| `PUT` | `/api/notes/:id` | Update an existing note |
| `DELETE` | `/api/notes/:id` | Delete a note by ID |
| `GET` | `/api/health` | Health check endpoint |
