
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const supportedLocales = ["fr", "en"] as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("NEXT_LOCALE")?.value;

  const locale =
    savedLocale && supportedLocales.some((item) => item === savedLocale)
      ? savedLocale
      : "fr";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
