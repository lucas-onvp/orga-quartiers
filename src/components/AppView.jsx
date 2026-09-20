"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import QuartierModal from "./QuartierModal";
import { COLORS, couleurPour } from "@/lib/colors";
import { quartierList, quartierName } from "@/lib/quartiers";

const QuartierMap = dynamic(() => import("./QuartierMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Chargement de la carte…</div>,
});

export default function AppView({
  userName,
  initialByQuartier,
  initialMine,
  initialGeojson,
  apiUrl,
}) {
  const [geojson, setGeojson] = useState(initialGeojson);
  const [geoError, setGeoError] = useState(null);
  const [byQuartier, setByQuartier] = useState(initialByQuartier);
  const [mine, setMine] = useState(new Set(initialMine));
  const [view, setView] = useState("carte");
  const [openId, setOpenId] = useState(null);
  const [pending, setPending] = useState(false);

  // GeoJSON non embarqué → téléchargement côté client depuis l'API officielle
  useEffect(() => {
    if (geojson || !apiUrl) return;
    fetch(apiUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setGeojson)
      .catch((e) =>
        setGeoError(
          `Impossible de charger les contours des quartiers (${e.message}). Relance « npm run fetch-quartiers » puis redéploie.`
        )
      );
  }, [geojson, apiUrl]);

  // Rechargement automatique toutes les 60 s pour voir les sélections des autres
  const refresh = useCallback(async () => {
    const r = await fetch("/api/state");
    if (!r.ok) return;
    const d = await r.json();
    setByQuartier(d.byQuartier);
    setMine(new Set(d.mine));
  }, []);
  useEffect(() => {
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, [refresh]);

  async function mutate(quartierId, action) {
    if (pending) return;
    setPending(true);
    const r = await fetch("/api/selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quartierId, action }),
    });
    if (r.ok) {
      const d = await r.json();
      setByQuartier(d.byQuartier);
      setMine(new Set(d.mine));
    }
    setPending(false);
  }

  const quartiers = useMemo(() => quartierList(geojson), [geojson]);
  const openFeature = useMemo(
    () => geojson?.features?.find((f) => String(f.properties?.quartier) === openId) ?? null,
    [geojson, openId]
  );

  const nbMoi = mine.size;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <h1>Quartiers de Toulouse</h1>
          <span className="who">connecté·e en tant que <strong>{userName}</strong> — {nbMoi} quartier{nbMoi > 1 ? "s" : ""} dans ma sélection</span>
        </div>
        <div className="topbar-right">
          <div className="segmented" role="tablist">
            <button
              className={view === "carte" ? "active" : ""}
              onClick={() => setView("carte")}
            >
              🗺️ Carte
            </button>
            <button
              className={view === "liste" ? "active" : ""}
              onClick={() => setView("liste")}
            >
              ☰ Liste
            </button>
          </div>
          <button className="btn" onClick={refresh} title="Actualiser">
            ⟳
          </button>
        </div>
      </header>

      <div className="legend">
        <span>
          <i style={{ background: COLORS.aucuneSelection }} /> 0
        </span>
        <span>
          <i style={{ background: COLORS.unePersonne }} /> 1 personne
        </span>
        <span>
          <i style={{ background: COLORS.plusieursPersonnes }} /> 2+ personnes
        </span>
        <span>
          <i className="ring" style={{ borderColor: "#2563eb" }} /> ma sélection
        </span>
      </div>

      {geoError && <p className="error banner">{geoError}</p>}

      {!geojson && !geoError ? (
        <div className="map-loading">Chargement des quartiers…</div>
      ) : view === "carte" ? (
        <div className="map-wrap">
          <QuartierMap
            geojson={geojson}
            byQuartier={byQuartier}
            mine={mine}
            onOpen={setOpenId}
          />
        </div>
      ) : (
        <ul className="q-list">
          {quartiers.map((q) => {
            const names = byQuartier[q.id] ?? [];
            const isMine = mine.has(q.id);
            return (
              <li key={q.id}>
                <button className="q-row" onClick={() => setOpenId(q.id)}>
                  <i
                    className="dot"
                    style={{
                      background: couleurPour(names.length),
                      outline: isMine ? "2px solid #2563eb" : "none",
                    }}
                  />
                  <span className="q-name">{q.name}</span>
                  {isMine && <span className="tag-mine">mien</span>}
                  {names.length > 0 && (
                    <span
                      className="badge"
                      style={{
                        background: couleurPour(names.length),
                        color: names.length === 1 ? "#7f1d1d" : "#fff",
                      }}
                    >
                      {names.length}
                    </span>
                  )}
                  <span className="chevron">›</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {openId && (
        <QuartierModal
          name={openFeature ? quartierName(openFeature) : "Quartier"}
          names={byQuartier[openId] ?? []}
          isMine={mine.has(openId)}
          pending={pending}
          onClose={() => setOpenId(null)}
          onToggle={() =>
            mutate(openId, mine.has(openId) ? "deselect" : "select")
          }
        />
      )}
    </div>
  );
}
