import os
from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer, Date, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session

# ─────────────────────────────────────────────────────────────────────────────
# Database setup
# ─────────────────────────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./freshtrack.db")

# Railway gives postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    items = relationship("Item", back_populates="owner", cascade="all, delete-orphan")


class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    emoji = Column(String, default="📦")
    qty = Column(Integer, default=1)
    unit = Column(String, default="pcs")
    expiry = Column(Date, nullable=False)
    owner = relationship("User", back_populates="items")


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─────────────────────────────────────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="FreshTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your Vercel URL once deployed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str

class LoginRequest(BaseModel):
    username: str

class ItemCreate(BaseModel):
    name: str
    category: str
    emoji: str = "📦"
    qty: int = 1
    unit: str = "pcs"
    expiry: date

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    emoji: Optional[str] = None
    qty: Optional[int] = None
    unit: Optional[str] = None
    expiry: Optional[date] = None


def item_to_dict(item: Item) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "category": item.category,
        "emoji": item.emoji,
        "qty": item.qty,
        "unit": item.unit,
        "expiry": item.expiry.isoformat(),
    }


def get_user_or_404(username: str, db: Session) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ─────────────────────────────────────────────────────────────────────────────
# Auth routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "FreshTrack API is running"}


@app.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    username = payload.username.strip().lower()
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    existing = db.query(User).filter(User.username == username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken")

    user = User(username=username)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"username": user.username}


@app.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    username = payload.username.strip().lower()
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Username not found. Please register first.")
    return {"username": user.username}


# ─────────────────────────────────────────────────────────────────────────────
# Item routes — scoped per user via username
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/users/{username}/items")
def get_items(username: str, db: Session = Depends(get_db)):
    user = get_user_or_404(username.strip().lower(), db)
    return [item_to_dict(i) for i in user.items]


@app.post("/users/{username}/items")
def add_item(username: str, payload: ItemCreate, db: Session = Depends(get_db)):
    user = get_user_or_404(username.strip().lower(), db)
    item = Item(
        user_id=user.id,
        name=payload.name,
        category=payload.category,
        emoji=payload.emoji,
        qty=payload.qty,
        unit=payload.unit,
        expiry=payload.expiry,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item_to_dict(item)


@app.put("/users/{username}/items/{item_id}")
def update_item(username: str, item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    user = get_user_or_404(username.strip().lower(), db)
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item_to_dict(item)


@app.delete("/users/{username}/items/{item_id}", status_code=204)
def delete_item(username: str, item_id: int, db: Session = Depends(get_db)):
    user = get_user_or_404(username.strip().lower(), db)
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
