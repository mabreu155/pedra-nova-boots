import { LOCALES, useI18n } from "@/i18n/I18nContext";

const LanguageToggle = () => {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label={t("footer.language")}>
      {LOCALES.map((l) => {
        const active = l.code === locale;
        return (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            aria-label={l.name}
            aria-pressed={active}
            title={l.name}
            className="label inline-flex items-center gap-1 transition-opacity"
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid hsl(var(--border))",
              background: active ? "hsl(var(--foreground))" : "transparent",
              color: active ? "hsl(var(--background))" : "hsl(var(--foreground))",
              opacity: active ? 1 : 0.75,
              fontSize: 11,
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 14 }} aria-hidden>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;
