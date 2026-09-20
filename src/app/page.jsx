import { cookies } from "next/headers";
import { decodeToken } from "@/lib/auth";
import { getState } from "@/lib/db";
import { getLocalGeoJSON, QUARTIERS_API_URL } from "@/lib/quartiers";
import Gate from "@/components/Gate";
import AppView from "@/components/AppView";

export const dynamic = "force-dynamic";

export default async function Home() {
  // 1. Mot de passe ?
  const gate = decodeToken(cookies().get("qt_gate")?.value);
  if (!gate) return <Gate mode="password" />;

  // 2. Identifiant ?
  const user = decodeToken(cookies().get("qt_user")?.value);
  if (!user?.uid || !user?.name) return <Gate mode="name" />;

  // 3. Application
  let state;
  try {
    state = await getState(user.uid);
  } catch (e) {
    return (
      <main className="gate-wrap">
        <div className="card">
          <h1>Configuration incomplète</h1>
          <p className="muted">
            La base de données est inaccessible. Vérifie les variables
            d'environnement <code>SUPABASE_URL</code> et{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>, et que le schéma SQL a été
            exécuté (voir <code>supabase/schema.sql</code>).
          </p>
          <p className="muted detail">{String(e.message ?? e)}</p>
        </div>
      </main>
    );
  }

  const geojson = getLocalGeoJSON();

  return (
    <AppView
      userName={user.name}
      initialByQuartier={state.byQuartier}
      initialMine={state.mine}
      initialGeojson={geojson}
      apiUrl={geojson ? null : QUARTIERS_API_URL}
    />
  );
}
