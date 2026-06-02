import logoImg from "@/assets/logo.png";
import logoWhite from "@/assets/logo-white.png";

const Logo = ({
  className = "",
  size = 44,
  variant = "dark",
}: {
  className?: string;
  size?: number;
  variant?: "dark" | "light";
}) => (
  <img
    src={variant === "light" ? logoWhite : logoImg}
    alt="Pedra Nova Botas"
    width={size}
    height={size}
    style={{ height: size, width: "auto", display: "block" }}
    className={className}
  />
);

export default Logo;
