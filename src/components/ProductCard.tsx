import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductImage from "./ProductImage";
import { Product, formatPrice } from "@/data/products";

const ProductCard = ({ product }: { product: Product }) => (
  <Link to={`/produto/${product.slug}`} className="group block">
    <div className="relative overflow-hidden">
      <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <ProductImage src={product.image} name={product.name} ratio="3/4" />
      </motion.div>
      {product.badge && (
        <span
          className="absolute top-3 left-3 label bg-background text-foreground"
          style={{ padding: "5px 8px", fontSize: 9 }}
        >
          {product.badge}
        </span>
      )}
    </div>
    <div className="pt-3 md:pt-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-display leading-none truncate" style={{ fontSize: "clamp(16px, 1.6vw, 20px)" }}>
          {product.name}
        </h3>
        <p className="label text-muted-foreground mt-1.5 truncate" style={{ fontSize: 9 }}>
          {product.code}
        </p>
      </div>
      <span
        className="font-display whitespace-nowrap"
        style={{ fontSize: "clamp(13px, 1.2vw, 16px)" }}
      >
        {formatPrice(product.price)}
      </span>
    </div>
  </Link>
);

export default ProductCard;
