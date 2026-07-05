import React from "react";

function Footer({ setActiveTab }) {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 2.2 1.8 4 4 4h0" />
            <path d="M14 14.66V17c0 2.2-1.8 4-4 4h0" />
            <path d="M12 17v5" />
            <path d="M18 4H6v5c0 3.3 2.7 6 6 6s6-2.7 6-6V4z" />
          </svg>
          <span>FIFA World Cup 2026 Simulator</span>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("home"); }}>Home</a>
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("standings"); }}>Standings</a>
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("matches"); }}>Matches</a>
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("results"); }}>Results</a>
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("bracket"); }}>Bracket</a>
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("panduan"); }}>Panduan</a>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "4px 0" }}>
          Built for educational purposes. All tournament models are simulated.
        </p>
        <p className="footer-copyright">
          © 2026 FIFA World Cup Simulator. Designed under official specs.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
