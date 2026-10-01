import type { Metadata, Viewport } from "next";
import "./paradise.css";

export const metadata: Metadata = {
  title: "Paradise: An Interactive Bible Journey",
  description: "Paradise is an interactive Bible journey from Kingdom Empowerment Place. Test your knowledge, learn the Word and continue the journey.",
};

// Fills the whole screen on phones, including under the browser's own bars.
export const viewport: Viewport = { themeColor: "#04130f", viewportFit: "cover" };

// The game is its own world: no site header or footer.
export default function ParadiseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pd-root" id="main">
      {children}
    </div>
  );
}
