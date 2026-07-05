import React, { useState } from "react";

function Matches({ GROUPS, matches, setMatches, TEAMS, isAdmin, addToast }) {
  const [selectedGroupTab, setSelectedGroupTab] = useState("A");

  // Keep track of score values being edited locally in input fields
  const [tempScores, setTempScores] = useState({});

  const handleScoreChange = (matchId, teamType, val) => {
    setTempScores((prev) => ({
      ...prev,
      [`${matchId}_${teamType}`]: val
    }));
  };

  const handleSaveScore = (matchId) => {
    const homeVal = tempScores[`${matchId}_home`];
    const awayVal = tempScores[`${matchId}_away`];

    const homeScore = parseInt(homeVal, 10);
    const awayScore = parseInt(awayVal, 10);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      addToast("Scores must be valid positive numbers!", "error");
      return;
    }

    setMatches((prevMatches) =>
      prevMatches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            homeScore,
            awayScore,
            status: "finished"
          };
        }
        return m;
      })
    );
    addToast(`Match ${matchId} score saved successfully!`);
  };

  const groupMatches = matches.filter((m) => m.type === "group" && m.group === selectedGroupTab);

  return (
    <div className="container fade-in" style={{ paddingTop: "30px", marginBottom: "50px" }}>
      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "8px", fontSize: "28px" }}>
        Group Stage Matches
      </h2>


      {/* Group Tabs Navigation (A-L) */}
      <div style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "12px",
        marginBottom: "30px",
        borderBottom: "1px solid var(--border)"
      }}>
        {GROUPS.map((g) => (
          <button
            key={g}
            className={`filter-tab ${selectedGroupTab === g ? "active" : ""}`}
            style={{ minWidth: "80px" }}
            onClick={() => setSelectedGroupTab(g)}
          >
            Group {g}
          </button>
        ))}
      </div>

      {/* Group Matches Render */}
      <div className="matches-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))" }}>
        {groupMatches.map((m) => {
          const home = TEAMS[m.homeTeam];
          const away = TEAMS[m.awayTeam];
          const isFinished = m.status === "finished";

          // Read local inputs if available, else database scores
          const homeInput = tempScores[`${m.id}_home`] !== undefined 
            ? tempScores[`${m.id}_home`] 
            : (m.homeScore !== null ? m.homeScore : "");
            
          const awayInput = tempScores[`${m.id}_away`] !== undefined 
            ? tempScores[`${m.id}_away`] 
            : (m.awayScore !== null ? m.awayScore : "");

          return (
            <div key={m.id} className="match-card">
              <div className="match-card-header">
                <span>Group {m.group}</span>
                <span className={`match-status-badge ${m.status}`}>{m.status}</span>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                📍 {m.stadium} • {m.date} • {m.kickoff}
              </div>

              <div className="match-teams-layout" style={{ margin: "16px 0" }}>
                {/* Home */}
                <div className="team-display home" style={{ flex: "1.2" }}>
                  <span className="team-display-flag">{home?.flag}</span>
                  <span className="team-display-name" style={{ fontSize: "14px" }}>{home?.name}</span>
                </div>

                {/* Score Input/Display */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {isAdmin ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: "50px", textAlign: "center", padding: "6px" }}
                        value={homeInput}
                        min="0"
                        onChange={(e) => handleScoreChange(m.id, "home", e.target.value)}
                      />
                      <span style={{ color: "var(--text-muted)" }}>:</span>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: "50px", textAlign: "center", padding: "6px" }}
                        value={awayInput}
                        min="0"
                        onChange={(e) => handleScoreChange(m.id, "away", e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="score-box" style={{ fontSize: "16px", padding: "6px 12px" }}>
                      <span>{isFinished ? m.homeScore : "-"}</span>
                      <span className="score-separator">-</span>
                      <span>{isFinished ? m.awayScore : "-"}</span>
                    </div>
                  )}
                </div>

                {/* Away */}
                <div className="team-display away" style={{ flex: "1.2" }}>
                  <span className="team-display-flag">{away?.flag}</span>
                  <span className="team-display-name" style={{ fontSize: "14px" }}>{away?.name}</span>
                </div>
              </div>

              {/* Admin Save Button */}
              {isAdmin && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "4px 12px", fontSize: "12px", borderRadius: "6px" }}
                    onClick={() => handleSaveScore(m.id)}
                  >
                    Save Score
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Matches;
