export const metadata = {
  title: "Sign in — Idea Validator",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;
  const safeFrom = from && from.startsWith("/") && !from.startsWith("//") ? from : "/";

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        method="POST"
        action="/api/login"
        className="w-full max-w-[400px] border border-ink p-6 bg-white"
      >
        <div className="text-[10px] tracking-[2px] opacity-60 mb-2">ELUX // INTERNAL</div>
        <h1 className="font-serif text-2xl font-semibold mb-1">Sign in</h1>
        <p className="text-[12px] opacity-60 mb-6">Idea Validator is private. Use your operator credentials.</p>

        {error && (
          <div className="bg-red-50 border border-red-600 px-3 py-2 mb-4 text-[12px]">
            Invalid username or password.
          </div>
        )}

        <input type="hidden" name="from" value={safeFrom} />

        <label className="block mb-4">
          <span className="text-[10px] tracking-[1.5px] opacity-60 block mb-1">USERNAME</span>
          <input
            name="username"
            required
            autoFocus
            autoComplete="username"
            spellCheck={false}
            className="w-full p-2.5 text-[13px] bg-white border border-ink outline-none font-mono"
          />
        </label>

        <label className="block mb-6">
          <span className="text-[10px] tracking-[1.5px] opacity-60 block mb-1">PASSWORD</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full p-2.5 text-[13px] bg-white border border-ink outline-none font-mono"
          />
        </label>

        <button
          type="submit"
          className="bg-ink text-paper px-5 py-2.5 text-[11px] tracking-[2px] border-none w-full"
        >
          SIGN IN
        </button>
      </form>
    </div>
  );
}
