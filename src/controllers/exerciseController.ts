// src/index.ts
import { Request, Response, NextFunction } from "express";
import Exercise, { IExercise } from "../models/Exercise";
import path from "path";
import fs from "fs";

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
    next: NextFunction,
) => {
    const userId = req.user?.id;
    try {
        const { name, videoPlaceholder } = req.body; // Get the form data
        const imageFiles = req.files as Express.Multer.File[]; // Get the uploaded files

        // Make sure name is provided
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        if (!userId) {
            return res.status(400).json({ error: "User id is required" });
        }

        // Step 1: Create exercise record in the database to generate exerciseId
        const exerciseData = {
            name, // Default name if not provided
            userId: userId || "Anonymous", // Default createdBy if not provided
            createdOn: new Date(),
            updatedOn: new Date(),
            videoPlaceholder: videoPlaceholder || "",
            imagePlaceholder: defaultValues.imagePlaceholder,
        };

        const newExercise = new Exercise(exerciseData);
        const savedExercise = await newExercise.save();

        req.body.exerciseId = savedExercise._id.toString(); // Save exerciseId in req for later use
        next(); // Move to next middleware (file upload)
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

export const getCreatedExercise = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const exerciseId = req.body.exerciseId; // Get the exerciseId saved earlier
    const userId = req.user?.id; // Get userId from the authenticated user
    const imageFiles = req.files as Express.Multer.File[]; // Access the uploaded image files

    if (!userId || !exerciseId) {
        return res.status(400).json({ error: "Missing userId or exerciseId" });
    }

    try {
        console.log("00000");
        console.log("userId", userId);
        console.log("exerciseId", exerciseId);
        // Create the directory structure for the user and exercise
        const userExerciseDir = path.join(
            __dirname,
            "../../uploads",
            userId,
            "exercise",
            exerciseId,
        );
        console.log("userExerciseDir", userId);
        // Ensure the directory exists (create it if it doesn't)
        fs.existsSync(userExerciseDir) ||
            fs.mkdirSync(userExerciseDir, { recursive: true });

        console.log("111111");
        // Move the files from the temporary directory to the final destination
        const imageMetadata = await Promise.all(
            imageFiles.map(async file => {
                const tempFilePath = path.join(
                    __dirname,
                    "../../uploads",
                    userId,
                    "exercise",
                    "temp",
                    file.filename,
                );
                const finalFilePath = path.join(userExerciseDir, file.filename);

                // Move the file from temp to final destination
                fs.renameSync(tempFilePath, finalFilePath);

                return {
                    filename: file.originalname,
                    path: finalFilePath.replace("uploads/", ""), // Strip "uploads/" from path
                };
            }),
        );
        console.log("2222222");
        // Update the exercise with the new image paths
        const updatedExercise = await Exercise.findByIdAndUpdate(
            exerciseId,
            {
                $set: {
                    imagePlaceholder: imageMetadata,
                    updatedOn: new Date(),
                },
            },
            { new: true }, // Return the updated document
        );

        return res.status(201).json({
            message: "New exercise created successfully!",
            exercise: updatedExercise,
        });
    } catch (error: any) {
        return res.status(500).json({
            error: "Failed to update exercise with image paths",
        });
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
