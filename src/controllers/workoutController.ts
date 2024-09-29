import { Request, Response } from "express";
import Workout from "../models/Workout";

// Get all workouts
export const getAllWorkouts = async (req: Request, res: Response) => {
    try {
        const workouts = await Workout.find();
        res.status(200).json(workouts);
    } catch (err: any) {
        console.error("Error fetching workouts:", err);
        res.status(500).json({ message: err.message });
    }
};

// Create a new workout
export const createNewWorkout = async (req: Request, res: Response) => {
    const workout = new Workout({
        title: req.body.title,
        description: req.body.description,
        duration: req.body.duration,
    });

    try {
        const newWorkout = await workout.save();
        res.status(201).json(newWorkout);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
