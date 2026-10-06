
"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [changing, setChanging] = useState(false);

  function changeLanguage(nextLocale: "fr" | "en") {
    if (nextLocale === locale) return;

    setChanging(true);

    document.cookie =
      `NEXT_LOCALE=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;

    router.refresh();
    setChanging(false);
  }

  return (
    <div
      role="group"
      aria-label="Choose language"
      className="flex items-center gap-1 rounded-lg border border-gray-200 p-1"
    >
      <button
        type="button"
        onClick={() => changeLanguage("fr")}
        disabled={changing}
        aria-pressed={locale === "fr"}
        className={`rounded-md px-3 py-2 text-sm font-semibold ${
          locale === "fr"
            ? "bg-green-700 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        FR
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("en")}
        disabled={changing}
        aria-pressed={locale === "en"}
        className={`rounded-md px-3 py-2 text-sm font-semibold ${
          locale === "en"
            ? "bg-green-700 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        EN
      </button>
    </div>
  );
}
