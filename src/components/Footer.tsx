import { Link } from "react-router-dom";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import { useI18n } from "@/i18n/I18nContext";

const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="mt-32 pt-16 pb-10 px-6" style={{ borderTop: "1px solid hsl(var(--border))" }}>
      <div className="mx-auto max-w-[1480px] grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="flex flex-col items-center text-center">
          <Logo size={88} />
          <p className="mt-6 text-muted-foreground" style={{ fontSize: 13, maxWidth: 280 }}>
            {t("footer.tagline")}
          </p>
          <div className="mt-6">
            <LanguageToggle />
          </div>
        </div>
        <div>
          <p className="label mb-4">{t("footer.navigate")}</p>
          <ul className="space-y-2" style={{ fontSize: 14 }}>
            <li><Link to="/" className="hover:underline">{t("nav.shop")}</Link></li>
            <li><Link to="/lookbook" className="hover:underline">{t("nav.lookbook")}</Link></li>
            <li><Link to="/vender" className="hover:underline">{t("nav.vender")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="label">
            © <a href="https://instagram.com/pedranovabr" target="_blank" rel="noopener noreferrer" className="hover:underline">pedranovabr</a> {new Date().getFullYear()} · {t("footer.madeIn")}
          </p>
          <p className="label mt-2">
            {t("footer.siteBy")} <a href="https://instagram.com/nul.solutions" target="_blank" rel="noopener noreferrer" className="hover:underline">Nul</a> {t("footer.siteByTail")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
