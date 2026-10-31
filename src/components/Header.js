import { useCallback, useEffect, useRef, useState } from "react";
import { SECTIONS } from "../sections";
import useActiveSection from "../hooks/useActiveSection";
import useTheme from "../hooks/useTheme";
import Icon from "./Icon";
import "./Header.css";

const ids = SECTIONS.map((s) => s.id);

function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}

export default function Header({ name }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(ids);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);
  // Focus goes back to the Menu button when the menu is dismissed, but not when a link
  // was chosen: then the browser moves focus to that section
  const returnFocus = useRef(true);

  const closeMenu = useCallback((refocus) => {
    returnFocus.current = refocus;
    setOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the mobile menu is open: lock page scroll, close on Escape or a wide viewport,
  // and move focus into the menu (and back to the button when it closes)
  useEffect(() => {
    if (!open) return undefined;
    const toggleButton = toggleRef.current;

    document.body.classList.add("is-locked");
    menuRef.current?.querySelector("a")?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") closeMenu(true);
    };
    const wide = window.matchMedia?.("(min-width: 761px)");
    const onWide = (e) => e.matches && closeMenu(false);

    document.addEventListener("keydown", onKey);
    wide?.addEventListener?.("change", onWide);
    return () => {
      document.body.classList.remove("is-locked");
      document.removeEventListener("keydown", onKey);
      wide?.removeEventListener?.("change", onWide);
      if (returnFocus.current) toggleButton?.focus();
    };
  }, [open, closeMenu]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="container site-header__bar">
        <a href="#top" className="brand" onClick={() => closeMenu(false)}>
          <span className="brand__mark" aria-hidden="true">
            SKK
          </span>
          <span className="brand__name">{name}</span>
        </a>

        <nav className="site-nav" aria-label="Sections">
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined}>
                  <span className="site-nav__index" aria-hidden="true">
                    {s.index}
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => (open ? closeMenu(true) : setOpen(true))}
          >
            <span className="menu-toggle__label">{open ? "Close" : "Menu"}</span>
            <span className="menu-toggle__lines" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" ref={menuRef}>
        <nav className="container" aria-label="Sections menu">
          <ol>
            {SECTIONS.map((s, i) => (
              <li key={s.id} style={{ "--i": i }}>
                <a href={`#${s.id}`} onClick={() => closeMenu(false)}>
                  <span className="label">{s.index}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
