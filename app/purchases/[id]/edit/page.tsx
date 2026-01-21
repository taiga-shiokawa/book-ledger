"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { updatePurchaseAction } from "../../../actions/purchases";
import { supabase } from "../../../lib/supabase";
import { AppHeader } from "../../../components/app-header";

type Purchase = {
  id: string;
  title: string;
  price: number;
  purchasedAt: string;
};

export default function EditPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.replace("/login");
        return;
      }
      if (mounted) {
        setAccessToken(session.access_token);
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!accessToken || !id) {
      return;
    }

    const loadPurchase = async () => {
      setError(null);
      const response = await fetch(`/api/purchases/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        setError("購入情報の取得に失敗しました。");
        return;
      }

      const data = (await response.json()) as { purchase: Purchase };
      setPurchase(data.purchase);
    };

    loadPurchase();
  }, [accessToken, id]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!accessToken || !purchase) {
      setError("ログイン情報が確認できませんでした。");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("accessToken", accessToken);
    formData.set("id", purchase.id);

    startTransition(async () => {
      try {
        await updatePurchaseAction(formData);
        router.push("/purchases");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "更新に失敗しました。";
        setError(message);
      }
    });
  };

  if (!purchase) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
          <p className="text-sm text-slate-300">
            {error ?? "読み込み中..."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <AppHeader title="購入編集" subtitle="入力内容を更新してください。" />

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <label className="block text-sm">
            タイトル
            <input
              type="text"
              name="title"
              required
              minLength={1}
              maxLength={200}
              defaultValue={purchase.title}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="block text-sm">
            価格（JPY）
            <input
              type="number"
              name="price"
              required
              min={0}
              max={9999999}
              step={1}
              defaultValue={purchase.price}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="block text-sm">
            購入日
            <input
              type="date"
              name="purchasedAt"
              required
              defaultValue={purchase.purchasedAt.slice(0, 10)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "更新中..." : "更新"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/purchases")}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
