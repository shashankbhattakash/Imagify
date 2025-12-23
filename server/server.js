import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/imageRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

await connectDB();

app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
