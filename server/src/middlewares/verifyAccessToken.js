import jwt from "jsonwebtoken";

// Protects routes by checking the Authorization header for a valid access token
export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      // Expired or invalid access token -> frontend should call refresh-token
      return res
        .status(401)
        .json({ message: "Access token expired or invalid" });
    }

    // Attach decoded payload to the request for later use in controllers
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  });
};
