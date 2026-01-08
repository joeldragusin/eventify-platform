import prisma from "../utils/prismaClient.js";

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    //safety check alhtough I testes this in requireAuth
    if (!req.user) {
      return res.status(401).json({ error: "User is not authenticated." });
    }

    //if the role is not in the allowedRoles list
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "You lack permissions for this action." });
    }

    next();
  };
};
