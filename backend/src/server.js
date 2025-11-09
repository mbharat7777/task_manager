
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// middleware
if (process.env.NODE_ENV !== "production") {
  // Allow Vite dev server origins (5173 and 5174) during development.
  // Use an allowlist so preflight responses return the correct Access-Control-Allow-Origin.
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow requests with no origin (like curl or server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        const msg = `The CORS policy for this site does not allow access from the specified Origin. Origin=${origin}`;
        return callback(new Error(msg), false);
      },
      optionsSuccessStatus: 200,
    })
  );
}
app.use(express.json()); // this middleware will parse JSON bodies: req.body

// our simple custom middleware
// app.use((req, res, next) => {
//   console.log(`Req method is ${req.method} & Req URL is ${req.url}`);
//   next();
// });

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

const startServer = async () => {
  try {
    // First connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB successfully');

    // Then start the Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`🔑 Auth endpoints at http://localhost:${PORT}/api/auth`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
