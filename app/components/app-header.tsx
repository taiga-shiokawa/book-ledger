"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUserEmail(data.session?.user.email ?? null);
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.replace("/login");
    });
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Book Ledger
        </p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-slate-300">{subtitle}</p>
        ) : null}
        {userEmail ? (
          <p className="text-xs text-slate-500">{userEmail}</p>
        ) : null}
      </div>
      <div className="hidden flex-wrap items-center gap-3 sm:flex">
        <Link
          href="/"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
        >
          集計
        </Link>
        <Link
          href="/purchases"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
        >
          一覧
        </Link>
        <Link
          href="/new"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
        >
          新規登録
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "ログアウト中..." : "ログアウト"}
        </button>
      </div>
      <div className="flex items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500"
          aria-expanded={isMenuOpen}
          aria-label="メニューを開閉"
        >
          {isMenuOpen ? "閉じる" : "メニュー"}
        </button>
      </div>
      {isMenuOpen ? (
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:hidden">
          <nav className="grid gap-2 text-sm">
            <Link
              href="/"
              className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 transition hover:border-slate-500"
              onClick={() => setIsMenuOpen(false)}
            >
              集計
            </Link>
            <Link
              href="/purchases"
              className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 transition hover:border-slate-500"
              onClick={() => setIsMenuOpen(false)}
            >
              一覧
            </Link>
            <Link
              href="/new"
              className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-900 transition hover:bg-white"
              onClick={() => setIsMenuOpen(false)}
            >
              新規登録
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              disabled={isPending}
              className="rounded-lg border border-slate-700 px-3 py-2 text-left text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "ログアウト中..." : "ログアウト"}
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
