// src/models/Exercise.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IExercise extends Document {
    _id: mongoose.Types.ObjectId; // Explicitly typing _id as ObjectId
    name: string;
    userId: string;
    createdOn: Date;
    updatedOn: Date;
    imagePlaceholder?: Array<{ filename: string; path: string }>; // Change to an array of strings
    videoPlaceholder?: string;
    active: boolean;
}

const ExerciseSchema: Schema = new Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now },
    imagePlaceholder: {
        type: [{ filename: String, path: String }],
        default: [],
    }, // Set default to an empty array
    videoPlaceholder: { type: String, optional: true, default: "" },
    active: { type: Boolean, default: true }, // Default to active
});

export default mongoose.model<IExercise>("Exercise", ExerciseSchema);
