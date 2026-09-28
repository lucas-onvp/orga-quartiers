// ═══════════════════════════════════════════════════════════════
//   COULEURS — modifie librement les valeurs ci-dessous.
//   Elles sont utilisées à la fois par la carte et par la liste.
// ═══════════════════════════════════════════════════════════════

export const COLORS = {
  /** Quartier sans aucune sélection */
  aucuneSelection: "#94a3b8", // gris bleuté
  /** Sélectionné par exactement 1 personne — rouge clair */
  unePersonne: "#fca5a5",
  /** Sélectionné par 2 personnes ou plus — rouge foncé */
  plusieursPersonnes: "#b91c1c",
};

/** Couleur de la bordure des quartiers que TU as sélectionnés */
export const MA_SELECTION_BORDURE = "#2563eb";

/** Couleur du chiffre (compteur) affiché sur chaque quartier */
export const COMPTEUR_TEXTES = {
  unePersonne: "#7f1d1d",       // texte foncé sur rouge clair
  plusieursPersonnes: "#ffffff" // texte blanc sur rouge foncé
};

export function couleurPour(nbPersonnes) {
  if (nbPersonnes <= 0) return COLORS.aucuneSelection;
  if (nbPersonnes === 1) return COLORS.unePersonne;
  return COLORS.plusieursPersonnes;
}

export function couleurTexteCompteur(nbPersonnes) {
  return nbPersonnes === 1
    ? COMPTEUR_TEXTES.unePersonne
    : COMPTEUR_TEXTES.plusieursPersonnes;
}
