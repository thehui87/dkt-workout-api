import express, { Request, Response } from "express";
import {
    WorkoutPlannerModel,
    WorkoutPlanner,
    Workout,
} from "../models/Workout";

import User from "../models/User";

const defaultWorkoutExerciseValues = {
    exerciseName: "",
    exerciseId: null, // Foreign key
    repetitions: "",
    weights: "",
    sets: 0,
    rest: "",
    description: "",
    repUnit: "",
    weightUnit: "",
    duration: "", // in minutes
};

const defaultWorkoutValues = {
    templateName: "Default Workout Plan",
    exercises: [
        {
            ...defaultWorkoutExerciseValues,
        },
    ],
};

// Get all workouts
export const getAllWorkouts = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const userId = req.user?.id;
    console.log(userId);
    console.log(req.user?.role);
    try {
        const workouts = await WorkoutPlannerModel.find({
            userId,
            active: true,
        });
        return res.status(200).json(workouts);
    } catch (err: any) {
        console.error("Error fetching workouts:", err);
        return res.status(500).json({ message: err.message });
    }
};

// Controller function to get a workout planner by ID
export const getWorkoutPlannerById = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { id } = req.params; // Extract the workout planner ID from the route parameters
    const userId = req.user?.id;
    try {
        const workoutPlan = await WorkoutPlannerModel.find({
            userId,
            _id: id,
            active: true,
        });
        if (workoutPlan.length) {
            return res.status(200).json(workoutPlan[0]);
        }
        // return res.status(400).send("Unable to fetch workout plan.");
        return res.status(404).send("Workout Planner not found");
    } catch (error) {
        console.error("Error fetching workout plan:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Create a new workout
export const createNewWorkout = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { templateName, exercises } = req.body;

    try {
        // Use defaults if values are missing
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(400).send("User not found");
        }
        if (user) {
            const workoutPlanData: Partial<WorkoutPlanner> = {
                templateName: templateName || defaultWorkoutValues.templateName,
                exercises: exercises
                    ? exercises.map((exercise: any) => ({
                          exerciseName:
                              exercise.exerciseName ||
                              defaultWorkoutValues.exercises[0].exerciseName,
                          exerciseId:
                              exercise.exerciseId ||
                              defaultWorkoutValues.exercises[0].exerciseId, // Handle null case as needed
                          repetitions:
                              exercise.repetitions ||
                              defaultWorkoutValues.exercises[0].repetitions,
                          weights:
                              exercise.weights ||
                              defaultWorkoutValues.exercises[0].weights,
                          sets:
                              exercise.sets ??
                              defaultWorkoutValues.exercises[0].sets, // Use nullish coalescing to check for undefined
                          rest:
                              exercise.rest ||
                              defaultWorkoutValues.exercises[0].rest,
                          description:
                              exercise.description ||
                              defaultWorkoutValues.exercises[0].description,
                          repUnit:
                              exercise.repUnit ||
                              defaultWorkoutValues.exercises[0].repUnit,
                          weightUnit:
                              exercise.weightUnit ||
                              defaultWorkoutValues.exercises[0].weightUnit,
                          duration:
                              exercise.duration ||
                              defaultWorkoutValues.exercises[0].duration,
                      }))
                    : defaultWorkoutValues.exercises,
            };
            const newWorkoutPlan = await WorkoutPlannerModel.create({
                userId: user?._id,
                ...workoutPlanData,
            });
            return res.status(201).json(newWorkoutPlan);
        }
        return res
            .status(400)
            .send("Oops something went wrong. Unable to create new workout ");
    } catch (error) {
        console.error("Error creating workout plan:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Controller function to update a workout planner
export const updateWorkoutPlanner = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { id } = req.params; // Extract the workout planner ID from the route parameters
    const { templateName, exercises } = req.body;

    try {
        const workoutPlan = await WorkoutPlannerModel.findById(id);

        // Update fields with new values or use existing/defaults
        if (workoutPlan) {
            if (templateName) {
                workoutPlan.templateName = templateName;
            }

            if (exercises) {
                workoutPlan.exercises = exercises.map((exercise: any) => ({
                    exerciseName:
                        exercise.exerciseName ||
                        defaultWorkoutExerciseValues.exerciseName,
                    exerciseId:
                        exercise.exerciseId ||
                        defaultWorkoutExerciseValues.exerciseId, // Handle null case as needed
                    repetitions:
                        exercise.repetitions ||
                        defaultWorkoutExerciseValues.repetitions,
                    weights:
                        exercise.weights ||
                        defaultWorkoutExerciseValues.weights,
                    sets: exercise.sets ?? defaultWorkoutExerciseValues.sets, // Use nullish coalescing to check for undefined
                    rest: exercise.rest || defaultWorkoutExerciseValues.rest,
                    description:
                        exercise.description ||
                        defaultWorkoutExerciseValues.description,
                    repUnit:
                        exercise.repUnit ||
                        defaultWorkoutExerciseValues.repUnit,
                    weightUnit:
                        exercise.weightUnit ||
                        defaultWorkoutExerciseValues.weightUnit,
                    duration:
                        exercise.duration ||
                        defaultWorkoutExerciseValues.duration,
                }));
            }

            // Save the updated workout planner
            await workoutPlan.save();
            return res.status(200).json(workoutPlan);
        }
        return res.status(404).send("Workout Planner not found");
    } catch (error) {
        console.error("Error updating workout plan:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Controller function to deactivate (delete) a workout planner
export const deactivateWorkoutPlanner = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { id } = req.params; // Extract the workout planner ID from the route parameters

    try {
        const workoutPlan = await WorkoutPlannerModel.findById(id);

        if (workoutPlan) {
            // Update the active field to false
            workoutPlan.active = false;
            await workoutPlan.save();

            return res.status(200).json({
                message: "Workout Planner deactivated",
            });
        }
        return res.status(404).json({ message: "Workout Planner not found" });
    } catch (error) {
        console.error("Error deactivating workout plan:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Controller function to delete a workout planner
export const deleteWorkoutPlanner = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { id } = req.params; // Extract the workout planner ID from the route parameters

    try {
        const workoutPlan = await WorkoutPlannerModel.findByIdAndDelete(id);

        if (!workoutPlan) {
            return res
                .status(404)
                .json({ message: "Workout Planner not found" });
        }

        return res.status(200).json({
            message: "Workout Planner deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting workout plan:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
