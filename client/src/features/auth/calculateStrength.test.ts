import { describe, it, expect } from "vitest";
import { calculateStrength } from "./calculateStrength";

describe("calculateStrength", () => {
  it("labels a short, simple password as weak", () => {
    expect(calculateStrength("abc").label).toBe("Weak");
  });

  it("labels a password missing special characters as medium", () => {
    expect(calculateStrength("Password123").label).toBe("Medium");
  });

  it("labels a password meeting all criteria as strong", () => {
    expect(calculateStrength("Zx9#mK2vQ!").label).toBe("Strong");
  });
});
