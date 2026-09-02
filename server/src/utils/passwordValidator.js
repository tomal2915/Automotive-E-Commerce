// Enforces a strong password policy across registration, password reset,
// and password change — kept in one place so the rule never drifts
// between those three flows.
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Blocks the most common weak passwords outright, regardless of
  // whether they technically satisfy the rules above (e.g. "Password1!")
  const commonWeakPasswords = ["password", "123456", "12345678", "qwerty", "letmein", "admin123"];
  if (commonWeakPasswords.some((weak) => password?.toLowerCase().includes(weak))) {
    errors.push("This password is too common — please choose something less predictable");
  }

  return { isValid: errors.length === 0, errors };
};