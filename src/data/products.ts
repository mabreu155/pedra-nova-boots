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
      "Construída para durar mais que tendências. Plataforma maciça, couro legítimo, metal que pesa. Wall006 não pede licença — ocupa o chão.",
    details: [
      "Couro legítimo bovino",
      "Sola borracha vulcanizada",
      "Plataforma 6cm",
      "Made in Spain",
    ],
    image: wall006,
  },
  {
    slug: "mili085",
    name: "Mili085",
    code: "M.MILI085-S1",
    price: 1670,
    category: "Military",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44],
    description:
      "Estética militar. Atitude underground. Coturno robusto com fivelas em aço — uma armadura para a rotina urbana.",
    details: [
      "Couro legítimo",
      "Fivelas aço inox",
      "Sola antiderrapante",
      "Made in Spain",
    ],
    image: mili085,
  },
  {
    slug: "futur01",
    name: "Futur01",
    code: "M.FUTUR01-S1",
    price: 2100,
    category: "Platform",
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    description:
      "Distopia aos seus pés. Linhas escultóricas, plataforma extrema, design que recusa envelhecer. Futuro forjado em couro.",
    details: [
      "Couro e materiais sintéticos premium",
      "Plataforma escultural 8cm",
      "Zíper lateral YKK",
      "Made in Spain",
    ],
    badge: "New",
    image: futur01,
  },
  {
    slug: "sylth001",
    name: "Sylth001",
    code: "M.SYLTH001-S1",
    price: 1450,
    category: "Classic",
    sizes: [37, 38, 39, 40, 41, 42, 43],
    description:
      "Slim por fora. Pesada por dentro. Para quem fala baixo e pisa alto — perfil enxuto, impacto máximo.",
    details: [
      "Couro legítimo preto",
      "Bico quadrado",
      "Sola borracha",
      "Made in Spain",
    ],
    image: sylth001,
  },
  {
    slug: "skull001",
    name: "Skull001",
    code: "M.SKULL001-S1",
    price: 1980,
    category: "Iconic",
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    description:
      "O ícone que recusou virar nostalgia. Caveiras fundidas, couro legítimo, presença que entra antes de você. Skull001 é assinatura.",
    details: [
      "Couro legítimo",
      "Detalhes caveira fundidos",
      "Plataforma 5cm",
      "Made in Spain",
    ],
    
    image: skull001,
  },
  {
    slug: "tower006",
    name: "Tower006",
    code: "M.TOWER006-C1",
    price: 2250,
    category: "High Boot",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44, 45],
    description:
      "Cano alto. Última palavra. Múltiplas fivelas, plataforma forjada — Tower006 não entra na sala, domina ela.",
    details: [
      "Couro legítimo",
      "Cano alto 30cm",
      "Plataforma 7cm",
      "Múltiplas fivelas",
      "Made in Spain",
    ],
    image: tower006,
  },
];

export const formatPrice = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 0 });

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

export const WHATSAPP_NUMBER = "5500000000000"; // TODO: substituir pelo número do Kaique
