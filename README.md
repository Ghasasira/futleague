# Apex Football League Hub

A premier, full-featured football league web application built with React 19, TypeScript, and Tailwind CSS. The platform delivers real-time match telemetry, tactical boards, dedicated club & player pages, head-to-head player comparisons, historical season archives, an events calendar, subscriber notifications, and a comprehensive administrative management center.

---

## 🌟 Key Features

### 1. ⏱️ Real-Time Match Center & Event Ingestion
- **Live Match Telemetry**: Dynamic match clock with live ticking simulation, stadium information, attendance, referee, and weather conditions.
- **Minute-by-Minute Timeline**: Instant log with goal scorers, assist providers, yellow/red cards, substitutions, and VAR review rulings.
- **2D Tactical Pitch Board**: Interactive grass pitch showcasing team formations (e.g. `4-3-3`, `4-2-3-1`), starter coordinates, live player match ratings, substitutions, and bench rosters.
- **Live Ingestion Console**: Direct administrative control to record goals (penalty, regular, own goal), disciplinary cards (yellow, second yellow, red), substitutions (in/out), VAR checks, and real-time adjustments for shots, xG, corners, fouls, and saves.
- **Live Statistics Comparison**: Telemetry bars for possession %, expected goals (xG), shots on target, pass accuracy %, fouls, offsides, and saves.

### 2. 👤 Dedicated Player Pages & Profiles
- **Career Dossier**: Detailed personal bio, date of birth, age, height, weight, preferred foot, and tactical strengths.
- **Performance Statistics**: Appearances, goals, assists, minutes per goal, total minutes, and clean sheets.
- **FIFA / FM Style Attribute Hexagon**: Ratings (1–99) across Pace, Shooting, Passing, Dribbling, Defending, and Physicality.
- **Technical Metrics**: Passing accuracy %, ground tackles won, shots on target, and aerial duels.
- **Transfer History Timeline**: Chronological transfer moves with from/to clubs, transfer fees, and transfer types (Permanent, Academy, Loan, Free).
- **Recent Match Logs**: Match-by-match performance logs with minutes, goals, assists, and ratings.

### 3. ⚔️ Head-to-Head Player Comparison Tool
- Compare any two players side-by-side with dual selectors and instant swapping.
- Pre-configured rivalry match-ups (e.g. *Erling Vance vs. Mohamed Farouk*, *Kevin De Vries vs. Pedri*).
- Comparative visual bars with leader crown badges (`👑`) and percentage differentials.
- Full attribute duel across all 6 core football pillars.

### 4. 🛡️ Dedicated Team Hubs
- Club overview with foundation year, home ground & seating capacity, head coach/manager, president, and playing philosophy.
- Honours cabinet showcasing historical trophy counts.
- Full squad rosters filterable by position (`GK`, `DF`, `MF`, `FW`) and sortable by number, goals, rating, and market value.
- Club fixture calendar with completed results and upcoming matches.

### 5. 🏆 League Standings & Historical Archive
- **Live League Table**: Real-time standings updated dynamically from match scores with Champions League, Europa League, and Relegation zones.
- **Historical Seasons Archive**: Final standings and awards for past championship seasons (`2024/25`, `2023/24`, `2022/23`).
- **Leaderboards**: Golden Boot (top scorers), Playmaker (assists), Golden Glove (clean sheets & saves), MVP ratings, and disciplinary rankings.

### 6. 📅 Events Calendar & Notifications
- Interactive activities schedule for league matches, press conferences, open fan trainings, youth academy cups, and trophy tours.
- iCal (`.ics`) download capability for Apple and Google Calendar integration.
- In-app notification center drawer with unread badges.
- Email subscriber management with real-time goal alerts and interactive HTML email dispatch previewer.

### 7. 🛠️ Administrator Control Center
- Player roster management: register new players, edit numbers, update stats, or modify injury/fitness status.
- Fixture scheduling: create new matches and set venues.
- Database governance: export and download full JSON snapshots, import backups, or reset to factory championship defaults.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/apex-football-league-hub.git

# Navigate into directory
cd apex-football-league-hub

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Storage**: Browser LocalStorage with JSON Export/Import

---

## 📄 License
Apache-2.0 License.
