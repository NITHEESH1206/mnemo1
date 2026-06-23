// Generate a photoshoot-quality grass hero image via OpenAI, save to public/grass.jpg
// Reads OPENAI_API_KEY from .env.local. Usage: node scripts/gen-grass.mjs
import { readFileSync, writeFileSync } from "node:fs";

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv(new URL("../.env.local", import.meta.url));
const key = env.OPENAI_API_KEY;
if (!key) {
  console.error("OPENAI_API_KEY is empty in .env.local — paste it there first.");
  process.exit(1);
}

const prompt =
  "Ultra-photorealistic professional photograph of a lush vibrant green grass meadow at golden hour. " +
  "Extremely shallow depth of field with dreamy creamy bokeh, soft warm low morning sunlight raking across the blades, " +
  "delicate dew drops catching the light, gentle hazy atmospheric backlight glow, soft out-of-focus background. " +
  "Calm, premium, dreamy, cinematic mood. Looks like a high-end magazine photoshoot shot on a Sony A7R V with an 85mm f/1.4 prime lens. " +
  "Crisp foreground blades, natural filmic color grade, beautiful soft light, the upper portion airy and slightly lighter. " +
  "Landscape orientation, no text, no people.";

async function gen(model, body) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, n: 1, ...body }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

console.log("Generating with gpt-image-1 …");
let r = await gen("gpt-image-1", {
  size: "1536x1024",
  quality: "high",
  output_format: "jpeg",
});

// Fallback to dall-e-3 if the account can't use gpt-image-1.
if (!r.ok) {
  console.log("gpt-image-1 unavailable (", r.status, JSON.stringify(r.data).slice(0, 160), ") — trying dall-e-3 …");
  r = await gen("dall-e-3", { size: "1792x1024", quality: "hd", response_format: "b64_json" });
}

if (!r.ok) {
  console.error("Image generation failed:", r.status, JSON.stringify(r.data).slice(0, 400));
  process.exit(1);
}

const b64 = r.data?.data?.[0]?.b64_json;
if (!b64) {
  console.error("No image in response:", JSON.stringify(r.data).slice(0, 400));
  process.exit(1);
}
const buf = Buffer.from(b64, "base64");
writeFileSync(new URL("../public/grass.jpg", import.meta.url), buf);
console.log(`Saved public/grass.jpg (${(buf.length / 1024).toFixed(0)} KB)`);
