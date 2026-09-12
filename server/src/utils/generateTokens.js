import jwt from "jsonwebtoken";

export const generateAccessToken = (user, permissions = []) => {
  return jwt.sign(
    { userId: user._id, roleId: user.role, permissions }, // permissions baked into the token itself
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
