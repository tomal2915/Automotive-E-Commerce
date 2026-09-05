export const calculateStrength = (
  password: string,
): { score: number; label: string; color: "error" | "warning" | "success" } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) score++;

  if (score <= 2)
    return { score: (score / 5) * 100, label: "Weak", color: "error" };
  if (score <= 4)
    return { score: (score / 5) * 100, label: "Medium", color: "warning" };
  return { score: 100, label: "Strong", color: "success" };
};
