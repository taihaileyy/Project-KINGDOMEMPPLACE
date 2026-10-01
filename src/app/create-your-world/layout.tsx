import type { Metadata, Viewport } from "next";
import "./paradise.css";

export const metadata: Metadata = {
  title: "Create Your World: An Interactive Bible Journey",
  description: "Create Your World is an interactive Bible journey from Kingdom Empowerment Place, beginning in Paradise. Test your knowledge, learn the Word and continue the journey.",
};

// Fills the whole screen on phones, including under the browser's own bars.
export const viewport: Viewport = { themeColor: "#04130f", viewportFit: "cover" };

// Create Your World is its own world: no site header or footer.
export default function ParadiseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pd-root" id="main">
      {children}
    </div>
  );
}
