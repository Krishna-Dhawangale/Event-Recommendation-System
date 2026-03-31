import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, MapPin, Search, Star, Sparkles, User, Users, ChevronRight, Activity, Filter, Info, ArrowRight, Zap, Globe, LogOut
} from 'lucide-react';
import EventModal from './components/EventModal';
import Auth from './components/Auth';
import './index.css';

// Base URL for backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Map event category keywords → local fallback images
const getCategoryFallback = (category = '') => {
  const c = category.toLowerCase();
  if (c.includes('music') || c.includes('jazz') || c.includes('rock') || c.includes('festival')) return '/images/music.png';
  if (c.includes('art') || c.includes('photo') || c.includes('design') || c.includes('culture')) return '/images/art.png';
  if (c.includes('food') || c.includes('wine') || c.includes('culinary') || c.includes('cooking')) return '/images/food.png';
  return '/images/tech.png'; // default fallback
};

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAIExplainer, setShowAIExplainer] = useState(false);

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(allEvents.map(e => e.category.split(' ')[0]))];
    return cats;
  }, [allEvents]);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (authenticatedUser) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/events/`);
          const eventsData = await response.json();
          setAllEvents(eventsData);
          
          // Fetch recommendations for the logged-in user
          await fetchRecommendations(authenticatedUser.id);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [authenticatedUser]);

  const fetchRecommendations = async (userId) => {
    try {
      setLoadingRecs(true);
      const res = await fetch(`${API_BASE_URL}/users/${userId}/recommendations?top_n=3`);
      const recsData = await res.json();
      setRecommendations(recsData);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAuthSuccess = (user) => {
    setAuthenticatedUser(user);
    // Optionally save to localStorage for persistence
    localStorage.setItem('event_ai_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    localStorage.removeItem('event_ai_user');
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('event_ai_user');
    if (savedUser) {
      setAuthenticatedUser(JSON.parse(savedUser));
    }
  }, []);

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || event.category.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  if (!authenticatedUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} apiBaseUrl={API_BASE_URL} />;
  }

  if (loading) {
    return (
      <div className="premium-loader">
        <div className="orbit-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Syncing with Neural Core...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <nav className="navbar fade-in">
        <div className="nav-brand">
          <Sparkles size={24} /> EVENT.AI
        </div>
        <div className="nav-actions">
          <div className="user-pill">
            <User size={16} /> {authenticatedUser.name}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '8rem' }}>
        {/* Header / Hero Section */}
        <header className="fade-in">
          <div className="hero-glow"></div>
          <h1>Discover Your Next Story</h1>
          <p>
            Experience the future of event discovery. Our AI analyzes thousands of data points 
            to match you with events that genuinely resonate with your unique profile.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button className="action-btn-premium" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
              Start Exploring <ArrowRight size={18} />
            </button>
            <button className="filter-btn" onClick={() => setShowAIExplainer(!showAIExplainer)}>
              <Info size={18} /> {showAIExplainer ? "Hide Logic" : "View AI Logic"}
            </button>
          </div>
        </header>

        {/* AI Explainer */}
        {showAIExplainer && (
          <div className="ai-logic-card fade-in">
            <h2><Zap size={32} color="var(--accent-secondary)" /> Semantic Intelligence</h2>
            <p>
              We don't just search for keywords. We build a high-dimensional vector space representing 
              both your profile and event content using TF-IDF and Cosine Similarity.
            </p>
            <code>Similarity(U, E) = (Vector_U ⋅ Vector_E) / (||Vector_U|| * ||Vector_E||)</code>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              Matched events are ranked by their proximity in this semantic space, ensuring deep relevance.
            </p>
          </div>
        )}

        {/* Personalized Recommendations */}
        <section className="section fade-in">
          <div className="section-title-wrap">
            <div>
              <span className="event-tag"><Sparkles size={14} /> Neural Matching</span>
              <h2>Tailored For You</h2>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              3 Premium Matches
            </div>
          </div>
          
          {loadingRecs ? (
            <div className="premium-loader" style={{ padding: '4rem 0' }}>
              <div className="orbit-spinner" style={{ width: '40px', height: '40px' }}></div>
            </div>
          ) : (
            <div className="events-grid">
              {recommendations.map((rec, index) => (
                <div className="event-card fade-in" style={{ animationDelay: `${index * 0.1}s` }} key={rec.event.id}>
                  <div className="event-img-box">
                    <img
                      src={rec.event.image_url}
                      alt={rec.event.title}
                      className="event-img"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getCategoryFallback(rec.event.category); }}
                    />
                    <div className="event-overlay"></div>
                    <div className="match-score-pill">
                      <Activity size={14} /> {Math.round(rec.similarity_score * 100)}% Match
                    </div>
                  </div>
                  <div className="event-body">
                    <span className="event-tag">{rec.event.category}</span>
                    <h3 className="event-h3">{rec.event.title}</h3>
                    <p className="event-p">{rec.event.description}</p>
                    <div className="event-footer">
                      <div className="footer-meta">
                        <div className="meta-row"><Calendar size={14} /> {rec.event.date}</div>
                        <div className="meta-row"><MapPin size={14} /> {rec.event.location}</div>
                      </div>
                      <button className="action-btn-premium" onClick={() => setModalEvent(rec.event)}>
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Global Discovery Section */}
        <section className="discover-section fade-in">
          <div className="section-title-wrap">
            <div>
              <span className="event-tag"><Globe size={14} /> Global Nexus</span>
              <h2>All Discoveries</h2>
            </div>
            <div className="search-container">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input-premium"
                placeholder="Search keywords, categories, or cities..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-bar">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="events-grid">
            {filteredEvents.map((event, index) => (
              <div className="event-card fade-in" style={{ animationDelay: `${(index % 3) * 0.1}s` }} key={event.id}>
                <div className="event-img-box">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="event-img"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getCategoryFallback(event.category); }}
                  />
                  <div className="event-overlay"></div>
                </div>
                <div className="event-body">
                  <span className="event-tag">{event.category}</span>
                  <h3 className="event-h3">{event.title}</h3>
                  <p className="event-p">{event.description}</p>
                  <div className="event-footer">
                    <div className="footer-meta">
                      <div className="meta-row"><Calendar size={14} /> {event.date}</div>
                      <div className="meta-row"><MapPin size={14} /> {event.location}</div>
                    </div>
                    <button 
                      className="filter-btn" 
                      style={{ padding: '0.6rem 1.2rem' }}
                      onClick={() => setModalEvent(event)}
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <EventModal 
        event={modalEvent} 
        isOpen={!!modalEvent} 
        onClose={() => setModalEvent(null)} 
      />
    </div>
  );
}

export default App;

