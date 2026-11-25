# Flowmind — AI SaaS landing page (001)

Fictional AI workflow automation SaaS called **Flowmind**. One offer, one audience,
one primary action: start a free trial. Layout type A (classic hero + sections).

## What it is

A self-contained React + TypeScript + Vite + Tailwind CSS v4 landing page, fully
bilingual (English LTR / Arabic RTL), built to the studio design system in
`~/workspace/100-web-projects/design-system/DESIGN-SYSTEM.md`.

Sections: floating nav, hero with CSS-built dashboard mockup and trial signup form,
benefits (4), how it works (3 steps), tagline reveal, sample testimonial, pricing
(3 tiers), FAQ (8), final CTA, footer.

## Run

```bash
npm install
npm run dev
```

Open the local URL Vite prints (default http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

Import this folder as a Vercel project (framework preset: Vite). Build command
`npm run build`, output directory `dist`. No environment variables are needed.

## Features

- Bilingual EN/AR with a visible switcher in the nav; `dir` and `lang` set on
  `<html>`; preference saved in localStorage (`flowmind-lang`).
- All UI strings live in `locales/en/common.json` and `locales/ar/common.json`;
  no hardcoded copy in components.
- Hero trial signup: client-side validation (required, valid email), inline error
  and success states, saved to localStorage (`flowmind-trial-email`).
- "Book a demo" dialog: name + email validation, success state, saved to
  localStorage (`flowmind-demo-request`).
- FAQ accordion, smooth-scroll nav links, mobile full-height menu with
  60 ms staggered link entrance, scroll reveals via IntersectionObserver
  (once only), word-by-word tagline reveal.
- Privacy and terms footer links open dialogs with short placeholder text.
- Skip-to-content link, semantic HTML (`nav`/`main`/`section`/`footer`),
  meta title/description, inline SVG data-URI favicon, visible focus rings,
  hover and active (`scale(0.98)`) states, `prefers-reduced-motion` support.

## i18n notes

- Manrope is used for Latin text with system Arabic fallback; no Inter, Roboto,
  or Arial anywhere.
- Arabic copy is a full translation of the English strings, not a partial one.
- Flow status labels in the demo dashboard come from the locale files.

## Content honesty

No invented prices, stats, customer counts, or real testimonials. Pricing shows
`{{price}}` placeholders, the hero proof line is a clearly marked demo badge,
and the testimonial is labelled as a sample/demo with a fictional person
(Layla Mansour). The dashboard shows sample demo data.

## Known gaps

- No backend: trial and demo submissions are stored only in localStorage.
- No custom 404 page (single-page landing; none is routed).
- No cookie consent banner (no tracking cookies are used).
- No `og:image` asset (no external images are used by design).
- The demo dashboard is a static CSS mockup, not a live product.
