// src/routes/workouts.ts
import express from "express";
// import Workout from "../models/Workout";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";
import {
    getAllWorkouts,
    createNewWorkout,
    updateWorkoutPlanner,
    deactivateWorkoutPlanner,
    getWorkoutPlannerById,
    deleteWorkoutPlanner,
} from "../controllers/workoutController";
const router = express.Router();

router.get("/", authenticate, (req, res) => {
    getAllWorkouts(req, res);
}); // Get all workouts
router.get("/:id", authenticate, (req, res) => {
    getWorkoutPlannerById(req, res);
}); // Get workout by id
router.post("/", authenticate, (req, res) => {
    createNewWorkout(req, res);
}); // Create a new workout
router.patch("/:id", authenticate, (req, res) => {
    updateWorkoutPlanner(req, res);
}); // Update a workout
router.delete("/:id", authenticate, (req, res) => {
    deactivateWorkoutPlanner(req, res);
}); // Deactivate a new workout
router.delete(
    "/delete/:id",
    authenticate,
    authorizeRole("admin"),
    (req, res) => {
        deleteWorkoutPlanner(req, res);
    },
); // delete a workout

export default router;
