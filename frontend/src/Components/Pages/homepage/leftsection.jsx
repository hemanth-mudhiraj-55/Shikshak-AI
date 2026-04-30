import { Link } from "react-router-dom";
import "./home.css";
import { useState, useEffect, useRef } from "react";

// Import your card images
import cardImage1 from "../../../assets/image.png";
import cardImage2 from "../../../assets/image.png";
import cardImage3 from "../../../assets/image.png";
import cardImage4 from "../../../assets/image.png";
import cardImage5 from "../../../assets/image.png";
import appLogo from "../../../assets/logo.svg";

function LeftSection() {
    const [currentCard, setCurrentCard] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const autoPlayRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Check if mobile on resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const cards = [
        {
            id: 1,
            image: cardImage1,
            title: "AI-Powered Learning",
            description: "Personalized learning paths powered by artificial intelligence"
        },
        {
            id: 2,
            image: cardImage2,
            title: "Interactive Coding",
            description: "Practice coding with real-time feedback and instant execution"
        },
        {
            id: 3,
            image: cardImage3,
            title: "Skill Assessment",
            description: "Get evaluated on your coding skills with detailed analytics"
        },
        {
            id: 4,
            image: cardImage4,
            title: "Project Building",
            description: "Build real-world projects with guided tutorials"
        },
        {
            id: 5,
            image: cardImage5,
            title: "Career Growth",
            description: "Track progress and get career advancement recommendations"
        }
    ];

    // Auto-play functionality
    useEffect(() => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }

        if (!isHovering) {
            autoPlayRef.current = setInterval(() => {
                setCurrentCard(prev => (prev + 1) % cards.length);
            }, isMobile ? 4000 : 5000);
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isHovering, cards.length, isMobile]);

    // Handle manual card selection
    const handleCardSelect = (index) => {
        setCurrentCard(index);
        
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
        
        setTimeout(() => {
            if (!isHovering) {
                autoPlayRef.current = setInterval(() => {
                    setCurrentCard(prev => (prev + 1) % cards.length);
                }, isMobile ? 4000 : 5000);
            }
        }, 2000);
    };

    // Handle previous/next navigation
    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentCard(prev => prev === 0 ? cards.length - 1 : prev - 1);
        
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
        
        setTimeout(() => {
            if (!isHovering) {
                autoPlayRef.current = setInterval(() => {
                    setCurrentCard(prev => (prev + 1) % cards.length);
                }, isMobile ? 4000 : 5000);
            }
        }, 2000);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentCard(prev => (prev + 1) % cards.length);
        
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
        
        setTimeout(() => {
            if (!isHovering) {
                autoPlayRef.current = setInterval(() => {
                    setCurrentCard(prev => (prev + 1) % cards.length);
                }, isMobile ? 4000 : 5000);
            }
        }, 2000);
    };

    // Touch handlers for mobile swipe
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const threshold = 50;
        const swipeDistance = touchEndX.current - touchStartX.current;
        
        if (swipeDistance > threshold) {
            handlePrev({ stopPropagation: () => {} });
        } else if (swipeDistance < -threshold) {
            handleNext({ stopPropagation: () => {} });
        }
        
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    // Mouse handlers
    const handleMouseEnter = () => {
        setIsHovering(true);
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setTimeout(() => {
            if (!isHovering && !autoPlayRef.current) {
                autoPlayRef.current = setInterval(() => {
                    setCurrentCard(prev => (prev + 1) % cards.length);
                }, isMobile ? 4000 : 5000);
            }
        }, 300);
    };

    return (
        <div className="left-section">
            <nav className="navbar">
                <div className="logo">
                    <img 
                        src={appLogo}
                        alt="ShikshakAI Logo"
                        className="logo-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                    <span className="logo-text">
                        ShikshakAI
                        <span className="logo-subtitle">Learn. Build. Grow.</span>
                    </span>
                </div>               
                <div className="nav-links">
                    <Link to="/vision">Vision</Link>
                    <Link to="/developer">Developer</Link>
                </div>
            </nav>

            <div className="animation-area">
                <div 
                    className="cards-carousel"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="carousel-container">
                        {cards.map((card, index) => {
                            let positionClass = '';
                            if (index === currentCard) positionClass = 'active';
                            else if (index === (currentCard - 1 + cards.length) % cards.length) positionClass = 'prev';
                            else if (index === (currentCard + 1) % cards.length) positionClass = 'next';
                            
                            return (
                                <div 
                                    key={card.id}
                                    className={`card ${positionClass}`}
                                    onClick={() => handleCardSelect(index)}
                                >
                                    <div className="card-image">
                                        <img 
                                            src={card.image} 
                                            alt={card.title} 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                            }}
                                        />
                                    </div>
                                    <div className="card-content">
                                        <h3>{card.title}</h3>
                                        <p>{card.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation Buttons - Hide on very small screens */}
                    {!isMobile && (
                        <>
                            <button className="carousel-btn prev-btn" onClick={handlePrev}>
                                ‹
                            </button>
                            <button className="carousel-btn next-btn" onClick={handleNext}>
                                ›
                            </button>
                        </>
                    )}

                    {/* Indicators */}
                    <div className="carousel-indicators">
                        {cards.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${index === currentCard ? 'active' : ''}`}
                                onClick={() => handleCardSelect(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeftSection;