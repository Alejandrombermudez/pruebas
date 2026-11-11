import { useEffect } from "react";
import type { CSSProperties, PointerEvent } from "react";

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Retraso escalonado para las animaciones de entrada (variable CSS --d). */
export function stagger(index: number, step = 90): CSSProperties {
  return { ["--d" as string]: `${index * step}ms` };
}

const REVEAL_OPTIONS: IntersectionObserverInit = {
  threshold: 0.12,
  rootMargin: "0px 0px -6% 0px",
};

/**
 * Animaciones de entrada: cada elemento con [data-reveal] recibe [data-shown]
 * la primera vez que entra en pantalla. Sin JavaScript, sin IntersectionObserver
 * o con "reducir movimiento" todo queda visible desde el principio.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) return;

    const root = document.documentElement;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.shown = "";
        observer.unobserve(entry.target);
      }
    }, REVEAL_OPTIONS);

    document
      .querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])")
      .forEach((element) => observer.observe(element));
    root.dataset.motion = "on";

    return () => {
      observer.disconnect();
      delete root.dataset.motion;
    };
  }, []);
}

/** Ejecuta `start` cuando el elemento aparece (mismo criterio que useScrollReveal). */
export function onFirstReveal(element: Element, start: () => void) {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    start();
  }, REVEAL_OPTIONS);
  observer.observe(element);
  return () => observer.disconnect();
}

/* ---------- Desplazamiento animado entre secciones ---------- */

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Duración según la distancia: ~1,1 s entre secciones contiguas, máximo 1,6 s. */
const scrollDuration = (distance: number) => Math.min(1600, 900 + Math.abs(distance) * 0.25);

let cancelCurrent: (() => void) | null = null;

export const isScrollAnimating = () => cancelCurrent !== null;

export function headerHeight() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
}

/** Posición de scroll que deja la sección justo debajo de la cabecera. */
export function sectionScrollTop(section: Element) {
  return section.getBoundingClientRect().top + window.scrollY - headerHeight();
}

/**
 * Lleva la página a `top` con una animación suave y de duración controlada
 * (el scroll "smooth" del navegador es demasiado rápido y no se puede ajustar).
 * Se cancela si el usuario toca la pantalla, pulsa una tecla o hace clic.
 * Devuelve la duración en ms.
 */
export function animateScrollTo(top: number, onDone?: () => void) {
  cancelCurrent?.();

  const root = document.documentElement;
  const max = root.scrollHeight - window.innerHeight;
  const target = Math.max(0, Math.min(Math.round(top), max));
  const start = window.scrollY;
  const distance = target - start;

  if (Math.abs(distance) < 2 || prefersReducedMotion()) {
    window.scrollTo({ top: target, behavior: "instant" });
    onDone?.();
    return 0;
  }

  const duration = scrollDuration(distance);
  const startedAt = performance.now();
  let raf = 0;

  // El scroll-snap atraparía cada paso intermedio: se suspende durante la animación.
  root.style.scrollSnapType = "none";
  root.style.scrollBehavior = "auto";

  const cleanup = () => {
    cancelAnimationFrame(raf);
    root.style.removeProperty("scroll-snap-type");
    root.style.removeProperty("scroll-behavior");
    window.removeEventListener("touchstart", cleanup);
    window.removeEventListener("keydown", cleanup);
    window.removeEventListener("mousedown", cleanup);
    cancelCurrent = null;
  };

  const step = (now: number) => {
    const t = Math.min((now - startedAt) / duration, 1);
    window.scrollTo({ top: start + distance * easeInOutCubic(t), behavior: "instant" });
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      cleanup();
      onDone?.();
    }
  };

  window.addEventListener("touchstart", cleanup, { passive: true });
  window.addEventListener("keydown", cleanup);
  window.addEventListener("mousedown", cleanup);
  cancelCurrent = cleanup;
  raf = requestAnimationFrame(step);
  return duration;
}

const WHEEL_QUERY =
  "(min-width: 769px) and (min-height: 620px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Scroll por secciones en escritorio: cada gesto de rueda o touchpad lleva a la
 * sección siguiente o anterior. Si una sección es más alta que la pantalla, se
 * recorre con normalidad hasta su borde y después salta a la siguiente.
 * El teclado, la barra de scroll y el táctil usan el scroll-snap de CSS.
 */
export function useSectionWheel() {
  useEffect(() => {
    const query = window.matchMedia(WHEEL_QUERY);
    let lockUntil = 0;

    function onWheel(event: WheelEvent) {
      if (!query.matches || event.ctrlKey || event.deltaY === 0) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if ((event.target as Element | null)?.closest?.("textarea")) return;

      const now = performance.now();
      // Durante la transición, y mientras dure la inercia del mismo gesto, se ignora la rueda.
      if (isScrollAnimating() || now < lockUntil) {
        event.preventDefault();
        lockUntil = Math.max(lockUntil, now + 180);
        return;
      }

      const sections = [...document.querySelectorAll<HTMLElement>("main > section")];
      if (!sections.length) return;

      const top = headerHeight();
      const available = window.innerHeight - top;
      let index = 0;
      sections.forEach((section, i) => {
        if (section.getBoundingClientRect().top <= top + 4) index = i;
      });
      const current = sections[index];
      const rect = current.getBoundingClientRect();
      // El relleno vacío de la sección no cuenta como "contenido pendiente".
      const style = getComputedStyle(current);
      const slackBottom = parseFloat(style.paddingBottom) + 4;
      const slackTop = parseFloat(style.paddingTop) + 4;

      let target: number | null = null;
      if (event.deltaY > 0) {
        if (rect.bottom > window.innerHeight + slackBottom) return; // queda contenido abajo
        const next = sections[index + 1];
        if (next) target = sectionScrollTop(next);
      } else {
        if (rect.top < top - slackTop) return; // queda contenido arriba
        const previous = sections[index - 1];
        if (previous) {
          const box = previous.getBoundingClientRect();
          const start = box.top + window.scrollY - top;
          // Sección alta: se llega a su final para seguir leyendo hacia arriba.
          target = box.height > available + 4 ? start + box.height - available : start;
        }
      }
      if (target === null) return;

      event.preventDefault();
      const duration = animateScrollTo(target);
      lockUntil = now + duration + 150;
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);
}

/** Luz que sigue al puntero dentro de una tarjeta (variables CSS --mx / --my). */
export function trackSpotlight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === "touch") return;
  const card = event.currentTarget;
  const box = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${event.clientX - box.left}px`);
  card.style.setProperty("--my", `${event.clientY - box.top}px`);
}
