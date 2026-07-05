import React, { useState } from "react";

function AdminDashboard({
  matches,
  setMatches,
  TEAMS,
  setTeams,
  GROUPS,
  STADIUMS,
  handleResetTournament,
  handleSimulateGroupStage,
  handleAdvanceToKnockout,
  addToast,
  onLogout
}) {
  const [activeAdminTab, setActiveAdminTab] = useState("matches");

  // State: Add Team Form
  const [newTeamCode, setNewTeamCode] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamGroup, setNewTeamGroup] = useState("A");
  const [newTeamFlag, setNewTeamFlag] = useState("🏳️");

  // State: Edit Team Form
  const [selectedTeamCode, setSelectedTeamCode] = useState("");
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamGroup, setEditTeamGroup] = useState("A");
  const [editTeamFlag, setEditTeamFlag] = useState("🏳️");

  // State: Match Editing Form
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [editHomeScore, setEditHomeScore] = useState("");
  const [editAwayScore, setEditAwayScore] = useState("");
  const [editPenaltyWinner, setEditPenaltyWinner] = useState("");
  const [editStadium, setEditStadium] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editKickoff, setEditKickoff] = useState("");
  const [editStatus, setEditStatus] = useState("scheduled");

  // --- HANDLER: Team Operations ---
  const handleAddTeam = (e) => {
    e.preventDefault();
    const code = newTeamCode.trim().toUpperCase();
    const name = newTeamName.trim();
    if (!code || !name) {
      addToast("Team Code and Name are required!", "error");
      return;
    }
    if (TEAMS[code]) {
      addToast(`Team with code ${code} already exists!`, "error");
      return;
    }

    const updatedTeams = {
      ...TEAMS,
      [code]: { id: code, name, code, group: newTeamGroup, flag: newTeamFlag }
    };
    setTeams(updatedTeams);
    addToast(`Team ${name} (${code}) added successfully!`);

    // Reset Form
    setNewTeamCode("");
    setNewTeamName("");
    setNewTeamGroup("A");
    setNewTeamFlag("🏳️");
  };

  const handleEditTeam = (e) => {
    e.preventDefault();
    if (!selectedTeamCode) return;

    const name = editTeamName.trim();
    if (!name) {
      addToast("Team Name is required!", "error");
      return;
    }

    const updatedTeams = {
      ...TEAMS,
      [selectedTeamCode]: {
        ...TEAMS[selectedTeamCode],
        name,
        group: editTeamGroup,
        flag: editTeamFlag
      }
    };
    setTeams(updatedTeams);
    addToast(`Team ${selectedTeamCode} updated successfully!`);
  };

  const handleDeleteTeam = (code) => {
    if (window.confirm(`Are you sure you want to delete team ${code}?`)) {
      const updatedTeams = { ...TEAMS };
      delete updatedTeams[code];
      setTeams(updatedTeams);
      addToast(`Team ${code} deleted.`);
      if (selectedTeamCode === code) {
        setSelectedTeamCode("");
        setEditTeamName("");
      }
    }
  };

  // --- HANDLER: Match Operations ---
  const handleUpdateMatchDetails = (e) => {
    e.preventDefault();
    if (!selectedMatchId) return;

    const matchToUpdate = matches.find((m) => m.id === selectedMatchId);
    if (!matchToUpdate) return;

    const homeScoreVal = editHomeScore !== "" ? parseInt(editHomeScore, 10) : null;
    const awayScoreVal = editAwayScore !== "" ? parseInt(editAwayScore, 10) : null;

    if (editStatus === "finished") {
      if (homeScoreVal === null || awayScoreVal === null || isNaN(homeScoreVal) || isNaN(awayScoreVal)) {
        addToast("Finished matches require scores!", "error");
        return;
      }
      if (matchToUpdate.type === "knockout" && homeScoreVal === awayScoreVal && !editPenaltyWinner) {
        addToast("Knockout matches cannot end in a draw! Choose a Penalty Winner.", "warning");
        return;
      }
    }

    let winnerTeam = null;
    if (matchToUpdate.type === "knockout" && editStatus === "finished") {
      if (homeScoreVal > awayScoreVal) {
        winnerTeam = matchToUpdate.homeTeam;
      } else if (awayScoreVal > homeScoreVal) {
        winnerTeam = matchToUpdate.awayTeam;
      } else {
        winnerTeam = editPenaltyWinner;
      }
    }

    let updatedMatches = matches.map((m) => {
      if (m.id === selectedMatchId) {
        return {
          ...m,
          homeScore: homeScoreVal,
          awayScore: awayScoreVal,
          status: editStatus,
          stadium: editStadium,
          date: editDate,
          kickoff: editKickoff,
          winner: winnerTeam,
          penaltyWinner: editStatus === "finished" && homeScoreVal === awayScoreVal ? editPenaltyWinner : null
        };
      }
      return m;
    });

    // Propagate winners if knockout
    if (matchToUpdate.type === "knockout" && editStatus === "finished" && winnerTeam) {
      const nextMatchId = matchToUpdate.nextMatchId;
      if (nextMatchId) {
        let tempMatches = [...updatedMatches];
        tempMatches = tempMatches.map((m) => {
          if (m.id === nextMatchId) {
            const nextNode = { ...m };
            if (matchToUpdate.isHomeInNextMatch) {
              nextNode.homeTeam = winnerTeam;
            } else {
              nextNode.awayTeam = winnerTeam;
            }
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
              nextNextId = node.nextMatchId;
              return node;
            }
            return m;
          });
          if (!nextFound) break;
        }
        updatedMatches = tempMatches;
      }
    }

    setMatches(updatedMatches);
    addToast(`Match ${selectedMatchId} updated successfully!`);

    // Reset Form
    setSelectedMatchId("");
    setEditHomeScore("");
    setEditAwayScore("");
    setEditPenaltyWinner("");
    setEditStadium("");
    setEditDate("");
    setEditKickoff("");
    setEditStatus("scheduled");
  };

  return (
    <div className="container fade-in" style={{ paddingTop: "30px", marginBottom: "60px" }}>
      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "4px", fontSize: "28px" }}>
        Admin Command Panel
      </h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px", fontSize: "14px" }}>
        Manage matches details, edit teams, and advance brackets. Changes apply globally instantly.
      </p>

      {/* Admin Subtabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "30px", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={`filter-tab ${activeAdminTab === "matches" ? "active" : ""}`}
            onClick={() => setActiveAdminTab("matches")}
          >
            ⚽ Edit Matches & Schedules
          </button>
          <button
            className={`filter-tab ${activeAdminTab === "teams" ? "active" : ""}`}
            onClick={() => setActiveAdminTab("teams")}
          >
            🚩 Team Editor (Add/Edit/Delete)
          </button>
          <button
            className={`filter-tab ${activeAdminTab === "controls" ? "active" : ""}`}
            onClick={() => setActiveAdminTab("controls")}
          >
            ⚙️ Controls Center
          </button>
        </div>
        <button onClick={onLogout} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", color: "white", backgroundColor: "var(--danger)", border: "none" }}>Logout</button>
      </div>

      {/* TAB: Edit Matches */}
      {activeAdminTab === "matches" && (
        <div className="admin-dashboard-container">
          <div className="dashboard-panel">
            <h3 className="panel-title">Match Detail Editor</h3>
            
            <form onSubmit={handleUpdateMatchDetails}>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-match-select">Select Match</label>
                <select
                  id="admin-match-select"
                  className="form-input"
                  value={selectedMatchId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedMatchId(id);
                    const m = matches.find((match) => match.id === id);
                    if (m) {
                      setEditHomeScore(m.homeScore !== null ? m.homeScore : "");
                      setEditAwayScore(m.awayScore !== null ? m.awayScore : "");
                      setEditPenaltyWinner(m.penaltyWinner || "");
                      setEditStadium(m.stadium || "");
                      setEditDate(m.date || "");
                      setEditKickoff(m.kickoff || "");
                      setEditStatus(m.status);
                    }
                  }}
                >
                  <option value="">-- Select a Match --</option>
                  <optgroup label="Group Stage Matches">
                    {matches.filter((m) => m.type === "group").map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} ({m.group}): {TEAMS[m.homeTeam]?.name || m.homeTeam} vs {TEAMS[m.awayTeam]?.name || m.awayTeam}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Knockout Matches">
                    {matches.filter((m) => m.type === "knockout").map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} ({m.name}): {TEAMS[m.homeTeam]?.name || m.placeholderHome} vs {TEAMS[m.awayTeam]?.name || m.placeholderAway}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {selectedMatchId && (
                <div className="fade-in">
                  
                  {/* Edit Scores Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {TEAMS[matches.find((m) => m.id === selectedMatchId)?.homeTeam]?.name || matches.find((m) => m.id === selectedMatchId)?.placeholderHome}
                      </span>
                      <input
                        type="number"
                        className="form-input"
                        style={{ textAlign: "center", marginTop: "8px" }}
                        placeholder="Home score"
                        value={editHomeScore}
                        onChange={(e) => setEditHomeScore(e.target.value)}
                        min="0"
                      />
                    </div>
                    <span style={{ fontWeight: "bold", color: "var(--text-muted)", fontSize: "20px" }}>-</span>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {TEAMS[matches.find((m) => m.id === selectedMatchId)?.awayTeam]?.name || matches.find((m) => m.id === selectedMatchId)?.placeholderAway}
                      </span>
                      <input
                        type="number"
                        className="form-input"
                        style={{ textAlign: "center", marginTop: "8px" }}
                        placeholder="Away score"
                        value={editAwayScore}
                        onChange={(e) => setEditAwayScore(e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Penalty Shootout Selector */}
                  {matches.find((m) => m.id === selectedMatchId)?.type === "knockout" && editHomeScore === editAwayScore && editHomeScore !== "" && (
                    <div className="form-group" style={{
                      backgroundColor: "rgba(244, 197, 66, 0.08)",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--accent)",
                      marginBottom: "20px"
                    }}>
                      <label className="form-label">Penalty Shootout Winner</label>
                      <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
                        <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                          <input
                            type="radio"
                            name="penaltyWinner"
                            value={matches.find((m) => m.id === selectedMatchId)?.homeTeam}
                            checked={editPenaltyWinner === matches.find((m) => m.id === selectedMatchId)?.homeTeam}
                            onChange={(e) => setEditPenaltyWinner(e.target.value)}
                          />
                          {TEAMS[matches.find((m) => m.id === selectedMatchId)?.homeTeam]?.name}
                        </label>
                        <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                          <input
                            type="radio"
                            name="penaltyWinner"
                            value={matches.find((m) => m.id === selectedMatchId)?.awayTeam}
                            checked={editPenaltyWinner === matches.find((m) => m.id === selectedMatchId)?.awayTeam}
                            onChange={(e) => setEditPenaltyWinner(e.target.value)}
                          />
                          {TEAMS[matches.find((m) => m.id === selectedMatchId)?.awayTeam]?.name}
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Status, Date, Stadium, Kickoff Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div className="form-group">
                      <label className="form-label">Match Status</label>
                      <select className="form-input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live</option>
                        <option value="finished">Finished</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Kickoff Time</label>
                      <input type="text" className="form-input" value={editKickoff} onChange={(e) => setEditKickoff(e.target.value)} placeholder="e.g. 18:00" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Match Date</label>
                      <input type="text" className="form-input" value={editDate} onChange={(e) => setEditDate(e.target.value)} placeholder="e.g. Jun 11, 2026" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Stadium Venue</label>
                      <input type="text" className="form-input" value={editStadium} onChange={(e) => setEditStadium(e.target.value)} />
                    </div>
                  </div>

                  <button type="submit" className="form-btn">Update Match Info</button>

                </div>
              )}
            </form>
          </div>

          <div className="dashboard-panel" style={{ height: "fit-content" }}>
            <h4 style={{ marginBottom: "12px", fontSize: "14px", color: "var(--text-muted)" }}>✏️ Fast Editor Tip</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Updating group match scores to <strong>finished</strong> recalculates standings automatically. Updating knockout match scores propagates the winners to the next rounds.
            </p>
          </div>
        </div>
      )}

      {/* TAB: Team Editor */}
      {activeAdminTab === "teams" && (
        <div className="admin-dashboard-container">
          
          {/* Add Team Panel */}
          <div className="dashboard-panel">
            <h3 className="panel-title">Add New Team</h3>
            <form onSubmit={handleAddTeam}>
              <div className="form-group">
                <label className="form-label" htmlFor="add-team-code">Team Code (3 Letters)</label>
                <input
                  type="text"
                  id="add-team-code"
                  className="form-input"
                  maxLength="3"
                  placeholder="e.g. ITA"
                  value={newTeamCode}
                  onChange={(e) => setNewTeamCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-team-name">Team Name</label>
                <input
                  type="text"
                  id="add-team-name"
                  className="form-input"
                  placeholder="e.g. Italy"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div className="form-group">
                  <label className="form-label">Group Assignment</label>
                  <select className="form-input" value={newTeamGroup} onChange={(e) => setNewTeamGroup(e.target.value)}>
                    {GROUPS.map((g) => <option key={g} value={g}>Group {g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji Flag</label>
                  <input type="text" className="form-input" value={newTeamFlag} onChange={(e) => setNewTeamFlag(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="form-btn">Add Team</button>
            </form>
          </div>

          {/* Edit / Delete Team Panel */}
          <div className="dashboard-panel">
            <h3 className="panel-title">Edit / Delete Teams</h3>
            
            <div className="form-group">
              <label className="form-label">Select Team to Edit</label>
              <select
                className="form-input"
                value={selectedTeamCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setSelectedTeamCode(code);
                  const team = TEAMS[code];
                  if (team) {
                    setEditTeamName(team.name);
                    setEditTeamGroup(team.group);
                    setEditTeamFlag(team.flag);
                  }
                }}
              >
                <option value="">-- Choose Team --</option>
                {Object.values(TEAMS).sort((a,b) => a.name.localeCompare(b.name)).map((t) => (
                  <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                ))}
              </select>
            </div>

            {selectedTeamCode && (
              <form onSubmit={handleEditTeam} className="fade-in">
                <div className="form-group">
                  <label className="form-label">Team Name</label>
                  <input type="text" className="form-input" value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div className="form-group">
                    <label className="form-label">Group</label>
                    <select className="form-input" value={editTeamGroup} onChange={(e) => setEditTeamGroup(e.target.value)}>
                      {GROUPS.map((g) => <option key={g} value={g}>Group {g}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Flag Emoji</label>
                    <input type="text" className="form-input" value={editTeamFlag} onChange={(e) => setEditTeamFlag(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button type="submit" className="form-btn" style={{ flex: 1 }}>Save Changes</button>
                  <button
                    type="button"
                    className="form-btn"
                    style={{ flex: 1, backgroundColor: "var(--danger)" }}
                    onClick={() => handleDeleteTeam(selectedTeamCode)}
                  >
                    Delete Team
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      )}

      {/* TAB: Controls */}
      {activeAdminTab === "controls" && (
        <div className="admin-dashboard-container" style={{ gridTemplateColumns: "1fr" }}>
          <div className="dashboard-panel">
            <h3 className="panel-title">Tournament Management Controls</h3>
            
            <div className="control-panel" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              
              <div className="control-card">
                <h5>🚀 Simulate Rest of Groups</h5>
                <p>Run quick simulations for all remaining group stage games to fill the standings tables automatically.</p>
                <button className="form-btn" onClick={handleSimulateGroupStage}>
                  Simulate Group Matches
                </button>
              </div>

              <div className="control-card">
                <h5>🏆 Generate Knockout Bracket</h5>
                <p>Fetch the top 2 teams from each of the 12 groups + the 8 best 3rd place teams, and generate the Round of 32.</p>
                <button className="form-btn" onClick={handleAdvanceToKnockout} style={{ backgroundColor: "var(--success)" }}>
                  Generate Bracket
                </button>
              </div>

              <div className="control-card" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
                <h5 style={{ color: "var(--danger)" }}>⚠️ Danger Zone: Reset Tournament</h5>
                <p>Delete all match scores, clear brackets, reset configurations, and restart the simulator.</p>
                <button className="form-btn" onClick={handleResetTournament} style={{ backgroundColor: "var(--danger)" }}>
                  Reset All Match Data
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
