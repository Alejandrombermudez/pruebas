"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Copy } from "./copy";
import { onFirstReveal, prefersReducedMotion, stagger, trackSpotlight } from "./motion";

/* ---------- Servicios ---------- */

// pathLength={1} permite "dibujar" cada trazo al aparecer la tarjeta.
const SERVICE_ICONS = [
  // Automatización industrial
  <>
    <rect pathLength={1} x="7" y="7" width="18" height="18" rx="2" />
    <path
      pathLength={1}
      d="M11 12h10M11 17h6M11 21h10M11 3v4m5-4v4m5-4v4M11 25v4m5-4v4m5-4v4M3 11h4m-4 5h4m-4 5h4m18-10h4m-4 5h4m-4 5h4"
    />
  </>,
  // Puesta en marcha y optimización
  <>
    <path pathLength={1} d="M16 4v11" />
    <path pathLength={1} d="M9 7a12 12 0 1 0 14 0" />
    <path pathLength={1} d="m11 20 3 3 7-8" />
  </>,
  // Industria 4.0 y eficiencia de recursos
  <>
    <path pathLength={1} d="M5 26h23M7 23V12m7 11V8m7 15V4" />
    <path pathLength={1} d="m27 9-5 8h5l-5 9" />
  </>,
  // Software industrial e integración
  <>
    <rect pathLength={1} x="3" y="6" width="12" height="9" rx="2" />
    <rect pathLength={1} x="17" y="19" width="12" height="9" rx="2" />
    <path pathLength={1} d="M9 15v8h8M23 19V10h-8m4-4-4 4 4 4M13 19l4 4-4 4" />
  </>,
];

function ServiceCard({
  index,
  icon,
  title,
  text,
}: {
  index: number;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article
      className="service"
      data-reveal=""
      style={stagger(index, 110)}
      onPointerMove={trackSpotlight}
    >
      <div className="service-top">
        <span className="service-icon-tile">
          <svg
            className="service-icon"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            {icon}
          </svg>
        </span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function Services({ c }: { c: Copy }) {
  const items = [
    [c.s1, c.s1Text],
    [c.s2, c.s2Text],
    [c.s3, c.s3Text],
    [c.s4, c.s4Text],
  ];

  return (
    <section id="services" className="section snap">
      <div className="section-heading">
        <p className="eyebrow" data-reveal="">
          {c.servicesSmall}
        </p>
        <h2 data-reveal="" style={stagger(1)}>
          {c.servicesLines.map((line) => (
            <span className="services-title-line" key={line}>
              {line}
            </span>
          ))}
        </h2>
      </div>

      <div className="services-grid">
        {items.map(([title, text], index) => (
          <ServiceCard
            key={index}
            index={index + 1}
            icon={SERVICE_ICONS[index]}
            title={title}
            text={text}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------- About ---------- */

const COUNT_MS = 2400;

/** Cifra que cuenta de 0 al valor final cuando su tarjeta aparece. */
function Counter({ target, suffix, delayMs }: { target: number; suffix: string; delayMs: number }) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window) || prefersReducedMotion()) return;

    let raf = 0;
    const stop = onFirstReveal(element.closest("[data-reveal]") ?? element, () => {
      const startedAt = performance.now() + delayMs;
      const tick = (now: number) => {
        const t = Math.max(0, Math.min((now - startedAt) / COUNT_MS, 1));
        setProgress(1 - (1 - t) ** 4); // desacelera al final
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      stop();
      cancelAnimationFrame(raf);
    };
  }, [delayMs]);

  const final = `${target}${suffix}`;
  if (progress === null) return <strong ref={ref}>{final}</strong>;

  return (
    <strong ref={ref} aria-label={final}>
      <span aria-hidden="true">
        {Math.round(target * progress)}
        {suffix}
      </span>
    </strong>
  );
}

function AboutCard({
  index,
  className,
  target,
  suffix,
  title,
  text,
  watermark,
}: {
  index: number;
  className?: string;
  target: number;
  suffix: string;
  title: string;
  text: string;
  watermark?: string;
}) {
  const delayMs = index * 110;

  return (
    <article
      className={["va-card", className].filter(Boolean).join(" ")}
      data-reveal=""
      style={stagger(index, 110)}
      onPointerMove={trackSpotlight}
    >
      {watermark && (
        <span className="va-watermark" aria-hidden="true">
          {watermark}
        </span>
      )}
      <Counter target={target} suffix={suffix} delayMs={delayMs} />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function About({ c }: { c: Copy }) {
  return (
    <section id="about" className="section about va-section snap">
      <div className="va-layout">
        <div className="va-heading">
          <p className="eyebrow" data-reveal="">
            {c.aboutSmall}
          </p>
          <h2 data-reveal="" style={stagger(1)}>
            {c.aboutTitle}
          </h2>
          <ul data-reveal="" style={stagger(2)}>
            <li>{c.aboutValue1}</li>
            <li>{c.value2}</li>
            <li>{c.value3}</li>
          </ul>
        </div>

        <div className="va-body">
          <p className="va-lead" data-reveal="" style={stagger(1)}>
            {c.aboutLead}
          </p>
          <p data-reveal="" style={stagger(2)}>
            {c.about1}
          </p>
          <p data-reveal="" style={stagger(3)}>
            {c.about2}
          </p>
          <p data-reveal="" style={stagger(4)}>
            {c.about3}
          </p>

          <div className="va-cards">
            <AboutCard
              index={1}
              className="va-experience"
              target={20}
              suffix="+"
              title={c.aboutYearsTitle}
              text={c.aboutYearsText}
              watermark="20+"
            />
            <AboutCard
              index={2}
              className="va-projects"
              target={110}
              suffix="+"
              title={c.projectsTitle}
              text={c.projectsText}
            />
            <AboutCard
              index={3}
              className="va-resources"
              target={3}
              suffix=""
              title={c.resourcesTitle}
              text={c.resourcesText}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Experiencia ---------- */

export function Experience({ c }: { c: Copy }) {
  const sectors = [
    [c.e1, c.e1Text],
    [c.e2, c.e2Text],
    [c.e3, c.e3Text],
    [c.e4, c.e4Text],
    [c.e5, c.e5Text],
    [c.e6, c.e6Text],
  ];

  return (
    <section id="experience" className="section experience-sectors snap">
      <div className="section-heading">
        <p className="eyebrow" data-reveal="">
          {c.experienceSmall}
        </p>
        <h2 data-reveal="" style={stagger(1)}>
          {c.experienceTitle}
        </h2>
        <div className="experience-intro" data-reveal="" style={stagger(2)}>
          <p className="intro">{c.experienceText}</p>
          <p className="intro">{c.experienceText2}</p>
        </div>
      </div>

      <div className="sector-list">
        {sectors.map(([title, text], index) => (
          <article className="sector-row" key={index} data-reveal="" style={stagger(index, 80)}>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
