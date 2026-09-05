import { validatePasswordStrength } from "../utils/passwordValidator.js";

describe("validatePasswordStrength", () => {
  it("rejects a password shorter than 8 characters", () => {
    const result = validatePasswordStrength("Ab1!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must be at least 8 characters long",
    );
  });

  it("rejects a password missing a special character", () => {
    const result = validatePasswordStrength("Password123");
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("special character"))).toBe(
      true,
    );
  });

  it("rejects a common weak password even if it technically meets the rules", () => {
    const result = validatePasswordStrength("Password1!");
    expect(result.isValid).toBe(false);
  });

  it("accepts a strong, unique password", () => {
    const result = validatePasswordStrength("Zx9#mK2vQ!");
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
