from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite DB 파일 경로
DATABASE_URL = "sqlite:///./app.db"

# engine = DB와 연결을 담당하는 객체
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Session = DB 작업(조회/저장/삭제)을 할 때 쓰는 작업 단위
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = 우리가 만들 테이블 클래스들이 상속받을 부모 클래스
Base = declarative_base()

# FastAPI에서 DB 세션을 안전하게 열고 닫기 위한 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()