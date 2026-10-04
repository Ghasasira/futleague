import React, { useState } from 'react';
import { LeagueEvent, Team, EventCategory } from '../types/league';
import { ClubCrest } from './ClubCrest';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Filter,
  Check,
  Download,
  Bell,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface EventsCalendarViewProps {
  events: LeagueEvent[];
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
  onReminderSet?: (eventTitle: string) => void;
}

export const EventsCalendarView: React.FC<EventsCalendarViewProps> = ({
  events,
  teams,
  onSelectTeam,
  onReminderSet,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [savedReminders, setSavedReminders] = useState<Record<string, boolean>>({});

  const filteredEvents = events.filter((evt) => {
    if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) return false;
    if (selectedTeamFilter !== 'ALL' && evt.teamId !== selectedTeamFilter) return false;
    return true;
  });

  const handleToggleReminder = (evt: LeagueEvent) => {
    const nextState = !savedReminders[evt.id];
    setSavedReminders((prev) => ({ ...prev, [evt.id]: nextState }));
    if (nextState && onReminderSet) {
      onReminderSet(`Reminder set for: ${evt.title}`);
    }
  };

  const handleDownloadICS = (evt: LeagueEvent) => {
    // Generate simple standard iCalendar file
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Apex Football League//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description}`,
      `LOCATION:${evt.location}`,
      `DTSTART:${evt.date.replace(/-/g, '')}T${evt.time.replace(':', '')}00Z`,
      `DTEND:${evt.date.replace(/-/g, '')}T210000Z`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${evt.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'MATCH':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Match</span>;
      case 'PRESS_CONFERENCE':
        return <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Press Briefing</span>;
      case 'OPEN_TRAINING':
        return <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded text-[10px] font-semibold">Fan Training</span>;
      case 'YOUTH_CUP':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Junior Cup</span>;
      case 'TROPHY_TOUR':
      case 'FAN_FEST':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">Fan Festival</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            League Activities & Events Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fixtures, press briefings, youth tournaments, open training, and fan festivals.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="MATCH">Matches</option>
            <option value="PRESS_CONFERENCE">Press Conferences</option>
            <option value="OPEN_TRAINING">Open Training</option>
            <option value="YOUTH_CUP">Youth Academy Cup</option>
            <option value="TROPHY_TOUR">Trophy Tour & Fan Fest</option>
          </select>

          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Clubs</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-sm">
            No events match the selected filters.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const team = evt.teamId ? teams.find((t) => t.id === evt.teamId) : null;
            const isReminded = savedReminders[evt.id];

            return (
              <div
                key={evt.id}
                className={`p-5 rounded-xl border transition-all ${
                  evt.isHighlighted
                    ? 'bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-950 border-emerald-500/40 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Date badge & Info */}
                  <div className="flex items-start gap-4">
                    <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0 min-w-[70px]">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block font-mono">
                        {new Date(evt.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold font-mono text-white block">
                        {new Date(evt.date).getDate()}
                      </span>
                      <span className="text-[9px] text-slate-500 block font-mono">
                        {evt.time}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(evt.category)}
                        {team && (
                          <div
                            onClick={() => onSelectTeam(team.id)}
                            className="flex items-center gap-1.5 cursor-pointer hover:underline text-xs text-slate-300 font-medium"
                          >
                            <ClubCrest team={team} size="xs" />
                            <span>{team.shortName}</span>
                          </div>
                        )}
                        {evt.isHighlighted && (
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{evt.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Remind & Add to iCal */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleToggleReminder(evt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                        isReminded
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {isReminded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bell className="w-3.5 h-3.5" />}
                      <span>{isReminded ? 'Reminder Active' : 'Get Alert'}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadICS(evt)}
                      title="Download iCal (.ics) for Apple/Google Calendar"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.ICS</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
