import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StarRating from "./StarRating";

describe("StarRating", () => {
  it("displays the review count when provided", () => {
    render(<StarRating value={4.5} count={23} />);
    expect(screen.getByText("(23)")).toBeInTheDocument();
  });

  it("does not render a count when none is given", () => {
    render(<StarRating value={4.5} />);
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
  });
});
