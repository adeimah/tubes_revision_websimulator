export const TEAMS = {
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

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// Generate standard round robin matches for 8 groups (6 matches per group = 48 matches)
export const generateGroupMatches = () => {
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

// Generate empty Knockout structure
// Round of 16 (8 matches) -> Quarterfinals (4 matches) -> Semifinals (2 matches) -> Final (1 match)
export const initialKnockoutMatches = [
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
