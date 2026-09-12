import jwt from "jsonwebtoken";

// Protects routes by checking the Authorization header for a valid access token
export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(401)
        .json({ message: "Access token expired or invalid" });

    req.user = {
      id: decoded.userId,
      roleId: decoded.roleId,
      permissions: decoded.permissions || [], // now available on every request, no extra DB hit
    };
    next();
  });
};
