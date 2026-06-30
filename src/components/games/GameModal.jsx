import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export const GameModal = ({ game, onClose }) => {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!game) return;

    // Remember what had focus so we can restore it on close.
    previouslyFocused.current = document.activeElement;

    const dialog = dialogRef.current;
    const getFocusable = () =>
      dialog
        ? Array.from(
            dialog.querySelectorAll(
              'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];

    // Move focus into the dialog.
    const focusable = getFocusable();
    (focusable[0] || dialog)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const items = getFocusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the trigger when the dialog unmounts.
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [game, onClose]);

  if (!game) return null;

  const logo = game.logo || game.externalLogoUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-3xl bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm z-10 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5 text-purple-300" />
        </button>

        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-500 to-cyan-500">
            {logo ? (
              <img
                src={logo}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white">{game.name}</div>
            )}
          </div>

          <div className="flex-1">
            <h2 id="game-modal-title" className="text-2xl font-bold text-white">{game.name}</h2>
            <p className="text-gray-400 mt-1">
              {game.genre} • {game.esrb}
            </p>

            <p className="text-gray-300 mt-4">{game.description}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-purple-300 font-semibold">
                  Players
                </h4>
                <p className="text-gray-300 text-sm mt-1">
                  {game.isTeamBased
                    ? `${game.minPlayersPerTeam || "?"}–${
                        game.maxPlayersPerTeam || "?"
                      } per team`
                    : `${
                        game.minPlayersIndividual || "1"
                      } player (individual event)`}
                  {game.substitutesAllowed ? ` • Substitutes: Yes` : ""}
                </p>
              </div>

              <div>
                <h4 className="text-sm text-purple-300 font-semibold">
                  Pricing
                </h4>
                <p className="text-gray-300 text-sm mt-1">
                  {game.pricing?.costPerTeam
                    ? `$${game.pricing.costPerTeam} per team`
                    : ""}
                  {game.pricing?.costPerPlayer
                    ? `${game.pricing?.costPerTeam ? " • " : ""}$${
                        game.pricing.costPerPlayer
                      } per player`
                    : ""}
                  {!game.pricing?.costPerTeam &&
                    !game.pricing?.costPerPlayer &&
                    "TBD"}
                </p>
                {game.pricing?.notes && (
                  <p className="text-gray-400 text-xs mt-1">
                    {game.pricing.notes}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm text-purple-300 font-semibold">
                  Season & Format
                </h4>
                <p className="text-gray-300 text-sm mt-1">
                  {Array.isArray(game.seasonAvailability)
                    ? game.seasonAvailability.join(", ")
                    : "TBD"}
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  Regular: {game.matchFormat?.regularSeason || "TBD"} • Post:{" "}
                  {game.matchFormat?.postSeason || "TBD"}
                </p>
              </div>

              <div>
                <h4 className="text-sm text-purple-300 font-semibold">
                  Platform & Time
                </h4>
                <p className="text-gray-300 text-sm mt-1">
                  {(game.platforms || []).join(", ") || "TBD"}
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  Avg match:{" "}
                  {game.typicalMatchLengthMinutes
                    ? `${game.typicalMatchLengthMinutes} min`
                    : "TBD"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm text-purple-300 font-semibold">
                Equipment Requirements
              </h4>
              <ul className="list-disc ml-5 mt-2 text-gray-300 text-sm">
                {(game.equipmentRequirements || []).length > 0 ? (
                  game.equipmentRequirements.map((e, i) => <li key={i}>{e}</li>)
                ) : (
                  <li>TBD</li>
                )}
              </ul>
            </div>

            {game.supportedBy && (
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded overflow-hidden bg-slate-800 flex items-center justify-center">
                  {game.supportedBy.logo ? (
                    <img
                      src={game.supportedBy.logo}
                      alt={game.supportedBy.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white">{game.supportedBy.name}</span>
                  )}
                </div>
                <div>
                  <p className="text-gray-300 text-sm">
                    Supported by <strong>{game.supportedBy.name}</strong>
                  </p>
                  {game.supportedBy.website && (
                    <a
                      href={game.supportedBy.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 text-sm underline"
                    >
                      {game.supportedBy.website}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {game.rulesAnchor && (
            <a
              href={`/rules#${game.rulesAnchor}`}
              className="px-4 py-2 bg-slate-800 rounded-lg text-white border border-purple-500/30 hover:bg-slate-700 transition-all"
            >
              Jump to Rules
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
