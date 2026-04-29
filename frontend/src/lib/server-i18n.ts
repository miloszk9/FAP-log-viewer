import type { AstroCookies } from "astro";

export type SupportedLanguage = "en" | "pl";
export type LanguagePreference = SupportedLanguage | "system";
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const LANGUAGE_COOKIE_KEY = "fap-log-viewer-language-preference";
export const THEME_COOKIE_KEY = "fap-log-viewer-theme-preference";

export function getInitialState(cookies: AstroCookies, request: Request) {
  // Language
  const langCookie = cookies.get(LANGUAGE_COOKIE_KEY)?.value;
  const isSupportedLang = (l: string | undefined): l is SupportedLanguage => l === "en" || l === "pl";

  let initialLanguagePreference: LanguagePreference = "system";
  if (langCookie === "en" || langCookie === "pl" || langCookie === "system") {
    initialLanguagePreference = langCookie;
  }

  let serverResolvedLang: SupportedLanguage = "en";
  if (isSupportedLang(initialLanguagePreference)) {
    serverResolvedLang = initialLanguagePreference;
  } else {
    const acceptLang = request.headers.get("accept-language");
    if (acceptLang) {
      const preferred = acceptLang.split(",")[0].split("-")[0].toLowerCase();
      if (isSupportedLang(preferred)) {
        serverResolvedLang = preferred;
      }
    }
  }

  // Theme
  const themeCookie = cookies.get(THEME_COOKIE_KEY)?.value;
  let initialThemePreference: ThemePreference = "system";
  if (themeCookie === "light" || themeCookie === "dark" || themeCookie === "system") {
    initialThemePreference = themeCookie;
  }

  return { initialLanguagePreference, serverResolvedLang, initialThemePreference };
}
