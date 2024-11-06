import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import RefreshToken from "../models/RefreshToken"; // The schema created above

dotenv.config();

declare module "express-serve-static-core" {
    interface Request {
        user?: { id: string; role?: string };
    }
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    // const token = req.header("Authorization")?.replace("Bearer ", "");
    const token = req.cookies.accessToken;
    if (!token) {
        res.status(401).send("Access Denied");
        return;
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            console.log(decoded);

            req.user = decoded as { id: string; role: string };
            next();
        } catch (error) {
            res.status(400).send("Invalid Token");
        }
    }
};

export const generateAccessToken = (user: any) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" },
    );
};

export const generateRefreshToken = async (user: any) => {
    const refreshToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: "7d" },
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    await new RefreshToken({
        userId: user.id,
        token: refreshToken,
        expiresAt,
    }).save();

    return refreshToken;
};

export const authorizeRole =
    (role: string) => (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (user.role !== role) res.status(403).send("Access Forbidden");
        else next();
    };
