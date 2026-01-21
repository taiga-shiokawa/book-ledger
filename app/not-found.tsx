import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          404 Not Found
        </p>
        <h1 className="text-3xl font-semibold">
          お探しのページが見つかりませんでした
        </h1>
        <p className="text-sm text-slate-300">
          URLが正しいか確認するか、ダッシュボードへ戻ってください。
        </p>
        <Link
          href="/"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
        >
          ダッシュボードへ戻る
        </Link>
      </div>
    </main>
  );
}
