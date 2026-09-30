import { org } from "@/content/site";

// Brand marks drawn inline so they stay crisp and take the footer's color.
const marks: Record<string, React.ReactNode> = {
  facebook: (
    <path d="M9.1 23.7v-8H6.6V12h2.5v-1.6c0-4.1 1.8-6 5.9-6 .8 0 2.1.2 2.6.3v3.3h-1.4c-1.4 0-2 .6-2 2.1V12h3.9l-.7 3.7h-3.2V24C19.4 23.2 24 18.2 24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 5.6 3.9 10.4 9.1 11.7Z" />
  ),
  instagram: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.6" cy="6.4" r="1.3" />
    </>
  ),
  youtube: (
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
  ),
};

export function SocialLinks({ className = "" }: { className?: string }) {
  const links = org.social.filter((s) => s.href);
  if (links.length === 0) return null;
  return (
    <ul className={`flex gap-3 ${className}`}>
      {links.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`KEP on ${s.label}`}
            className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-electric hover:bg-electric/15 hover:text-electric"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
              {marks[s.icon]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
