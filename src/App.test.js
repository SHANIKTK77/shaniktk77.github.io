import { render, screen, within, act, fireEvent } from "@testing-library/react";
import App from "./App";
import { games, profile, experience, skills } from "./data";

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

test("renders the intro and every section", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/run well on cheap phones/i);
  ["Games I've worked on", "Experience", "Skills and tools", "Get in touch"].forEach((name) => {
    expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
  });
});

test("header links point at sections that exist", () => {
  const { container } = render(<App />);
  const nav = screen.getByRole("navigation", { name: "Sections" });
  within(nav)
    .getAllByRole("link")
    .forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    });
});

test("lists every team game with its Google Play link, and the solo project separately", () => {
  render(<App />);
  const ledger = document.querySelector(".ledger");

  games
    .filter((g) => !g.personal)
    .forEach((game) => {
      const link = within(ledger).getByRole("link", { name: new RegExp(`^${escape(game.title)}`) });
      expect(link).toHaveAttribute("href", game.playStore);
      expect(link).toHaveAttribute("rel", "noreferrer");
    });

  const own = games.find((g) => g.personal);
  const solo = screen.getByRole("article", { name: own.title });
  expect(within(solo).getByRole("link", { name: /see it on google play/i })).toHaveAttribute("href", own.playStore);
  expect(within(ledger).queryByText(own.title)).toBeNull();
});

test("shows the headline numbers from the data", () => {
  render(<App />);
  const panel = screen.getByRole("complementary", { name: "Key numbers" });
  ["325M+", "0.24%", "~5x"].forEach((value) =>
    expect(within(panel).getAllByText(value).length).toBeGreaterThan(0)
  );
  expect(within(panel).getByText(/ANR rate went from 0.45% to 0.24%/)).toBeInTheDocument();
  expect(within(panel).getByText(/Draw calls went from 450 to 90/)).toBeInTheDocument();
});

test("shows all experience and skills", () => {
  render(<App />);
  experience.forEach((job) => expect(screen.getByRole("heading", { name: job.role })).toBeInTheDocument());
  const spec = within(document.querySelector("#skills"));
  skills.forEach((group) => {
    expect(spec.getByText(group.group)).toBeInTheDocument();
    group.items.forEach((item) => expect(spec.getByText(item)).toBeInTheDocument());
  });
});

test("contact details link correctly and the resume downloads", () => {
  render(<App />);
  screen
    .getAllByRole("link", { name: profile.email })
    .forEach((link) => expect(link).toHaveAttribute("href", `mailto:${profile.email}`));
  expect(screen.getByRole("link", { name: profile.phone })).toHaveAttribute("href", "tel:+923119029334");
  screen
    .getAllByRole("link", { name: /resume/i })
    .forEach((link) => expect(link).toHaveAttribute("download", "Shadman-Khan-Khattak-Resume.pdf"));
  expect(screen.getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy-policy");
});

test("mobile menu opens, closes on Escape and returns focus", () => {
  render(<App />);
  const toggle = screen.getByRole("button", { name: /menu/i });
  expect(toggle).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(document.body).toHaveClass("is-locked");

  fireEvent.keyDown(document, { key: "Escape" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(document.body).not.toHaveClass("is-locked");
  expect(toggle).toHaveFocus();
});

test("Tab stays inside the open menu, and picking a link focuses that section", () => {
  render(<App />);
  const toggle = screen.getByRole("button", { name: /menu/i });
  fireEvent.click(toggle);

  const menu = screen.getByRole("navigation", { name: "Sections menu" });
  const links = within(menu).getAllByRole("link");
  links[links.length - 1].focus();
  fireEvent.keyDown(document, { key: "Tab" });
  expect(toggle).toHaveFocus();
  fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  expect(links[links.length - 1]).toHaveFocus();

  fireEvent.click(within(menu).getByRole("link", { name: /experience/i }));
  expect(document.getElementById("experience")).toHaveFocus();
});

test("theme switch flips the theme and remembers it", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("theme")).toBe("dark");
  expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
});

test("copy button copies the email address", async () => {
  const writeText = jest.fn().mockResolvedValue();
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

  render(<App />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /copy address/i }));
  });
  expect(writeText).toHaveBeenCalledWith(profile.email);
  expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();

  delete navigator.clipboard;
});
