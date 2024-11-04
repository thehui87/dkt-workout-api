// src/models/Exercise.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IExercise extends Document {
    name: string;
    userId: string;
    createdOn: Date;
    updatedOn: Date;
    imagePlaceholder?: string[]; // Change to an array of strings
    videoPlaceholder?: string;
    active: boolean;
}

const ExerciseSchema: Schema = new Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now },
    imagePlaceholder: { type: [String], optional: true, default: [] }, // Set default to an empty array
    videoPlaceholder: { type: String, optional: true, default: "" },
    active: { type: Boolean, default: true }, // Default to active
});

export default mongoose.model<IExercise>("Exercise", ExerciseSchema);
