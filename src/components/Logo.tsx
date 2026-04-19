import logoImg from "@/assets/logo.png";

const Logo = ({ className = "", size = 44 }: { className?: string; size?: number }) => (
  <img
    src={logoImg}
    alt="Pedra Nova Botas"
    width={size}
    height={size}
    style={{ height: size, width: "auto", display: "block" }}
    className={className}
  />
);

export default Logo;
