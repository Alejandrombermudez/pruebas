export const LANGUAGES = ["en", "it", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

export const LAUNCH_DATE = "2027-01-01T00:00:00-05:00";

type Copy = {
  language: string;
  label: string;
  title: [string, string];
  units: [string, string, string, string];
  launch: string;
  timer: string;
  completed: string;
  rights: string;
  preview: string;
};

export const COPY: Record<Language, Copy> = {
  en: {
    language: "Language",
    label: "INDUSTRIAL AUTOMATION & SMART MANUFACTURING",
    title: ["Something new", "is taking shape"],
    units: ["DAYS", "HOURS", "MINUTES", "SECONDS"],
    launch: "1 JANUARY 2027",
    timer: "Countdown to 1 January 2027, Colombia time",
    completed: "The countdown is complete",
    rights: "All rights reserved",
    preview: "Preview the website",
  },
  it: {
    language: "Lingua",
    label: "AUTOMAZIONE INDUSTRIALE E PRODUZIONE INTELLIGENTE",
    title: ["Qualcosa di nuovo", "sta prendendo forma"],
    units: ["GIORNI", "ORE", "MINUTI", "SECONDI"],
    launch: "1 GENNAIO 2027",
    timer: "Conto alla rovescia al 1 gennaio 2027, ora della Colombia",
    completed: "Il conto alla rovescia è terminato",
    rights: "Tutti i diritti riservati",
    preview: "Anteprima del sito",
  },
  es: {
    language: "Idioma",
    label: "AUTOMATIZACIÓN INDUSTRIAL Y PRODUCCIÓN INTELIGENTE",
    title: ["Algo nuevo", "está tomando forma"],
    units: ["DÍAS", "HORAS", "MINUTOS", "SEGUNDOS"],
    launch: "1 ENERO 2027",
    timer: "Cuenta regresiva al 1 de enero de 2027, hora de Colombia",
    completed: "La cuenta regresiva ha terminado",
    rights: "Todos los derechos reservados",
    preview: "Vista previa del sitio",
  },
};

export type ContactStatus = "idle" | "sending" | "sent" | "error" | "rateLimited";

type ContactCopy = {
  title: string;
  name: string;
  email: string;
  message: string;
  placeholder: string;
  send: string;
  sending: string;
  sent: string;
  error: string;
  rateLimited: string;
};

export const CONTACT_COPY: Record<Language, ContactCopy> = {
  en: {
    title: "Follow what’s coming",
    name: "Your name",
    email: "Your email",
    message: "Your company",
    placeholder: "Company name",
    send: "Send email",
    sending: "Sending…",
    sent: "Message successfully sent to Vireo.",
    error: "Unable to confirm sending. Please try again later.",
    rateLimited: "Too many requests. Please try again later.",
  },
  it: {
    title: "Segui le novità in arrivo",
    name: "Il tuo nome",
    email: "La tua email",
    message: "La tua azienda",
    placeholder: "Nome dell’azienda",
    send: "Invia email",
    sending: "Invio in corso…",
    sent: "Messaggio inviato correttamente a Vireo.",
    error: "Non è stato possibile confermare l’invio. Riprova più tardi.",
    rateLimited: "Troppe richieste. Riprova più tardi.",
  },
  es: {
    title: "Sigue lo que viene",
    name: "Tu nombre",
    email: "Tu correo",
    message: "Tu empresa",
    placeholder: "Nombre de la empresa",
    send: "Enviar correo",
    sending: "Enviando…",
    sent: "Mensaje enviado correctamente a Vireo.",
    error: "No se ha podido confirmar el envío. Inténtalo más tarde.",
    rateLimited: "Demasiadas solicitudes. Inténtalo más tarde.",
  },
};

export const VALIDATION_COPY: Record<
  Language,
  {
    nameRequired: string;
    nameShort: string;
    emailRequired: string;
    emailInvalid: string;
    companyRequired: string;
  }
> = {
  en: {
    nameRequired: "Please enter your name.",
    nameShort: "Please enter a name with at least 2 characters.",
    emailRequired: "Please enter your email address.",
    emailInvalid: "Please enter a valid email address.",
    companyRequired: "Please enter your company name.",
  },
  it: {
    nameRequired: "Inserisci il tuo nome.",
    nameShort: "Inserisci un nome di almeno 2 caratteri.",
    emailRequired: "Inserisci il tuo indirizzo email.",
    emailInvalid: "Inserisci un indirizzo email valido.",
    companyRequired: "Inserisci il nome della tua azienda.",
  },
  es: {
    nameRequired: "Escribe tu nombre.",
    nameShort: "Escribe un nombre de al menos 2 caracteres.",
    emailRequired: "Escribe tu dirección de correo.",
    emailInvalid: "Escribe una dirección de correo válida.",
    companyRequired: "Escribe el nombre de tu empresa.",
  },
};
