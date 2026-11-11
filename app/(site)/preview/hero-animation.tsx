"use client";

import { useEffect, useRef } from "react";
import { POINTS } from "./hero-points";

const GOLDEN_ANGLE = 2.399963;

// Esfera de Fibonacci con tantos puntos como el logo: es la forma "de partida" de la animación.
const SPHERE = POINTS.map((_, i) => {
  const y = 1 - (2 * (i + 0.5)) / POINTS.length;
  const r = Math.sqrt(1 - y * y);
  const a = i * GOLDEN_ANGLE;
  return [r * Math.cos(a), y, r * Math.sin(a)] as const;
});

function smooth(x: number) {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
}

/** Logo de Vireo en partículas: esfera -> logo -> esfera, con reacción al puntero. */
export default function HeroAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 300;
    let height = 300;
    let time = 0;
    let last = 0;
    let raf = 0;
    let visible = true;
    const pointer = { inside: false, x: 0, y: 0, targetX: 0, targetY: 0, tiltX: 0, tiltY: 0 };

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const phase = time % 16;
      const logo = reduced
        ? 1
        : phase < 3
          ? 0
          : phase < 6
            ? smooth((phase - 3) / 3)
            : phase < 12
              ? 1
              : phase < 15
                ? 1 - smooth((phase - 12) / 3)
                : 0;

      pointer.tiltX += (pointer.targetX - pointer.tiltX) * 0.06;
      pointer.tiltY += (pointer.targetY - pointer.tiltY) * 0.06;

      const rotation = reduced
        ? 0
        : time * 0.32 * (1 - logo) + Math.sin(time * 0.6) * 0.16 * logo + pointer.tiltX * 0.5;
      const pitch = reduced ? 0 : -pointer.tiltY * 0.35;
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const c = Math.cos(rotation);
      const s = Math.sin(rotation);
      const breathe = reduced ? 1 : 1 + 0.045 * Math.sin(time * 0.8);
      const radius = Math.min(width, height) * 0.38 * breathe;

      const projected = POINTS.map((p, i) => {
        const q = SPHERE[i];
        const x = q[0] * (1 - logo) + p[0] * logo;
        const y = q[1] * (1 - logo) + p[1] * logo;
        const z = q[2] * (1 - logo) + Math.sin(i * 0.7) * 0.06 * logo;
        const nx = x * c + z * s;
        const nz = -x * s + z * c;
        const ny = y * cp - nz * sp;
        const depth = y * sp + nz * cp;
        const scale = 3 / (3 - depth * 0.55);
        let screenX = width / 2 + nx * radius * scale;
        let screenY = height / 2 + ny * radius * scale;

        if (pointer.inside && !reduced) {
          const dx = screenX - pointer.x;
          const dy = screenY - pointer.y;
          const distance = Math.hypot(dx, dy);
          const reach = Math.min(width, height) * 0.12;
          if (distance < reach) {
            const force = (1 - distance / reach) ** 2 * reach * 0.4;
            const angle = distance > 0.01 ? Math.atan2(dy, dx) : i * GOLDEN_ANGLE;
            screenX += Math.cos(angle) * force;
            screenY += Math.sin(angle) * force;
          }
        }

        return {
          x: screenX,
          y: screenY,
          z: depth,
          color: p[2],
          size: (0.8 + (nz + 1) * 0.3) * Math.max(0.75, width / 340),
          alpha: 0.42 + (nz + 1) * 0.25,
        };
      }).sort((a, b) => a.z - b.z);

      // Mezcla aditiva: donde se juntan partículas el logo brilla un poco más.
      ctx.globalCompositeOperation = "lighter";
      projected.forEach((p) => {
        ctx.globalAlpha = Math.min(1, p.alpha * 0.85);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function frame(now: number) {
      if (last && visible && !reduced) time += Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible) draw();
      raf = requestAnimationFrame(frame);
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === "touch" || reduced || !canvas) return;
      const box = canvas.getBoundingClientRect();
      pointer.inside = true;
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.targetX = (pointer.x / width - 0.5) * 2;
      pointer.targetY = (pointer.y / height - 0.5) * 2;
    }

    function onPointerLeave() {
      pointer.inside = false;
      pointer.targetX = 0;
      pointer.targetY = 0;
    }

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // No dibuja mientras la sección no está en pantalla.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(root);

    resize();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div id="vireo-hero-animation" className="hero-mark" ref={rootRef}>
      <canvas ref={canvasRef} role="img" aria-label="Vireo — interactive particle logo" />
    </div>
  );
}
