import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 1. Extend Express Request type for user
interface JwtPayload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// 2. Middleware function
const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.sendStatus(403);
  }
};

export default auth;
