import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Tag, Star, User, Mail, CheckCircle, Info } from 'lucide-react';
import './EventModal.css';

// Map event category keywords → local fallback images
const getCategoryFallback = (category = '') => {
  const c = category.toLowerCase();
  if (c.includes('music') || c.includes('jazz') || c.includes('rock') || c.includes('festival')) return '/images/music.png';
  if (c.includes('art') || c.includes('photo') || c.includes('design') || c.includes('culture')) return '/images/art.png';
  if (c.includes('food') || c.includes('wine') || c.includes('culinary') || c.includes('cooking')) return '/images/food.png';
  return '/images/tech.png'; // default fallback
};

const EventModal = ({ event, isOpen, onClose }) => {
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', email: '' });
  const [isSuccess, setIsSuccess] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsRegistering(false);
      setIsSuccess(false);
      setFormData({ name: '', email: '' });
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-content fade-in">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        
        <div className="modal-hero-img-box">
          <img
            src={event.image_url}
            alt={event.title}
            className="modal-hero-img"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getCategoryFallback(event.category); }}
          />
          <div className="modal-hero-overlay"></div>
        </div>
        
        <div className="modal-body">
          <span className="event-tag" style={{ color: 'var(--accent-secondary)' }}>{event.category}</span>
          <h2 className="modal-title">{event.title}</h2>
          
          <div className="modal-info-grid">
            <div className="info-item">
              <div className="info-icon-box"><Calendar size={18} /></div>
              <div className="info-details">
                <h4>Date & Arrival</h4>
                <p>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon-box"><MapPin size={18} /></div>
              <div className="info-details">
                <h4>Location</h4>
                <p>{event.location}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-box"><Tag size={18} /></div>
              <div className="info-details">
                <h4>Access</h4>
                <p>Premium Entry</p>
              </div>
            </div>
          </div>
          
          <div className="modal-description-box">
            <h3><Info size={20} /> Event Intelligence</h3>
            <p>{event.description}</p>
          </div>

          <div className="reg-section">
            {isSuccess ? (
              <div className="success-card fade-in">
                <div className="success-icon-wrap">
                  <CheckCircle size={40} />
                </div>
                <h4 style={{ color: '#10b981', marginBottom: '1rem' }}>Registration Confirmed</h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Welcome aboard, <strong>{formData.name}</strong>! We've sent your entry pass to <strong>{formData.email}</strong>.
                </p>
                <button className="action-btn-premium" onClick={onClose} style={{ marginTop: '2rem' }}>
                  Great, see you there!
                </button>
              </div>
            ) : isRegistering ? (
              <div className="reg-card fade-in">
                <h4>Secure Your Spot</h4>
                <form className="reg-form" onSubmit={handleRegister}>
                  <div className="input-field-wrap">
                    <label><User size={12} style={{ marginRight: '5px' }} /> Full Name</label>
                    <input 
                      className="premium-input"
                      type="text" 
                      name="name" 
                      placeholder="Your name" 
                      required 
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-field-wrap">
                    <label><Mail size={12} style={{ marginRight: '5px' }} /> Email Address</label>
                    <input 
                      className="premium-input"
                      type="email" 
                      name="email" 
                      placeholder="Your email" 
                      required 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="reg-actions">
                    <button type="button" className="btn-ghost" onClick={() => setIsRegistering(false)}>
                      Go Back
                    </button>
                    <button type="submit" className="action-btn-premium" style={{ flexGrow: 1 }}>
                      Complete Registration
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginTop: '2rem' }}>
                <button className="btn-ghost" onClick={onClose}>
                  Save for Later
                </button>
                <button className="action-btn-premium" onClick={() => setIsRegistering(true)}>
                  Register Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;

