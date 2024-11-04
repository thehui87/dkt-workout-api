// src/models/Workout.ts
import mongoose, { Document, Schema } from "mongoose";

// Define the interface for Exercise
interface Workout {
    exerciseName: string;
    exerciseId: mongoose.Types.ObjectId; // Foreign key
    repetitions: string;
    weights: string;
    sets: number;
    rest: string;
    description?: string;
    repUnit: string;
    weightUnit: string;
    duration: string; // in minutes
}

// Define the interface for WorkoutPlanner
interface WorkoutPlanner extends Document {
    templateName: string;
    exercises: Workout[];
    active: boolean; // New field for active status
    userId: mongoose.Types.ObjectId; // Field to associate workout planner with a user
}

// Create the Exercise schema
const WorkoutSchema: Schema = new Schema({
    exerciseName: { type: String, required: true },
    exerciseId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Exercise",
    }, // Assuming you have an Exercise model
    repetitions: { type: String, default: "" },
    weights: { type: String, default: "" },
    sets: { type: Number, default: 0 },
    rest: { type: String, default: "" },
    description: { type: String, default: "" },
    repUnit: { type: String, default: "" },
    weightUnit: { type: String, default: "" },
    duration: { type: String, default: "" },
});

// Create the WorkoutPlanner schema
const WorkoutPlannerSchema: Schema = new Schema({
    templateName: { type: String, required: true },
    exercises: { type: [WorkoutSchema], required: true },
    active: { type: Boolean, default: true }, // Default to active
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" }, // Reference to User model
});

const WorkoutPlannerModel = mongoose.model<WorkoutPlanner>(
    "WorkoutPlanner",
    WorkoutPlannerSchema,
);
export { WorkoutPlannerModel, WorkoutPlanner, Workout };
