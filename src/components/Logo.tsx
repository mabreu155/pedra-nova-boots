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
  <span
    className={className}
    style={{ position: "relative", display: "inline-block", height: size }}
  >
    <img
      src={logoImg}
      alt="Pedra Nova Botas"
      width={size}
      height={size}
      style={{
        height: size,
        width: "auto",
        display: "block",
        opacity: variant === "light" ? 0 : 1,
        transition: "opacity 200ms",
      }}
    />
    <img
      src={logoWhite}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{
        height: size,
        width: "auto",
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        opacity: variant === "light" ? 1 : 0,
        transition: "opacity 200ms",
        pointerEvents: "none",
      }}
    />
  </span>
);

export default Logo;
