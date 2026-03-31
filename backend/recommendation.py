import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from models import User, Event

def get_recommendations(user: User, events: list[Event], top_n: int = 5):
    """
    Calculates similarity between user preferences and event descriptions/categories.
    Returns a sorted list of dictionaries with the event and its similarity score.
    """
    if not events:
        return []

    # Prepare user profile text
    user_profile_text = user.preferences

    # Prepare event documents
    # Combine title, description, and category for better matching
    event_docs = []
    for event in events:
        doc = f"{event.title} {event.description} {event.category}"
        event_docs.append(doc)

    # Add the user profile as the first document
    all_docs = [user_profile_text] + event_docs

    # Vectorize the documents using TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(all_docs)
    except ValueError:
        # Handles case where vocabulary is empty (e.g. all stop words)
        return [{"event": event, "similarity_score": 0.0} for event in events[:top_n]]

    # Calculate cosine similarity between the user profile (index 0) and all events (index 1 to end)
    # tfidf_matrix[0:1] is the user, tfidf_matrix[1:] are the events
    cosine_sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])

    # Flatten the result and pair with events
    similarity_scores = cosine_sims[0]
    
    event_scores = []
    for i, event in enumerate(events):
        event_scores.append({
            "event": event,
            "similarity_score": float(similarity_scores[i])
        })

    # Sort events by similarity score in descending order
    event_scores.sort(key=lambda x: x["similarity_score"], reverse=True)

    # Return the top N recommendations
    return event_scores[:top_n]
