import { GamePlaceholder } from "@/components/paradise/game-stage";

// ── The one place to connect the Paradise game ──────────────────────────────
// Pick a mode below. The page, the frame and the layout never need to change.
//
//   "placeholder"  the "Coming Soon" panel (default)
//   "iframe"       a hosted or embedded web game: set `iframeSrc`
//   "component"    a React component: import it and return it from the
//                  `component` branch below (add "use client" in that file if it
//                  uses state or browser APIs)

type Mode = "placeholder" | "iframe" | "component";

const mode: Mode = "placeholder";
const iframeSrc = ""; // e.g. "https://play.example.com/paradise"
const iframeTitle = "Paradise: an interactive Bible experience";

export function ParadiseGame() {
  if (mode === "iframe" && iframeSrc) {
    return (
      <iframe
        src={iframeSrc}
        title={iframeTitle}
        className="absolute inset-0 size-full border-0"
        allow="fullscreen; autoplay; gamepad; clipboard-write"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  if (mode === "component") {
    // import { MyGame } from "@/components/paradise/my-game";
    // return <MyGame />;
  }
  return <GamePlaceholder />;
}
