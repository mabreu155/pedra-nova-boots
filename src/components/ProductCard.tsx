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
          className="absolute top-4 left-4 label bg-background text-foreground"
          style={{ padding: "6px 10px" }}
        >
          {product.badge}
        </span>
      )}
    </div>
    <div className="pt-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="font-display text-2xl leading-none">{product.name}</h3>
        <p className="label text-muted-foreground mt-2">{product.code}</p>
      </div>
      <span className="font-display text-lg whitespace-nowrap">{formatPrice(product.price)}</span>
    </div>
  </Link>
);

export default ProductCard;
