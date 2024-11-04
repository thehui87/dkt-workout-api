// src/routes/workouts.ts
import express, { Request, Response } from "express";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";
import {
    getAllExercises,
    createNewExercise,
    getExerciseById,
    updateExercise,
    deactivateExercise,
    deleteExercise,
} from "../controllers/exerciseController";
const router = express.Router();

router.get("/", authenticate, (req, res) => {
    getAllExercises(req, res);
}); // Get all exercises
router.post("/", authenticate, (req, res) => {
    createNewExercise(req, res);
}); //  Create a new exercise
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
