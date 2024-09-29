// src/routes/workouts.ts
import express, { Request, Response } from "express";
import Workout from "../models/Workout";
import {
    getAllWorkouts,
    createNewWorkout,
} from "../controllers/workoutController";
const router = express.Router();

router.get("/", getAllWorkouts); // Get all workouts
router.post("/", createNewWorkout); // Create a new workout

export default router;
