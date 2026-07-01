import React, { useState, useEffect } from "react";
import { TEAMS, GROUPS, generateGroupMatches, initialKnockoutMatches } from "./data/mockData";
import "./App.css";

function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState("home");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem("adminToken"));
  
  // Data State
  const [matches, setMatches] = useState(() => {
    const savedMatches = localStorage.getItem("wc_matches");
    return savedMatches ? JSON.parse(savedMatches) : generateGroupMatches().concat(initialKnockoutMatches);
  });
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Match filters state
  const [matchTypeFilter, setMatchTypeFilter] = useState("all");
  const [matchGroupFilter, setMatchGroupFilter] = useState("all");
  const [matchStatusFilter, setMatchStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Hovered team code for visual path tracing
  const [hoveredTeam, setHoveredTeam] = useState(null);

  // Admin Dashboard Editing State
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [editHomeScore, setEditHomeScore] = useState("");
  const [editAwayScore, setEditAwayScore] = useState("");
  const [editPenaltyWinner, setEditPenaltyWinner] = useState(""); // For knockout draws

  // Synchronize theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Synchronize matches state to localStorage
  useEffect(() => {
    localStorage.setItem("wc_matches", JSON.stringify(matches));
  }, [matches]);

  // Helper: Toast Notifications
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Helper: Toggle Dark Mode
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Helper: Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin123") { // Mock admin credentials
      setIsAdmin(true);
      localStorage.setItem("adminToken", "mock-jwt-token-12345");
      setShowLoginModal(false);
      setPassword("");
      addToast("Successfully logged in as Admin!");
    } else {
      addToast("Invalid password! (Try: admin123)", "error");
    }
  };

  // Helper: Handle Logout
  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("adminToken");
    addToast("Logged out from admin panel.");
  };

  // Standings Calculator for a specific group
  const getGroupStandings = (groupChar) => {
    const groupTeams = Object.values(TEAMS).filter((t) => t.group === groupChar);
    
    // Initialize stats
    const standings = groupTeams.reduce((acc, team) => {
      acc[team.code] = {
        ...team,
        P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0
      };
      return acc;
    }, {});

    // Filter group matches
    const groupMatches = matches.filter(
      (m) => m.type === "group" && m.group === groupChar && m.status === "finished"
    );

    // Calculate stats
    groupMatches.forEach((m) => {
      const home = standings[m.homeTeam];
      const away = standings[m.awayTeam];

      if (home && away) {
        home.P += 1;
        away.P += 1;
        home.GF += m.homeScore;
        home.GA += m.awayScore;
        away.GF += m.awayScore;
        away.GA += m.homeScore;

        if (m.homeScore > m.awayScore) {
          home.W += 1;
          home.Pts += 3;
          away.L += 1;
        } else if (m.awayScore > m.homeScore) {
          away.W += 1;
          away.Pts += 3;
          home.L += 1;
        } else {
          home.D += 1;
          away.D += 1;
          home.Pts += 1;
          away.Pts += 1;
        }
      }
    });

    // Update goal difference
    Object.values(standings).forEach((team) => {
      team.GD = team.GF - team.GA;
    });

    // Sort by Points -> GD -> GF -> Name
    return Object.values(standings).sort((a, b) => {
      if (b.Pts !== a.Pts) return b.Pts - a.Pts;
      if (b.GD !== a.GD) return b.GD - a.GD;
      if (b.GF !== a.GF) return b.GF - a.GF;
      return a.name.localeCompare(b.name);
    });
  };

  // Statistics calculation for the dashboard
  const getStats = () => {
    const finishedMatches = matches.filter((m) => m.status === "finished");
    const totalGoals = finishedMatches.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0);
    const avgGoals = finishedMatches.length > 0 ? (totalGoals / finishedMatches.length).toFixed(2) : "0.00";
    
    // Top scoring teams estimation
    const teamGoals = {};
    finishedMatches.forEach((m) => {
      if (m.homeTeam) teamGoals[m.homeTeam] = (teamGoals[m.homeTeam] || 0) + (m.homeScore || 0);
      if (m.awayTeam) teamGoals[m.awayTeam] = (teamGoals[m.awayTeam] || 0) + (m.awayScore || 0);
    });

    let topScorerTeam = "-";
    let maxGoals = 0;
    Object.entries(teamGoals).forEach(([code, goals]) => {
      if (goals > maxGoals) {
        maxGoals = goals;
        topScorerTeam = `${TEAMS[code]?.flag || ""} ${code} (${goals} gls)`;
      }
    });

    return {
      played: finishedMatches.length,
      total: matches.length,
      goals: totalGoals,
      avgGoals,
      topTeam: topScorerTeam
    };
  };

  // Reset all matches back to default
  const handleResetTournament = () => {
    if (window.confirm("Are you sure you want to reset all tournament data? All scores and knockout stages will be cleared.")) {
      const cleanMatches = generateGroupMatches().concat(initialKnockoutMatches);
      setMatches(cleanMatches);
      setSelectedMatchId("");
      setEditHomeScore("");
      setEditAwayScore("");
      addToast("Tournament reset successfully!");
    }
  };

  // Generate / Simulate Random Results for Group Stage matches
  const handleSimulateGroupStage = () => {
    const updated = matches.map((m) => {
      if (m.type === "group" && m.status !== "finished") {
        // Generate typical football scores (bias towards lower scores)
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore = Math.floor(Math.random() * 3);
        return {
          ...m,
          homeScore,
          awayScore,
          status: "finished"
        };
      }
      return m;
    });

    setMatches(updated);
    addToast("All remaining group stage matches simulated!");
  };

  // Advancing top teams from group stage to knockout stage (Round of 16)
  const handleAdvanceToKnockout = () => {
    // Check if group stage matches are all finished
    const groupMatches = matches.filter((m) => m.type === "group");
    const unplayed = groupMatches.filter((m) => m.status !== "finished");

    if (unplayed.length > 0) {
      if (!window.confirm(`There are still ${unplayed.length} unplayed group matches. Do you want to advance anyway? (Standings will be calculated based on current finished matches)`)) {
        return;
      }
    }

    // Get top 2 of each group
    const qualifiers = {};
    GROUPS.forEach((groupChar) => {
      const standings = getGroupStandings(groupChar);
      qualifiers[groupChar] = {
        winner: standings[0]?.code || null,
        runnerUp: standings[1]?.code || null
      };
    });

    // Populate Round of 16
    const updatedMatches = matches.map((m) => {
      if (m.type === "knockout") {
        // Clear scores/status of all knockout matches when advancing to keep state synchronized
        const cleanKnockout = {
          ...m,
          homeScore: null,
          awayScore: null,
          status: "scheduled",
          winner: null
        };

        // Inject team codes based on group rankings
        if (m.id === "R16-1") {
          cleanKnockout.homeTeam = qualifiers["A"].winner;
          cleanKnockout.awayTeam = qualifiers["B"].runnerUp;
        } else if (m.id === "R16-2") {
          cleanKnockout.homeTeam = qualifiers["C"].winner;
          cleanKnockout.awayTeam = qualifiers["D"].runnerUp;
        } else if (m.id === "R16-3") {
          cleanKnockout.homeTeam = qualifiers["E"].winner;
          cleanKnockout.awayTeam = qualifiers["F"].runnerUp;
        } else if (m.id === "R16-4") {
          cleanKnockout.homeTeam = qualifiers["G"].winner;
          cleanKnockout.awayTeam = qualifiers["H"].runnerUp;
        } else if (m.id === "R16-5") {
          cleanKnockout.homeTeam = qualifiers["B"].winner;
          cleanKnockout.awayTeam = qualifiers["A"].runnerUp;
        } else if (m.id === "R16-6") {
          cleanKnockout.homeTeam = qualifiers["D"].winner;
          cleanKnockout.awayTeam = qualifiers["C"].runnerUp;
        } else if (m.id === "R16-7") {
          cleanKnockout.homeTeam = qualifiers["F"].winner;
          cleanKnockout.awayTeam = qualifiers["E"].runnerUp;
        } else if (m.id === "R16-8") {
          cleanKnockout.homeTeam = qualifiers["H"].winner;
          cleanKnockout.awayTeam = qualifiers["G"].runnerUp;
        } else {
          // QF, SF, F matches should have null teams initially
          cleanKnockout.homeTeam = null;
          cleanKnockout.awayTeam = null;
        }

        return cleanKnockout;
      }
      return m;
    });

    setMatches(updatedMatches);
    addToast("Advanced to Knockout Stage! Bracket populated.");
    setActiveTab("bracket");
  };

  // Propagate winner of a knockout match to the next match node
  const propagateKnockoutWinner = (updatedMatches, currentMatch, winnerTeamCode) => {
    if (!currentMatch.nextMatchId) return updatedMatches; // Final match, no next node

    return updatedMatches.map((m) => {
      if (m.id === currentMatch.nextMatchId) {
        const nextNode = { ...m };
        if (currentMatch.isHomeInNextMatch) {
          nextNode.homeTeam = winnerTeamCode;
        } else {
          nextNode.awayTeam = winnerTeamCode;
        }
        
        // If the next node's home or away team changes, we must recursively clear out scores of that node and subsequent nodes
        nextNode.homeScore = null;
        nextNode.awayScore = null;
        nextNode.status = "scheduled";
        nextNode.winner = null;

        // Clear children recursively
        let recursivelyCleaned = propagateKnockoutWinner(updatedMatches, nextNode, null);
        
        // Replace nextNode in recursivelyCleaned
        return recursivelyCleaned.map((item) => (item.id === nextNode.id ? nextNode : item)).find(item => item.id === nextNode.id) || nextNode;
      }
      return m;
    });
  };

  // Update specific Match score
  const handleUpdateMatchScore = (e) => {
    e.preventDefault();
    if (!selectedMatchId) return;

    const matchToUpdate = matches.find((m) => m.id === selectedMatchId);
    if (!matchToUpdate) return;

    const homeScoreVal = parseInt(editHomeScore, 10);
    const awayScoreVal = parseInt(editAwayScore, 10);

    if (isNaN(homeScoreVal) || isNaN(awayScoreVal) || homeScoreVal < 0 || awayScoreVal < 0) {
      addToast("Scores must be positive numbers!", "error");
      return;
    }

    // Validation for knockout matches: must not end in a tie without penalty winner
    if (matchToUpdate.type === "knockout" && homeScoreVal === awayScoreVal && !editPenaltyWinner) {
      addToast("Knockout matches cannot end in a draw! Choose a Penalty Winner.", "warning");
      return;
    }

    let winnerTeam = null;
    if (matchToUpdate.type === "knockout") {
      if (homeScoreVal > awayScoreVal) {
        winnerTeam = matchToUpdate.homeTeam;
      } else if (awayScoreVal > homeScoreVal) {
        winnerTeam = matchToUpdate.awayTeam;
      } else {
        winnerTeam = editPenaltyWinner;
      }
    }

    // Step 1: Update the match itself
    let updatedMatches = matches.map((m) => {
      if (m.id === selectedMatchId) {
        return {
          ...m,
          homeScore: homeScoreVal,
          awayScore: awayScoreVal,
          status: "finished",
          winner: winnerTeam,
          penaltyWinner: homeScoreVal === awayScoreVal ? editPenaltyWinner : null
        };
      }
      return m;
    });

    // Step 2: Propagate if it's knockout stage
    if (matchToUpdate.type === "knockout" && winnerTeam) {
      const updatedMatch = updatedMatches.find((m) => m.id === selectedMatchId);
      
      // We need a helper mapping that applies the recursion
      let tempMatches = [...updatedMatches];
      const nextMatchId = updatedMatch.nextMatchId;
      if (nextMatchId) {
        tempMatches = tempMatches.map((m) => {
          if (m.id === nextMatchId) {
            const nextNode = { ...m };
            if (updatedMatch.isHomeInNextMatch) {
              nextNode.homeTeam = winnerTeam;
            } else {
              nextNode.awayTeam = winnerTeam;
            }
            // Clear subsequent stats
            nextNode.homeScore = null;
            nextNode.awayScore = null;
            nextNode.status = "scheduled";
            nextNode.winner = null;
            return nextNode;
          }
          return m;
        });

        // Clear recursively for nodes after the next node
        const nextNode = tempMatches.find(m => m.id === nextMatchId);
        let nextNextId = nextNode.nextMatchId;
        while (nextNextId) {
          const currentNext = nextNextId;
          let nextFound = false;
          tempMatches = tempMatches.map((m) => {
            if (m.id === currentNext) {
              nextFound = true;
              const node = { ...m };
              node.homeTeam = null;
              node.awayTeam = null;
              node.homeScore = null;
              node.awayScore = null;
              node.status = "scheduled";
              node.winner = null;
              nextNextId = node.nextMatchId; // Move to next node in loop
              return node;
            }
            return m;
          });
          if (!nextFound) break;
        }
      }
      updatedMatches = tempMatches;
    }

    setMatches(updatedMatches);
    addToast(`Match ${selectedMatchId} updated successfully!`);
    
    // Clear inputs
    setSelectedMatchId("");
    setEditHomeScore("");
    setEditAwayScore("");
    setEditPenaltyWinner("");
  };

  // Auto-fill inputs when match is selected for editing
  const handleSelectMatchForEdit = (matchId) => {
    const match = matches.find((m) => m.id === matchId);
    if (match) {
      setSelectedMatchId(matchId);
      setEditHomeScore(match.homeScore !== null ? match.homeScore : "0");
      setEditAwayScore(match.awayScore !== null ? match.awayScore : "0");
      setEditPenaltyWinner(match.penaltyWinner || "");
      setActiveTab("admin");
      
      // Scroll to dashboard edit form
      setTimeout(() => {
        document.getElementById("edit-form-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Filtering matches for matches page
  const filteredMatches = matches.filter((m) => {
    // Type filter
    if (matchTypeFilter !== "all" && m.type !== matchTypeFilter) return false;
    
    // Group filter (only applies to group matches)
    if (matchGroupFilter !== "all") {
      if (m.type !== "group" || m.group !== matchGroupFilter) return false;
    }
    
    // Status filter
    if (matchStatusFilter !== "all" && m.status !== matchStatusFilter) return false;
    
    // Search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const homeName = (TEAMS[m.homeTeam]?.name || m.placeholderHome || "").toLowerCase();
      const awayName = (TEAMS[m.awayTeam]?.name || m.placeholderAway || "").toLowerCase();
      const homeCode = (m.homeTeam || "").toLowerCase();
      const awayCode = (m.awayTeam || "").toLowerCase();
      
      if (!homeName.includes(query) && !awayName.includes(query) && 
          !homeCode.includes(query) && !awayCode.includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  const tournamentStats = getStats();
  const activeWinner = matches.find((m) => m.id === "F")?.winner;

  return (
    <>
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type} fade-in`}>
            {t.type === "success" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {t.type === "error" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {t.type === "warning" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <header className="navbar">
        <div className="container nav-container">
          <a href="#" className="logo-section" onClick={(e) => { e.preventDefault(); setActiveTab("home"); }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
            <h1>WORLD CUP 2026</h1>
          </a>

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
            <button className={`nav-btn ${activeTab === "bracket" ? "active" : ""}`} onClick={() => setActiveTab("bracket")}>
              Bracket
            </button>
            <button className={`nav-btn ${activeTab === "admin" ? "active" : ""}`} onClick={() => setActiveTab("admin")}>
              {isAdmin ? "Admin Dashboard" : "Admin Panel"}
            </button>
          </nav>

          <div className="nav-controls">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === "light" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main style={{ flex: 1 }}>
        
        {/* TAB: HOME */}
        {activeTab === "home" && (
          <div className="fade-in">
            <section className="hero-section">
              <div className="hero-bg-overlay"></div>
              <div className="container">
                <span className="hero-badge">⚽ Interactive Tournament Simulator</span>
                <h2 className="hero-title">World Cup 2026 Simulator</h2>
                <p className="hero-subtitle">
                  Predict group stage results, simulate team scores, generate knockout brackets, and discover alternate tournament outcomes in real-time.
                </p>
                <div className="hero-actions">
                  <button className="btn btn-primary" onClick={() => setActiveTab("standings")}>
                    View Standings
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab("bracket")}>
                    View Bracket
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Statistics Panels */}
            <section className="container" style={{ marginTop: "40px" }}>
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h4>Matches Played</h4>
                    <p>{tournamentStats.played} / {tournamentStats.total}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🥅</div>
                  <div className="stat-info">
                    <h4>Total Goals</h4>
                    <p>{tournamentStats.goals}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-info">
                    <h4>Avg Goals / Match</h4>
                    <p>{tournamentStats.avgGoals}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-info">
                    <h4>Top Scoring Team</h4>
                    <p style={{ fontSize: "14px", marginTop: "4px" }}>{tournamentStats.topTeam}</p>
                  </div>
                </div>
              </div>

              {/* Quick instructions / Call-out banner */}
              <div style={{
                background: "rgba(30, 58, 138, 0.05)",
                border: "1px dashed var(--border)",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "50px",
                textAlign: "left"
              }}>
                <h3 style={{ marginBottom: "10px", color: "var(--secondary)" }}>💡 How to use the Simulator</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.6" }}>
                  Go to the <strong>Standings</strong> tab to see the groups. As an administrator, you can log in through the <strong>Admin Panel</strong> (password: <code>admin123</code>) to edit results. You can also simulate random scores automatically to quickly populate group standings, and then advance to the visual <strong>Knockout Bracket</strong> to trace the path to the championship!
                </p>
              </div>
            </section>
          </div>
        )}

        {/* TAB: STANDINGS */}
        {activeTab === "standings" && (
          <div className="container fade-in" style={{ paddingTop: "30px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "8px" }}>Tournament Standings</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
              Calculated real-time standings of all 32 teams across Groups A to H. Top 2 teams from each group qualify for the Knockout Stage.
            </p>

            <div className="standings-grid">
              {GROUPS.map((groupChar) => {
                const standings = getGroupStandings(groupChar);
                return (
                  <div key={groupChar} className="group-card">
                    <div className="group-header">
                      <h3>Group {groupChar}</h3>
                      <span>Group Stage</span>
                    </div>
                    <div className="table-responsive">
                      <table className="standings-table">
                        <thead>
                          <tr>
                            <th>Pos</th>
                            <th>Team</th>
                            <th className="text-center">P</th>
                            <th className="text-center">W</th>
                            <th className="text-center">D</th>
                            <th className="text-center">L</th>
                            <th className="text-center">GD</th>
                            <th className="text-center font-bold">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((team, idx) => {
                            const isQualifyingSpot = idx < 2;
                            return (
                              <tr
                                key={team.code}
                                className={isQualifyingSpot ? "qualify-spot" : ""}
                                onMouseEnter={() => setHoveredTeam(team.code)}
                                onMouseLeave={() => setHoveredTeam(null)}
                                style={{
                                  backgroundColor: hoveredTeam === team.code ? "rgba(245, 158, 11, 0.08)" : ""
                                }}
                              >
                                <td className="text-center font-bold">{idx + 1}</td>
                                <td>
                                  <div className="team-cell">
                                    <span className="team-flag">{team.flag}</span>
                                    <span>{team.name}</span>
                                    <span className="team-code">{team.code}</span>
                                  </div>
                                </td>
                                <td className="text-center">{team.P}</td>
                                <td className="text-center">{team.W}</td>
                                <td className="text-center">{team.D}</td>
                                <td className="text-center">{team.L}</td>
                                <td className="text-center" style={{ color: team.GD > 0 ? "var(--success)" : team.GD < 0 ? "var(--danger)" : "inherit" }}>
                                  {team.GD > 0 ? `+${team.GD}` : team.GD}
                                </td>
                                <td className="text-center font-bold">{team.Pts}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: MATCHES */}
        {activeTab === "matches" && (
          <div className="container fade-in" style={{ paddingTop: "30px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "8px" }}>Matches & Results</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
              Browse and search through all 48 group stage matches and the subsequent 15 knockout fixtures.
            </p>

            {/* Filters Dashboard */}
            <div className="filters-bar">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search team (e.g. Brazil)..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="match-filter-tabs">
                <button
                  className={`filter-tab ${matchTypeFilter === "all" ? "active" : ""}`}
                  onClick={() => { setMatchTypeFilter("all"); setMatchGroupFilter("all"); }}
                >
                  All Stages
                </button>
                <button
                  className={`filter-tab ${matchTypeFilter === "group" ? "active" : ""}`}
                  onClick={() => setMatchTypeFilter("group")}
                >
                  Group Stage
                </button>
                <button
                  className={`filter-tab ${matchTypeFilter === "knockout" ? "active" : ""}`}
                  onClick={() => { setMatchTypeFilter("knockout"); setMatchGroupFilter("all"); }}
                >
                  Knockout Stage
                </button>
              </div>

              {matchTypeFilter === "group" && (
                <select
                  className="select-filter"
                  value={matchGroupFilter}
                  onChange={(e) => setMatchGroupFilter(e.target.value)}
                >
                  <option value="all">All Groups</option>
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>Group {g}</option>
                  ))}
                </select>
              )}

              <select
                className="select-filter"
                value={matchStatusFilter}
                onChange={(e) => setMatchStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            {/* Matches Grid */}
            <div className="matches-grid">
              {filteredMatches.length > 0 ? (
                filteredMatches.map((m) => {
                  const home = TEAMS[m.homeTeam];
                  const away = TEAMS[m.awayTeam];
                  const isFinished = m.status === "finished";

                  return (
                    <div
                      key={m.id}
                      className="match-card"
                      onMouseEnter={() => {
                        if (m.homeTeam) setHoveredTeam(m.homeTeam);
                      }}
                      onMouseLeave={() => setHoveredTeam(null)}
                      style={{
                        borderColor: (hoveredTeam && (m.homeTeam === hoveredTeam || m.awayTeam === hoveredTeam)) ? "var(--accent)" : ""
                      }}
                    >
                      <div className="match-card-header">
                        <span>
                          {m.type === "group" ? `Group ${m.group}` : m.name}
                        </span>
                        <span className={`match-status-badge ${m.status}`}>
                          {m.status}
                        </span>
                      </div>

                      <div className="match-teams-layout">
                        {/* Home Team */}
                        <div className="team-display home">
                          <span className="team-display-flag">{home ? home.flag : "🏳️"}</span>
                          <span className="team-display-name">
                            {home ? home.name : m.placeholderHome || "TBD"}
                          </span>
                        </div>

                        {/* Center Score */}
                        <div className="match-score-center">
                          {isFinished ? (
                            <div className="score-box">
                              <span>{m.homeScore}</span>
                              <span className="score-separator">-</span>
                              <span>{m.awayScore}</span>
                            </div>
                          ) : (
                            <div className="vs-box">VS</div>
                          )}
                          
                          {/* Penalty shootout label if exists */}
                          {m.penaltyWinner && (
                            <span style={{ fontSize: "10px", color: "var(--success)", fontWeight: 700, marginTop: "4px" }}>
                              ({TEAMS[m.penaltyWinner]?.code} pens)
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="team-display away">
                          <span className="team-display-flag">{away ? away.flag : "🏳️"}</span>
                          <span className="team-display-name">
                            {away ? away.name : m.placeholderAway || "TBD"}
                          </span>
                        </div>
                      </div>

                      <div className="match-card-footer">
                        <span>Code: {m.id}</span>
                        {isAdmin && m.homeTeam && m.awayTeam && (
                          <button
                            className="admin-match-edit-btn"
                            onClick={() => handleSelectMatchForEdit(m.id)}
                          >
                            ✏️ Edit Score
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No matches match the filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: BRACKET */}
        {activeTab === "bracket" && (
          <div className="container fade-in" style={{ paddingTop: "30px", overflowX: "hidden" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "8px" }}>Tournament Bracket</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
              Visual rendering of the World Cup 2026 Knockout Stage. Result changes in the admin dashboard will instantly update the paths.
            </p>

            {/* Winner Announcement Panel */}
            {activeWinner && (
              <div className="winner-pulse" style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "#0D1B4C",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
                marginBottom: "30px",
                boxShadow: "var(--shadow-lg)"
              }}>
                <h2 style={{ fontSize: "28px", color: "#0D1B4C" }}>🏆 WORLD CUP CHAMPION 🏆</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", margin: "12px 0" }}>
                  <span style={{ fontSize: "48px" }}>{TEAMS[activeWinner]?.flag}</span>
                  <span style={{ fontSize: "36px", fontWeight: 800 }}>{TEAMS[activeWinner]?.name.toUpperCase()}</span>
                </div>
                <p style={{ fontWeight: 600 }}>Congratulations to the World Cup 2026 Champion!</p>
              </div>
            )}

            <div className="bracket-scroll-container">
              <div className="bracket-container">
                
                {/* Round of 16 */}
                <div className="bracket-column">
                  <div className="bracket-column-header">Round of 16</div>
                  {matches.filter((m) => m.round === "R16").map((m) => {
                    const homeWinner = m.status === "finished" && m.winner === m.homeTeam;
                    const awayWinner = m.status === "finished" && m.winner === m.awayTeam;
                    return (
                      <div key={m.id} className="bracket-match-node">
                        <div className="bracket-node-header">{m.id}</div>
                        
                        {/* Home Team */}
                        <div className={`bracket-node-team ${homeWinner ? "winner" : m.status === "finished" ? "loser" : ""}`}>
                          <div className="bracket-node-team-info">
                            <span>{TEAMS[m.homeTeam]?.flag || "🏳️"}</span>
                            <span>{TEAMS[m.homeTeam]?.name || m.placeholderHome}</span>
                          </div>
                          {m.status === "finished" && (
                            <span className="bracket-node-score">
                              {m.homeScore}
                              {m.penaltyWinner === m.homeTeam && " (P)"}
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className={`bracket-node-team ${awayWinner ? "winner" : m.status === "finished" ? "loser" : ""}`}>
                          <div className="bracket-node-team-info">
                            <span>{TEAMS[m.awayTeam]?.flag || "🏳️"}</span>
                            <span>{TEAMS[m.awayTeam]?.name || m.placeholderAway}</span>
                          </div>
                          {m.status === "finished" && (
                            <span className="bracket-node-score">
                              {m.awayScore}
                              {m.penaltyWinner === m.awayTeam && " (P)"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quarterfinals */}
                <div className="bracket-column">
                  <div className="bracket-column-header">Quarter-finals</div>
                  {matches.filter((m) => m.round === "QF").map((m) => {
                    const homeWinner = m.status === "finished" && m.winner === m.homeTeam;
                    const awayWinner = m.status === "finished" && m.winner === m.awayTeam;
                    return (
                      <div key={m.id} className="bracket-match-node">
                        <div className="bracket-node-header">{m.id}</div>
                        
                        <div className={`bracket-node-team ${homeWinner ? "winner" : m.status === "finished" && m.homeTeam ? "loser" : ""}`}>
                          <div className="bracket-node-team-info">
                            <span>{TEAMS[m.homeTeam]?.flag || "🏳️"}</span>
                            <span>{TEAMS[m.homeTeam]?.name || m.placeholderHome}</span>
                          </div>
                          {m.status === "finished" && m.homeTeam && (
                            <span className="bracket-node-score">
                              {m.homeScore}
                              {m.penaltyWinner === m.homeTeam && " (P)"}
                            </span>
                          )}
                        </div>

                        <div className={`bracket-node-team ${awayWinner ? "winner" : m.status === "finished" && m.awayTeam ? "loser" : ""}`}>
                          <div className="bracket-node-team-info">
                            <span>{TEAMS[m.awayTeam]?.flag || "🏳️"}</span>
                            <span>{TEAMS[m.awayTeam]?.name || m.placeholderAway}</span>
                          </div>
                          {m.status === "finished" && m.awayTeam && (
                            <span className="bracket-node-score">
                              {m.awayScore}
                              {m.penaltyWinner === m.awayTeam && " (P)"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Semifinals */}
                <div className="bracket-column">
                  <div className="bracket-column-header">Semi-finals</div>
                  {matches.filter((m) => m.round === "SF").map((m) => {
                    const homeWinner = m.status === "finished" && m.winner === m.homeTeam;
                    const awayWinner = m.status === "finished" && m.winner === m.awayTeam;
                    return (
                      <div key={m.id} className="bracket-match-node">
                        <div className="bracket-node-header">{m.id}</div>
                        
                        <div className={`bracket-node-team ${homeWinner ? "winner" : m.status === "finished" && m.homeTeam ? "loser" : ""}`}>
                          <div className="bracket-node-team-info">
                            <span>{TEAMS[m.homeTeam]?.flag || "🏳️"}</span>
                            <span>{TEAMS[m.homeTeam]?.name || m.placeholderHome}</span>
                          </div>
                          {m.status === "finished" && m.homeTeam && (
                            <span className="bracket-node-score">
                              {m.homeScore}
                              {m.penaltyWinner === m.homeTeam && " (P)"}
                            </span>
                          )}
                        </div>

                        <div className={`bracket-node-team ${awayWinner ? "winner" : m.status === "finished" && m.awayTeam ? "loser" : ""}`}>
                          <div className="bracket-node-team-info">
                            <span>{TEAMS[m.awayTeam]?.flag || "🏳️"}</span>
                            <span>{TEAMS[m.awayTeam]?.name || m.placeholderAway}</span>
                          </div>
                          {m.status === "finished" && m.awayTeam && (
                            <span className="bracket-node-score">
                              {m.awayScore}
                              {m.penaltyWinner === m.awayTeam && " (P)"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Final */}
                <div className="bracket-column" style={{ justifyContent: "center" }}>
                  <div className="bracket-column-header">Final</div>
                  {matches.filter((m) => m.round === "F").map((m) => {
                    const homeWinner = m.status === "finished" && m.winner === m.homeTeam;
                    const awayWinner = m.status === "finished" && m.winner === m.awayTeam;
                    return (
                      <div key={m.id} className="bracket-match-node" style={{ borderColor: "var(--accent)", borderWidth: "2px" }}>
                        <div className="bracket-node-header" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "var(--accent)" }}>World Cup Final</div>
                        
                        <div className={`bracket-node-team ${homeWinner ? "winner" : m.status === "finished" && m.homeTeam ? "loser" : ""}`}>
                          <div className="bracket-node-team-info">
                            <span>{TEAMS[m.homeTeam]?.flag || "🏳️"}</span>
                            <span>{TEAMS[m.homeTeam]?.name || m.placeholderHome}</span>
                          </div>
                          {m.status === "finished" && m.homeTeam && (
                            <span className="bracket-node-score">
                              {m.homeScore}
                              {m.penaltyWinner === m.homeTeam && " (P)"}
                            </span>
                          )}
                        </div>

                        <div className={`bracket-node-team ${awayWinner ? "winner" : m.status === "finished" && m.awayTeam ? "loser" : ""}`}>
                          <div className="bracket-node-team-info">
                            <span>{TEAMS[m.awayTeam]?.flag || "🏳️"}</span>
                            <span>{TEAMS[m.awayTeam]?.name || m.placeholderAway}</span>
                          </div>
                          {m.status === "finished" && m.awayTeam && (
                            <span className="bracket-node-score">
                              {m.awayScore}
                              {m.penaltyWinner === m.awayTeam && " (P)"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Quick action button inside Bracket page for easier navigation */}
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "30px", marginBottom: "50px" }}>
                <button className="btn btn-primary" onClick={() => setActiveTab("admin")}>
                  ⚙️ Open Admin Dashboard to Input Scores
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: ADMIN PANEL */}
        {activeTab === "admin" && (
          <div className="container fade-in" style={{ paddingTop: "30px" }}>
            
            {/* Case: Not logged in */}
            {!isAdmin ? (
              <div style={{ maxWidth: "460px", margin: "40px auto 100px auto", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
                <h2 style={{ marginBottom: "12px" }}>Admin Access Required</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
                  Please enter the administrator password to unlock match result management and tournament controls.
                </p>

                <form onSubmit={handleLogin} className="dashboard-panel" style={{ textAlign: "left" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="admin-pw">Password</label>
                    <input
                      type="password"
                      id="admin-pw"
                      className="form-input"
                      placeholder="Enter admin password (hint: admin123)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-btn">Unlock Admin Dashboard</button>
                </form>
              </div>
            ) : (
              // Case: Logged In (Admin Dashboard)
              <div>
                <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "4px" }}>Admin Command Dashboard</h2>
                    <p style={{ color: "var(--text-muted)" }}>Logged in as administrator. Manage scores and advance tournament stages.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={handleLogout} style={{ border: "1px solid var(--danger)", color: "var(--danger)" }}>
                    🚪 Logout Admin
                  </button>
                </div>

                <div className="admin-dashboard-container">
                  
                  {/* LEFT COLUMN: Match Management */}
                  <div className="dashboard-panel" id="edit-form-section">
                    <h3 className="panel-title">⚽ Edit Match Results</h3>
                    
                    <form onSubmit={handleUpdateMatchScore}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="match-select">Select Match to Update</label>
                        <select
                          id="match-select"
                          className="form-input"
                          value={selectedMatchId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedMatchId(val);
                            const match = matches.find((m) => m.id === val);
                            if (match) {
                              setEditHomeScore(match.homeScore !== null ? match.homeScore : "0");
                              setEditAwayScore(match.awayScore !== null ? match.awayScore : "0");
                              setEditPenaltyWinner(match.penaltyWinner || "");
                            } else {
                              setEditHomeScore("");
                              setEditAwayScore("");
                              setEditPenaltyWinner("");
                            }
                          }}
                        >
                          <option value="">-- Choose a Match --</option>
                          <optgroup label="Group Stage Matches">
                            {matches.filter((m) => m.type === "group").map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.id} ({m.group}): {TEAMS[m.homeTeam]?.name} vs {TEAMS[m.awayTeam]?.name} {m.status === "finished" ? `(${m.homeScore}-${m.awayScore})` : "(Scheduled)"}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Knockout Matches">
                            {matches.filter((m) => m.type === "knockout").map((m) => {
                              const homeName = TEAMS[m.homeTeam]?.name || m.placeholderHome;
                              const awayName = TEAMS[m.awayTeam]?.name || m.placeholderAway;
                              return (
                                <option key={m.id} value={m.id} disabled={!m.homeTeam || !m.awayTeam}>
                                  {m.id} ({m.name}): {homeName} vs {awayName} {m.status === "finished" ? `(${m.homeScore}-${m.awayScore})` : "(Scheduled)"}
                                </option>
                              );
                            })}
                          </optgroup>
                        </select>
                      </div>

                      {selectedMatchId && (
                        <div className="fade-in">
                          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                            
                            {/* Home Input */}
                            <div style={{ textAlign: "center" }}>
                              <span style={{ fontSize: "36px", display: "block" }}>
                                {TEAMS[matches.find((m) => m.id === selectedMatchId)?.homeTeam]?.flag || "🏳️"}
                              </span>
                              <span style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
                                {TEAMS[matches.find((m) => m.id === selectedMatchId)?.homeTeam]?.name}
                              </span>
                              <input
                                type="number"
                                className="form-input"
                                style={{ textAlign: "center", fontSize: "20px" }}
                                value={editHomeScore}
                                onChange={(e) => setEditHomeScore(e.target.value)}
                                min="0"
                              />
                            </div>

                            <span style={{ fontSize: "24px", fontWeight: "bold", color: "var(--text-muted)" }}>-</span>

                            {/* Away Input */}
                            <div style={{ textAlign: "center" }}>
                              <span style={{ fontSize: "36px", display: "block" }}>
                                {TEAMS[matches.find((m) => m.id === selectedMatchId)?.awayTeam]?.flag || "🏳️"}
                              </span>
                              <span style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
                                {TEAMS[matches.find((m) => m.id === selectedMatchId)?.awayTeam]?.name}
                              </span>
                              <input
                                type="number"
                                className="form-input"
                                style={{ textAlign: "center", fontSize: "20px" }}
                                value={editAwayScore}
                                onChange={(e) => setEditAwayScore(e.target.value)}
                                min="0"
                              />
                            </div>
                          </div>

                          {/* Penalty Shootout Selector (Knockout Tiebreaker) */}
                          {matches.find((m) => m.id === selectedMatchId)?.type === "knockout" && editHomeScore === editAwayScore && editHomeScore !== "" && (
                            <div className="form-group fade-in" style={{
                              backgroundColor: "rgba(245, 158, 11, 0.08)",
                              padding: "16px",
                              borderRadius: "8px",
                              border: "1px solid var(--accent)",
                              marginBottom: "20px"
                            }}>
                              <label className="form-label" style={{ color: "var(--accent)" }}>⚡ Match ends in a Draw. Select Penalty Shootout Winner:</label>
                              <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}>
                                  <input
                                    type="radio"
                                    name="penaltyWinner"
                                    value={matches.find((m) => m.id === selectedMatchId)?.homeTeam}
                                    checked={editPenaltyWinner === matches.find((m) => m.id === selectedMatchId)?.homeTeam}
                                    onChange={(e) => setEditPenaltyWinner(e.target.value)}
                                  />
                                  {TEAMS[matches.find((m) => m.id === selectedMatchId)?.homeTeam]?.name} (Home)
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}>
                                  <input
                                    type="radio"
                                    name="penaltyWinner"
                                    value={matches.find((m) => m.id === selectedMatchId)?.awayTeam}
                                    checked={editPenaltyWinner === matches.find((m) => m.id === selectedMatchId)?.awayTeam}
                                    onChange={(e) => setEditPenaltyWinner(e.target.value)}
                                  />
                                  {TEAMS[matches.find((m) => m.id === selectedMatchId)?.awayTeam]?.name} (Away)
                                </label>
                              </div>
                            </div>
                          )}

                          <button type="submit" className="form-btn btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            💾 Save Score & Propagate
                          </button>
                        </div>
                      )}
                    </form>

                    <div style={{ marginTop: "30px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                      <h4 style={{ marginBottom: "10px", fontSize: "14px", color: "var(--text-muted)" }}>✏️ Fast Edit Helper</h4>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                        You can also browse matches in the <strong>Matches</strong> tab and click the <strong>✏️ Edit Score</strong> button on any card to instantly select and edit it here.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Tournament Controls */}
                  <div className="dashboard-panel control-panel">
                    <h3 className="panel-title">⚙️ Tournament Controls</h3>
                    
                    <div className="control-card">
                      <h5>🚀 Simulation Helper</h5>
                      <p>Automatically populate all unplayed group matches with random soccer scores for testing.</p>
                      <button className="form-btn" onClick={handleSimulateGroupStage}>
                        Simulate Group Stage
                      </button>
                    </div>

                    <div className="control-card">
                      <h5>👉 Advance to Knockout</h5>
                      <p>Take the top 2 teams from each group based on current standings and draw the Round of 16 bracket.</p>
                      <button className="form-btn" onClick={handleAdvanceToKnockout} style={{ backgroundColor: "var(--success)" }}>
                        Advance to Knockout
                      </button>
                    </div>

                    <div className="control-card" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
                      <h5 style={{ color: "var(--danger)" }}>⚠️ Danger Zone</h5>
                      <p>Clear all match scores, delete knockout progression, and restart the simulator.</p>
                      <button className="form-btn" onClick={handleResetTournament} style={{ backgroundColor: "var(--danger)" }}>
                        Reset Tournament
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer Element */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
            <span>WORLD CUP SIMULATOR 2026</span>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("home"); }}>Home</a>
            <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("standings"); }}>Standings</a>
            <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("matches"); }}>Matches</a>
            <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab("bracket"); }}>Bracket</a>
          </div>
          <p className="footer-copyright">
            © 2026 World Cup Simulator. Designed for WAD specifications. Developed with ❤️.
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
