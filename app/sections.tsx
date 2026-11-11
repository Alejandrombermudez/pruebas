"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import type { Copy } from "./copy";
import { useReveal } from "./use-reveal";
import type { RevealPhase } from "./use-reveal";

/* ---------- Servicios ---------- */

const SERVICE_ICONS = [
  // Automatización industrial
  <>
    <rect x="7" y="7" width="18" height="18" rx="2" />
    <path d="M11 12h10M11 17h6M11 21h10M11 3v4m5-4v4m5-4v4M11 25v4m5-4v4m5-4v4M3 11h4m-4 5h4m-4 5h4m18-10h4m-4 5h4m-4 5h4" />
  </>,
  // Puesta en marcha y optimización
  <>
    <path d="M16 4v11" />
    <path d="M9 7a12 12 0 1 0 14 0" />
    <path d="m11 20 3 3 7-8" />
  </>,
  // Industria 4.0 y eficiencia de recursos
  <>
    <path d="M5 26h23M7 23V12m7 11V8m7 15V4" />
    <path d="m27 9-5 8h5l-5 9" />
  </>,
  // Software industrial e integración
  <>
    <rect x="3" y="6" width="12" height="9" rx="2" />
    <rect x="17" y="19" width="12" height="9" rx="2" />
    <path d="M9 15v8h8M23 19V10h-8m4-4-4 4 4 4M13 19l4 4-4 4" />
  </>,
];

function ServiceCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  // Las tarjetas aparecen una sola vez; después se quita la clase para no pisar el hover.
  const { ref, phase } = useReveal<HTMLElement>(0.08, 650);
  const className =
    "service" +
    (phase === "pending" ? " reveal-pending" : "") +
    (phase === "revealing" ? " service-revealing" : "");

  return (
    <article className={className} ref={ref}>
      <div className="service-top">
        <svg
          className="service-icon"
          width="40"
          height="40"
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
    <section id="services" className="section">
      <div className="section-heading">
        <p className="eyebrow">{c.servicesSmall}</p>
        <h2>
          {c.servicesLines.map((line) => (
            <span className="services-title-line" key={line}>
              {line}
            </span>
          ))}
        </h2>
      </div>

      <div className="services-grid">
        {items.map(([title, text], index) => (
          <ServiceCard key={index} icon={SERVICE_ICONS[index]} title={title} text={text} />
        ))}
      </div>
    </section>
  );
}

/* ---------- About ---------- */

function aboutClass(base: string | undefined, phase: RevealPhase) {
  return [base, phase === "pending" && "va-pending", phase === "revealing" && "va-enter"]
    .filter(Boolean)
    .join(" ");
}

function delay(index: number): CSSProperties {
  return { ["--va-delay" as string]: `${(index % 3) * 90}ms` };
}

/** Elemento de texto del About que aparece con retraso escalonado. */
function Rv({
  as: Tag,
  index,
  className,
  children,
}: {
  as: ElementType;
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const { ref, phase } = useReveal<HTMLElement>(0.08);
  return (
    <Tag ref={ref} className={aboutClass(className, phase) || undefined} style={delay(index)}>
      {children}
    </Tag>
  );
}

/** Cifra que cuenta de 0 al valor final (7 s) cuando la tarjeta entra en pantalla. */
function Counter({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - startedAt) / 7000, 1);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const final = `${target}${suffix}`;
  if (progress === null) return <strong>{final}</strong>;

  return (
    <strong aria-label={final}>
      <span aria-hidden="true">
        {Math.floor(target * progress)}
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
  const { ref, phase } = useReveal<HTMLElement>(0.08);

  return (
    <article
      ref={ref}
      className={aboutClass(["va-card", className].filter(Boolean).join(" "), phase)}
      style={delay(index)}
    >
      {watermark && (
        <span className="va-watermark" aria-hidden="true">
          {watermark}
        </span>
      )}
      <Counter target={target} suffix={suffix} active={phase === "revealing"} />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function About({ c }: { c: Copy }) {
  return (
    <section id="about" className="section about va-section">
      <div className="va-layout">
        <div className="va-heading">
          <Rv as="p" index={0} className="va-eyebrow">
            {c.aboutSmall}
          </Rv>
          <Rv as="h2" index={1}>
            {c.aboutTitle}
          </Rv>
          <Rv as="ul" index={2}>
            <li>{c.aboutValue1}</li>
            <li>{c.value2}</li>
            <li>{c.value3}</li>
          </Rv>
        </div>

        <div className="va-body">
          <Rv as="p" index={3} className="va-lead">
            {c.aboutLead}
          </Rv>
          <Rv as="p" index={4}>
            {c.about1}
          </Rv>
          <Rv as="p" index={5}>
            {c.about2}
          </Rv>
          <Rv as="p" index={6}>
            {c.about3}
          </Rv>

          <div className="va-cards">
            <AboutCard
              index={7}
              className="va-experience"
              target={20}
              suffix="+"
              title={c.aboutYearsTitle}
              text={c.aboutYearsText}
              watermark="20+"
            />
            <AboutCard
              index={8}
              target={110}
              suffix="+"
              title={c.projectsTitle}
              text={c.projectsText}
            />
            <AboutCard
              index={9}
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

function SectorRow({ title, text }: { title: string; text: string }) {
  const ref = useRef<HTMLElement>(null);

  // Entrada suave una sola vez por fila.
  useEffect(() => {
    const row = ref.current;
    if (
      !row ||
      !("IntersectionObserver" in window) ||
      typeof row.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        row.animate(
          [
            { opacity: 0.65, transform: "translateY(18px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 550, easing: "ease-out" },
        );
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  return (
    <article className="sector-row" ref={ref}>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

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
    <section id="experience" className="section experience-sectors">
      <div className="section-heading">
        <p className="eyebrow">{c.experienceSmall}</p>
        <h2>{c.experienceTitle}</h2>
        <div className="experience-intro">
          <p className="intro">{c.experienceText}</p>
          <p className="intro">{c.experienceText2}</p>
        </div>
      </div>

      <div className="sector-list">
        {sectors.map(([title, text], index) => (
          <SectorRow key={index} title={title} text={text} />
        ))}
      </div>
    </section>
  );
}
