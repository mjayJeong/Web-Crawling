import time
import requests
from bs4 import BeautifulSoup
from typing import List, Dict

NAVER_NEWS_HOME_URL = "https://news.naver.com/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def fetch_news_list(query: str = "", limit: int = 30) -> List[Dict]:
    """
    네이버 뉴스 '홈'에서 기사 {title, url} 목록을 가져온다.
    query는 일단 사용 안 함(키워드별 수집은 다음 단계에서).
    """
    resp = requests.get(NAVER_NEWS_HOME_URL, headers=HEADERS, timeout=10)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    results: List[Dict] = []

    # 1) 메인 뉴스 카드: a.cnf_news_area 안에 strong.cnf_news_title
    for a in soup.select("a.cnf_news_area"):
        title_tag = a.select_one("strong.cnf_news_title")
        url = a.get("href")
        if not title_tag or not url:
            continue

        title = title_tag.get_text(strip=True)
        results.append({"title": title, "url": url})
        if len(results) >= limit:
            time.sleep(1.0)
            return results

    # 2) 카드 내 리스트 뉴스: li.cnf_news_item > a.cnf_news
    for a in soup.select("li.cnf_news_item a.cnf_news"):
        title = a.get_text(strip=True)
        url = a.get("href")
        if not title or not url:
            continue

        results.append({"title": title, "url": url})
        if len(results) >= limit:
            time.sleep(1.0)
            return results

    time.sleep(1.0)
    return results
