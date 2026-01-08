import jwt from "jsonwebtoken";
import prisma from "../utils/prismaClient.js";

export const requireAuth = async (req, res, next) => {
  try {
    //extract my token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication is required. Token is missing or expired!",
      });
    }

    //we now decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //I verify the user exists in the DB and later I will send the inform towards the controller, where it is decided which
    //endpoint is called
    const actualUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    //in case the token is valid BUT the user got deleted recently, I verify it
    if (!actualUser) {
      return res.status(401).json({ error: "User not found." });
    }

    //to be used on controllers. add the actualUser variable on the request for the controller going to be called
    req.user = actualUser;

    next();
  } catch (error) {
    //the token is invalid
    return res.status(401).json({ error: "Your token is invalid or expired!" });
  }
};
