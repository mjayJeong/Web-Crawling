from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine, get_db
from . import models, schemas
from .services.naver_news import fetch_news_list
from .services.trend import count_articles_by_day_created


# 서버 시작할 때 테이블이 없으면 자동 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(title="News Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite 기본
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 테스트 용도
@app.get("/health")
def health():
    return {"ok": True}

# 키워드 추가 
@app.post("/keywords", response_model=schemas.KeywordOut)
def create_keyword(payload: schemas.KeywordCreate, db: Session = Depends(get_db)):
    term = payload.term.strip()
    if not term:
        raise HTTPException(status_coe=400, detail="term is empty")

    # 중복 확인
    exists = db.query(models.Keyword).filter(models.Keyword.term == term).first()
    if exists:
        return exists
    
    kw = models.Keyword(term=term)
    db.add(kw)      # DB에 추가 예약
    db.commit()     # 실제 저장
    db.refresh(kw)  # 저장된 결과 불러오기
    return kw

# 키워드 목록 조회
@app.get("/keywords", response_model=List[schemas.KeywordOut])
def list_keywords(db: Session = Depends(get_db)):
    return db.query(models.Keyword).order_by(models.Keyword.id.desc()).all()


@app.post("/keywords/{keyword_id}/crawl")
def crawl_keyword(keyword_id: int, db: Session = Depends(get_db)):
    kw = db.query(models.Keyword).filter(models.Keyword.id == keyword_id).first()
    if not kw:
        raise HTTPException(status_code=404, detail="keyword not found")

    items = fetch_news_list(query=kw.term, limit=50)

    saved = 0
    skipped_by_keyword = 0
    skipped_by_dup = 0

    for it in items:
        title = it.get("title", "")
        url = it.get("url", "")

        # 키워드 필터 (루프 안 / 제일 먼저)
        if kw.term not in title:
            skipped_by_keyword += 1
            continue

        # 중복 필터
        exists = db.query(models.Article).filter(models.Article.url == url).first()
        if exists:
            skipped_by_dup += 1
            continue

        art = models.Article(
            keyword_id=kw.id,
            title=title,
            url=url,
        )
        db.add(art)
        saved += 1

    db.commit()
    return {
        "keyword": kw.term,
        "fetched": len(items),
        "saved": saved,
        "skipped_by_keyword": skipped_by_keyword,
        "skipped_by_dup": skipped_by_dup,
    }


@app.get("/articles", response_model=List[schemas.ArticleOut])
def list_articles(keyword_id: int, db: Session = Depends(get_db)):
    """
    특정 keyword_id로 저장된 기사들을 최신순으로 반환
    """
    return (
        db.query(models.Article)
        .filter(models.Article.keyword_id == keyword_id)
        .order_by(models.Article.id.desc())
        .limit(200)
        .all()
    )


@app.get("/trend")
def trend(keyword_id: int, db: Session = Depends(get_db)):
    return count_articles_by_day_created(db, keyword_id=keyword_id)