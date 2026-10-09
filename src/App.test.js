import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the games section", () => {
  render(<App />);
  expect(screen.getByText(/games i've worked on/i)).toBeInTheDocument();
});
