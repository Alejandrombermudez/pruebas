"use client";

import { useEffect, useRef, useState } from "react";
import { COPY, LANGUAGES } from "./copy";
import type { Language } from "./copy";
import Contact from "./contact-form";
import HeroAnimation from "./hero-animation";
import { About, Experience, Services } from "./sections";
import { useLanguage } from "./use-language";

const NAV = [
  ["home", "navHome"],
  ["services", "navServices"],
  ["about", "navAbout"],
  ["experience", "navExperience"],
  ["contact", "navContact"],
] as const;

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  it: "Italiano",
  es: "Español",
};

export default function Site() {
  const [language, chooseLanguage] = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("home");

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const clickLock = useRef(false);
  const clickTimer = useRef<number | undefined>(undefined);

  const c = COPY[language];

  useEffect(() => {
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", c.description);
  }, [c.description]);

  // Resalta en el menú la sección visible.
  useEffect(() => {
    const sections = NAV.map(([id]) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );
    if (!sections.length) return;

    function updateFromScroll() {
      if (clickLock.current) return;

      const offset = (headerRef.current?.getBoundingClientRect().bottom ?? 0) + 60;
      let current = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= offset) current = section;
      });

      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10;
      if (atBottom) current = sections[sections.length - 1];

      setActive(current.id);
    }

    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);
    window.addEventListener("load", updateFromScroll);
    return () => {
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
      window.removeEventListener("load", updateFromScroll);
      window.clearTimeout(clickTimer.current);
    };
  }, []);

  // Escape cierra el menú del móvil.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function onNavClick(id: string) {
    setActive(id);
    setMenuOpen(false);

    // Durante el scroll suave no se recalcula la sección activa.
    clickLock.current = true;
    window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      clickLock.current = false;
    }, 1200);
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        {c.skip}
      </a>

      <header className="header" ref={headerRef}>
        <a className="brand" href="#home" aria-label="Vireo — smart by nature">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo de 40px, sin necesidad de optimizar */}
          <img src="/img/logo-vireo-white.png" alt="" width={40} height={40} />
          <span>VIREO</span>
          <span className="brand-slogan">smart by nature</span>
        </a>

        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          aria-controls="navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {c.menu}
        </button>

        <nav id="navigation" aria-label={c.navLabel} className={menuOpen ? "is-open" : undefined}>
          {NAV.map(([id, key]) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? "active" : undefined}
              aria-current={active === id ? "location" : undefined}
              onClick={() => onNavClick(id)}
            >
              {c[key]}
            </a>
          ))}
        </nav>

        <div className="languages" role="group" aria-label={c.language}>
          {LANGUAGES.map((code) => (
            <button
              key={code}
              type="button"
              lang={code}
              aria-label={LANGUAGE_LABELS[code]}
              aria-pressed={language === code}
              onClick={() => chooseLanguage(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main id="main-content">
        <section id="home" className="hero">
          <div className="hero-content">
            <p className="eyebrow">{c.heroSmall}</p>
            <h1>
              <span>{c.hero1}</span>
              <span>{c.hero2}</span>
              <span>{c.hero3}</span>
            </h1>
            <p className="hero-text">{c.heroText}</p>
            <a href="#contact" className="button" onClick={() => onNavClick("contact")}>
              <span>{c.cta}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <HeroAnimation />
        </section>

        <Services c={c} />
        <About c={c} />
        <Experience c={c} />
        <Contact c={c} language={language} />
      </main>

      <footer>
        <p id="copyright">
          © 2026 Vireo {c.rights}
        </p>
      </footer>
    </>
  );
}
