// Server-only — this module is never sent to the browser.
// Usage: const dict = await getDictionary('en');
//        dict.auth.signIn → "Sign In"
//        dict.auth.signIn → "লগ ইন করুন" (for 'bn')

import "server-only";

const dictionaries = {
  en: () => import("@/locales/en.json").then((m) => m.default),
  bn: () => import("@/locales/bn.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries["en"]();
};