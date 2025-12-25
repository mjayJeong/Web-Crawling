from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True)
    term = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    articles = relationship("Article", back_populates="keyword")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    keyword_id = Column(Integer, ForeignKey("keywords.id"), index=True, nullable=False)

    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    press = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)
    snippet = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    keyword = relationship("Keyword", back_populates="articles")

    __table_args__ = (
        UniqueConstraint("url", name="uq_articles_url"),
    )
