// Site text and settings, read from content/site.yaml at build time.
import { parse } from 'yaml';
import raw from '../../content/site.yaml?raw';

interface Link {
  label: string;
  href: string;
}

export interface SiteContent {
  site: {
    name: string;
    url: string;
    email: string;
    nav: Link[];
    copyright: string;
    contactLink: Link;
    instagram: { label: string; handle: string; href: string };
  };
  notFound: { pageTitle: string; heading: string; text: string; links: Link[] };
  firstLines: {
    pageTitle: string;
    description: string;
    kicker: string;
    readButton: string;
    shuffleButton: string;
    imageMissing: string;
    credits: {
      painting: string;
      portrait: string;
      text: string;
      selfPortrait: string;
      textSource: string;
      portraitSource: string;
    };
  };
  editing: {
    pageTitle: string;
    description: string;
    intro: { kicker: string; heading: string[]; lede: string; paragraphs: string[] };
    testimonial: { quote: string; name: string; role: string; work: string; workHref?: string; source: string };
    services: {
      heading: string;
      items: { name: string; text: string; ask: string; topic: string }[];
    };
    cta: { kicker: string; heading: string; text: string; button: string; topic: string };
  };
  books: { pageTitle: string; description: string; heading: string; lede: string };
  about: {
    pageTitle: string;
    description: string;
    intro: { kicker: string; heading: string[]; lede: string; paragraphs: string[] };
    notes: { title: string; text: string; link?: Link }[];
    contact: {
      kicker: string;
      heading: string;
      text: string;
      instagramPrefix: string;
      emailPrefix: string;
      emailSubject: string;
      topicNotes: Record<string, { note?: string; hint?: string }>;
      topics: string[];
      labels: { name: string; email: string; topic: string; message: string; send: string };
      errors: { name: string; email: string; emailInvalid: string; message: string };
      status: { sending: string; sent: string; failed: string };
    };
  };
}

export const CONTENT = parse(raw) as SiteContent;

export const SITE = {
  ...CONTENT.site,
  // The contact form is emailed to the press's address by FormSubmit
  // (formsubmit.co: no account; the first message asks the address to confirm).
  // PUBLIC_CONTACT_ENDPOINT can point it at another JSON form service instead.
  formEndpoint: (import.meta.env.PUBLIC_CONTACT_ENDPOINT as string | undefined) || `https://formsubmit.co/ajax/${CONTENT.site.email}`,
  /** Where the browser posts the form when JavaScript is off. */
  formAction: (import.meta.env.PUBLIC_CONTACT_ENDPOINT as string | undefined) || `https://formsubmit.co/${CONTENT.site.email}`,
};

export const NAV = CONTENT.site.nav;

/** Replace {name} placeholders in a string. */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Escape text for HTML and set _Title_ in italics as <cite>Title</cite>. */
export const withCites = (text: string) => escapeHtml(text).replace(/_([^_]+)_/g, '<cite>$1</cite>');
