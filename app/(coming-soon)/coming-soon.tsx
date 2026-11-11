"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  CONTACT_COPY,
  COPY,
  LANGUAGES,
  LAUNCH_DATE,
  VALIDATION_COPY,
  isLanguage,
} from "./copy";
import type { ContactStatus, Language } from "./copy";

const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
const TARGET = new Date(LAUNCH_DATE).getTime();

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  it: "Italiano",
  es: "Español",
};

function MailIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

function splitRemaining(totalSeconds: number) {
  return [
    Math.floor(totalSeconds / 86400),
    Math.floor((totalSeconds % 86400) / 3600),
    Math.floor((totalSeconds % 3600) / 60),
    totalSeconds % 60,
  ];
}

export default function ComingSoon() {
  const [language, setLanguage] = useState<Language>("en");
  const [status, setStatus] = useState<ContactStatus>("idle");
  // null hasta el primer render en el navegador: evita un valor distinto entre servidor y cliente.
  const [remaining, setRemaining] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);

  const copy = COPY[language];
  const contact = CONTACT_COPY[language];
  const sending = status === "sending";

  // Elige el idioma inicial: ?lang= > localStorage > idioma del navegador > inglés.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("vireo-language");
    } catch {}

    const fromUrl = new URL(window.location.href).searchParams.get("lang");
    const fromBrowser = navigator.language.split("-")[0];

    const initial = [fromUrl, saved, fromBrowser].find(isLanguage) ?? "en";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende de APIs del navegador
    setLanguage(initial as Language);

    const onPopState = () => {
      const value = new URL(window.location.href).searchParams.get("lang");
      if (isLanguage(value)) setLanguage(value);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    // Devuelve true cuando la cuenta regresiva ya terminó.
    const tick = () => {
      const now = Date.now();
      setRemaining(Math.max(0, Math.floor((TARGET - now) / 1000)));
      const done = now >= TARGET;
      if (done) setCompleted(true);
      return done;
    };

    if (tick()) return;
    const id = window.setInterval(() => {
      if (tick()) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Mensajes de validación en el idioma elegido.
  const validate = useCallback(() => {
    const messages = VALIDATION_COPY[language];
    const name = nameRef.current;
    const email = emailRef.current;
    const company = companyRef.current;

    if (name) {
      const value = name.value.trim();
      name.setCustomValidity(
        value.length === 0
          ? messages.nameRequired
          : value.length < 2
            ? messages.nameShort
            : "",
      );
    }

    if (email) {
      email.setCustomValidity("");
      if (email.value.trim().length === 0) {
        email.setCustomValidity(messages.emailRequired);
      } else if (email.validity.typeMismatch) {
        email.setCustomValidity(messages.emailInvalid);
      }
    }

    if (company) {
      company.setCustomValidity(
        company.value.trim().length === 0 ? messages.companyRequired : "",
      );
    }
  }, [language]);

  useEffect(() => {
    validate();
  }, [validate]);

  function chooseLanguage(next: Language) {
    setLanguage(next);
    try {
      localStorage.setItem("vireo-language", next);
    } catch {}
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState(null, "", url);
    } catch {}
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    validate();
    if (!form.reportValidity()) return;

    const data = new FormData(form);

    // Campo oculto antispam: si lo rellena un bot, no se envía nada.
    if (String(data.get("website") || "").trim()) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: "Nuova richiesta di contatto — Vireo S.A.S.",
          from_name: "Vireo — Modulo contatti",
          name: String(data.get("name") || "").trim(),
          email: String(data.get("email") || "").trim(),
          message: String(data.get("message") || "").trim(),
          language,
        }),
        signal: controller.signal,
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success === true) {
        setStatus("sent");
        form.reset();
        validate();
      } else if (response.status === 429) {
        setStatus("rateLimited");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const values = remaining === null ? null : splitRemaining(remaining);

  return (
    <main className="coming-soon">
      <div className="languages" role="group" aria-label={copy.language}>
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

      <div className="content">
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo animado de 120px, sin necesidad de optimizar */}
          <img
            className="animated-logo"
            src="/img/logo-vireo.png"
            alt="Vireo"
            width={120}
            height={120}
          />
          <span aria-hidden="true">VIREO</span>
        </div>

        <div className="label">{copy.label}</div>
        <h1>
          {copy.title[0]}
          <br />
          {copy.title[1]}
        </h1>
        <div className="slogan">smart by nature</div>

        <div
          className="countdown"
          id="countdown"
          role="timer"
          aria-label={copy.timer}
          aria-live="off"
        >
          {completed ? (
            <p className="launch-message">{copy.completed}</p>
          ) : (
            copy.units.map((unit, index) => (
              <div key={index}>
                <span>{values ? values[index] : "—"}</span>
                <small>{unit}</small>
              </div>
            ))
          )}
        </div>

        <time className="launch" dateTime={LAUNCH_DATE}>
          {copy.launch}
        </time>

        {/* El sitio completo vive en otro layout raíz: enlace normal, con recarga de página. */}
        <a className="preview-link" href={`/preview?lang=${language}`}>
          {copy.preview}
          <ArrowIcon />
        </a>

        <details className="contact-request">
          <summary>
            <MailIcon size={16} />
            {contact.title}
            <span aria-hidden="true">+</span>
          </summary>

          <form aria-busy={sending} onSubmit={onSubmit} noValidate>
            <fieldset disabled={sending}>
              <div className="contact-row">
                <label htmlFor="contact-name">
                  {contact.name}
                  <input
                    ref={nameRef}
                    id="contact-name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    onInput={validate}
                  />
                </label>
                <label htmlFor="contact-email">
                  {contact.email}
                  <input
                    ref={emailRef}
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    onInput={validate}
                  />
                </label>
              </div>

              <label htmlFor="contact-message">
                {contact.message}
                <input
                  ref={companyRef}
                  id="contact-message"
                  name="message"
                  type="text"
                  required
                  maxLength={3000}
                  placeholder={contact.placeholder}
                  autoComplete="organization"
                  onInput={validate}
                />
              </label>

              <div className="contact-honey" aria-hidden="true">
                <label htmlFor="contact-website">
                  Website
                  <input
                    id="contact-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              <button type="submit" disabled={sending}>
                <MailIcon size={15} />
                {sending ? contact.sending : contact.send}
                <ArrowIcon />
              </button>
            </fieldset>

            <p
              className="contact-note"
              data-state={status}
              role="status"
              aria-live="polite"
            >
              {status === "idle" || status === "sending" ? "" : contact[status]}
            </p>
          </form>
        </details>

        <footer className="footer">
          © 2026 Vireo S.A.S. {copy.rights}
        </footer>
      </div>
    </main>
  );
}
