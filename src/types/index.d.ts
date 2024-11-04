// src/@types/express.d.ts

export * from "express-serve-static-core";

declare module "express-serve-static-core" {
    interface Request {
        user?: { id: string; role?: string };
    }
}
