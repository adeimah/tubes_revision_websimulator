require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  initPrisma,
  getTeams,
  getMatches,
  resetTournament,
  simulateGroupStage,
  advanceToKnockout,
  updateMatchScore
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Database connection on start
initPrisma();

app.get('/', (req, res) => {
  res.json({
    message: "Tubes World Cup Web Simulator Backend API is running!",
    endpoints: {
      "GET /api/teams": "Get all teams",
      "GET /api/matches": "Get all matches",
      "POST /api/matches/reset": "Reset all tournament data",
      "POST /api/matches/simulate-group": "Simulate unplayed group stage matches",
      "POST /api/matches/advance-knockout": "Calculate standings and generate knockout bracket",
      "PUT /api/matches/:id": "Update score of a specific match"
    }
  });
});

// GET /api/teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await getTeams();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/matches
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await getMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/matches/reset
app.post('/api/matches/reset', async (req, res) => {
  try {
    const matches = await resetTournament();
    res.json({ message: "Tournament reset successfully", matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/matches/simulate-group
app.post('/api/matches/simulate-group', async (req, res) => {
  try {
    const matches = await simulateGroupStage();
    res.json({ message: "Group stage simulated successfully", matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/matches/advance-knockout
app.post('/api/matches/advance-knockout', async (req, res) => {
  try {
    const matches = await advanceToKnockout();
    res.json({ message: "Advanced to knockout stage successfully", matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/matches/:id
app.put('/api/matches/:id', async (req, res) => {
  const { id } = req.params;
  const { homeScore, awayScore, penaltyWinner } = req.body;

  if (homeScore === undefined || awayScore === undefined) {
    return res.status(400).json({ error: "homeScore and awayScore are required in request body" });
  }

  try {
    const matches = await updateMatchScore(
      id,
      parseInt(homeScore, 10),
      parseInt(awayScore, 10),
      penaltyWinner || null
    );
    res.json({ message: `Match ${id} updated successfully`, matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
