import Link from "next/link";

export default function Header({ username }: { username: string | null }) {
  return (
    <header className="border-b border-ink bg-paper sticky top-0 z-10">
      <div className="max-w-[1100px] mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-baseline gap-3 no-underline text-ink">
          <span className="text-[11px] tracking-[2px] opacity-60">ELUX // INTERNAL</span>
          <span className="font-sans text-xl font-semibold">Idea Validator</span>
          <span className="text-[11px] opacity-50">v1.0</span>
        </Link>
        {username && (
          <nav className="flex gap-1 items-center">
            <Link
              href="/"
              className="px-3 py-1.5 text-[11px] tracking-[1.5px] border border-transparent hover:border-ink no-underline text-ink"
            >
              NEW
            </Link>
            <Link
              href="/runs"
              className="px-3 py-1.5 text-[11px] tracking-[1.5px] border border-transparent hover:border-ink no-underline text-ink"
            >
              RUNS
            </Link>
            <span className="px-3 text-[11px] tracking-[1.5px] opacity-50">
              {username.toUpperCase()}
            </span>
            <form method="POST" action="/api/logout" className="m-0">
              <button
                type="submit"
                className="px-3 py-1.5 text-[11px] tracking-[1.5px] border border-transparent hover:border-ink bg-transparent text-ink"
              >
                LOGOUT
              </button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
