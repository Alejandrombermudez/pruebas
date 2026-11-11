"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { COPY, LANGUAGES } from "./copy";
import type { Language } from "./copy";
import Contact from "./contact-form";
import HeroAnimation from "./hero-animation";
import {
  animateScrollTo,
  prefersReducedMotion,
  sectionScrollTop,
  stagger,
  useScrollReveal,
  useSectionWheel,
} from "./motion";
import { About, Experience, Services } from "./sections";
import { useLanguage } from "./use-language";

const NAV = [
  ["home", "navHome"],
  ["services", "navServices"],
  ["about", "navAbout"],
  ["experience", "navExperience"],
  ["contact", "navContact"],
] as const;

// Secciones con fondo oscuro: los puntos laterales cambian a color claro.
const DARK_SECTIONS = new Set(["home", "contact"]);

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  it: "Italiano",
  es: "Español",
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

export default function Site() {
  const [language, chooseLanguage] = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const clickLock = useRef(false);
  const clickTimer = useRef<number | undefined>(undefined);

  const c = COPY[language];

  useScrollReveal();
  useSectionWheel();

  useEffect(() => {
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", c.description);
  }, [c.description]);

  // Altura real de la cabecera (--header-h): alinea el scroll por secciones bajo ella.
  // El menú del móvil se superpone, así que no altera esta medida.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let first = true;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
      // Con la medida provisional el navegador pudo alinear la página unos píxeles abajo.
      if (first && !window.location.hash && window.scrollY > 0 && window.scrollY < header.offsetHeight) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      first = false;
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Sección visible, progreso de lectura y estado de la cabecera.
  useEffect(() => {
    const sections = NAV.map(([id]) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );
    if (!sections.length) return;

    let raf = 0;

    function update() {
      raf = 0;
      const header = headerRef.current;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      header?.style.setProperty("--progress", progress.toFixed(4));
      setScrolled(window.scrollY > 8);

      if (clickLock.current) return;

      const offset = (header?.getBoundingClientRect().bottom ?? 0) + window.innerHeight * 0.3;
      let current = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= offset) current = section;
      });
      if (window.scrollY >= max - 10) current = sections[sections.length - 1];

      setActive(current.id);
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
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

  // Enlaces internos: misma transición suave que el scroll por secciones.
  function onNavClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();

    setActive(id);
    setMenuOpen(false);

    try {
      const url = new URL(window.location.href);
      url.hash = id;
      window.history.replaceState(null, "", url);
    } catch {}

    // Durante la transición no se recalcula la sección activa.
    clickLock.current = true;
    window.clearTimeout(clickTimer.current);
    const unlock = () => {
      window.clearTimeout(clickTimer.current);
      clickLock.current = false;
    };
    const duration = animateScrollTo(id === "home" ? 0 : sectionScrollTop(section), unlock);
    clickTimer.current = window.setTimeout(unlock, duration + 300);
  }

  // Cambio de idioma con un fundido suave donde el navegador lo permite.
  function switchLanguage(code: Language) {
    if (code === language) return;
    const doc = document as ViewTransitionDocument;
    if (typeof doc.startViewTransition === "function" && !prefersReducedMotion()) {
      doc.startViewTransition(() => flushSync(() => chooseLanguage(code)));
    } else {
      chooseLanguage(code);
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        {c.skip}
      </a>

      <header className="header" ref={headerRef} data-scrolled={scrolled || undefined}>
        <a
          className="brand"
          href="#home"
          aria-label="Vireo — smart by nature"
          onClick={(event) => onNavClick(event, "home")}
        >
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
          <span className="menu-icon" aria-hidden="true">
            <span />
            <span />
          </span>
          {c.menu}
        </button>

        <nav id="navigation" aria-label={c.navLabel} className={menuOpen ? "is-open" : undefined}>
          {NAV.map(([id, key]) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? "active" : undefined}
              aria-current={active === id ? "location" : undefined}
              onClick={(event) => onNavClick(event, id)}
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
              onClick={() => switchLanguage(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        <span className="scroll-progress" aria-hidden="true" />
      </header>

      <nav
        className="section-dots"
        aria-label={c.sectionsLabel}
        data-tone={DARK_SECTIONS.has(active) ? "on-dark" : "on-light"}
      >
        <ul>
          {NAV.map(([id, key]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                onClick={(event) => onNavClick(event, id)}
              >
                <span className="dot-label">{c[key]}</span>
                <span className="dot" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main id="main-content">
        <section id="home" className="hero snap">
          <div className="hero-bg" aria-hidden="true">
            <span className="orb orb-1" />
            <span className="orb orb-2" />
          </div>

          <div className="hero-content">
            <p className="eyebrow hero-in" style={stagger(0)}>
              {c.heroSmall}
            </p>
            <h1>
              {[c.hero1, c.hero2, c.hero3].map((line, index) => (
                <span className="line" key={index}>
                  <span style={stagger(index + 1, 120)}>{line}</span>
                </span>
              ))}
            </h1>
            <p className="hero-text hero-in" style={stagger(5)}>
              {c.heroText}
            </p>
            <div className="hero-in" style={stagger(6)}>
              <a href="#contact" className="button" onClick={(event) => onNavClick(event, "contact")}>
                <span>{c.cta}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <HeroAnimation />

          <a
            className="scroll-cue hero-in"
            href="#services"
            style={stagger(9)}
            onClick={(event) => onNavClick(event, "services")}
          >
            <span className="mouse" aria-hidden="true" />
            <span>{c.scrollHint}</span>
          </a>
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
