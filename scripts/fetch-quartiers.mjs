// Télécharge les contours officiels des quartiers de démocratie locale
// de Toulouse (Toulouse Métropole Open Data) vers src/data/quartiers.geojson.
// Node 18+ requis (fetch natif). Exécuter : npm run fetch-quartiers

import { writeFile, mkdir } from "node:fs/promises";

const GEOJSON_URL =
  "https://data.toulouse-metropole.fr/api/explore/v2.1/catalog/datasets/quartiers-de-democratie-locale/exports/geojson?lang=fr&timezone=Europe%2FParis";

const res = await fetch(GEOJSON_URL);
if (!res.ok) {
  console.error(`Échec du téléchargement : HTTP ${res.status}`);
  process.exit(1);
}
const geojson = await res.json();

await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../src/data/quartiers.geojson", import.meta.url),
  JSON.stringify(geojson)
);
console.log(`OK : ${geojson.features?.length ?? 0} quartiers enregistrés dans src/data/quartiers.geojson`);
