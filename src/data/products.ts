import wall006 from "@/assets/wall006.jpg";
import mili085 from "@/assets/mili085.jpg";
import futur01 from "@/assets/futur01.jpg";
import sylth001 from "@/assets/sylth001.jpg";
import skull001 from "@/assets/skull001.jpg";
import tower006 from "@/assets/tower006.jpg";

export type Product = {
  slug: string;
  name: string;
  code: string;
  price: number;
  category: string;
  sizes: number[];
  description: string;
  details: string[];
  badge?: string;
  image: string;
};

export const products: Product[] = [
  {
    slug: "wall006",
    name: "Wall006",
    code: "M.WALL006-S3",
    price: 1890,
    category: "Platform",
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    description:
      "A bota que define o rock alternativo. Plataforma maciça, couro legítimo, construção que dura décadas.",
    details: [
      "Couro legítimo bovino",
      "Sola borracha vulcanizada",
      "Plataforma 6cm",
      "Fabricado na Espanha",
    ],
    badge: "Novo",
  },
  {
    slug: "mili085",
    name: "Mili085",
    code: "M.MILI085-S1",
    price: 1670,
    category: "Military",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44],
    description:
      "Estética militar encontra o underground. Coturno robusto com detalhes metálicos que não pedem licença.",
    details: [
      "Couro legítimo",
      "Fivelas aço inox",
      "Sola antiderrapante",
      "Fabricado na Espanha",
    ],
  },
  {
    slug: "futur01",
    name: "Futur01",
    code: "M.FUTUR01-S1",
    price: 2100,
    category: "Platform",
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    description:
      "Futuro distópico nos seus pés. Design arrojado que atravessa décadas sem envelhecer.",
    details: [
      "Couro e materiais sintéticos premium",
      "Plataforma escultural 8cm",
      "Zíper lateral YKK",
      "Fabricado na Espanha",
    ],
    badge: "Novo",
  },
  {
    slug: "sylth001",
    name: "Sylth001",
    code: "M.SYLTH001-S1",
    price: 1450,
    category: "Classic",
    sizes: [37, 38, 39, 40, 41, 42, 43],
    description:
      "A escolha dos que preferem falar baixo e pisar alto. Perfil slim, impacto máximo.",
    details: [
      "Couro legítimo preto",
      "Bico quadrado",
      "Sola borracha",
      "Fabricado na Espanha",
    ],
  },
  {
    slug: "skull001",
    name: "Skull001",
    code: "M.SKULL001-S1",
    price: 1980,
    category: "Iconic",
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    description:
      "Ícone absoluto. O modelo que colocou a New Rock no mapa do rock mundial.",
    details: [
      "Couro legítimo",
      "Detalhes caveira fundidos",
      "Plataforma 5cm",
      "Fabricado na Espanha",
    ],
    badge: "Novo",
  },
  {
    slug: "tower006",
    name: "Tower006",
    code: "M.TOWER006-C1",
    price: 2250,
    category: "High Boot",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44, 45],
    description:
      "Para quem quer dominar qualquer ambiente. Cano alto, atitude máxima.",
    details: [
      "Couro legítimo",
      "Cano alto 30cm",
      "Plataforma 7cm",
      "Múltiplas fivelas",
      "Fabricado na Espanha",
    ],
  },
];

export const formatPrice = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 0 });

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

export const WHATSAPP_NUMBER = "5500000000000"; // TODO: substituir pelo número do Kaique
