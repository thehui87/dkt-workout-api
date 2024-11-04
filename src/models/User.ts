import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
    createdAt?: Date;
    updatedAt?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    profile?: {
        age?: number;
        height?: number; // in cm
        weight?: number; // in kg
        bio?: string;
    };
    active: boolean;
}

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        profile: {
            age: { type: Number },
            height: { type: Number },
            weight: { type: Number },
            bio: { type: String },
        },
        active: { type: Boolean, default: true }, // Default to active
    },
    { timestamps: true },
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
