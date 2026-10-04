import React, { useState, useEffect } from 'react';
import {
  Team,
  Player,
  Match,
  HistoricalSeason,
  LeagueEvent,
  InAppNotification,
  Subscriber,
  DispatchedEmail,
} from './types/league';
import {
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  INITIAL_MATCHES,
  INITIAL_HISTORICAL_SEASONS,
  INITIAL_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SUBSCRIBERS,
  INITIAL_DISPATCHED_EMAILS,
} from './data/initialLeagueData';
import { ClubCrest } from './components/ClubCrest';
import { MatchCenterView } from './components/MatchCenterView';
import { TeamPageView } from './components/TeamPageView';
import { LeagueTable } from './components/LeagueTable';
import { PlayerRankings } from './components/PlayerRankings';
import { HistoricalSeasonsView } from './components/HistoricalSeasonsView';
import { EventsCalendarView } from './components/EventsCalendarView';
import { AdminDashboard } from './components/AdminDashboard';
import { PlayerModal } from './components/PlayerModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { PlayerDetailPageView } from './components/PlayerDetailPageView';
import { PlayerComparisonView } from './components/PlayerComparisonView';
import {
  Bell,
  Shield,
  Calendar,
  Sliders,
  Award,
  Users,
  Activity,
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<
    'matches' | 'table' | 'teams' | 'rankings' | 'history' | 'calendar' | 'admin' | 'compare' | 'player-detail'
  >('matches');

  // Selected entities for drilldown
  const [selectedMatchId, setSelectedMatchId] = useState<string>('match-live-1');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [comparePlayerA, setComparePlayerA] = useState<Player | null>(null);
  const [comparePlayerB, setComparePlayerB] = useState<Player | null>(null);

  // Modals
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Persistent State
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('apex_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('apex_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('apex_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [seasons] = useState<HistoricalSeason[]>(INITIAL_HISTORICAL_SEASONS);

  const [events, setEvents] = useState<LeagueEvent[]>(() => {
    const saved = localStorage.getItem('apex_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('apex_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    const saved = localStorage.getItem('apex_subscribers');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIBERS;
  });

  const [dispatchedEmails, setDispatchedEmails] = useState<DispatchedEmail[]>(() => {
    const saved = localStorage.getItem('apex_dispatched_emails');
    return saved ? JSON.parse(saved) : INITIAL_DISPATCHED_EMAILS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('apex_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('apex_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('apex_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('apex_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('apex_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('apex_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem('apex_dispatched_emails', JSON.stringify(dispatchedEmails));
  }, [dispatchedEmails]);

  // Derive Standings dynamically based on matches
  const standings = React.useMemo(() => {
    const tableMap: Record<
      string,
      {
        played: number;
        won: number;
        drawn: number;
        lost: number;
        goalsFor: number;
        goalsAgainst: number;
        points: number;
        form: ('W' | 'D' | 'L')[];
      }
    > = {};

    teams.forEach((t) => {
      tableMap[t.id] = {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: [],
      };
    });

    // Compute from finished and live matches
    matches.forEach((m) => {
      if (m.status === 'FINISHED' || m.status === 'LIVE') {
        const home = tableMap[m.homeTeamId];
        const away = tableMap[m.awayTeamId];

        if (home && away) {
          home.played += 1;
          away.played += 1;
          home.goalsFor += m.homeScore;
          home.goalsAgainst += m.awayScore;
          away.goalsFor += m.awayScore;
          away.goalsAgainst += m.homeScore;

          if (m.homeScore > m.awayScore) {
            home.won += 1;
            home.points += 3;
            away.lost += 1;
            home.form.unshift('W');
            away.form.unshift('L');
          } else if (m.homeScore < m.awayScore) {
            away.won += 1;
            away.points += 3;
            home.lost += 1;
            away.form.unshift('W');
            home.form.unshift('L');
          } else {
            home.drawn += 1;
            home.points += 1;
            away.drawn += 1;
            away.points += 1;
            home.form.unshift('D');
            away.form.unshift('D');
          }
        }
      }
    });

    // Provide default initial baseline if few matches
    return teams
      .map((t) => {
        const stats = tableMap[t.id] || {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          form: ['W', 'D', 'W', 'W', 'L'],
        };

        // If played < 10, blend with realistic base table points
        const basePoints: Record<string, { p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number }> = {
          'apex-city': { p: 24, w: 18, d: 4, l: 2, gf: 61, ga: 19, pts: 58 },
          'crown-vanguard': { p: 24, w: 17, d: 4, l: 3, gf: 58, ga: 22, pts: 55 },
          'solaria-united': { p: 24, w: 15, d: 5, l: 4, gf: 52, ga: 28, pts: 50 },
          'ironclad-athletic': { p: 24, w: 13, d: 6, l: 5, gf: 38, ga: 24, pts: 45 },
          'starlight-rangers': { p: 24, w: 11, d: 5, l: 8, gf: 44, ga: 39, pts: 38 },
          'verdant-rovers': { p: 24, w: 9, d: 7, l: 8, gf: 36, ga: 35, pts: 34 },
          'maritime-mariners': { p: 24, w: 7, d: 7, l: 10, gf: 33, ga: 42, pts: 28 },
          'northgate-albion': { p: 24, w: 5, d: 6, l: 13, gf: 29, ga: 48, pts: 21 },
        };

        const base = basePoints[t.id] || { p: 24, w: 8, d: 6, l: 10, gf: 30, ga: 40, pts: 30 };

        const totalP = base.p + stats.played;
        const totalW = base.w + stats.won;
        const totalD = base.d + stats.drawn;
        const totalL = base.l + stats.lost;
        const totalGf = base.gf + stats.goalsFor;
        const totalGa = base.ga + stats.goalsAgainst;
        const totalPts = base.pts + stats.points;

        return {
          teamId: t.id,
          played: totalP,
          won: totalW,
          drawn: totalD,
          lost: totalL,
          goalsFor: totalGf,
          goalsAgainst: totalGa,
          goalDifference: totalGf - totalGa,
          points: totalPts,
          form: (stats.form.length >= 5
            ? stats.form.slice(0, 5)
            : [...stats.form, 'W', 'D', 'W', 'W', 'L'].slice(0, 5)) as ('W' | 'D' | 'L')[],
        };
      })
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  }, [teams, matches]);

  // Actions
  const handleUpdateMatch = (updated: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleAddMatch = (newMatch: Match) => {
    setMatches((prev) => [newMatch, ...prev]);
  };

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleUpdatePlayer = (updated: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const handleTriggerNotification = (
    title: string,
    message: string,
    type: any
  ) => {
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleDispatchEmail = (
    subject: string,
    preview: string,
    bodyHtml: string
  ) => {
    subscribers.forEach((sub) => {
      const email: DispatchedEmail = {
        id: `email-${Date.now()}-${sub.id}`,
        subscriberEmail: sub.email,
        subject,
        previewText: preview,
        bodyHtml,
        sentAt: new Date().toISOString(),
        type: 'GOAL_ALERT',
      };
      setDispatchedEmails((prev) => [email, ...prev]);
    });
  };

  const handleAddSubscriber = (
    email: string,
    name: string,
    favoriteTeamId: string
  ) => {
    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email,
      name,
      preferences: {
        matchAlerts: true,
        goalAlerts: true,
        weeklyDigest: true,
        teamNews: true,
        favoriteTeamId,
      },
      subscribedAt: new Date().toISOString(),
    };
    setSubscribers((prev) => [...prev, newSub]);

    // Send welcome email
    const welcomeEmail: DispatchedEmail = {
      id: `email-${Date.now()}`,
      subscriberEmail: email,
      subject: '⚽ Welcome to Apex League Official Match Alerts',
      previewText: `You are now subscribed to real-time match and goal alerts.`,
      bodyHtml: `
        <div style="font-family:sans-serif;background:#090d16;color:#f8fafc;padding:24px;border-radius:8px;">
          <h2 style="color:#10b981;">APEX LEAGUE OFFICIAL SUBSCRIPTION</h2>
          <p>Hello ${name},</p>
          <p>You have successfully activated real-time goal notifications, lineup announcements, and weekly match round-ups.</p>
          <div style="margin-top:20px;font-size:12px;color:#64748b;">Apex Football Championship Hub</div>
        </div>
      `,
      sentAt: new Date().toISOString(),
      type: 'EVENT_REMINDER',
    };
    setDispatchedEmails((prev) => [welcomeEmail, ...prev]);
  };

  const handleSendTestEmail = (
    type: 'GOAL_ALERT' | 'MATCH_SUMMARY' | 'WEEKLY_DIGEST'
  ) => {
    const currentLiveMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
    const hTeam = teams.find((t) => t.id === currentLiveMatch.homeTeamId);
    const aTeam = teams.find((t) => t.id === currentLiveMatch.awayTeamId);

    const testEmail: DispatchedEmail = {
      id: `test-email-${Date.now()}`,
      subscriberEmail: subscribers[0]?.email || 'supporter@apexleague.com',
      subject:
        type === 'GOAL_ALERT'
          ? `⚡ GOAL ALERT: ${hTeam?.name} ${currentLiveMatch.homeScore} - ${currentLiveMatch.awayScore} ${aTeam?.name}`
          : type === 'MATCH_SUMMARY'
          ? `🏆 Full-Time Summary: ${hTeam?.shortName} vs ${aTeam?.shortName}`
          : `📰 Apex League Weekly Round-up: Matchweek ${currentLiveMatch.matchweek} Standings`,
      previewText: 'Official championship updates from the Apex Football League.',
      bodyHtml: `
        <div style="font-family:sans-serif;background:#090d16;color:#f8fafc;padding:24px;border-radius:8px;">
          <h2 style="color:#38bdf8;">APEX LEAGUE OFFICIAL DISPATCH</h2>
          <p style="font-size:18px;font-weight:bold;">${hTeam?.name} ${currentLiveMatch.homeScore} - ${currentLiveMatch.awayScore} ${aTeam?.name}</p>
          <p style="color:#94a3b8;">Status: ${currentLiveMatch.status} (${currentLiveMatch.currentMinute}') · Venue: ${currentLiveMatch.venue}</p>
          <p style="line-height:1.5;">This email was automatically triggered by the live match center event ingest service.</p>
        </div>
      `,
      sentAt: new Date().toISOString(),
      type,
    };
    setDispatchedEmails((prev) => [testEmail, ...prev]);
  };

  const handleResetData = () => {
    localStorage.removeItem('apex_teams');
    localStorage.removeItem('apex_players');
    localStorage.removeItem('apex_matches');
    localStorage.removeItem('apex_events');
    localStorage.removeItem('apex_notifications');
    localStorage.removeItem('apex_subscribers');
    localStorage.removeItem('apex_dispatched_emails');

    setTeams(INITIAL_TEAMS);
    setPlayers(INITIAL_PLAYERS);
    setMatches(INITIAL_MATCHES);
    setEvents(INITIAL_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setDispatchedEmails(INITIAL_DISPATCHED_EMAILS);
  };

  const handleExportData = () => {
    const payload = {
      teams,
      players,
      matches,
      events,
      standings,
      seasons,
      subscribers,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex_league_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.teams) setTeams(parsed.teams);
      if (parsed.players) setPlayers(parsed.players);
      if (parsed.matches) setMatches(parsed.matches);
      if (parsed.events) setEvents(parsed.events);
    } catch (e) {
      alert('Invalid JSON file format.');
    }
  };

  const activeMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
  const activeTeam = selectedTeamId ? teams.find((t) => t.id === selectedTeamId) : null;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 
        TOP BAR CONTRACT (Frontend Design Constitution Section 2):
        [Brand title, one line] — [4–6 nav links, 1–2 word labels, single-line] — [1–2 primary actions]
      */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            setCurrentView('matches');
            setSelectedTeamId(null);
          }}
          className="text-lg md:text-xl font-extrabold tracking-tight text-white hover:text-emerald-400 transition-colors flex items-center gap-2 text-left"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span>Apex League</span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs md:text-sm font-medium text-slate-400">
          <button
            onClick={() => {
              setCurrentView('matches');
              setSelectedTeamId(null);
            }}
            className={`hover:text-white transition-colors pb-0.5 ${
              currentView === 'matches' && !selectedTeamId
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : ''
            }`}
          >
            Matches
          </button>
          <button
            onClick={() => {
              setCurrentView('table');
              setSelectedTeamId(null);
            }}
            className={`hover:text-white transition-colors pb-0.5 ${
              currentView === 'table' && !selectedTeamId
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : ''
            }`}
          >
            Standings
          </button>
          <button
            onClick={() => {
              setCurrentView('teams');
              setSelectedTeamId(null);
            }}
            className={`hover:text-white transition-colors pb-0.5 ${
              currentView === 'teams' || selectedTeamId
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : ''
            }`}
          >
            Clubs
          </button>
          <button
            onClick={() => {
              setCurrentView('rankings');
              setSelectedTeamId(null);
            }}
            className={`hover:text-white transition-colors pb-0.5 ${
              currentView === 'rankings'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : ''
            }`}
          >
            Rankings
          </button>
          <button
            onClick={() => {
              setCurrentView('compare');
              setSelectedTeamId(null);
            }}
            className={`hover:text-white transition-colors pb-0.5 ${
              currentView === 'compare'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : ''
            }`}
          >
            Compare
          </button>
          <button
            onClick={() => {
              setCurrentView('history');
              setSelectedTeamId(null);
            }}
            className={`hover:text-white transition-colors pb-0.5 ${
              currentView === 'history'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : ''
            }`}
          >
            History
          </button>
          <button
            onClick={() => {
              setCurrentView('calendar');
              setSelectedTeamId(null);
            }}
            className={`hover:text-white transition-colors pb-0.5 ${
              currentView === 'calendar'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : ''
            }`}
          >
            Events
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Notification Center Trigger */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Notification Center & Email Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center font-mono animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard Trigger */}
          <button
            onClick={() => {
              setCurrentView('admin');
              setSelectedTeamId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentView === 'admin'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Admin Console</span>
            <span className="sm:hidden">Admin</span>
          </button>
        </div>
      </header>

      {/* Quick Fixture Strip (Allows jumping directly between any matches) */}
      <div className="bg-slate-950 border-b border-slate-900 px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-3 text-xs w-max mx-auto">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
            Fixtures:
          </span>
          {matches.map((m) => {
            const h = teams.find((t) => t.id === m.homeTeamId);
            const a = teams.find((t) => t.id === m.awayTeamId);
            const isSelected = selectedMatchId === m.id && currentView === 'matches' && !selectedTeamId;

            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMatchId(m.id);
                  setCurrentView('matches');
                  setSelectedTeamId(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <span className="font-semibold text-white">{h?.code}</span>
                <span className="font-mono font-bold text-slate-200">
                  {m.status === 'UPCOMING' ? m.time : `${m.homeScore}-${m.awayScore}`}
                </span>
                <span className="font-semibold text-white">{a?.code}</span>
                {m.status === 'LIVE' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN APPLICATION VIEWPORT */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
        {/* VIEW 0: DEDICATED PLAYER PAGE (Full Page Experience) */}
        {currentView === 'player-detail' && selectedPlayer ? (
          <PlayerDetailPageView
            player={selectedPlayer}
            team={teams.find((t) => t.id === selectedPlayer.teamId)}
            allTeams={teams}
            allPlayers={players}
            onBack={() => {
              setCurrentView('matches');
              setSelectedPlayer(null);
            }}
            onSelectTeam={(tId) => {
              setSelectedTeamId(tId);
              setCurrentView('teams');
              setSelectedPlayer(null);
            }}
            onSelectPlayer={(p) => {
              setSelectedPlayer(p);
              setCurrentView('player-detail');
            }}
            onStartComparison={(p) => {
              setComparePlayerA(p);
              setCurrentView('compare');
            }}
          />
        ) : selectedTeamId && activeTeam ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedTeamId(null)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-medium mb-2"
            >
              ← Back to {currentView === 'teams' ? 'Clubs Directory' : 'Overview'}
            </button>
            <TeamPageView
              team={activeTeam}
              allTeams={teams}
              players={players}
              matches={matches}
              onSelectMatch={(mId) => {
                setSelectedMatchId(mId);
                setCurrentView('matches');
                setSelectedTeamId(null);
              }}
              onSelectPlayer={(p) => {
                setSelectedPlayer(p);
                setCurrentView('player-detail');
              }}
            />
          </div>
        ) : (
          <>
            {/* VIEW 1: PLAYER COMPARISON */}
            {currentView === 'compare' && (
              <PlayerComparisonView
                players={players}
                teams={teams}
                initialPlayerA={comparePlayerA}
                initialPlayerB={comparePlayerB}
                onSelectPlayer={(p) => {
                  setSelectedPlayer(p);
                  setCurrentView('player-detail');
                }}
                onSelectTeam={(tId) => {
                  setSelectedTeamId(tId);
                  setCurrentView('teams');
                }}
              />
            )}

            {/* VIEW 2: MATCH CENTER */}
            {currentView === 'matches' && (
              <MatchCenterView
                match={activeMatch}
                teams={teams}
                players={players}
                isAdmin={true}
                onUpdateMatch={handleUpdateMatch}
                onSelectTeam={(tId) => setSelectedTeamId(tId)}
                onSelectPlayer={(p) => {
                  setSelectedPlayer(p);
                  setCurrentView('player-detail');
                }}
                onTriggerNotification={handleTriggerNotification}
                onDispatchEmail={handleDispatchEmail}
              />
            )}

            {/* VIEW 3: STANDINGS / LEAGUE TABLE */}
            {currentView === 'table' && (
              <div className="space-y-8 max-w-6xl mx-auto">
                <LeagueTable
                  standings={standings}
                  teams={teams}
                  onSelectTeam={(tId) => setSelectedTeamId(tId)}
                />

                {/* Quick stats cards below table */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Title Contenders
                    </h3>
                    <div className="space-y-2">
                      {standings.slice(0, 3).map((st, i) => {
                        const t = teams.find((team) => team.id === st.teamId);
                        return (
                          <div
                            key={st.teamId}
                            onClick={() => setSelectedTeamId(st.teamId)}
                            className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800 p-1.5 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-emerald-400 font-bold">{i + 1}.</span>
                              {t && <ClubCrest team={t} size="xs" />}
                              <span className="font-semibold text-white">{t?.shortName}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-300">{st.points} pts</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Golden Boot Race
                    </h3>
                    <div className="space-y-2">
                      {[...players]
                        .sort((a, b) => b.goals - a.goals)
                        .slice(0, 3)
                        .map((p, i) => {
                          const t = teams.find((team) => team.id === p.teamId);
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPlayer(p)}
                              className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800 p-1.5 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-amber-400 font-bold">{i + 1}.</span>
                                <span className="font-semibold text-white">{p.name}</span>
                                <span className="text-[10px] text-slate-500">({t?.code})</span>
                              </div>
                              <span className="font-mono font-bold text-emerald-400">{p.goals} goals</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Championship Schedule
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Matchweek 25 currently in action. Upcoming games schedule updated in real-time.
                    </p>
                    <button
                      onClick={() => setCurrentView('calendar')}
                      className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Explore Fixtures Calendar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: CLUBS DIRECTORY */}
            {currentView === 'teams' && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Apex League Clubs Directory
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select any club to view their dedicated profile, squad roster, games played, and match statistics.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {teams.map((t) => {
                    const tPlayers = players.filter((p) => p.teamId === t.id);
                    const tMatches = matches.filter(
                      (m) => m.homeTeamId === t.id || m.awayTeamId === t.id
                    );

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTeamId(t.id)}
                        className="group bg-slate-900/60 hover:bg-slate-850 p-5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <ClubCrest team={t} size="md" />
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                              {t.code}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {t.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {t.philosophy}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <span>{tPlayers.length} Players</span>
                          <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            <span>Hub</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 5: PLAYER RANKINGS */}
            {currentView === 'rankings' && (
              <PlayerRankings
                players={players}
                teams={teams}
                onSelectPlayer={(p) => {
                  setSelectedPlayer(p);
                  setCurrentView('player-detail');
                }}
                onSelectTeam={(tId) => {
                  setSelectedTeamId(tId);
                  setCurrentView('teams');
                }}
              />
            )}

            {/* VIEW 6: HISTORICAL SEASONS */}
            {currentView === 'history' && (
              <HistoricalSeasonsView
                seasons={seasons}
                teams={teams}
                onSelectTeam={(tId) => setSelectedTeamId(tId)}
              />
            )}

            {/* VIEW 7: EVENTS CALENDAR */}
            {currentView === 'calendar' && (
              <EventsCalendarView
                events={events}
                teams={teams}
                onSelectTeam={(tId) => setSelectedTeamId(tId)}
                onReminderSet={(msg) => handleTriggerNotification('Activity Reminder', msg, 'ANNOUNCEMENT')}
              />
            )}

            {/* VIEW 8: ADMIN DASHBOARD */}
            {currentView === 'admin' && (
              <AdminDashboard
                teams={teams}
                players={players}
                matches={matches}
                onAddPlayer={handleAddPlayer}
                onUpdatePlayer={handleUpdatePlayer}
                onDeletePlayer={handleDeletePlayer}
                onUpdateMatch={handleUpdateMatch}
                onAddMatch={handleAddMatch}
                onResetData={handleResetData}
                onExportData={handleExportData}
                onImportData={handleImportData}
                onOpenMatchCenter={(mId) => {
                  setSelectedMatchId(mId);
                  setCurrentView('matches');
                  setSelectedTeamId(null);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 px-4 md:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Apex Football Championship</span>
            <span aria-hidden="true">·</span>
            <span>Real-time match telemetry, tactical lineups & league hub</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="hover:text-slate-200"
            >
              Email Alerts
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className="hover:text-slate-200"
            >
              Events Calendar
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className="hover:text-slate-200"
            >
              Administrator Console
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL 1: PLAYER PROFILE MODAL */}
      <PlayerModal
        player={selectedPlayer}
        team={selectedPlayer ? teams.find((t) => t.id === selectedPlayer.teamId) : undefined}
        onClose={() => setSelectedPlayer(null)}
        onSelectTeam={(tId) => {
          setSelectedPlayer(null);
          setSelectedTeamId(tId);
          setCurrentView('teams');
        }}
        onViewFullPage={(p) => {
          setSelectedPlayer(p);
          setCurrentView('player-detail');
        }}
        onStartComparison={(p) => {
          setComparePlayerA(p);
          setCurrentView('compare');
        }}
      />

      {/* MODAL 2: NOTIFICATIONS & EMAIL HUB MODAL */}
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        subscribers={subscribers}
        dispatchedEmails={dispatchedEmails}
        teams={teams}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onSelectNotification={(n) => {
          if (n.matchId) {
            setSelectedMatchId(n.matchId);
            setCurrentView('matches');
            setSelectedTeamId(null);
          } else if (n.teamId) {
            setSelectedTeamId(n.teamId);
          }
        }}
        onAddSubscriber={handleAddSubscriber}
        onSendTestEmail={handleSendTestEmail}
      />
    </div>
  );
}
