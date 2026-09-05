import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

describe("PasswordStrengthMeter", () => {
  it("renders nothing when the password is empty", () => {
    const { container } = render(<PasswordStrengthMeter password="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows 'Strong password' text for a strong password", () => {
    render(<PasswordStrengthMeter password="Zx9#mK2vQ!" />);
    expect(screen.getByText(/Strong password/i)).toBeInTheDocument();
  });

  it("shows 'Weak password' text for a weak password", () => {
    render(<PasswordStrengthMeter password="abc" />);
    expect(screen.getByText(/Weak password/i)).toBeInTheDocument();
  });
});
