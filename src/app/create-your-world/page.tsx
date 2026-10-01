import { ParadiseGame } from "@/components/paradise/paradise-game";
import { loadParadiseContent } from "@/lib/paradise/content";

// Always read fresh, so content changes in Admin show up right away.
export const dynamic = "force-dynamic";

export default async function ParadisePage() {
  const content = await loadParadiseContent();
  return <ParadiseGame content={content} />;
}
