const BASE_URL = "http://127.0.0.1:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail ? JSON.stringify(data.detail) : JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${detail}`);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export type Keyword = {
  id: number;
  term: string;
  created_at: string;
};

export type Article = {
  id: number;
  keyword_id: number;
  title: string;
  url: string;
  press?: string | null;
  published_at?: string | null;
  snippet?: string | null;
  created_at?: string;
};

export type TrendPoint = {
  date: string;
  count: number;
};

export type CrawlResult = {
  keyword: string;
  fetched: number;
  saved: number;
  skipped_by_keyword?: number;
  skipped_by_dup?: number;
};

export const api = {
  // keywords
  getKeywords: () => request<Keyword[]>("/keywords"),
  createKeyword: (term: string) =>
    request<Keyword>("/keywords", { method: "POST", body: JSON.stringify({ term }) }),
  deleteKeyword: (id: number) => request<{ deleted: boolean }>(`/keywords/${id}`, { method: "DELETE" }),

  // crawl
  crawlKeyword: (id: number) => request<CrawlResult>(`/keywords/${id}/crawl`, { method: "POST" }),

  // articles & trend
  getArticles: (keywordId: number) => request<Article[]>(`/articles?keyword_id=${keywordId}`),
  getTrend: (keywordId: number) => request<TrendPoint[]>(`/trend?keyword_id=${keywordId}`),
};
