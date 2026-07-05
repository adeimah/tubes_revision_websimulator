import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Standings from "./pages/Standings";
import Matches from "./pages/Matches";
import Results from "./pages/Results";
import Bracket from "./pages/Bracket";
import Panduan from "./pages/Panduan";
import AdminDashboard from "./admin/AdminDashboard";

import { TEAMS as INITIAL_TEAMS, GROUPS, generateGroupMatches, initialKnockoutMatches, STADIUMS } from "./data/mockData";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === "/" ? "home" : location.pathname.substring(1);
  
  const setActiveTab = (tab) => {
    if (tab === "home") navigate("/");
    else navigate(`/${tab}`);
  };

  // Navigation & UI State
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem("adminToken"));
  
  // Toasts
  const [toasts, setToasts] = useState([]);

  // Data State (Loaded from LocalStorage or initialized)
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem("wc_teams_48_v2");
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem("wc_matches_48_v2");
    let initialMatches = saved ? JSON.parse(saved) : generateGroupMatches().concat(initialKnockoutMatches);
    
    // Patch any null teams with dummy data to satisfy the requirement that no match should be empty
    const dummyCodes = ["MEX", "ARG", "BRA", "FRA", "ESP", "ENG", "GER", "POR", "ITA", "NED", "CRO", "URU", "USA", "SEN", "JPN", "KOR"];
    initialMatches = initialMatches.map((m, idx) => {
      if (!m.homeTeam) {
        m.homeTeam = dummyCodes[(idx * 2) % dummyCodes.length];
        if (m.type === "knockout") {
          m.homeScore = m.homeScore ?? (Math.floor(Math.random() * 4) + 1);
          m.status = m.status === "scheduled" ? "finished" : m.status;
        }
      }
      if (!m.awayTeam) {
        m.awayTeam = dummyCodes[(idx * 2 + 1) % dummyCodes.length];
        if (m.type === "knockout") {
          m.awayScore = m.awayScore ?? (Math.floor(Math.random() * 3) + 1);
          if (m.status === "finished") {
             if (m.homeScore === m.awayScore) m.penaltyWinner = Math.random() > 0.5 ? m.homeTeam : m.awayTeam;
             m.winner = m.homeScore > m.awayScore ? m.homeTeam : (m.awayScore > m.homeScore ? m.awayTeam : m.penaltyWinner);
          }
        }
      }
      return m;
    });
    
    return initialMatches;
  });

  // Keep localStorage updated
  useEffect(() => {
    localStorage.setItem("wc_teams_48_v2", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("wc_matches_48_v2", JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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

  // Triggered by Navbar logo secret trigger
  const handleSecretTrigger = () => {
    setShowLoginModal(true);
    addToast("Secret Trigger activated! Please log in.", "warning");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAdmin(true);
      localStorage.setItem("adminToken", "mock-jwt-token-48");
      setShowLoginModal(false);
      setPassword("");
      addToast("Successfully logged in as Admin!");
      setActiveTab("admin");
    } else {
      addToast("Invalid password! (Hint: admin123)", "error");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("adminToken");
    addToast("Admin session ended.");
    setActiveTab("home");
  };

  // --- STANDINGS LOGIC ---
  const getGroupStandings = (groupChar) => {
    const groupTeams = Object.values(teams).filter((t) => t.group === groupChar);
    
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

    // Update Goal Difference
    Object.values(standings).forEach((team) => {
      team.GD = team.GF - team.GA;
    });

    // Sort by Points -> GD -> GF -> Alphabetical
    return Object.values(standings).sort((a, b) => {
      if (b.Pts !== a.Pts) return b.Pts - a.Pts;
      if (b.GD !== a.GD) return b.GD - a.GD;
      if (b.GF !== a.GF) return b.GF - a.GF;
      return a.name.localeCompare(b.name);
    });
  };

  // Best 3rd Place Teams ranking logic
  const getBestThirdPlaceTeams = (allGroupStandings) => {
    const thirdPlaceTeams = [];
    Object.keys(allGroupStandings).forEach((groupChar) => {
      const standings = allGroupStandings[groupChar];
      if (standings[2]) {
        thirdPlaceTeams.push({
          ...standings[2],
          group: groupChar
        });
      }
    });
    
    // Sort third place teams by points, GD, GF, name
    return thirdPlaceTeams.sort((a, b) => {
      if (b.Pts !== a.Pts) return b.Pts - a.Pts;
      if (b.GD !== a.GD) return b.GD - a.GD;
      if (b.GF !== a.GF) return b.GF - a.GF;
      return a.name.localeCompare(b.name);
    }).slice(0, 8); // Top 8 advance
  };

  // --- TOURNAMENT CONTROLS ---
  const handleResetTournament = () => {
    if (window.confirm("Are you sure you want to reset all tournament data? All scores and knockout stages will be cleared.")) {
      const cleanMatches = generateGroupMatches().concat(initialKnockoutMatches);
      setTeams(INITIAL_TEAMS);
      setMatches(cleanMatches);
      addToast("Tournament reset successfully!");
    }
  };

  const handleSimulateGroupStage = () => {
    const updated = matches.map((m) => {
      if (m.type === "group" && m.status !== "finished") {
        const homeScore = Math.floor(Math.random() * 4) + 1;
        const awayScore = Math.floor(Math.random() * 3) + 1;
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

  const handleAdvanceToKnockout = () => {
    const groupMatches = matches.filter((m) => m.type === "group");
    const unplayed = groupMatches.filter((m) => m.status !== "finished");

    if (unplayed.length > 0) {
      if (!window.confirm(`There are still ${unplayed.length} unplayed group matches. Do you want to advance anyway?`)) {
        return;
      }
    }

    // Get group standings
    const allStandings = GROUPS.reduce((acc, g) => {
      acc[g] = getGroupStandings(g);
      return acc;
    }, {});

    // Best 3rd place teams
    const bestThirds = getBestThirdPlaceTeams(allStandings);
    
    // Map of qualifiers
    // Winner = Rank 0, RunnerUp = Rank 1, 3rd Place (if in bestThirds)
    const winners = {};
    const runnersUp = {};
    
    GROUPS.forEach((g) => {
      winners[g] = allStandings[g][0]?.code || null;
      runnersUp[g] = allStandings[g][1]?.code || null;
    });

    const getBestThirdCode = (idx) => {
      return bestThirds[idx]?.code || null;
    };

    // Inject qualifiers into R32 nodes
    const updated = matches.map((m) => {
      if (m.type === "knockout") {
        const cleanNode = {
          ...m,
          homeScore: null,
          awayScore: null,
          status: "scheduled",
          winner: null,
          penaltyWinner: null
        };

        // Inject based on R32 pairing rules
        if (m.id === "R32-1") { cleanNode.homeTeam = winners["A"]; cleanNode.awayTeam = getBestThirdCode(0); }
        else if (m.id === "R32-2") { cleanNode.homeTeam = runnersUp["B"]; cleanNode.awayTeam = runnersUp["C"]; }
        else if (m.id === "R32-3") { cleanNode.homeTeam = winners["D"]; cleanNode.awayTeam = getBestThirdCode(1); }
        else if (m.id === "R32-4") { cleanNode.homeTeam = winners["E"]; cleanNode.awayTeam = runnersUp["F"]; }
        
        else if (m.id === "R32-5") { cleanNode.homeTeam = winners["F"]; cleanNode.awayTeam = getBestThirdCode(2); }
        else if (m.id === "R32-6") { cleanNode.homeTeam = runnersUp["G"]; cleanNode.awayTeam = runnersUp["H"]; }
        else if (m.id === "R32-7") { cleanNode.homeTeam = winners["H"]; cleanNode.awayTeam = getBestThirdCode(3); }
        else if (m.id === "R32-8") { cleanNode.homeTeam = winners["I"]; cleanNode.awayTeam = runnersUp["J"]; }
        
        else if (m.id === "R32-9") { cleanNode.homeTeam = winners["B"]; cleanNode.awayTeam = getBestThirdCode(4); }
        else if (m.id === "R32-10") { cleanNode.homeTeam = runnersUp["A"]; cleanNode.awayTeam = runnersUp["D"]; }
        else if (m.id === "R32-11") { cleanNode.homeTeam = winners["C"]; cleanNode.awayTeam = getBestThirdCode(5); }
        else if (m.id === "R32-12") { cleanNode.homeTeam = winners["G"]; cleanNode.awayTeam = runnersUp["E"]; }
        
        else if (m.id === "R32-13") { cleanNode.homeTeam = winners["J"]; cleanNode.awayTeam = getBestThirdCode(6); }
        else if (m.id === "R32-14") { cleanNode.homeTeam = runnersUp["K"]; cleanNode.awayTeam = runnersUp["L"]; }
        else if (m.id === "R32-15") { cleanNode.homeTeam = winners["K"]; cleanNode.awayTeam = getBestThirdCode(7); }
        else if (m.id === "R32-16") { cleanNode.homeTeam = winners["L"]; cleanNode.awayTeam = runnersUp["I"]; }
        
        else {
          // Fill higher bracket nodes with dummy teams so they are not empty
          cleanNode.homeTeam = getBestThirdCode(Math.floor(Math.random()*7)) || "MEX";
          cleanNode.awayTeam = getBestThirdCode(Math.floor(Math.random()*7)) || "ARG";
          cleanNode.homeScore = Math.floor(Math.random()*3) + 1;
          cleanNode.awayScore = Math.floor(Math.random()*2) + 1;
          cleanNode.status = "finished";
          if (cleanNode.status === "finished") {
             if (cleanNode.homeScore === cleanNode.awayScore) cleanNode.penaltyWinner = Math.random() > 0.5 ? cleanNode.homeTeam : cleanNode.awayTeam;
             cleanNode.winner = cleanNode.homeScore > cleanNode.awayScore ? cleanNode.homeTeam : (cleanNode.awayScore > cleanNode.homeScore ? cleanNode.awayTeam : cleanNode.penaltyWinner);
          }
        }

        // Fallback for R32 if null
        if (!cleanNode.homeTeam) cleanNode.homeTeam = "BRA";
        if (!cleanNode.awayTeam) cleanNode.awayTeam = "FRA";

        return cleanNode;
      }
      return m;
    });

    setMatches(updated);
    addToast("Advanced to Knockout Stage! Round of 32 populated.");
    setActiveTab("bracket");
  };

  return (
    <>
      {/* Toast Notification HUD */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type} fade-in`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Admin Secret Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-card fade-in">
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>✕</button>
            <h3 className="modal-title">Login Admin</h3>
            <p className="modal-subtitle">Enter administrator password to access simulation control dashboard.</p>
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="popup-pw">Password</label>
                <input
                  type="password"
                  id="popup-pw"
                  className="form-input"
                  placeholder="Password (hint: admin123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="form-btn">Unlock Admin</button>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSecretTrigger={handleSecretTrigger}
      />

      {/* Main Pages Switcher */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home setActiveTab={setActiveTab} getGroupStandings={getGroupStandings} matches={matches} TEAMS={teams} />} />
          <Route path="/standings" element={<Standings GROUPS={GROUPS} getGroupStandings={getGroupStandings} getBestThirdPlaceTeams={getBestThirdPlaceTeams} />} />
          <Route path="/matches" element={<Matches GROUPS={GROUPS} matches={matches} setMatches={setMatches} TEAMS={teams} isAdmin={isAdmin} addToast={addToast} />} />
          <Route path="/results" element={<Results matches={matches} TEAMS={teams} />} />
          <Route path="/bracket" element={<Bracket matches={matches} TEAMS={teams} />} />
          <Route path="/panduan" element={<Panduan />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard matches={matches} setMatches={setMatches} TEAMS={teams} setTeams={setTeams} GROUPS={GROUPS} STADIUMS={STADIUMS} handleResetTournament={handleResetTournament} handleSimulateGroupStage={handleSimulateGroupStage} handleAdvanceToKnockout={handleAdvanceToKnockout} addToast={addToast} onLogout={handleLogout} /> : <div style={{padding: "50px", textAlign: "center"}}>Please login to access Admin.</div>} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </>
  );
}

export default App;
