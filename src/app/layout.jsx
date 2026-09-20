import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata = {
  title: "Quartiers de Toulouse — sélection",
  description:
    "Sélection collaborative des quartiers de démocratie locale de Toulouse",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
