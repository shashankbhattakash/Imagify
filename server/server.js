// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import connectDB from "./config/mongodb.js";
// import userRouter from "./routes/userRoutes.js";
// import imageRouter from "./routes/imageRoutes.js";

// const PORT = process.env.PORT || 4000;
// const app = express();

// app.use(express.json());
// app.use(cors());
// await connectDB();

// app.use("/api/user", userRouter);
// app.use("/api/image", imageRouter);
// app.get("/", (req, res) => res.send("API Working "));

// app.listen(PORT, () => console.log("Server is running on port " + PORT));
// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/imageRoutes.js";

const PORT = process.env.PORT || 4000;
const app = express();

// --- URL normalization middleware ---
// Convert any repeated slashes in the path to a single slash.
// This prevents hosting/proxy layers from issuing a redirect when requests contain '//'.
// Note: this only affects the path, not the protocol or host.
app.use((req, res, next) => {
  if (req.url.includes("//")) {
    req.url = req.url.replace(/\/{2,}/g, "/");
  }
  next();
});

app.use(express.json());

// --- Configure CORS explicitly ---
const allowedOrigin = "https://imagify-kappa-nine.vercel.app"; // set your frontend origin here
const corsOptions = {
  origin: allowedOrigin, // use '*' only for dev (not with credentials)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true, // set true if you use cookies/auth
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Explicitly respond to preflight requests for all routes
app.options("*", cors(corsOptions));

await connectDB();

app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

app.get("/", (req, res) => res.send("API Working"));

app.listen(PORT, () => console.log("Server is running on port " + PORT));
