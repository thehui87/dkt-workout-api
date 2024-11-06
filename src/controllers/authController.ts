import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";
import { generateResetToken } from "../services/resetTokenService";
import { resetPasswordTemplate } from "../services/emailService";
import RefreshToken from "../models/RefreshToken";

export const register = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { username, email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
        });
        await newUser.save();
        return res.status(201).send("User registered");
    } catch (error) {
        return res.status(500).send("Error registering user");
    }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
    const { login, password } = req.body;

    try {
        // const user = await User.findOne({ username });
        const user = await User.findOne({
            $or: [{ username: login }, { email: login }],
        });
        if (!user) {
            return res.status(400).send("User not found");
        }
        if (user) {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).send("Invalid credentials");
            }
            if (!user.active) {
                return res
                    .status(403)
                    .send(
                        "Account deactivated contact admin to reactivate account",
                    );
            }

            if (validPassword) {
                const userId = user._id; // This is the ObjectId
                if (userId) {
                    const userIdString = userId.toString(); // If you need it as a string
                    const userObj = {
                        id: userIdString,
                        role: user.role,
                    };
                    const refreshToken = await generateRefreshToken(userObj);
                    // Set the refresh token in an HttpOnly, Secure cookie
                    res.cookie("refreshToken", refreshToken, {
                        httpOnly: true, // Prevent JavaScript access
                        secure: true, // Send cookie only over HTTPS
                        sameSite: "none", // CSRF protection
                        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
                    });
                    const accessToken = await generateAccessToken(userObj);

                    res.cookie("accessToken", accessToken, {
                        httpOnly: true, // Prevent JavaScript access
                        secure: true, // Send cookie only over HTTPS
                        sameSite: "none", // CSRF protection
                        maxAge: 15 * 60 * 1000, // 15 mins expiration
                    });

                    // Generate access token (short-lived)
                    // Respond with the access token (which can be stored in memory or Redux)
                    // return res.status(200).json({
                    //     accessToken: generateAccessToken(userObj),
                    // });
                    return res.status(200).send("Login successful");
                }
            }
        }
        return res.status(400).send("Oop something wasn't right");
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).send("Server error");
    }
};

export const refreshToken = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
        // Verify the refresh token
        return new Promise(resolve => {
            jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET as string,
                (err: any, user: any) => {
                    if (err) {
                        return res
                            .status(403)
                            .json({ message: "Invalid refresh token" });
                    }

                    // Generate a new access token
                    const newAccessToken = generateAccessToken({
                        id: user.id,
                        role: user.role,
                    });

                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true, // Prevent JavaScript access
                        secure: true, // Send cookie only over HTTPS
                        sameSite: "none", // CSRF protection
                        maxAge: 15 * 60 * 1000, // 15 mins expiration
                    });

                    // Send the new access token to the client
                    resolve(
                        // res.status(200).json({ accessToken: newAccessToken }),
                        res
                            .status(200)
                            .json({ message: "Acces token refreshed" }),
                    );
                },
            );
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const sendResetPasswordEmail = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { email } = req.body;

    try {
        const resetToken = await generateResetToken(email);
        await resetPasswordTemplate(email, resetToken);
        return res.status(200).send("Password reset email sent");
    } catch (error: any) {
        return res.status(400).send(error.message);
    }
};

const updateNewPassword = async (token: string, newPassword: string) => {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
        throw new Error("Password reset token is invalid or has expired");
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
};

export const resetPassword = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        await updateNewPassword(token, newPassword);
        return res.status(200).send("Password has been reset");
    } catch (error: any) {
        return res.status(400).send(error.message);
    }
};

export const logout = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const refreshToken = req.cookies.refreshToken;
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true, // true if using HTTPS
        sameSite: "none", // required for cross-origin requests
        maxAge: 0,
    });
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: true, // true if using HTTPS
        sameSite: "none", // required for cross-origin requests
        maxAge: 0,
    });
    return res.status(200).json({ message: "Logged out successfully" }); // Success
};
