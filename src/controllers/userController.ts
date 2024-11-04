import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";

// Controller to get user details from the request
export const getUserDetails = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const resData = (req as any).user; // Access the decoded user info from the request

    try {
        const user = await User.findById(resData.id);

        if (!user) return res.status(400).send("User not found");

        if (user) {
            // Return user details (excluding sensitive data like password)
            return res.status(200).json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            });
        }
        return res.status(400).send("No user information found");
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// Get user profile
export const getUserProfile = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const userId = req.user?.id;
    try {
        const user = await User.findById(userId).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// Update user profile
export const updateUserProfile = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const userId = req.user?.id;
    const { age, height, weight, bio } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profile: { age, height, weight, bio } },
            { new: true, runValidators: true },
        ).select("-password"); // Exclude password

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        } else return res.status(200).json(updatedUser);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

// Change password
export const updateUserPassword = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            message: "Both old and new passwords are required.",
        });
    }

    try {
        // Find the user in the database
        const user = await User.findById(req.user?.id); // Assuming `id` is part of the JWT payload

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user) {
            // Check if the old password is correct
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({ message: "Old password is incorrect." });
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            // Save the updated user
            await user.save();
            return res
                .status(200)
                .json({ message: "Password updated successfully." });
        }
        return res
            .status(400)
            .send("Something went wrong. Unable to update password.");
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

// Deactivate user account
export const deactivateUserAccount = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const id = req.user?.id; // Extract the workout planner ID from the route parameters

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user) {
            // Update the active field to false
            user.active = false;
            await user.save();

            return res.status(200).json({
                message: "User account deactivated",
                user,
            });
        }
        return res
            .status(400)
            .send("Something went wrong. Unable to deactivate account");
    } catch (error) {
        console.error("Error deactivating workout plan:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete user profile
export const deleteUserProfile = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    const userId = req.params.userId;
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "User profile deleted successfully",
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
