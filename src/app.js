import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    // To make understand express the encoded url
    limit: "16kb",
    extended: true,
  }),
);
app.use(express.static("public")); // To store any public assests in server (Temp

// Routes
import todoRoutes from "./routes/todo.routes.js";
import userRoutes from "./routes/user.routes.js";

// Access Routes
app.use("/api/v1/todo", todoRoutes);
app.use("/api/v1/user", userRoutes);

export { app };
