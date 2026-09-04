import { defineRouting } from "next-intl/routing";
import { LOCALE_CODES, DEFAULT_LOCALE } from "@/config/languages";

export const routing = defineRouting({
  locales: LOCALE_CODES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  localeCookie: {
    name: "korealink_locale",
  },
});
