"use client";

export default function QuartierModal({
  name,
  names,
  isMine,
  pending,
  onClose,
  onToggle,
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>
        <h2>{name}</h2>
        {names.length === 0 ? (
          <p className="muted">Personne n'a encore sélectionné ce quartier.</p>
        ) : (
          <>
            <p className="muted">
              Sélectionné par {names.length} personne{names.length > 1 ? "s" : ""} :
            </p>
            <div className="chips">
              {names.map((n) => (
                <span key={n} className="chip">
                  {n}
                </span>
              ))}
            </div>
          </>
        )}
        <button
          className={`btn ${isMine ? "danger" : "primary"}`}
          onClick={onToggle}
          disabled={pending}
        >
          {pending
            ? "Enregistrement…"
            : isMine
              ? "Retirer de ma sélection"
              : "Sélectionner ce quartier"}
        </button>
      </div>
    </div>
  );
}
