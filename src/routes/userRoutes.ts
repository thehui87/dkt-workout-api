import { Router } from "express";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";
import {
    // getUserDetails,
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    deactivateUserAccount,
    deleteUserProfile,
} from "../controllers/userController";

const router = Router();

router.get("/admin", authenticate, authorizeRole("admin"), (req, res) => {
    res.send("Admin Access");
});

// router.get("/", authenticate, getUserDetails);

// Get user profile
router.get("/", authenticate, (req, res) => {
    getUserProfile(req, res);
});

// Update user profile
router.put("/", authenticate, (req, res) => {
    updateUserProfile(req, res);
});

// Change password
router.post("/udpate-password", authenticate, (req, res) => {
    updateUserPassword(req, res);
});

// Deactivate account
router.delete("/", authenticate, (req, res) => {
    deactivateUserAccount(req, res);
});

// Delete user profile
router.delete(
    "/delete/:id",
    authenticate,
    authorizeRole("admin"),
    (req, res) => {
        deleteUserProfile(req, res);
    },
);

export default router;
