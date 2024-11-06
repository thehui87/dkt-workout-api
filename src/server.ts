// src/server.ts
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db";
import bodyParser from "body-parser";
import workoutRoutes from "./routes/workoutRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";

const cookieParser = require("cookie-parser");
const cors = require("cors");
dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URI,
        credentials: true, // This allows cookies to be sent and received
    }),
);
app.options("*", cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(express.urlencoded());
connectDB();

app.use("/api/workouts", workoutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/exercise", exerciseRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
