from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 키워드 추가할 때 보내는 데이터
class KeywordCreate(BaseModel):
    term: str

# 서버가 응답으로 돌려주는 데이터
class KeywordOut(BaseModel):
    id: int
    term: str
    created_at: datetime

    class Config:
        from_attributes = True      # JSON 바꾸는 것 허용 옵션

class ArticleOut(BaseModel):
    id: int
    keyword_id: int
    title: str
    url: str
    press: Optional[str] = None
    published_at: Optional[datetime] = None
    snippet: Optional[str] = None

    class Config:
        from_attributes = True