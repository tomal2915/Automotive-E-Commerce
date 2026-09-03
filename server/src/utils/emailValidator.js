import disposableDomains from "disposable-email-domains";

const disposableDomainSet = new Set(disposableDomains);

// Checks whether an email's domain is a known disposable/temp-mail provider
export const isDisposableEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? disposableDomainSet.has(domain) : false;
};

// Basic structural sanity check beyond what a simple regex catches —
// rejects obviously fake patterns like "a@a.com" style throwaway addresses
// without being so strict it blocks legitimate unusual (but real) emails
export const isPlausibleEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
};