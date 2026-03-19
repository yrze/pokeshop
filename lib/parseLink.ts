import * as cheerio from "cheerio";

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

// Query the Pokemon TCG API with a card name / set info
async function searchPokemonTCGApi(query: string): Promise<ParsedCard | null> {
  try {
    const encoded = encodeURIComponent(`name:"${query}"`);
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${encoded}&pageSize=1`,
      { headers: { "User-Agent": "PokemonShop/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.data || data.data.length === 0) return null;
    return mapApiCard(data.data[0]);
  } catch {
    return null;
  }
}

async function getCardById(id: string): Promise<ParsedCard | null> {
  try {
    const res = await fetch(`https://api.pokemontcg.io/v2/cards/${id}`, {
      headers: { "User-Agent": "PokemonShop/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return mapApiCard(data.data);
  } catch {
    return null;
  }
}

function mapApiCard(card: Record<string, unknown>): ParsedCard {
  const attacks = (card.attacks as Array<Record<string, unknown>> | undefined) || [];
  const abilities = (card.abilities as Array<Record<string, unknown>> | undefined) || [];

  const descParts: string[] = [];
  for (const ab of abilities) {
    descParts.push(`[Ability] ${ab.name}: ${ab.text}`);
  }
  for (const atk of attacks) {
    const cost = Array.isArray(atk.cost) ? atk.cost.join(", ") : "";
    descParts.push(
      `[Attack] ${atk.name}${cost ? ` (${cost})` : ""}${atk.damage ? ` – ${atk.damage}` : ""}${atk.text ? `: ${atk.text}` : ""}`
    );
  }

  const images = card.images as Record<string, string> | undefined;
  const set = card.set as Record<string, unknown> | undefined;

  return {
    tcgId: card.id as string,
    name: card.name as string,
    setName: set ? (set.name as string) : undefined,
    setCode: set ? (set.id as string) : undefined,
    number: card.number as string | undefined,
    rarity: card.rarity as string | undefined,
    types: card.types as string[] | undefined,
    hp: card.hp as string | undefined,
    imageUrl: images?.small || "",
    imageLarge: images?.large,
    description: descParts.join("\n") || undefined,
    artist: card.artist as string | undefined,
    sourceUrl: "",
  };
}

// Extract card name from a URL path
function extractNameFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const path = decodeURIComponent(u.pathname);

    // Bulbapedia: /wiki/Charizard_(Base_Set_4)
    if (u.hostname.includes("bulbapedia")) {
      const m = path.match(/\/wiki\/([^/_(]+)/);
      if (m) return m[1].replace(/_/g, " ").trim();
    }

    // TCGPlayer: /product/charizard-holo/
    if (u.hostname.includes("tcgplayer")) {
      const parts = path.split("/").filter(Boolean);
      for (const p of parts.reverse()) {
        if (p.length > 2 && !/^\d+$/.test(p)) {
          return p.replace(/-/g, " ").trim();
        }
      }
    }

    // CardMarket
    if (u.hostname.includes("cardmarket")) {
      const parts = path.split("/").filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1].replace(/-/g, " ");
    }

    // Generic: last path segment
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) {
      return segments[segments.length - 1].replace(/[-_]/g, " ").replace(/\.\w+$/, "");
    }
    return null;
  } catch {
    return null;
  }
}

// Try to extract Pokemon TCG API card ID from URL
function extractTcgApiId(url: string): string | null {
  // Direct API URL: api.pokemontcg.io/v2/cards/xy1-1
  const apiMatch = url.match(/api\.pokemontcg\.io\/v2\/cards\/([a-z0-9-]+)/i);
  if (apiMatch) return apiMatch[1];

  // Some sites embed card IDs like sv1-25 or base1-4
  const idMatch = url.match(/\b([a-z]{1,6}\d{1,2}-\d{1,3})\b/i);
  if (idMatch) return idMatch[1];

  return null;
}

// Allowed domains for URL scraping (SSRF prevention)
const ALLOWED_SCRAPE_DOMAINS = [
  "bulbapedia.bulbagarden.net",
  "www.tcgplayer.com",
  "tcgplayer.com",
  "www.cardmarket.com",
  "cardmarket.com",
  "api.pokemontcg.io",
  "pokemontcg.io",
  "www.pokemon.com",
  "pokemon.com",
  "pkmncards.com",
  "www.pkmncards.com",
];

// Block private/internal IPs
const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^\[::1\]$/,
  /^\[fd/i,
  /^\[fe80:/i,
];

function isUrlAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    if (BLOCKED_HOSTNAME_PATTERNS.some((p) => p.test(parsed.hostname))) return false;
    if (ALLOWED_SCRAPE_DOMAINS.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))) return true;
    return false;
  } catch {
    return false;
  }
}

async function scrapePageForCardName(url: string): Promise<string | null> {
  if (!isUrlAllowed(url)) return null;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "PokemonShop/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "manual", // Don't follow redirects to prevent SSRF via redirect
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    // Try OpenGraph title
    const ogTitle = $('meta[property="og:title"]').attr("content");
    if (ogTitle) {
      // Strip common suffixes like "- TCGPlayer", "| Bulbapedia"
      return ogTitle
        .replace(/[-|–]\s*(tcgplayer|bulbapedia|cardmarket|pokémon|pokemon).*$/i, "")
        .trim();
    }

    // Try <title>
    const title = $("title").text();
    if (title) {
      return title
        .replace(/[-|–]\s*(tcgplayer|bulbapedia|cardmarket|pokémon|pokemon).*$/i, "")
        .trim()
        .split(/[-|]/)[0]
        .trim();
    }

    return null;
  } catch {
    return null;
  }
}

export async function parseLink(url: string): Promise<ParsedCard | null> {
  // Validate URL format
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (BLOCKED_HOSTNAME_PATTERNS.some((p) => p.test(parsed.hostname))) return null;
  } catch {
    return null;
  }

  // 1. Check if it's a direct Pokemon TCG API URL or contains a card ID
  const tcgId = extractTcgApiId(url);
  if (tcgId) {
    const card = await getCardById(tcgId);
    if (card) {
      card.sourceUrl = url;
      return card;
    }
  }

  // 2. Try to get card name from URL path
  let cardName = extractNameFromUrl(url);

  // 3. If URL extraction didn't give a good name, try scraping the page
  if (!cardName || cardName.length < 3) {
    cardName = await scrapePageForCardName(url);
  } else {
    // Also try scraping to get a better name
    const scrapedName = await scrapePageForCardName(url);
    if (scrapedName && scrapedName.length > cardName.length) {
      cardName = scrapedName;
    }
  }

  if (!cardName) return null;

  // 4. Search Pokemon TCG API with the name
  const card = await searchPokemonTCGApi(cardName);
  if (card) {
    card.sourceUrl = url;
    return card;
  }

  // 5. Try with first word only as fallback
  const firstWord = cardName.split(" ")[0];
  if (firstWord !== cardName) {
    const fallback = await searchPokemonTCGApi(firstWord);
    if (fallback) {
      fallback.sourceUrl = url;
      return fallback;
    }
  }

  return null;
}
