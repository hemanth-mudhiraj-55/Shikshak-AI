import React from "react";
import "./Header.css";

export default function Header() {
  const handleLogout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.log("Logout API error:", error);
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/";
};

  return (
    <div className="header-container">
      <div className="header-content">
        <div className="header-left">
          <div className="header-logo">
            {/* App Icon - You can replace the emoji with an actual icon */}
            <span className="header-icon">🎓</span>
          </div>
          <div className="header-text">
            <h1 className="header-title">Shikshak AI</h1>
            <p className="header-subtitle">A Virtually Teaching Platform</p>
          </div>
        </div>
        
        <div className="header-right">
          <button className="logout-button" onClick={handleLogout}>
            <svg 
              className="logout-icon" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}