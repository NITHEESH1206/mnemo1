import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Satoshi (Fontshare) — same display face the Feru AI site uses.
// The family ships 500/700/900; 600/800 don't exist in Satoshi.
const weights = ["500", "700", "900"] as const;

for (const weight of weights) {
  loadFont({
    family: "Satoshi",
    url: staticFile(`fonts/satoshi-${weight}.woff2`),
    weight,
  });
}
