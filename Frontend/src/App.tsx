import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { Article, Keyword, TrendPoint } from "./api";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Status = { type: "idle" | "loading" | "ok" | "error"; message: string };

function cn(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function App() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  const [termInput, setTermInput] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle", message: "Ready" });

  const selectedKeyword = useMemo(
    () => keywords.find((k) => k.id === selectedKeywordId) ?? null,
    [keywords, selectedKeywordId]
  );

  async function loadKeywords(selectFirst = false) {
    const list = await api.getKeywords();
    setKeywords(list);

    if (selectFirst && list.length > 0 && selectedKeywordId == null) {
      setSelectedKeywordId(list[0].id);
    }
  }

  async function loadArticlesAndTrend(keywordId: number | null) {
    if (!keywordId) {
      setArticles([]);
      setTrend([]);
      return;
    }

    const [a, t] = await Promise.all([api.getArticles(keywordId), api.getTrend(keywordId)]);
    setArticles(a);
    setTrend(t);
  }

  // initial load
  useEffect(() => {
    (async () => {
      try {
        setStatus({ type: "loading", message: "Loading keywords..." });
        await loadKeywords(true);
        setStatus({ type: "ok", message: "Ready" });
      } catch (e: any) {
        setStatus({ type: "error", message: e.message });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when keyword changes
  useEffect(() => {
    (async () => {
      try {
        setStatus({ type: "loading", message: "Loading articles & trend..." });
        await loadArticlesAndTrend(selectedKeywordId);
        setStatus({ type: "ok", message: "Ready" });
      } catch (e: any) {
        setStatus({ type: "error", message: e.message });
      }
    })();
  }, [selectedKeywordId]);

  async function onAddKeyword() {
    const term = termInput.trim();
    if (!term) return;

    try {
      setStatus({ type: "loading", message: "Creating keyword..." });
      await api.createKeyword(term);
      setTermInput("");
      await loadKeywords();
      setStatus({ type: "ok", message: "Created" });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  }

  async function onDeleteKeyword(id: number) {
    try {
      setStatus({ type: "loading", message: "Deleting keyword..." });
      await api.deleteKeyword(id);

      if (selectedKeywordId === id) setSelectedKeywordId(null);
      await loadKeywords(true);

      setStatus({ type: "ok", message: "Deleted" });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  }

  async function onCrawlKeyword(id: number) {
    try {
      setStatus({ type: "loading", message: "Crawling..." });
      const r = await api.crawlKeyword(id);
      setStatus({
        type: "ok",
        message: `Crawl done: fetched=${r.fetched}, saved=${r.saved}, skipped_by_keyword=${r.skipped_by_keyword ?? "?"}`,
      });

      await loadArticlesAndTrend(id);
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-6xl items-baseline justify-between px-4 py-4">
        <div className="text-lg font-bold">News Dashboard</div>
        <div
          className={cn(
            "text-sm",
            status.type === "loading" && "text-yellow-200",
            status.type === "error" && "text-red-300",
            (status.type === "ok" || status.type === "idle") && "text-slate-300"
          )}
        >
          {status.type === "loading" ? "Working... " : ""}
          {status.message}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 pb-6 md:grid-cols-[340px_1fr]">
        {/* LEFT: Keywords */}
        <section className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
          <h2 className="mb-2 text-sm font-semibold">Keywords</h2>

          <div className="mb-3 flex gap-2">
            <input
              className="h-9 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm outline-none focus:border-white/20"
              value={termInput}
              onChange={(e) => setTermInput(e.target.value)}
              placeholder="예: 인공지능"
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddKeyword();
              }}
            />
            <button
              className="h-9 shrink-0 rounded-lg border border-white/10 bg-slate-800 px-3 text-sm hover:bg-slate-700"
              onClick={onAddKeyword}
            >
              Add
            </button>
          </div>

          <div className="max-h-[540px] space-y-2 overflow-auto pr-1">
            {keywords.map((k) => (
              <div
                key={k.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border p-3",
                  selectedKeywordId === k.id
                    ? "border-white/25 bg-slate-950"
                    : "border-white/10 bg-slate-950/50 hover:border-white/20"
                )}
                onClick={() => setSelectedKeywordId(k.id)}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm">
                    <span className="mr-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                      #{k.id}
                    </span>
                    {k.term}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{k.created_at}</div>
                </div>

                <div className="ml-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs hover:border-white/20"
                    onClick={() => onCrawlKeyword(k.id)}
                  >
                    Crawl
                  </button>
                  <button
                    className="rounded-lg border border-red-400/20 bg-red-900/20 px-2 py-1 text-xs text-red-200 hover:bg-red-900/30"
                    onClick={() => onDeleteKeyword(k.id)}
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}

            {keywords.length === 0 && (
              <div className="text-sm text-slate-400">No keywords yet.</div>
            )}
          </div>
        </section>

        {/* RIGHT */}
        <section className="space-y-3">
          {/* Trend */}
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Trend</h2>
              <div className="text-xs text-slate-400">
                {selectedKeyword ? selectedKeyword.term : "No keyword selected"}
              </div>
            </div>

            <div className="h-[240px] rounded-lg border border-white/10 bg-slate-950 p-2">
              {trend.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No trend data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Articles */}
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            <h2 className="mb-2 text-sm font-semibold">
              {selectedKeyword ? `Articles for "${selectedKeyword.term}"` : "Articles"}
            </h2>

            {articles.length === 0 ? (
              <div className="text-sm text-slate-400">No articles</div>
            ) : (
              <div className="space-y-2">
                {articles.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-white/10 bg-slate-950/50 p-3 hover:border-white/20"
                  >
                    <div className="text-sm">{a.title}</div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <span className="rounded-full bg-white/10 px-2 py-0.5">#{a.id}</span>
                      <span>keyword_id: {a.keyword_id}</span>
                    </div>
                    <div className="mt-2 break-all text-xs text-slate-500">{a.url}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
