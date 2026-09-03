import sanitizeHtml from "sanitize-html";

// Strips all HTML tags from user-submitted free text — used on fields
// that get displayed elsewhere (reviews, product descriptions) so even
// if a frontend bug ever renders raw HTML, there's nothing dangerous in it
export const stripHtml = (text) => {
  if (typeof text !== "string") return text;
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
};