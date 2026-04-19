type Props = {
  name: string;
  ratio?: "3/4" | "4/5" | "1/1";
  className?: string;
};

const ProductImage = ({ name, ratio = "3/4", className = "" }: Props) => {
  const padding = ratio === "3/4" ? "133.33%" : ratio === "4/5" ? "125%" : "100%";
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div style={{ paddingTop: padding }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display italic text-center px-4"
          style={{ color: "#f7f5f2", fontSize: "clamp(28px, 4vw, 56px)", letterSpacing: "0.01em" }}
        >
          {name}
        </span>
      </div>
    </div>
  );
};

export default ProductImage;
