"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Copy, Language } from "./copy";
import { stagger } from "./motion";

const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
const WHATSAPP_NUMBER = "573183323640";

type Status = "idle" | "sending" | "sent" | "error" | "rateLimited";

export default function Contact({ c, language }: { c: Copy; language: Language }) {
  const [status, setStatus] = useState<Status>("idle");
  const sending = status === "sending";

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Nombre, email y mensaje son obligatorios; la empresa es opcional.
  // Los mensajes de error se muestran en el idioma elegido.
  const validate = useCallback(() => {
    const name = nameRef.current;
    const email = emailRef.current;
    const message = messageRef.current;

    if (name) {
      const value = name.value.trim();
      name.setCustomValidity(
        !value ? c.nameRequired : value.length < 2 ? c.nameShort : "",
      );
    }

    if (email) {
      email.setCustomValidity("");
      if (!email.value.trim()) {
        email.setCustomValidity(c.emailRequired);
      } else if (email.validity.typeMismatch) {
        email.setCustomValidity(c.emailInvalid);
      }
    }

    if (message) {
      const value = message.value.trim();
      message.setCustomValidity(
        !value ? c.messageRequired : value.length < 10 ? c.messageShort : "",
      );
    }
  }, [c]);

  useEffect(() => {
    validate();
  }, [validate]);

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
          subject: "Vireo S.A.S. — Website contact",
          from_name: "Vireo — Website",
          name: String(data.get("name") || "").trim(),
          email: String(data.get("email") || "").trim(),
          company: String(data.get("company") || "").trim(),
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
      } else {
        setStatus(response.status === 429 ? "rateLimited" : "error");
      }
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(c.whatsappMessage)}`;

  return (
    <section id="contact" className="section contact snap">
      <div className="contact-bg" aria-hidden="true" />
      <div>
        <p className="eyebrow" data-reveal="">
          {c.contactSmall}
        </p>
        <h2 data-reveal="" style={stagger(1)}>
          {c.contactTitle}
        </h2>
        <p className="intro" data-reveal="" style={stagger(2)}>
          {c.contactText}
        </p>
      </div>

      <form
        id="contact-form"
        aria-busy={sending}
        onSubmit={onSubmit}
        noValidate
        data-reveal=""
        style={stagger(2)}
      >
        <fieldset disabled={sending}>
          <legend className="sr-only">{c.contactTitle}</legend>

          <div className="contact-row">
            <label htmlFor="contact-name">
              <span>{c.name}</span>
              <input
                ref={nameRef}
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                placeholder={c.namePlaceholder}
                onInput={validate}
              />
            </label>

            <label htmlFor="contact-email">
              <span>{c.email}</span>
              <input
                ref={emailRef}
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder={c.emailPlaceholder}
                onInput={validate}
              />
            </label>
          </div>

          <label htmlFor="contact-company">
            <span>{c.company}</span>
            <input
              id="contact-company"
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={150}
              placeholder={c.companyPlaceholder}
            />
          </label>

          <label htmlFor="contact-message">
            <span>{c.message}</span>
            <textarea
              ref={messageRef}
              id="contact-message"
              name="message"
              rows={5}
              required
              minLength={10}
              maxLength={3000}
              placeholder={c.placeholder}
              onInput={validate}
            />
          </label>

          <div className="honeypot" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <button className="button" type="submit">
            <span id="send-label">{sending ? c.sending : c.send}</span>
            <span aria-hidden="true">↗</span>
          </button>
        </fieldset>

        <p className="contact-note" role="status" aria-live="polite" data-state={status}>
          {status === "idle" || status === "sending" ? "" : c[status]}
        </p>

        <a
          id="whatsapp-contact"
          className="button"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{c.whatsapp}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </form>
    </section>
  );
}
