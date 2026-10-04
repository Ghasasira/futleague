export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';
export type PlayerStatus = 'fit' | 'injured' | 'suspended';
export type InjuryStatus = 'fit' | 'injured' | 'doubtful' | 'out';

export interface TransferRecord {
  id: string;
  season: string;
  date: string;
  fromTeam: string;
  toTeam: string;
  fee: string;
  transferType: 'Permanent' | 'Loan' | 'Academy' | 'Free';
}

export interface PlayerMatchLog {
  id: string;
  date: string;
  opponent: string;
  opponentCode: string;
  result: string;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;
}

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  number: number;
  position: PlayerPosition;
  nationality: string;
  flag: string;
  age: number;
  height: string;
  preferredFoot: 'Left' | 'Right' | 'Both';
  appearances: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  marketValue: string;
  formRating: number; // e.g. 7.8
  status: PlayerStatus;
  injuryStatus?: InjuryStatus;
  injuryNote?: string;
  injuryReturnDate?: string;
  avatarBg: string;
  birthDate?: string;
  birthPlace?: string;
  weight?: string;
  contractExpires?: string;
  estimatedWage?: string;
  bioText?: string;
  transfers?: TransferRecord[];
  attributes?: PlayerAttributes;
  matchLogs?: PlayerMatchLog[];
  stats?: {
    passingAccuracy: number;
    tacklesWon: number;
    shotsOnTarget: number;
    aerialDuelsWon: number;
  };
}

export interface Trophy {
  name: string;
  count: number;
  lastWon: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  crestColor: string;
  secondaryColor: string;
  founded: number;
  stadium: string;
  capacity: number;
  manager: string;
  president: string;
  philosophy: string;
  honours: Trophy[];
  crestBadgeStyle: 'shield' | 'circle' | 'diamond' | 'hexagon';
  crestIcon: string;
  website: string;
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';

export type MatchEventType =
  | 'GOAL'
  | 'PENALTY_GOAL'
  | 'OWN_GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUB'
  | 'VAR_DECISION';

export interface MatchEvent {
  id: string;
  minute: number;
  addedTime?: number;
  type: MatchEventType;
  teamId: string;
  playerId: string;
  playerName: string;
  secondaryPlayerId?: string;
  secondaryPlayerName?: string;
  detail?: string;
}

export interface MatchLineupPlayer {
  playerId: string;
  name: string;
  number: number;
  position: PlayerPosition;
  role: 'starter' | 'bench';
  x: number; // pitch coordinates 0-100 (horizontal: left to right)
  y: number; // pitch coordinates 0-100 (vertical: top to bottom)
  rating?: number;
  substitutedMinute?: number;
}

export interface MatchLineup {
  formation: string; // e.g. '4-3-3'
  starters: MatchLineupPlayer[];
  bench: MatchLineupPlayer[];
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  xG: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  offsides: [number, number];
  passAccuracy: [number, number];
  saves: [number, number];
}

export interface Match {
  id: string;
  matchweek: number;
  season: string;
  date: string;
  time: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  currentMinute: number;
  venue: string;
  referee: string;
  attendance: number;
  events: MatchEvent[];
  homeLineup: MatchLineup;
  awayLineup: MatchLineup;
  stats: MatchStats;
  weather?: string;
  mvpPlayerId?: string;
}

export interface LeagueStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface HistoricalSeason {
  seasonId: string;
  seasonName: string;
  championTeamId: string;
  runnerUpTeamId: string;
  topScorer: {
    name: string;
    team: string;
    goals: number;
  };
  goldenGlove: {
    name: string;
    team: string;
    cleanSheets: number;
  };
  totalGoals: number;
  averageAttendance: number;
  standings: LeagueStanding[];
}

export type EventCategory =
  | 'MATCH'
  | 'PRESS_CONFERENCE'
  | 'OPEN_TRAINING'
  | 'YOUTH_CUP'
  | 'TROPHY_TOUR'
  | 'FAN_FEST';

export interface LeagueEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  teamId?: string;
  description: string;
  isHighlighted?: boolean;
}

export type NotificationType =
  | 'GOAL'
  | 'MATCH_START'
  | 'FINAL_WHISTLE'
  | 'CARD'
  | 'TRANSFER'
  | 'ANNOUNCEMENT';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  read: boolean;
  matchId?: string;
  teamId?: string;
}

export interface SubscriberPreferences {
  matchAlerts: boolean;
  goalAlerts: boolean;
  weeklyDigest: boolean;
  teamNews: boolean;
  favoriteTeamId: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  preferences: SubscriberPreferences;
  subscribedAt: string;
}

export interface DispatchedEmail {
  id: string;
  subscriberEmail: string;
  subject: string;
  previewText: string;
  bodyHtml: string;
  sentAt: string;
  type: 'GOAL_ALERT' | 'MATCH_SUMMARY' | 'WEEKLY_DIGEST' | 'EVENT_REMINDER';
}

export interface TeamPerformanceMatch {
  matchId?: string;
  matchweek: number;
  date: string;
  opponentId: string;
  opponentName: string;
  opponentShortName: string;
  isHome: boolean;
  teamScore: number;
  opponentScore: number;
  result: 'W' | 'D' | 'L';
  points: number;
  cumulativePoints: number;
  rating: number;
  teamXG: number;
  opponentXG: number;
  possession: number;
  venue: string;
  goalDiff: number;
  keyMoment?: string;
}

export interface TeamMomentumSummary {
  teamId: string;
  matches: TeamPerformanceMatch[];
  totalPoints: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  cleanSheets: number;
  averageRating: number;
  averageXG: number;
  averagePossession: number;
  momentumScore: number;
  momentumStatus: 'SURGING' | 'POSITIVE' | 'STABLE' | 'COOLING' | 'STRUGGLING';
  momentumLabel: string;
  pointsPercentage: number;
  currentStreak: string;
}

