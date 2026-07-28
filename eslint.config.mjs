import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "public/sw.js", "db/migrations/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Gebruikerstekst mag nooit in de logs belanden: gebruik lib/logger.ts.
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Scripts draaien in de terminal en mogen wel naar stdout schrijven.
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
  {
    // De logger is de enige plek in de app die zelf mag schrijven.
    files: ["lib/logger.ts"],
    rules: { "no-console": "off" },
  },
];

export default config;
