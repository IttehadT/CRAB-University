import "server-only";
import { cookies } from "next/headers";

const dictionaries = {
  en: () => import("@/locales/en.json").then((m) => m.default),
  bn: () => import("@/locales/bn.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "en";
  return dictionaries[locale]?.() ?? dictionaries["en"]();
};