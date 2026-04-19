import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/context/CartContext";

const links = [
  { to: "/", label: "Shop" },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/vender", label: "Vender" },
];

const Nav = () => {
  const { count, open } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setMobileOpen(false), [loc.pathname]);

  return (
    <header
      className="sticky top-0 z-40 bg-background"
      style={{ borderBottom: "1px solid hsl(var(--border))" }}
    >
      <div className="mx-auto max-w-[1480px] px-6 flex items-center justify-between" style={{ height: 64 }}>
        {/* Left links (desktop) */}
        <nav className="hidden md:flex items-center gap-8 flex-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `label transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          aria-label="Abrir menu"
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
        </button>

        {/* Center logo */}
        <Link to="/" className="flex-1 flex justify-center">
          <Logo />
        </Link>

        {/* Right cart */}
        <div className="flex-1 flex justify-end">
          <button
            aria-label="Abrir sacola"
            onClick={open}
            className="relative inline-flex items-center text-foreground"
          >
            <ShoppingBag size={20} strokeWidth={1.25} />
            {count > 0 && (
              <span
                className="absolute -top-2 -right-3 inline-flex items-center justify-center bg-foreground text-background"
                style={{ fontSize: 10, minWidth: 16, height: 16, padding: "0 4px", letterSpacing: "0.05em" }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
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
