import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import { Request } from "express";
import path from "path";

// Configure the storage
const storage = multer.diskStorage({
    destination: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void,
    ) => {
        // Get userId from the request
        const userId = req.user?.id;

        if (!userId) {
            // Reject file upload if userId is missing
            const error = new Error("User ID not found");
            return cb(error, ""); // Reject and pass empty string (no directory)
        }
        // if (req.body.exerciseId) {
        let tempExerciseDir = path.join(
            __dirname,
            `../../uploads/${userId}/exercise/temp/`,
        ); // For exercise-related uploads

        // Ensure the directory exists, create it if it doesn't
        if (!fs.existsSync(tempExerciseDir)) {
            fs.mkdirSync(tempExerciseDir, { recursive: true });
        }

        // Pass the destination directory to the callback
        cb(null, tempExerciseDir);
    },

    filename: (req, file, cb) => {
        // Set a unique filename with current timestamp and random number
        const fileExtension = path.extname(file.originalname);
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.fieldname}${fileExtension}`;

        cb(null, filename);
    },
});

// Initialize multer with storage configuration
const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // Max 1MB file size
    fileFilter: (req, file, cb: FileFilterCallback) => {
        // Allowed file types
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.mimetype)) {
            // Reject file if the type is not allowed
            const error = new Error(
                "Only JPEG, PNG, and JPG files are allowed",
            ) as any;
            return cb(error, false); // Reject the file with error and false to reject
        }

        // Accept file if everything is good
        cb(null, true); // Accept the file
    },
});

export default upload;
