import fs from "node:fs/promises";
import path from "node:path";

export async function getRandomQuote() {
  const quotesPath = path.join(process.cwd(), "public", "quotes.json");
  const raw = await fs.readFile(quotesPath, "utf8");
  const quotes = JSON.parse(raw);
  const keys = Object.keys(quotes);

  if (!keys.length) {
    return null;
  }

  const key = keys[Math.floor(Math.random() * keys.length)];
  return quotes[key];
}