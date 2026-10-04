import React, { useState } from 'react';
import {
  InAppNotification,
  Subscriber,
  DispatchedEmail,
  Team,
} from '../types/league';
import { ClubCrest } from './ClubCrest';
import {
  X,
  Bell,
  Mail,
  CheckCheck,
  Send,
  ExternalLink,
  Flame,
  CheckCircle,
  Eye,
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
  subscribers: Subscriber[];
  dispatchedEmails: DispatchedEmail[];
  teams: Team[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: InAppNotification) => void;
  onAddSubscriber: (email: string, name: string, favoriteTeamId: string) => void;
  onSendTestEmail: (type: 'GOAL_ALERT' | 'MATCH_SUMMARY' | 'WEEKLY_DIGEST') => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  subscribers,
  dispatchedEmails,
  teams,
  onMarkAllAsRead,
  onSelectNotification,
  onAddSubscriber,
  onSendTestEmail,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'inapp' | 'email' | 'preview'>('inapp');
  const [subEmail, setSubEmail] = useState('');
  const [subName, setSubName] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState(teams[0]?.id || '');
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<DispatchedEmail | null>(
    dispatchedEmails[0] || null
  );
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    onAddSubscriber(subEmail.trim(), subName.trim() || 'Supporter', favoriteTeam);
    setSubEmail('');
    setSubName('');
    setSubscribedSuccess(true);
    setTimeout(() => setSubscribedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Apex Notification & Dispatch Hub
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{unreadCount} unread in-app alerts</span>
                <span aria-hidden="true">·</span>
                <span>{subscribers.length} email subscribers</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/40 text-xs">
          <button
            onClick={() => setActiveTab('inapp')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'inapp'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            In-App Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'email'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Subscription & Logs
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview Rendered Email
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* TAB 1: IN-APP ALERTS */}
          {activeTab === 'inapp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Real-time alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No notifications currently logged.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onSelectNotification(notif);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        notif.read
                          ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                          : 'bg-slate-900 border-emerald-500/30 text-white shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold">{notif.title}</h4>
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL SUBSCRIPTION & DISPATCH LOGS */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              {/* Subscribe Form */}
              <form onSubmit={handleSubscribeSubmit} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Subscribe to Live Match & Goal Alerts
                  </h4>
                  {subscribedSuccess && (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Subscribed!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <input
                    required
                    type="email"
                    placeholder="Your email address"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                  <select
                    value={favoriteTeam}
                    onChange={(e) => setFavoriteTeam(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        Fav: {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center pt-1 text-xs">
                  <span className="text-[11px] text-slate-500">
                    Instant alerts for goals, red cards & full-time digests.
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                  >
                    Activate Alerts
                  </button>
                </div>
              </form>

              {/* Test Dispatch Triggers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    Simulate Live Dispatch
                  </span>
                  <span>Dispatched to {subscribers.length} subscribers</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => onSendTestEmail('GOAL_ALERT')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Send Goal Alert</span>
                  </button>
                  <button
                    onClick={() => onSendTestEmail('MATCH_SUMMARY')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>Send Match Summary</span>
                  </button>
                  <button
                    onClick={() => onSendTestEmail('WEEKLY_DIGEST')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send Weekly Round-up</span>
                  </button>
                </div>
              </div>

              {/* Dispatched History */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recent Email Dispatch Log
                </h4>
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {dispatchedEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => {
                        setSelectedEmailPreview(email);
                        setActiveTab('preview');
                      }}
                      className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 cursor-pointer border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-white block">{email.subject}</span>
                        <span className="text-[10px] text-slate-400">To: {email.subscriberEmail}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(email.sentAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              {selectedEmailPreview ? (
                <div>
                  <div className="bg-slate-950 p-3 rounded-t-xl border border-b-0 border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Subject: <strong className="text-white">{selectedEmailPreview.subject}</strong></span>
                      <span className="font-mono text-[10px]">{selectedEmailPreview.sentAt}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      To: {selectedEmailPreview.subscriberEmail}
                    </div>
                  </div>
                  <div
                    className="p-4 bg-slate-950/90 rounded-b-xl border border-slate-800 overflow-y-auto max-h-[300px]"
                    dangerouslySetInnerHTML={{ __html: selectedEmailPreview.bodyHtml }}
                  />
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Select an email from the log to preview its contents.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
