"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { deletePurchaseAction } from "../actions/purchases";
import { AppHeader } from "../components/app-header";
import Link from "next/link";

export default function PurchasesPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<
    Array<{
      id: string;
      title: string;
      price: number;
      tags: string[];
      purchasedAt: string;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setAccessToken(session.access_token);
        setChecking(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadPurchases = async () => {
      setError(null);
      const params = new URLSearchParams();
      if (tagFilter.trim()) {
        params.set("tag", tagFilter.trim());
      }
      const url = params.toString()
        ? `/api/purchases?${params.toString()}`
        : "/api/purchases";
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        setError("一覧の取得に失敗しました。");
        return;
      }

      const data = (await response.json()) as {
        purchases: Array<{
          id: string;
          title: string;
          price: number;
          tags: string[];
          purchasedAt: string;
        }>;
      };

      setPurchases(data.purchases);
    };

    loadPurchases();
  }, [accessToken, tagFilter]);

  const handleDelete = (id: string) => {
    if (!accessToken) {
      setError("ログイン情報が確認できませんでした。");
      return;
    }

    const confirmed = window.confirm("この購入を削除しますか？");
    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("accessToken", accessToken);
    formData.set("id", id);

    startTransition(async () => {
      try {
        await deletePurchaseAction(formData);
        setPurchases((prev) => prev.filter((purchase) => purchase.id !== id));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "削除に失敗しました。";
        setError(message);
      }
    });
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
          <p className="text-sm text-slate-300">読み込み中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <AppHeader title="購入一覧" />

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          {error ? (
            <p className="mb-4 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          ) : null}

          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col text-xs text-slate-300">
              タグで絞り込み
              <input
                type="text"
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                placeholder="例: 新潮文庫100冊"
                className="mt-2 w-64 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setTagFilter("")}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-slate-500"
            >
              クリア
            </button>
          </div>

          {purchases.length === 0 ? (
            <p className="text-sm text-slate-200">購入履歴がありません。</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">タイトル</th>
                    <th className="px-4 py-3 text-right">価格</th>
                    <th className="px-4 py-3 text-left">タグ</th>
                    <th className="px-4 py-3 text-left">購入日</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-3">{purchase.title}</td>
                      <td className="px-4 py-3 text-right">
                        {purchase.price.toLocaleString("ja-JP")}円
                      </td>
                      <td className="px-4 py-3">
                        {purchase.tags.length > 0
                          ? purchase.tags.join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(purchase.purchasedAt).toLocaleDateString(
                          "ja-JP"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/purchases/${purchase.id}/edit`}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500"
                          >
                            編集
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(purchase.id)}
                            className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs text-rose-200 transition hover:border-rose-300"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
