import { createRequire } from "module";

// disposable-email-domains ships as a JSON file, which Node's newer ESM
// rules require an explicit "type: json" import attribute for. Using
// createRequire sidesteps that entirely — CommonJS require() has always
// been able to load JSON natively, without any special syntax.
const require = createRequire(import.meta.url);
const disposableDomains = require("disposable-email-domains");

const disposableDomainSet = new Set(disposableDomains);

export const isDisposableEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? disposableDomainSet.has(domain) : false;
};

export const isPlausibleEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
};
