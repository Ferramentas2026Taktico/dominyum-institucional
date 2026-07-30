import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-carbon px-6 pb-24 pt-32 md:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-sans text-sm text-limestone/50 transition-colors hover:text-sage"
        >
          ← Voltar ao site
        </Link>
        <div className="legal-content mt-10">{children}</div>
      </div>
    </main>
  );
}