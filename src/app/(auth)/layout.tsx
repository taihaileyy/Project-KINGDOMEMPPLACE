import { Wordmark } from "@/components/wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto flex max-w-6xl items-center px-4 py-5 sm:px-6">
        <Wordmark />
      </header>
      <main id="main" className="mx-auto grid max-w-md px-4 pb-16 pt-6 sm:pt-12">
        {children}
      </main>
    </div>
  );
}
