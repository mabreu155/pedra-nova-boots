import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X, Heart } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useI18n } from "@/i18n/I18nContext";

const Nav = () => {
  const { t } = useI18n();
  const links = [
    { to: "/", label: t("nav.shop") },
    { to: "/lookbook", label: t("nav.lookbook") },
    { to: "/vender", label: t("nav.vender") },
  ];
  const { count, open } = useCart();
  const { count: wishCount, open: openWish } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  useEffect(() => setMobileOpen(false), [loc.pathname]);

  const isHome = loc.pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen;

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-colors duration-300"
      style={{
        background: transparent ? "transparent" : "hsl(var(--background))",
        borderBottom: transparent ? "1px solid transparent" : "1px solid hsl(var(--border))",
        color: transparent ? "#f7f5f2" : undefined,
      }}
    >
      <div className="mx-auto max-w-[1480px] px-6 flex items-center justify-between" style={{ height: 58 }}>
        {/* Left links (desktop) */}
        <nav className="hidden md:flex items-center gap-8 flex-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `label transition-colors ${
                  transparent
                    ? "text-current opacity-90 hover:opacity-100"
                    : isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden flex-1 flex justify-start">
          <button
            aria-label={t("nav.openMenu")}
            style={{ color: transparent ? "#f7f5f2" : "hsl(var(--foreground))" }}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
          </button>
        </div>

        {/* Center logo */}
        <Link to="/" className="flex-1 flex items-center justify-center">
          <span style={{ display: "inline-flex", alignItems: "center", transform: "scale(1.05)", transformOrigin: "center" }}>
            <Logo variant={transparent ? "light" : "dark"} size={65} />
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <button
            aria-label={t("nav.openWishlist")}
            onClick={openWish}
            className="relative inline-flex items-center"
            style={{ color: transparent ? "#f7f5f2" : "hsl(var(--foreground))" }}
          >
            <Heart size={20} strokeWidth={1.25} />
            {wishCount > 0 && (
              <span
                className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full"
                style={{
                  fontSize: 9,
                  width: 14,
                  height: 14,
                  letterSpacing: "0.05em",
                  background: transparent ? "#f7f5f2" : "hsl(var(--foreground))",
                  color: transparent ? "#0d0d0d" : "hsl(var(--background))",
                }}
              >
                {wishCount}
              </span>
            )}
          </button>
          <button
            aria-label={t("nav.openCart")}
            onClick={open}
            className="relative inline-flex items-center"
            style={{ color: transparent ? "#f7f5f2" : "hsl(var(--foreground))" }}
          >
            <ShoppingBag size={20} strokeWidth={1.25} />
            {count > 0 && (
              <span
                className="absolute -top-2 -right-3 inline-flex items-center justify-center rounded-full"
                style={{
                  fontSize: 9,
                  width: 14,
                  height: 14,
                  letterSpacing: "0.05em",
                  background: transparent ? "#f7f5f2" : "hsl(var(--foreground))",
                  color: transparent ? "#0d0d0d" : "hsl(var(--background))",
                }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background text-foreground">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className="label text-foreground">
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Nav;
