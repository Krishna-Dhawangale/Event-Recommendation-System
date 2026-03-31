import hashlib
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

import models
import database
import recommendation

# Helper for simple password hashing
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Event Recommendation AI", description="AI-Based Recommendation System for Events")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---

@app.post("/register", response_model=models.UserResponse)
def register_user(user: models.UserCreate, db: Session = Depends(database.get_db)):
    try:
        hashed_pwd = hash_password(user.password)
        db_user = models.User(
            name=user.name, 
            email=user.email, 
            hashed_password=hashed_pwd, 
            preferences=user.preferences
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

@app.post("/login", response_model=models.UserResponse)
def login_user(login_data: models.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or user.hashed_password != hash_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@app.get("/users/", response_model=list[models.UserResponse])
def get_users(db: Session = Depends(database.get_db)):
    users = db.query(models.User).all()
    return users

@app.get("/users/{user_id}", response_model=models.UserResponse)
def get_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/events/", response_model=models.EventResponse)
def create_event(event: models.EventCreate, db: Session = Depends(database.get_db)):
    db_event = models.Event(
        title=event.title, 
        description=event.description,
        category=event.category,
        date=event.date,
        location=event.location,
        image_url=event.image_url
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/events/", response_model=list[models.EventResponse])
def get_events(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    events = db.query(models.Event).offset(skip).limit(limit).all()
    return events

@app.get("/users/{user_id}/recommendations", response_model=list[models.RecommendationResponse])
def get_event_recommendations(user_id: int, top_n: int = 5, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    events = db.query(models.Event).all()
    if not events:
        return []
        
    recommended_events = recommendation.get_recommendations(user, events, top_n=top_n)
    return recommended_events

# Seed some data on startup
@app.on_event("startup")
def seed_data():
    db = database.SessionLocal()
    # Check if we have events, if not seed some
    if db.query(models.Event).count() == 0:
        seed_events = [
            {"title": "Tech Conference 2026", "description": "Annual gathering of tech enthusiasts exploring AI and Web3 technologies.", "category": "technology ai innovation", "date": "2026-10-15", "location": "San Francisco", "image_url": "https://images.unsplash.com/photo-1540575861501-7ad058177a33?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Jazz Night Live", "description": "A relaxing evening of live jazz music and cocktails for audiophiles.", "category": "music jazz luxury", "date": "2026-06-20", "location": "New York", "image_url": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Modern Art Exhibition", "description": "Explore the latest abstracts and sculptures from emerging artists.", "category": "art culture design", "date": "2026-07-05", "location": "London", "image_url": "https://images.unsplash.com/photo-1531050171669-0dfbb7d9f67a?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Startup Pitch Night", "description": "Watch new startups pitch their ideas to investors in the technology and business sectors.", "category": "technology business entrepreneurship", "date": "2026-08-12", "location": "Austin", "image_url": "https://images.unsplash.com/photo-1475721027187-402ad294165d?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Local Indie Rock Festival", "description": "Three days of loud indie rock music and food trucks.", "category": "music festival community", "date": "2026-09-01", "location": "Chicago", "image_url": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200"},
            {"title": "AI Workshop", "description": "Hands-on workshop building your first machine learning model using python and data science.", "category": "technology education ai coding", "date": "2026-05-18", "location": "Online", "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Food & Wine Expo", "description": "Taste standard dishes from around the world and try fine wines from global vineyards.", "category": "food wine culinary", "date": "2026-11-20", "location": "Paris", "image_url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Photography Masterclass", "description": "Learn lighting and composition techniques for stunning portraits and landscapes.", "category": "art education photography", "date": "2026-12-10", "location": "Los Angeles", "image_url": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Sustainable Tech Summit", "description": "Focusing on green energy, electric vehicles, and future sustainability in engineering.", "category": "technology sustainability environment", "date": "2026-04-25", "location": "Berlin", "image_url": "https://images.unsplash.com/photo-1509062522246-37559ee232f3?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Mindfulness Retreat", "description": "A weekend of meditation, yoga, and mental wellness in the serene countryside.", "category": "wellness health spirituality", "date": "2026-03-30", "location": "Kyoto", "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Gourmet Cooking Class", "description": "Master the art of French cuisine with a Michelin star chef.", "category": "food education culinary", "date": "2026-05-02", "location": "Lyon", "image_url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200"},
            {"title": "Cybersecurity Expo", "description": "Deep dive into network security, ethical hacking, and data protection trends.", "category": "technology security software", "date": "2026-09-15", "location": "Tel Aviv", "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200"}
        ]
        
        for e in seed_events:
            db.add(models.Event(**e))
            
    if db.query(models.User).count() == 0:
        seed_users = [
            {"name": "Alice Developer", "email": "alice@example.com", "hashed_password": hash_password("password"), "preferences": "I love technology, coding, artificial intelligence, and learning new things about software and development."},
            {"name": "Bob Musician", "email": "bob@example.com", "hashed_password": hash_password("password"), "preferences": "I enjoy listening to music, especially rock and jazz. Live concerts and festivals are great experiences."},
            {"name": "Charlie Artist", "email": "charlie@example.com", "hashed_password": hash_password("password"), "preferences": "Art, museums, photography, and creative workshops are my favorites for weekend activities."},
            {"name": "David Business", "email": "david@example.com", "hashed_password": hash_password("password"), "preferences": "Interested in startups, entrepreneurship, investing, and business networking in the tech sector."},
            {"name": "Emma Wellness", "email": "emma@example.com", "hashed_password": hash_password("password"), "preferences": "Passionate about yoga, health, mindfulness, and sustainable living environment."}
        ]
        
        for u in seed_users:
            db.add(models.User(**u))
            
    db.commit()
    db.close()

