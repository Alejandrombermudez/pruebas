import { useEffect, useRef, useState } from "react";

export type RevealPhase = "idle" | "pending" | "revealing" | "done";

/**
 * Aparición una sola vez al entrar en pantalla.
 * Sin IntersectionObserver o con "reducir movimiento" el elemento queda siempre visible ("idle").
 * Fases: idle -> pending (oculto) -> revealing (animando) -> done (si se indica settleMs).
 */
export function useReveal<T extends HTMLElement>(threshold: number, settleMs = 0) {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<RevealPhase>("idle");

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    setPhase("pending");

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setPhase("revealing");
        observer.disconnect();
        if (settleMs) timer = window.setTimeout(() => setPhase("done"), settleMs);
      },
      { threshold },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [threshold, settleMs]);

  return { ref, phase };
}
