export interface Card {
  id: string;
  name: string;
  setName?: string | null;
  setCode?: string | null;
  number?: string | null;
  rarity?: string | null;
  types?: string | null;
  hp?: string | null;
  imageUrl: string;
  imageLarge?: string | null;
  description?: string | null;
  artist?: string | null;
  price: number;
  stock: number;
  published?: boolean;
  createdAt?: string;
}

export interface ParsedCard {
  name: string;
  setName?: string;
  setCode?: string;
  number?: string;
  rarity?: string;
  types?: string[];
  hp?: string;
  imageUrl: string;
  imageLarge?: string;
  description?: string;
  artist?: string;
  tcgId?: string;
  sourceUrl: string;
}

export const TYPES = [
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Psychic",
  "Fighting",
  "Darkness",
  "Metal",
  "Dragon",
  "Colorless",
  "Fairy",
] as const;

export const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Rare Holo",
  "Rare Holo EX",
  "Rare Holo GX",
  "Rare Ultra",
  "Rare Secret",
  "Amazing Rare",
  "Illustration Rare",
] as const;

export const TYPE_COLORS: Record<string, string> = {
  Fire: "bg-red-500 text-white",
  Water: "bg-blue-500 text-white",
  Grass: "bg-green-500 text-white",
  Electric: "bg-yellow-400 text-black",
  Psychic: "bg-purple-500 text-white",
  Fighting: "bg-orange-600 text-white",
  Darkness: "bg-gray-800 text-white",
  Metal: "bg-gray-400 text-white",
  Dragon: "bg-indigo-600 text-white",
  Colorless: "bg-gray-300 text-black",
  Fairy: "bg-pink-400 text-white",
};

/** Background-only variant for places where text color is set separately */
export const TYPE_BG_COLORS: Record<string, string> = {
  Fire: "bg-red-500",
  Water: "bg-blue-500",
  Grass: "bg-green-500",
  Electric: "bg-yellow-400",
  Psychic: "bg-purple-500",
  Fighting: "bg-orange-600",
  Darkness: "bg-gray-800",
  Metal: "bg-gray-400",
  Dragon: "bg-indigo-600",
  Colorless: "bg-gray-300",
  Fairy: "bg-pink-400",
};
