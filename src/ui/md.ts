import { Marked } from "marked";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Markdown for our own curriculum content. */
const trusted = new Marked({ gfm: true });

/** Markdown for AI replies: raw HTML, links and images are neutralised. */
const untrusted = new Marked({
  gfm: true,
  renderer: {
    html: (token) => escapeHtml(token.text),
    link: (token) => escapeHtml(token.text),
    image: (token) => escapeHtml(token.text),
  },
});

export const renderMarkdown = (src: string) => trusted.parse(src, { async: false }) as string;
export const renderUntrusted = (src: string) => untrusted.parse(src, { async: false }) as string;
