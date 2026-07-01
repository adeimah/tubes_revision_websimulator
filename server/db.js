const { PrismaClient } = require('./generated/prisma');

// --- Static Data and Generators (from frontend) ---
const TEAMS = {
  // Group A
  QAT: { id: "QAT", name: "Qatar", code: "QAT", group: "A", flag: "🇶🇦" },
  ECU: { id: "ECU", name: "Ecuador", code: "ECU", group: "A", flag: "🇪🇨" },
  SEN: { id: "SEN", name: "Senegal", code: "SEN", group: "A", flag: "🇸🇳" },
  NED: { id: "NED", name: "Netherlands", code: "NED", group: "A", flag: "🇳🇱" },
  // Group B
  ENG: { id: "ENG", name: "England", code: "ENG", group: "B", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  IRN: { id: "IRN", name: "Iran", code: "IRN", group: "B", flag: "🇮🇷" },
  USA: { id: "USA", name: "USA", code: "USA", group: "B", flag: "🇺🇸" },
  WAL: { id: "WAL", name: "Wales", code: "WAL", group: "B", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  // Group C
  ARG: { id: "ARG", name: "Argentina", code: "ARG", group: "C", flag: "🇦🇷" },
  KSA: { id: "KSA", name: "Saudi Arabia", code: "KSA", group: "C", flag: "🇸🇦" },
  MEX: { id: "MEX", name: "Mexico", code: "MEX", group: "C", flag: "🇲🇽" },
  POL: { id: "POL", name: "Poland", code: "POL", group: "C", flag: "🇵🇱" },
  // Group D
  FRA: { id: "FRA", name: "France", code: "FRA", group: "D", flag: "🇫🇷" },
  AUS: { id: "AUS", name: "Australia", code: "AUS", group: "D", flag: "🇦🇺" },
  DEN: { id: "DEN", name: "Denmark", code: "DEN", group: "D", flag: "🇩🇰" },
  TUN: { id: "TUN", name: "Tunisia", code: "TUN", group: "D", flag: "🇹🇳" },
  // Group E
  ESP: { id: "ESP", name: "Spain", code: "ESP", group: "E", flag: "🇪🇸" },
  CRC: { id: "CRC", name: "Costa Rica", code: "CRC", group: "E", flag: "🇨🇷" },
  GER: { id: "GER", name: "Germany", code: "GER", group: "E", flag: "🇩🇪" },
  JPN: { id: "JPN", name: "Japan", code: "JPN", group: "E", flag: "🇯🇵" },
  // Group F
  BEL: { id: "BEL", name: "Belgium", code: "BEL", group: "F", flag: "🇧🇪" },
  CAN: { id: "CAN", name: "Canada", code: "CAN", group: "F", flag: "🇨🇦" },
  MAR: { id: "MAR", name: "Morocco", code: "MAR", group: "F", flag: "🇲🇦" },
  CRO: { id: "CRO", name: "Croatia", code: "CRO", group: "F", flag: "🇭🇷" },
  // Group G
  BRA: { id: "BRA", name: "Brazil", code: "BRA", group: "G", flag: "🇧🇷" },
  SRB: { id: "SRB", name: "Serbia", code: "SRB", group: "G", flag: "🇷🇸" },
  SUI: { id: "SUI", name: "Switzerland", code: "SUI", group: "G", flag: "🇨🇭" },
  CMR: { id: "CMR", name: "Cameroon", code: "CMR", group: "G", flag: "🇨🇲" },
  // Group H
  POR: { id: "POR", name: "Portugal", code: "POR", group: "H", flag: "🇵🇹" },
  GHA: { id: "GHA", name: "Ghana", code: "GHA", group: "H", flag: "🇬🇭" },
  URU: { id: "URU", name: "Uruguay", code: "URU", group: "H", flag: "🇺🇾" },
  KOR: { id: "KOR", name: "South Korea", code: "KOR", group: "H", flag: "🇰🇷" },
};

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const generateGroupMatches = () => {
  const matches = [];
  let matchId = 1;

  GROUPS.forEach((groupChar) => {
    const groupTeams = Object.values(TEAMS).filter((t) => t.group === groupChar);
    
    // Day 1
    matches.push({
      id: `G-${matchId++}`,
      type: "group",
      group: groupChar,
      homeTeam: groupTeams[0].code,
      awayTeam: groupTeams[1].code,
      homeScore: null,
      awayScore: null,
      status: "scheduled",
    });
    matches.push({
      id: `G-${matchId++}`,
      type: "group",
      group: groupChar,
      homeTeam: groupTeams[2].code,
      awayTeam: groupTeams[3].code,
      homeScore: null,
      awayScore: null,
      status: "scheduled",
    });

    // Day 2
    matches.push({
      id: `G-${matchId++}`,
      type: "group",
      group: groupChar,
      homeTeam: groupTeams[0].code,
      awayTeam: groupTeams[2].code,
      homeScore: null,
      awayScore: null,
      status: "scheduled",
    });
    matches.push({
      id: `G-${matchId++}`,
      type: "group",
      group: groupChar,
      homeTeam: groupTeams[1].code,
      awayTeam: groupTeams[3].code,
      homeScore: null,
      awayScore: null,
      status: "scheduled",
    });

    // Day 3
    matches.push({
      id: `G-${matchId++}`,
      type: "group",
      group: groupChar,
      homeTeam: groupTeams[3].code,
      awayTeam: groupTeams[0].code,
      homeScore: null,
      awayScore: null,
      status: "scheduled",
    });
    matches.push({
      id: `G-${matchId++}`,
      type: "group",
      group: groupChar,
      homeTeam: groupTeams[1].code,
      awayTeam: groupTeams[2].code,
      homeScore: null,
      awayScore: null,
      status: "scheduled",
    });
  });

  return matches;
};

const initialKnockoutMatches = [
  // Round of 16
  { id: "R16-1", type: "knockout", round: "R16", name: "Round of 16", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "QF-1", isHomeInNextMatch: true, placeholderHome: "Winner Group A", placeholderAway: "Runner-up Group B" },
  { id: "R16-2", type: "knockout", round: "R16", name: "Round of 16", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "QF-1", isHomeInNextMatch: false, placeholderHome: "Winner Group C", placeholderAway: "Runner-up Group D" },
  { id: "R16-3", type: "knockout", round: "R16", name: "Round of 16", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "QF-2", isHomeInNextMatch: true, placeholderHome: "Winner Group E", placeholderAway: "Runner-up Group F" },
  { id: "R16-4", type: "knockout", round: "R16", name: "Round of 16", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "QF-2", isHomeInNextMatch: false, placeholderHome: "Winner Group G", placeholderAway: "Runner-up Group H" },
  { id: "R16-5", type: "knockout", round: "R16", name: "Round of 16", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "QF-3", isHomeInNextMatch: true, placeholderHome: "Winner Group B", placeholderAway: "Runner-up Group A" },
  { id: "R16-6", type: "knockout", round: "R16", name: "Round of 16", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "QF-3", isHomeInNextMatch: false, placeholderHome: "Winner Group D", placeholderAway: "Runner-up Group C" },
  { id: "R16-7", type: "knockout", round: "R16", name: "Round of 16", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "QF-4", isHomeInNextMatch: true, placeholderHome: "Winner Group F", placeholderAway: "Runner-up Group E" },
  { id: "R16-8", type: "knockout", round: "R16", name: "Round of 16", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "QF-4", isHomeInNextMatch: false, placeholderHome: "Winner Group H", placeholderAway: "Runner-up Group G" },

  // Quarterfinals
  { id: "QF-1", type: "knockout", round: "QF", name: "Quarter-final", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "SF-1", isHomeInNextMatch: true, placeholderHome: "Winner R16-1", placeholderAway: "Winner R16-2" },
  { id: "QF-2", type: "knockout", round: "QF", name: "Quarter-final", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "SF-1", isHomeInNextMatch: false, placeholderHome: "Winner R16-3", placeholderAway: "Winner R16-4" },
  { id: "QF-3", type: "knockout", round: "QF", name: "Quarter-final", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "SF-2", isHomeInNextMatch: true, placeholderHome: "Winner R16-5", placeholderAway: "Winner R16-6" },
  { id: "QF-4", type: "knockout", round: "QF", name: "Quarter-final", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "SF-2", isHomeInNextMatch: false, placeholderHome: "Winner R16-7", placeholderAway: "Winner R16-8" },

  // Semifinals
  { id: "SF-1", type: "knockout", round: "SF", name: "Semi-final", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "F", isHomeInNextMatch: true, placeholderHome: "Winner QF-1", placeholderAway: "Winner QF-2" },
  { id: "SF-2", type: "knockout", round: "SF", name: "Semi-final", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: "F", isHomeInNextMatch: false, placeholderHome: "Winner QF-3", placeholderAway: "Winner QF-4" },

  // Final
  { id: "F", type: "knockout", round: "F", name: "Final", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, status: "scheduled", nextMatchId: null, placeholderHome: "Winner SF-1", placeholderAway: "Winner SF-2" }
];

// --- In-Memory Fallback Database ---
let inMemoryTeams = Object.values(TEAMS);
let inMemoryMatches = generateGroupMatches().concat(initialKnockoutMatches);

// --- Prisma Initialization with Fallback Support ---
let prisma = null;
let useDatabase = false;

const isPasswordPlaceholder = (url) => {
  return !url || url.includes('[YOUR-PASSWORD]');
};

const initPrisma = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (isPasswordPlaceholder(dbUrl)) {
    console.warn("⚠️  DATABASE_URL uses [YOUR-PASSWORD] placeholder. Falling back to In-Memory DB.");
    useDatabase = false;
    return;
  }

  try {
    prisma = new PrismaClient();
    // Test connection
    await prisma.$connect();
    useDatabase = true;
    console.log("🚀 Connected to Supabase PostgreSQL via Prisma Client!");
    await seedDatabaseIfNeeded();
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL database. Falling back to In-Memory DB.", error.message);
    useDatabase = false;
  }
};

const seedDatabaseIfNeeded = async () => {
  if (!useDatabase || !prisma) return;
  try {
    const teamCount = await prisma.team.count();
    if (teamCount === 0) {
      console.log("🌱 Database is empty. Seeding teams and matches...");
      
      // Seed teams
      await prisma.team.createMany({
        data: Object.values(TEAMS).map(t => ({
          id: t.id,
          name: t.name,
          code: t.code,
          group: t.group,
          flag: t.flag
        }))
      });

      // Seed matches
      const defaultMatches = generateGroupMatches().concat(initialKnockoutMatches);
      await prisma.match.createMany({
        data: defaultMatches.map(m => ({
          id: m.id,
          type: m.type,
          group: m.group || null,
          round: m.round || null,
          name: m.name || null,
          homeTeam: m.homeTeam || null,
          awayTeam: m.awayTeam || null,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
          nextMatchId: m.nextMatchId || null,
          isHomeInNextMatch: m.isHomeInNextMatch !== undefined ? m.isHomeInNextMatch : null,
          placeholderHome: m.placeholderHome || null,
          placeholderAway: m.placeholderAway || null,
          winner: m.winner || null,
          penaltyWinner: m.penaltyWinner || null
        }))
      });

      console.log("🌱 Database successfully seeded with 32 teams and 63 matches!");
    } else {
      console.log("👍 Database already contains data. Skipping seeding.");
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
};

// --- Database operations abstraction ---

const getTeams = async () => {
  if (useDatabase && prisma) {
    try {
      return await prisma.team.findMany();
    } catch (e) {
      console.error("Prisma error, falling back to memory:", e.message);
    }
  }
  return inMemoryTeams;
};

const getMatches = async () => {
  if (useDatabase && prisma) {
    try {
      // Sort matches so they return in consistent order
      const dbMatches = await prisma.match.findMany();
      return dbMatches;
    } catch (e) {
      console.error("Prisma error, falling back to memory:", e.message);
    }
  }
  return inMemoryMatches;
};

const resetTournament = async () => {
  const cleanMatches = generateGroupMatches().concat(initialKnockoutMatches);
  
  if (useDatabase && prisma) {
    try {
      await prisma.match.deleteMany();
      await prisma.match.createMany({
        data: cleanMatches.map(m => ({
          id: m.id,
          type: m.type,
          group: m.group || null,
          round: m.round || null,
          name: m.name || null,
          homeTeam: m.homeTeam || null,
          awayTeam: m.awayTeam || null,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
          nextMatchId: m.nextMatchId || null,
          isHomeInNextMatch: m.isHomeInNextMatch !== undefined ? m.isHomeInNextMatch : null,
          placeholderHome: m.placeholderHome || null,
          placeholderAway: m.placeholderAway || null,
          winner: m.winner || null,
          penaltyWinner: m.penaltyWinner || null
        }))
      });
      return cleanMatches;
    } catch (e) {
      console.error("Prisma error, falling back to memory:", e.message);
    }
  }
  
  inMemoryMatches = cleanMatches;
  return inMemoryMatches;
};

// Simulate Group matches
const simulateGroupStage = async () => {
  let currentMatches = await getMatches();
  
  const updatedMatches = currentMatches.map((m) => {
    if (m.type === "group" && m.status !== "finished") {
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

  if (useDatabase && prisma) {
    try {
      for (const m of updatedMatches) {
        if (m.type === "group") {
          await prisma.match.update({
            where: { id: m.id },
            data: {
              homeScore: m.homeScore,
              awayScore: m.awayScore,
              status: m.status
            }
          });
        }
      }
      return updatedMatches;
    } catch (e) {
      console.error("Prisma error, falling back to memory:", e.message);
    }
  }

  inMemoryMatches = updatedMatches;
  return inMemoryMatches;
};

// Standings Calculator for a specific group (Helper)
const calculateGroupStandings = (groupChar, matchesList) => {
  const groupTeams = Object.values(TEAMS).filter((t) => t.group === groupChar);
  
  const standings = groupTeams.reduce((acc, team) => {
    acc[team.code] = {
      ...team,
      P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0
    };
    return acc;
  }, {});

  const groupMatches = matchesList.filter(
    (m) => m.type === "group" && m.group === groupChar && m.status === "finished"
  );

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

  Object.values(standings).forEach((team) => {
    team.GD = team.GF - team.GA;
  });

  return Object.values(standings).sort((a, b) => {
    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    if (b.GD !== a.GD) return b.GD - a.GD;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return a.name.localeCompare(b.name);
  });
};

// Advance to Knockout Stage
const advanceToKnockout = async () => {
  const currentMatches = await getMatches();
  
  // Calculate qualifiers
  const qualifiers = {};
  GROUPS.forEach((groupChar) => {
    const standings = calculateGroupStandings(groupChar, currentMatches);
    qualifiers[groupChar] = {
      winner: standings[0]?.code || null,
      runnerUp: standings[1]?.code || null
    };
  });

  const updatedMatches = currentMatches.map((m) => {
    if (m.type === "knockout") {
      const cleanKnockout = {
        ...m,
        homeScore: null,
        awayScore: null,
        status: "scheduled",
        winner: null,
        penaltyWinner: null
      };

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
        cleanKnockout.homeTeam = null;
        cleanKnockout.awayTeam = null;
      }

      return cleanKnockout;
    }
    return m;
  });

  if (useDatabase && prisma) {
    try {
      for (const m of updatedMatches) {
        if (m.type === "knockout") {
          await prisma.match.update({
            where: { id: m.id },
            data: {
              homeTeam: m.homeTeam,
              awayTeam: m.awayTeam,
              homeScore: m.homeScore,
              awayScore: m.awayScore,
              status: m.status,
              winner: m.winner,
              penaltyWinner: m.penaltyWinner
            }
          });
        }
      }
      return updatedMatches;
    } catch (e) {
      console.error("Prisma error, falling back to memory:", e.message);
    }
  }

  inMemoryMatches = updatedMatches;
  return inMemoryMatches;
};

// Propagate Knockout winner helper (recursive clean of child nodes)
const propagateWinnerInList = (matchesList, currentMatch, winnerTeamCode) => {
  if (!currentMatch.nextMatchId) return matchesList;

  return matchesList.map((m) => {
    if (m.id === currentMatch.nextMatchId) {
      const nextNode = { ...m };
      if (currentMatch.isHomeInNextMatch) {
        nextNode.homeTeam = winnerTeamCode;
      } else {
        nextNode.awayTeam = winnerTeamCode;
      }
      
      nextNode.homeScore = null;
      nextNode.awayScore = null;
      nextNode.status = "scheduled";
      nextNode.winner = null;
      nextNode.penaltyWinner = null;

      // Recursive propagation to clean children
      let recursivelyCleaned = propagateWinnerInList(matchesList, nextNode, null);
      
      return recursivelyCleaned.map((item) => (item.id === nextNode.id ? nextNode : item)).find(item => item.id === nextNode.id) || nextNode;
    }
    return m;
  });
};

// Update Match Score
const updateMatchScore = async (id, homeScore, awayScore, penaltyWinner) => {
  let currentMatches = await getMatches();
  const matchToUpdate = currentMatches.find((m) => m.id === id);
  if (!matchToUpdate) throw new Error("Match not found");

  let winnerTeam = null;
  if (matchToUpdate.type === "knockout") {
    if (homeScore > awayScore) {
      winnerTeam = matchToUpdate.homeTeam;
    } else if (awayScore > homeScore) {
      winnerTeam = matchToUpdate.awayTeam;
    } else {
      winnerTeam = penaltyWinner;
    }
  }

  // Update match itself
  let updatedMatches = currentMatches.map((m) => {
    if (m.id === id) {
      return {
        ...m,
        homeScore,
        awayScore,
        status: "finished",
        winner: winnerTeam,
        penaltyWinner: homeScore === awayScore ? penaltyWinner : null
      };
    }
    return m;
  });

  // Handle knockout propagation
  if (matchToUpdate.type === "knockout" && winnerTeam) {
    const updatedMatchObj = updatedMatches.find((m) => m.id === id);
    let tempMatches = [...updatedMatches];
    const nextMatchId = updatedMatchObj.nextMatchId;
    
    if (nextMatchId) {
      tempMatches = tempMatches.map((m) => {
        if (m.id === nextMatchId) {
          const nextNode = { ...m };
          if (updatedMatchObj.isHomeInNextMatch) {
            nextNode.homeTeam = winnerTeam;
          } else {
            nextNode.awayTeam = winnerTeam;
          }
          nextNode.homeScore = null;
          nextNode.awayScore = null;
          nextNode.status = "scheduled";
          nextNode.winner = null;
          nextNode.penaltyWinner = null;
          return nextNode;
        }
        return m;
      });

      // Clear downstream nodes
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
            node.penaltyWinner = null;
            nextNextId = node.nextMatchId;
            return node;
          }
          return m;
        });
        if (!nextFound) break;
      }
    }
    updatedMatches = tempMatches;
  }

  if (useDatabase && prisma) {
    try {
      // Write updates to database
      for (const m of updatedMatches) {
        // Compare with old ones to only update what changed
        const oldMatch = currentMatches.find(old => old.id === m.id);
        if (
          oldMatch.homeScore !== m.homeScore ||
          oldMatch.awayScore !== m.awayScore ||
          oldMatch.status !== m.status ||
          oldMatch.homeTeam !== m.homeTeam ||
          oldMatch.awayTeam !== m.awayTeam ||
          oldMatch.winner !== m.winner ||
          oldMatch.penaltyWinner !== m.penaltyWinner
        ) {
          await prisma.match.update({
            where: { id: m.id },
            data: {
              homeTeam: m.homeTeam,
              awayTeam: m.awayTeam,
              homeScore: m.homeScore,
              awayScore: m.awayScore,
              status: m.status,
              winner: m.winner,
              penaltyWinner: m.penaltyWinner
            }
          });
        }
      }
      return updatedMatches;
    } catch (e) {
      console.error("Prisma error, falling back to memory:", e.message);
    }
  }

  inMemoryMatches = updatedMatches;
  return inMemoryMatches;
};

module.exports = {
  initPrisma,
  getTeams,
  getMatches,
  resetTournament,
  simulateGroupStage,
  advanceToKnockout,
  updateMatchScore
};
