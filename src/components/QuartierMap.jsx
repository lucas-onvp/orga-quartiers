"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker } from "react-leaflet";
import L from "leaflet";
import { couleurPour, couleurTexteCompteur, MA_SELECTION_BORDURE } from "@/lib/colors";
import { quartierId, quartierName } from "@/lib/quartiers";

/** Centroid visuel : moyenne des points de l'anneau extérieur. */
function centroid(geometry) {
  const ring =
    geometry.type === "Polygon"
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0];
  let x = 0,
    y = 0;
  for (const [lon, lat] of ring) {
    x += lon;
    y += lat;
  }
  return [y / ring.length, x / ring.length];
}

export default function QuartierMap({ geojson, byQuartier, mine, onOpen }) {
  const bounds = useMemo(() => L.geoJSON(geojson).getBounds(), [geojson]);

  // Recrée les couches quand les compteurs changent (peu de quartiers, coût négligeable)
  const layerKey = useMemo(
    () =>
      geojson.features
        .map((f) => `${quartierId(f)}:${(byQuartier[quartierId(f)] ?? []).length}`)
        .join("|") + [...mine].sort().join(","),
    [geojson, byQuartier, mine]
  );

  function style(feature) {
    const id = quartierId(feature);
    const n = (byQuartier[id] ?? []).length;
    const isMine = mine.has(id);
    return {
      color: isMine ? MA_SELECTION_BORDURE : "#ffffff",
      weight: isMine ? 3 : 1,
      fillColor: couleurPour(n),
      fillOpacity: 0.75,
    };
  }

  function onEachFeature(feature, layer) {
    const id = quartierId(feature);
    layer.on("click", () => onOpen(id));
    layer.bindTooltip(quartierName(feature), { sticky: true });
  }

  return (
    <MapContainer bounds={bounds} className="map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        key={layerKey}
        data={geojson}
        style={style}
        onEachFeature={onEachFeature}
      />
      {geojson.features.map((f) => {
        const id = quartierId(f);
        const n = (byQuartier[id] ?? []).length;
        if (n === 0) return null;
        const [lat, lon] = centroid(f.geometry);
        return (
          <Marker
            key={`${id}-${n}`}
            position={[lat, lon]}
            interactive={false}
            icon={L.divIcon({
              className: "q-count",
              html: `<span style="background:${couleurPour(n)};color:${couleurTexteCompteur(n)}">${n}</span>`,
              iconSize: [26, 26],
              iconAnchor: [13, 13],
            })}
          />
        );
      })}
    </MapContainer>
  );
}
