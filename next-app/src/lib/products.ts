export interface Product {
  name: string;
  brand: string;
  color: string;
  category: string;
  price: number;
  description: string;
}

export const PRODUCTS: Product[] = [
  // Blue iPhones under $500
  { name: "iPhone 15 Blue 128GB", brand: "Apple", color: "Blue", category: "Smartphone", price: 479, description: "The iPhone 15 in stunning Blue finish with A16 Bionic chip, 128GB storage, and 48MP camera system." },
  { name: "iPhone 14 Blue 128GB", brand: "Apple", color: "Blue", category: "Smartphone", price: 399, description: "iPhone 14 in Blue with A15 Bionic chip, excellent dual camera, and all-day battery life." },
  { name: "iPhone 13 Blue 128GB", brand: "Apple", color: "Blue", category: "Smartphone", price: 299, description: "iPhone 13 in Blue with A15 Bionic, cinematic mode, and impressive battery life at budget price." },

  // Blue iPhones over $500
  { name: "iPhone 15 Pro Blue Titanium 256GB", brand: "Apple", color: "Blue", category: "Smartphone", price: 999, description: "iPhone 15 Pro in Blue Titanium with A17 Pro chip, titanium design, and action button." },
  { name: "iPhone 15 Pro Max Blue Titanium 512GB", brand: "Apple", color: "Blue", category: "Smartphone", price: 1399, description: "The ultimate iPhone with 5x optical zoom, A17 Pro chip, titanium build, and all-day battery." },
  { name: "iPhone 16 Blue 256GB", brand: "Apple", color: "Blue", category: "Smartphone", price: 899, description: "Latest iPhone 16 in Blue with A18 chip, Apple Intelligence, and camera control button." },

  // Non-blue iPhones
  { name: "iPhone 15 Pink 128GB", brand: "Apple", color: "Pink", category: "Smartphone", price: 479, description: "iPhone 15 in gorgeous Pink with A16 Bionic chip and advanced camera features." },
  { name: "iPhone 15 Black 128GB", brand: "Apple", color: "Black", category: "Smartphone", price: 479, description: "iPhone 15 in sleek Black finish with A16 Bionic chip and Dynamic Island." },
  { name: "iPhone 14 Yellow 128GB", brand: "Apple", color: "Yellow", category: "Smartphone", price: 399, description: "iPhone 14 in cheerful Yellow with A15 Bionic chip and crash detection." },
  { name: "iPhone SE Red 64GB", brand: "Apple", color: "Red", category: "Smartphone", price: 249, description: "Compact and affordable iPhone SE in Product Red with A15 Bionic chip." },

  // Blue non-Apple phones
  { name: "Samsung Galaxy S24 Blue 256GB", brand: "Samsung", color: "Blue", category: "Smartphone", price: 449, description: "Samsung Galaxy S24 in Cobalt Blue with Galaxy AI and Snapdragon 8 Gen 3." },
  { name: "Google Pixel 8 Bay Blue 128GB", brand: "Google", color: "Blue", category: "Smartphone", price: 349, description: "Google Pixel 8 in Bay Blue with Tensor G3 chip and AI photography features." },
  { name: "OnePlus 12 Blue 256GB", brand: "OnePlus", color: "Blue", category: "Smartphone", price: 469, description: "OnePlus 12 in Flowy Emerald with Snapdragon 8 Gen 3 and Hasselblad camera." },

  // Blue non-phone Apple products
  { name: "AirPods Max Sky Blue", brand: "Apple", color: "Blue", category: "Headphones", price: 549, description: "Premium over-ear headphones in Sky Blue with ANC and spatial audio." },
  { name: "MacBook Air M2 Midnight", brand: "Apple", color: "Blue", category: "Laptop", price: 1199, description: "Ultra-thin MacBook Air with M2 chip in Midnight, fanless design, 18hr battery." },
  { name: "iPad Air Blue 64GB", brand: "Apple", color: "Blue", category: "Tablet", price: 599, description: "iPad Air in Blue with M1 chip, 10.9-inch Liquid Retina display." },
  { name: "Apple Watch Series 9 Blue", brand: "Apple", color: "Blue", category: "Smartwatch", price: 399, description: "Apple Watch Series 9 in Blue aluminum with S9 chip and health sensors." },

  // Other products
  { name: "Sony WH-1000XM5 Black", brand: "Sony", color: "Black", category: "Headphones", price: 349, description: "Industry-leading noise cancelling headphones with 30hr battery." },
  { name: "Nike Air Max 90 University Blue", brand: "Nike", color: "Blue", category: "Shoes", price: 130, description: "Classic Nike Air Max 90 in University Blue colorway." },
  { name: "JBL Charge 5 Blue", brand: "JBL", color: "Blue", category: "Speaker", price: 179, description: "Portable Bluetooth speaker in Blue with powerful bass and IP67 rating." },
  { name: "Dell XPS 15 Silver", brand: "Dell", color: "Silver", category: "Laptop", price: 1299, description: "Premium laptop with InfinityEdge display, Intel Core i7, NVIDIA graphics." },
  { name: "Samsung Galaxy Watch 6 Blue", brand: "Samsung", color: "Blue", category: "Smartwatch", price: 299, description: "Smartwatch in Blue with health monitoring, GPS, and Wear OS." },
  { name: "Bose QC Ultra Blue", brand: "Bose", color: "Blue", category: "Headphones", price: 429, description: "Premium noise cancelling earbuds in Moonstone Blue with spatial audio." },
];
