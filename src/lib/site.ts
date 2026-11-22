// Site text and settings, read from content/site.yaml at build time.
import { parse } from 'yaml';
import raw from '../../content/site.yaml?raw';

interface Link {
  label: string;
  href: string;
}

export interface SiteContent {
  site: { name: string; url: string; email: string; nav: Link[]; copyright: string };
  firstLines: {
    pageTitle: string;
    description: string;
    kicker: string;
    readButton: string;
    shuffleButton: string;
    imageMissing: string;
    credits: string;
  };
  about: {
    pageTitle: string;
    description: string;
    intro: { kicker: string; heading: string[]; lede: string; paragraphs: string[] };
    notes: { title: string; text: string; link?: Link }[];
    contact: {
      kicker: string;
      heading: string;
      text: string;
      emailPrefix: string;
      topics: string[];
      labels: { name: string; email: string; topic: string; message: string; send: string };
      errors: { name: string; email: string; emailInvalid: string; message: string };
      status: { sending: string; sent: string; failed: string; openedEmailApp: string };
    };
  };
}

export const CONTENT = parse(raw) as SiteContent;

export const SITE = {
  ...CONTENT.site,
  // Where the contact form posts. Any form service that accepts a normal form
  // POST works (Formspree, Basin, Netlify Forms...). Set PUBLIC_CONTACT_ENDPOINT
  // in .env; without it the form opens the visitor's email app instead.
  contactEndpoint: (import.meta.env.PUBLIC_CONTACT_ENDPOINT as string | undefined) ?? '',
};

export const NAV = CONTENT.site.nav;

/** Replace {name} placeholders in a string. */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));
