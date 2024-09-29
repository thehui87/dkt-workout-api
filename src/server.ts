// src/server.ts
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db";
// import mongoose from "mongoose";
import bodyParser from "body-parser";
// import cors from "cors";
import workoutRoutes from "./routes/workouts";
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

app.use(cors());
app.use(bodyParser.json());

app.use(cookieParser());
const PORT = process.env.PORT || 3004;

app.use(express.json());
connectDB();

app.use("/api/workouts", workoutRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
