// src/routes/workouts.ts
import express, { Request, Response } from "express";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";
import {
    getAllExercises,
    createNewExercise,
    getCreatedExercise,
    getExerciseById,
    updateExercise,
    deactivateExercise,
    deleteExercise,
} from "../controllers/exerciseController";
import upload from "../middleware/fileStorageMiddleware";

const router = express.Router();

router.get("/", authenticate, (req, res) => {
    getAllExercises(req, res);
}); // Get all exercises
// router.post(
//     "/",
//     authenticate,
//     (req, res, next) => {
//         createNewExercise(req, res, next);
//     },
//     upload.array("imagePlaceholder", 4),
//     (req, res) => {
//         getCreatedExercise(req, res);
//     },
// ); //  Create a new exercise
router.post(
    "/",
    authenticate,
    upload.array("imagePlaceholder", 4),
    (req, res, next) => {
        createNewExercise(req, res, next);
    },
    (req, res) => {
        getCreatedExercise(req, res);
    },
); //  Create a new exercise
router.get("/:id", authenticate, (req, res) => {
    getExerciseById(req, res);
}); //  Get exercise by id
router.put("/:id", authenticate, (req, res) => {
    updateExercise(req, res);
}); //  update exercise by id
router.delete("/:id", authenticate, (req, res) => {
    deactivateExercise(req, res);
}); //  deactivate exercise by id
router.delete(
    "/delete/:id",
    authenticate,
    authorizeRole("admin"),
    (req, res) => {
        deleteExercise(req, res);
    },
); //  delete exercise by id

export default router;
