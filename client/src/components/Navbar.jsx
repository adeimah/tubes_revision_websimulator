import React, { useState } from "react";

function Navbar({ activeTab, setActiveTab, onSecretTrigger }) {
  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Click on '2026' to open Admin Login */}
        <div className="logo-section" onClick={(e) => { e.preventDefault(); setActiveTab("home"); }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 2.2 1.8 4 4 4h0" />
            <path d="M14 14.66V17c0 2.2-1.8 4-4 4h0" />
            <path d="M12 17v5" />
            <path d="M18 4H6v5c0 3.3 2.7 6 6 6s6-2.7 6-6V4z" />
          </svg>
          <div className="logo-text">
            <span>FIFA WORLD CUP</span>
            <span className="logo-year-trigger" onClick={(e) => { e.stopPropagation(); onSecretTrigger(); }}> 2026</span>
          </div>
        </div>

        <nav className="nav-links">
          <button className={`nav-btn ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>
            Home
          </button>
          <button className={`nav-btn ${activeTab === "standings" ? "active" : ""}`} onClick={() => setActiveTab("standings")}>
            Standings
          </button>
          <button className={`nav-btn ${activeTab === "matches" ? "active" : ""}`} onClick={() => setActiveTab("matches")}>
            Matches
          </button>
          <button className={`nav-btn ${activeTab === "results" ? "active" : ""}`} onClick={() => setActiveTab("results")}>
            Results
          </button>
          <button className={`nav-btn ${activeTab === "bracket" ? "active" : ""}`} onClick={() => setActiveTab("bracket")}>
            Bracket
          </button>
          <button className={`nav-btn ${activeTab === "panduan" ? "active" : ""}`} onClick={() => setActiveTab("panduan")}>
            Panduan
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
