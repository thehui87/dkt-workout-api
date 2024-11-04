import { Router } from "express";
import {
    register,
    login,
    refreshToken,
    sendResetPasswordEmail,
    resetPassword,
    logout,
} from "../controllers/authController";

const router = Router();

router.post("/register", (req, res) => {
    register(req, res);
});
router.post("/login", (req, res) => {
    login(req, res);
});
router.post("/logout", (req, res) => {
    logout(req, res);
});
router.post("/refresh-token", (req, res) => {
    refreshToken(req, res);
});

router.post("/forgot-password", (req, res) => {
    sendResetPasswordEmail(req, res);
});
router.post("/reset-password/:token", (req, res) => {
    resetPassword(req, res);
});

export default router;
