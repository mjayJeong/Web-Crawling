from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Article

def count_articles_by_day_created(db: Session, keyword_id: int):
    """
    Article.created_at 기준으로 날짜별 기사 개수를 센다.
    """
    rows = (
        db.query(func.date(Article.created_at).label("d"), func.count(Article.id))
        .filter(Article.keyword_id == keyword_id)
        .group_by("d")
        .order_by("d")
        .all()
    )
    return [{"date": str(d), "count": c} for d, c in rows]
