import Image from "next/image";
import Link from "next/link";
import { images, org } from "@/content/site";

// KEP's logo is artwork on a dark background, so it sits on a black tile.
export function Wordmark({
  href = "/",
  showName = true,
  nameClass = "hidden lg:inline",
}: {
  href?: string;
  showName?: boolean;
  nameClass?: string;
}) {
  return (
    <Link href={href} className="inline-flex items-center gap-3" aria-label={`${org.name} home`}>
      <span className="flex h-10 w-24 items-center overflow-hidden rounded-xl bg-night">
        <Image src={images.logoTile.src} alt="" width={images.logoTile.width} height={images.logoTile.height} className="h-full w-full object-cover" priority />
      </span>
      {showName && (
        <span className={`${nameClass} whitespace-nowrap font-display text-[17px] font-extrabold leading-tight tracking-tight`}>
          Kingdom Empowerment Place
        </span>
      )}
    </Link>
  );
}
