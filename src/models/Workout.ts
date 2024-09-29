// src/models/Workout.ts
import mongoose, { Document, Schema } from "mongoose";

interface IWorkout extends Document {
    title: string;
    description?: string;
    duration: string; // in minutes
    date: Date;
}

const workoutSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

const Workout = mongoose.model<IWorkout>("Workout", workoutSchema);
export default Workout;
