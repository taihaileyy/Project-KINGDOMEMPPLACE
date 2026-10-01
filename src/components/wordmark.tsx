import Image from "next/image";
import Link from "next/link";
import { images, org } from "@/content/site";

// KEP's full logo (crown, dove and KEP) on a transparent background, so it
// sits on white or black. The spelled-out name follows the text color.
export function Wordmark({
  href = "/",
  showName = true,
  nameClass = "",
  logoClass = "h-11 w-auto",
  priority = true,
}: {
  href?: string;
  showName?: boolean;
  nameClass?: string;
  logoClass?: string;
  priority?: boolean;
}) {
  return (
    <Link href={href} className="inline-flex min-w-0 items-center gap-2.5" aria-label={`${org.name} home`}>
      <Image
        src={images.logoFull.src}
        alt=""
        width={images.logoFull.width}
        height={images.logoFull.height}
        sizes="200px"
        priority={priority}
        className={`shrink-0 ${logoClass}`}
      />
      {showName && (
        <span className={`font-display text-[17px] font-semibold leading-[1.05] sm:text-[19px] ${nameClass}`}>
          Kingdom
          <br />
          Empowerment Place
        </span>
      )}
    </Link>
  );
}
