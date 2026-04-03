# AI-Based Event Recommendation System

A professional, full-stack event recommendation platform that utilizes Machine Learning to suggest personalized events based on user profiles and preferences. 

## 🌟 Key Features
- **Similarity-Based AI**: Uses TF-IDF and Cosine Similarity to match user preferences with event metadata.
- **Interactive UI**: Modern, glassmorphism-inspired design with real-time search and smooth animations.
- **Deep Insights**: "How it Works" section explains the AI logic behind the matches.
- **Professional Aesthetics**: Custom AI-generated event illustrations for a premium feel.

## 🛠️ Technology Stack
- **Frontend**: React, Vite, Lucide-React, Vanilla CSS
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic
- **AI/ML**: Scikit-Learn (TF-IDF Vectorization, Cosine Similarity)
- **Database**: SQLite (SQLAlchemy ORM)

## 🚀 Deployment Guide

### Frontend (Vercel)
1. Navigate to the `frontend` folder.
2. Run `npm install` and `npm run build`.
3. Connect your GitHub repository to Vercel.
4. Set the **Root Directory** to `frontend`.
5. Set the Environment Variable `VITE_API_BASE_URL` to your deployed backend URL.

### Backend (Render / Railway / Fly.io)
Vercel is great for the UI, but for a FastAPI app with a persistent database, we recommend Render or Railway.
1. Connect your repository to Render.
2. Select **Python** as the environment.
3. Use the build command: `pip install -r requirements.txt`.
4. Use the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.

## 🧠 AI Technique Explained
The recommendation engine follows a **Content-Based Filtering** approach:
1. **Vectorization**: Event titles, descriptions, and categories are converted into numerical vectors using the `TfidfVectorizer`.
2. **Profile Matching**: User preferences are similarly vectorized.
3. **Similarity Score**: We compute the **Cosine Similarity** between the user vector and all event vectors.
4. **Ranking**: Events are ranked by their score, ensuring the most contextually relevant events are shown first.


