export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  images?: string[];
  description: string;
  specs: { label: string; value: string }[];
};

const img = (seed: string, w = 800, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const categories = [
  "All",
  "Audio",
  "Wearables",
  "Laptops",
  "Cameras",
  "Accessories",
  "Home",
];

export const products: Product[] = [
  {
    id: "aurora-headphones",
    name: "Aurora Wireless Headphones",
    category: "Audio",
    price: 289,
    originalPrice: 329,
    rating: 4.8,
    reviews: 1284,
    stock: 42,
    image: img("aurora-hp"),
    images: [img("aurora-hp-1"), img("aurora-hp-2"), img("aurora-hp-3"), img("aurora-hp-4")],
    description:
      "Studio-grade over-ear headphones with adaptive noise cancellation and 40-hour battery life. Precision-tuned drivers deliver a balanced, natural sound.",
    specs: [
      { label: "Driver", value: "40mm dynamic" },
      { label: "Battery", value: "40 hours" },
      { label: "Weight", value: "248g" },
      { label: "Connectivity", value: "Bluetooth 5.3, USB-C" },
    ],
  },
  {
    id: "vertex-smartwatch",
    name: "Vertex Smartwatch Series 6",
    category: "Wearables",
    price: 419,
    rating: 4.6,
    reviews: 892,
    stock: 18,
    image: img("vertex-sw"),
    images: [img("vertex-sw-1"), img("vertex-sw-2"), img("vertex-sw-3")],
    description:
      "Track your health, workouts, and notifications with an always-on Retina display. Titanium case, sapphire crystal.",
    specs: [
      { label: "Display", value: '1.9" AMOLED' },
      { label: "Battery", value: "36 hours" },
      { label: "Water Rating", value: "10 ATM" },
      { label: "Case", value: "Grade 5 Titanium" },
    ],
  },
  {
    id: "meridian-laptop",
    name: "Meridian Pro 14 Laptop",
    category: "Laptops",
    price: 1899,
    rating: 4.9,
    reviews: 421,
    stock: 7,
    image: img("meridian-lp"),
    description:
      "A featherweight 14-inch workstation with the M-series chip, 18-hour battery, and a colour-accurate Liquid Retina display.",
    specs: [
      { label: "Chip", value: "M-Pro 12-core" },
      { label: "Memory", value: "18GB unified" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Display", value: "14.2\" 120Hz" },
    ],
  },
  {
    id: "lumen-camera",
    name: "Lumen Mirrorless Camera",
    category: "Cameras",
    price: 1249,
    rating: 4.7,
    reviews: 306,
    stock: 12,
    image: img("lumen-cam"),
    description:
      "A compact 33MP full-frame mirrorless with in-body stabilization and 4K60 video. Built for creators who move fast.",
    specs: [
      { label: "Sensor", value: "Full-frame 33MP" },
      { label: "Video", value: "4K60, 10-bit" },
      { label: "Stabilization", value: "5-axis IBIS" },
      { label: "Mount", value: "LM-mount" },
    ],
  },
  {
    id: "echo-speaker",
    name: "Echo Studio Speaker",
    category: "Audio",
    price: 219,
    rating: 4.5,
    reviews: 738,
    stock: 55,
    image: img("echo-sp"),
    description: "Room-filling stereo sound with adaptive tuning and voice control.",
    specs: [
      { label: "Power", value: "80W RMS" },
      { label: "Drivers", value: "Dual 3.5\"" },
      { label: "Inputs", value: "AUX, Bluetooth, Wi-Fi" },
    ],
  },
  {
    id: "orbit-mouse",
    name: "Orbit Wireless Mouse",
    category: "Accessories",
    price: 79,
    rating: 4.4,
    reviews: 2101,
    stock: 0,
    image: img("orbit-ms"),
    description: "Ergonomic wireless mouse with MagSpeed scroll and 70-day battery.",
    specs: [
      { label: "DPI", value: "200–8000" },
      { label: "Battery", value: "70 days" },
      { label: "Weight", value: "115g" },
    ],
  },
  {
    id: "harbor-backpack",
    name: "Harbor Everyday Backpack",
    category: "Accessories",
    price: 149,
    rating: 4.7,
    reviews: 512,
    stock: 33,
    image: img("harbor-bp"),
    description: "A 22L weatherproof backpack with a padded 16\" laptop sleeve.",
    specs: [
      { label: "Capacity", value: "22L" },
      { label: "Material", value: "Recycled ripstop" },
      { label: "Laptop", value: "Up to 16\"" },
    ],
  },
  {
    id: "atlas-monitor",
    name: "Atlas 27\" 4K Monitor",
    category: "Accessories",
    price: 649,
    originalPrice: 749,
    rating: 4.6,
    reviews: 187,
    stock: 9,
    image: img("atlas-mn"),
    description: "A 27-inch 4K IPS panel with USB-C 90W passthrough and factory calibration.",
    specs: [
      { label: "Panel", value: "IPS 4K 60Hz" },
      { label: "Ports", value: "USB-C 90W, HDMI, DP" },
      { label: "Coverage", value: "98% DCI-P3" },
    ],
  },
  {
    id: "linen-lamp",
    name: "Linen Table Lamp",
    category: "Home",
    price: 89,
    rating: 4.3,
    reviews: 94,
    stock: 24,
    image: img("linen-lp"),
    description: "A warm ambient lamp with a fabric shade and touch dimmer.",
    specs: [
      { label: "Bulb", value: "E27 LED 9W" },
      { label: "Height", value: "42cm" },
    ],
  },
  {
    id: "nomad-charger",
    name: "Nomad 3-in-1 Charger",
    category: "Accessories",
    price: 129,
    rating: 4.5,
    reviews: 640,
    stock: 61,
    image: img("nomad-ch"),
    description: "Fold-flat travel charger for phone, watch, and earbuds.",
    specs: [
      { label: "Output", value: "15W + 5W + 5W" },
      { label: "Weight", value: "180g" },
    ],
  },
  {
    id: "peak-earbuds",
    name: "Peak Wireless Earbuds",
    category: "Audio",
    price: 199,
    rating: 4.6,
    reviews: 1543,
    stock: 88,
    image: img("peak-eb"),
    description: "Compact earbuds with ANC and 30-hour battery with the case.",
    specs: [
      { label: "Battery", value: "8h + 22h case" },
      { label: "Codec", value: "LC3, AAC, SBC" },
    ],
  },
  {
    id: "cove-keyboard",
    name: "Cove Mechanical Keyboard",
    category: "Accessories",
    price: 179,
    rating: 4.8,
    reviews: 803,
    stock: 21,
    image: img("cove-kb"),
    description: "Low-profile mechanical keyboard with hot-swappable switches.",
    specs: [
      { label: "Layout", value: "75%" },
      { label: "Switches", value: "Tactile brown" },
    ],
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";

export type Order = {
  id: string;
  date: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: OrderStatus;
  payment: PaymentStatus;
};

export const orders: Order[] = [
  { id: "ORD-10241", date: "2026-07-11", customer: "Amelia Chen", email: "amelia@example.com", items: 3, total: 428.5, status: "processing", payment: "paid" },
  { id: "ORD-10240", date: "2026-07-11", customer: "Noah Patel", email: "noah@example.com", items: 1, total: 289.0, status: "shipped", payment: "paid" },
  { id: "ORD-10239", date: "2026-07-10", customer: "Sofia Rossi", email: "sofia@example.com", items: 2, total: 1249.0, status: "delivered", payment: "paid" },
  { id: "ORD-10238", date: "2026-07-10", customer: "Lucas Meyer", email: "lucas@example.com", items: 5, total: 812.0, status: "pending", payment: "pending" },
  { id: "ORD-10237", date: "2026-07-09", customer: "Zara Ali", email: "zara@example.com", items: 1, total: 89.0, status: "cancelled", payment: "refunded" },
  { id: "ORD-10236", date: "2026-07-09", customer: "Ethan Wright", email: "ethan@example.com", items: 2, total: 358.0, status: "delivered", payment: "paid" },
  { id: "ORD-10235", date: "2026-07-08", customer: "Mika Tanaka", email: "mika@example.com", items: 4, total: 967.5, status: "shipped", payment: "paid" },
  { id: "ORD-10234", date: "2026-07-08", customer: "Owen Kelly", email: "owen@example.com", items: 1, total: 649.0, status: "processing", payment: "paid" },
];

export type Payment = {
  id: string;
  orderId: string;
  date: string;
  method: string;
  amount: number;
  status: PaymentStatus;
};

export const payments: Payment[] = orders.map((o, i) => ({
  id: `PAY-${20000 + i}`,
  orderId: o.id,
  date: o.date,
  method: ["Visa •• 4242", "Mastercard •• 8210", "Apple Pay", "PayPal"][i % 4],
  amount: o.total,
  status: o.payment,
}));

export const revenueSeries = [
  { m: "Jan", v: 24000 }, { m: "Feb", v: 28500 }, { m: "Mar", v: 31200 },
  { m: "Apr", v: 29800 }, { m: "May", v: 34600 }, { m: "Jun", v: 38900 },
  { m: "Jul", v: 42100 },
];
