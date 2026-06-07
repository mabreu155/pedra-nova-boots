import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => (
  <footer className="mt-32 pt-16 pb-10 px-6" style={{ borderTop: "1px solid hsl(var(--border))" }}>
    <div className="mx-auto max-w-[1480px] grid grid-cols-1 md:grid-cols-3 gap-10">
      <div className="flex flex-col items-center text-center">
        <Logo size={88} />
        <p className="mt-6 text-muted-foreground" style={{ fontSize: 13, maxWidth: 280 }}>
          Curadoria de New Rock originais. Couro legítimo, metal forjado, atendimento direto — sem intermediários.
        </p>
      </div>
      <div>
        <p className="label mb-4">Navegar</p>
        <ul className="space-y-2" style={{ fontSize: 14 }}>
          <li><Link to="/" className="hover:underline">Shop</Link></li>
          <li><Link to="/lookbook" className="hover:underline">Lookbook</Link></li>
          <li><Link to="/vender" className="hover:underline">Vender minha New Rock</Link></li>
        </ul>
      </div>
      <div>
        <p className="label">
          © <a href="https://instagram.com/pedranovabr" target="_blank" rel="noopener noreferrer" className="hover:underline">pedranovabr</a> {new Date().getFullYear()} · Made in Spain. Worn worldwide.
        </p>
        <p className="label mt-2">
          Site by <a href="https://instagram.com/nul.solutions" target="_blank" rel="noopener noreferrer" className="hover:underline">Nul</a> — human made sw &amp; ecommerce solutions
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
