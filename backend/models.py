from sqlalchemy import Column, Integer, String
from database import Base
from pydantic import BaseModel, EmailStr

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    preferences = Column(String) # e.g., "music technology art"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    category = Column(String)
    date = Column(String)
    location = Column(String)
    image_url = Column(String) # For event thumbnails

# Pydantic Schemas for API
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    preferences: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    preferences: str

    class Config:
        from_attributes = True

class EventCreate(BaseModel):
    title: str
    description: str
    category: str
    date: str
    location: str
    image_url: str

class EventResponse(EventCreate):
    id: int

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    event: EventResponse
    similarity_score: float
