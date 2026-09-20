import fs from "fs";
import path from "path";

export const QUARTIERS_API_URL =
  "https://data.toulouse-metropole.fr/api/explore/v2.1/catalog/datasets/quartiers-de-democratie-locale/exports/geojson?lang=fr&timezone=Europe%2FParis";

/** GeoJSON local (src/data/quartiers.geojson) ou null s'il est absent. */
export function getLocalGeoJSON() {
  try {
    const p = path.join(process.cwd(), "src", "data", "quartiers.geojson");
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/** Identifiant stable d'un quartier (dataset officiel : champ "quartier"). */
export function quartierId(feature) {
  const p = feature?.properties ?? {};
  return String(p.quartier ?? p.code ?? p.id ?? "");
}

/** Nom d'affichage d'un quartier. */
export function quartierName(feature) {
  const p = feature?.properties ?? {};
  return p.nom_quartier ?? p.nom ?? p.name ?? "Quartier";
}

/** Liste triée [{ id, name }] à partir d'un GeoJSON. */
export function quartierList(geojson) {
  return (geojson?.features ?? [])
    .map((f) => ({ id: quartierId(f), name: quartierName(f) }))
    .filter((q) => q.id)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
