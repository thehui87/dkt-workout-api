// src/index.ts
import { Request, Response } from "express";
import Exercise, { IExercise } from "../models/Exercise";

const defaultValues: Partial<IExercise> = {
    name: "", // Default value for repetitions
    imagePlaceholder: [], // Default to an empty array
    videoPlaceholder: "", // Optional, default to empty
    active: true,
};

// Create Exercise
export const createNewExercise = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const userId = req.user?.id;
    try {
        const exerciseData: Partial<IExercise> = {
            name: req.body.name || defaultValues.name, // Default name if not provided
            userId: userId || "Anonymous", // Default createdBy if not provided
            createdOn: new Date(),
            updatedOn: new Date(),
            imagePlaceholder:
                req.body.imagePlaceholder || defaultValues.imagePlaceholder, // Ensure this is handled as an array
            videoPlaceholder:
                req.body.videoPlaceholder || defaultValues.videoPlaceholder,
        };

        const newExercise = new Exercise(exerciseData);
        await newExercise.save();
        return res.status(201).json(newExercise);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

// Get all workouts
export const getAllExercises = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const userId = req.user?.id;
    try {
        const workouts = await Exercise.find({ userId, active: true });
        return res.status(200).json(workouts);
    } catch (err: any) {
        console.error("Error fetching exercises:", err);
        return res.status(500).json({ message: err.message });
    }
};

// View Exercise
export const getExerciseById = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { id } = req.params;
    try {
        const exercise = await Exercise.findById(id);
        if (exercise) {
            return res.status(200).json(exercise);
        }
        return res.status(404).send("Exercise not found");
    } catch (err: any) {
        console.error("Error fetching exercises:", err);
        return res.status(500).json({ message: err.message });
    }
};

// Update Exercise
export const updateExercise = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { id } = req.params;
    const { name, imagePlaceholder, videoPlaceholder } = req.body;
    try {
        const exercise = await Exercise.findByIdAndUpdate(
            id,
            { name, imagePlaceholder, videoPlaceholder, updatedOn: new Date() },
            { new: true },
        );

        if (exercise) {
            return res.status(200).json({
                message: "Exercise updated successfully.",
                exercise,
            });
        }
        return res.status(404).send("Exercise not found");
    } catch (err: any) {
        console.error("Error fetching exercises:", err);
        return res.status(500).json({ message: err.message });
    }
};
// Deactivate Excercise
export const deactivateExercise = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { id } = req.params; // Extract the workout planner ID from the route parameters

    try {
        const exercise = await Exercise.findById(id);

        if (!exercise) {
            return res.status(404).json({ message: "Exercise not found" });
        }

        if (exercise) {
            // Update the active field to false
            exercise.active = false;
            await exercise.save();

            return res.status(200).send("Excercise deactivated successfully");
        }
        return res.status(400).json({ message: "Oops something went wrong" });
    } catch (error) {
        console.error("Error deactivating exercise:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete Exercise
export const deleteExercise = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { id } = req.params;
    try {
        const result = await Exercise.findByIdAndDelete(id);
        if (result) {
            return res.status(204).send("Excercise deleted successfully");
        }
        return res.status(404).send("Exercise not found");
    } catch (error) {
        console.error("Error deleting exercise:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
