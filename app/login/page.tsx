"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const { error: authError } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({
              email,
              password,
            })
          : await supabase.auth.signUp({
              email,
              password,
            });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (mode === "login") {
        router.push("/purchases");
        return;
      }

      setShowSignupModal(true);
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            {mode === "login" ? "ログイン" : "新規登録"}
          </h1>
          <p className="text-sm text-slate-300">
            書籍購入費用を安全に記録するための認証画面です。
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <div className="mb-6 flex rounded-lg border border-slate-800 bg-slate-900 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md px-3 py-2 transition ${
                mode === "login"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md px-3 py-2 transition ${
                mode === "signup"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              新規登録
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm">
              メールアドレス
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
              />
            </label>

            <label className="block text-sm">
              パスワード
              <input
                type="password"
                name="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
              />
            </label>

            {error ? (
              <p className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "処理中..."
                : mode === "login"
                ? "ログイン"
                : "新規登録"}
            </button>
          </form>
        </div>
      </div>

      {showSignupModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              メールを送信しました
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              登録したメールアドレス宛に確認メールを送信しました。
              メール内のリンクをクリックして、登録を完了してください。
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSignupModal(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
