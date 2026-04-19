const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col items-center leading-none ${className}`} aria-label="Pedra Nova Botas">
    <span className="font-display font-bold tracking-tight text-foreground" style={{ fontSize: 22, letterSpacing: "0.02em" }}>
      PEDRA NOVA
    </span>
    <span className="block bg-foreground" style={{ height: 1, width: "100%", margin: "4px 0 4px" }} />
    <span className="label text-foreground" style={{ fontSize: 9 }}>BOTAS</span>
  </div>
);

export default Logo;
