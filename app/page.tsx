"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";
import { AppHeader } from "./components/app-header";

type Summary = {
  total: number;
  totalCount: number;
  monthTotal: number;
  monthCount: number;
  yearTotal: number;
  yearCount: number;
  month: string;
  year: number;
};

type Purchase = {
  id: string;
  title: string;
  price: number;
  purchasedAt: string;
};

export default function Home() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recent, setRecent] = useState<Purchase[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [limit, setLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [error, setError] = useState<string | null>(null);

  const monthOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const now = new Date();
    for (let i = 0; i < 12; i += 1) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      date.setUTCMonth(date.getUTCMonth() - i);
      const value = date.toISOString().slice(0, 7);
      const label = `${date.getUTCFullYear()}年${String(
        date.getUTCMonth() + 1
      ).padStart(2, "0")}月`;
      options.push({ value, label });
    }
    return options;
  }, []);

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
    if (!accessToken) {
      return;
    }

    const loadSummary = async () => {
      setError(null);
      const params = new URLSearchParams();
      if (selectedMonth) {
        params.set("month", selectedMonth);
        params.set("year", selectedMonth.slice(0, 4));
      }
      const summaryUrl = params.toString()
        ? `/api/summary?${params.toString()}`
        : "/api/summary";
      const summaryRes = await fetch(summaryUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!summaryRes.ok) {
        setError("集計データの取得に失敗しました。");
        return;
      }
      const summaryData = (await summaryRes.json()) as Summary;

      setSummary(summaryData);
    };

    loadSummary();
  }, [accessToken, selectedMonth]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const loadPurchases = async () => {
      setError(null);
      const effectiveLimit = Math.min(limit + 1, 100);
      const purchasesRes = await fetch(
        `/api/purchases?limit=${effectiveLimit}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!purchasesRes.ok) {
        setError("購入履歴の取得に失敗しました。");
        setIsLoadingMore(false);
        return;
      }

      const purchasesData = (await purchasesRes.json()) as {
        purchases: Purchase[];
      };
      const nextHasMore =
        purchasesData.purchases.length > limit && limit < 100;

      setRecent(purchasesData.purchases.slice(0, limit));
      setHasMore(nextHasMore);
      setIsLoadingMore(false);
    };

    loadPurchases();
  }, [accessToken, limit]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
        <AppHeader title="ダッシュボード" />

        {error ? (
          <p className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <label className="flex flex-col text-xs text-slate-300">
              集計対象の月
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="mt-2 w-56 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6">
            <p className="text-sm text-slate-400">トータル</p>
            <p className="mt-3 text-3xl font-semibold">
              {summary ? summary.total.toLocaleString("ja-JP") : "--"}円
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {summary
                ? `全期間・${summary.totalCount.toLocaleString("ja-JP")}冊`
                : "読み込み中..."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6">
            <p className="text-sm text-slate-400">今月合計</p>
            <p className="mt-3 text-3xl font-semibold">
              {summary ? summary.monthTotal.toLocaleString("ja-JP") : "--"}円
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {summary
                ? `${summary.month} 集計・${summary.monthCount.toLocaleString(
                    "ja-JP"
                  )}冊`
                : "読み込み中..."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6">
            <p className="text-sm text-slate-400">今年合計</p>
            <p className="mt-3 text-3xl font-semibold">
              {summary ? summary.yearTotal.toLocaleString("ja-JP") : "--"}円
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {summary
                ? `${summary.year} 年集計・${summary.yearCount.toLocaleString(
                    "ja-JP"
                  )}冊`
                : "読み込み中..."}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">最近の購入</h2>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-300">
              まだ購入履歴がありません。
            </p>
          ) : (
            <ul className="space-y-3">
              {recent.map((purchase) => (
                <li
                  key={purchase.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{purchase.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(purchase.purchasedAt).toLocaleDateString(
                        "ja-JP"
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {purchase.price.toLocaleString("ja-JP")}円
                  </span>
                </li>
              ))}
            </ul>
          )}

          {hasMore ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={() => {
                  setIsLoadingMore(true);
                  setLimit((prev) => Math.min(prev + 10, 100));
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingMore ? "読み込み中..." : "読み込み"}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
