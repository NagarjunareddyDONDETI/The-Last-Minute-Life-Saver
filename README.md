<div align="center">

# ⚡ RESCUE — The Last-Minute Life Saver

### *Autonomous AI Agentic Productivity Companion, 3D Agentic Avatar & Dynamic Rescue Engine*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-46E3B7?style=for-the-badge&logo=githubpages&logoColor=white)](https://nagarjunareddydondeti.github.io/The-Last-Minute-Life-Saver/)
[![GitHub Actions CI/CD](https://img.shields.io/badge/CI%2FCD-Active-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/NagarjunareddyDONDETI/The-Last-Minute-Life-Saver/actions)
[![React 18](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.6-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75FF?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <a href="https://nagarjunareddydondeti.github.io/The-Last-Minute-Life-Saver/"><strong>Explore Live Application »</strong></a>
  <br/>
  <a href="#-overview">Overview</a>
  ·
  <a href="#-the-5-phase-agent-loop">Agent Loop</a>
  ·
  <a href="#-system-architecture">Architecture</a>
  ·
  <a href="#-key-features">Key Features</a>
  ·
  <a href="#-getting-started-locally">Local Setup</a>
  ·
  <a href="#-tech-stack">Tech Stack</a>
</p>

</div>

---

## 📖 Overview

**RESCUE** is not another passive to-do list or notification app you swipe away. It is an **autonomous AI productivity agent** engineered for high-pressure execution when deadlines close in.

When workloads escalate, traditional planning fails because decision fatigue paralyzes action. RESCUE bridges the gap between chaotic intent and finished deliverables by continuously **perceiving urgency**, **reasoning mathematically across Eisenhower quadrants**, **constructing minute-by-minute rescue timelines**, **decomposing tasks into executable micro-steps**, and **adapting to behavioral productivity patterns**.

Equipped with a real-time **3D WebGL Agentic Avatar (Three.js)**, **hands-free voice capture**, **dual reasoning engines (Google Gemini + Offline Local Heuristic Brain)**, and **Google Calendar sync**, RESCUE ensures nothing slips through the cracks.

---

## 🔄 The 5-Phase Agent Loop

RESCUE operates on an autonomous 5-phase cognitive loop designed around high-stakes time management:

```
                  ┌─────────────────────────────────────────┐
                  │          01 · PERCEIVE                  │
                  │  Capture tasks via Voice / Text         │
                  │  Extract deadlines, effort & context    │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │          02 · REASON                    │
                  │  Calculate Urgency Score (0–100)        │
                  │  Map Eisenhower Quadrants & Slack Time  │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │          03 · PLAN                      │
                  │  Build minute-by-minute Rescue Schedule │
                  │  Insert recharge blocks & protect focus │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │          04 · ACT                       │
                  │  Auto-decompose into 5 micro-steps      │
                  │  Draft opening copy & launch Focus Mode │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │          05 · REFLECT                   │
                  │  Daily retrospective & habit analytics  │
                  │  Rebalance tomorrow's strategy          │
                  └─────────────────────────────────────────┘
```

1. **Perceives (Triage)**: Continuously tracks the clock, voice inputs, and active task queues to quantify urgency in real time.
2. **Reasons (Synthesis)**: Calculates time slack ($\text{slack} = \text{time available} - \text{effort required}$) and blends urgency with importance weights into a normalized 0–100 score.
3. **Plans (Timeline)**: Generates optimized time blocks tailored to your workday boundaries with built-in buffer and recharge periods.
4. **Acts (Execution)**: Breaks down abstract goals into 4–6 concrete micro-steps and drafts email/message openers so you can start without friction.
5. **Reflects (Adaptation)**: Analyzes completed vs. missed deadlines, identifies peak productivity hours, and personalizes tomorrow's schedule.

---

## ✨ Key Features

### 1. 🤖 Dual AI Reasoning Engine (Cloud + Offline)
- **Google Gemini Integration**: Leverages Gemini Flash & Pro models for context-aware task decomposition, intelligent scheduling, and conversational voice interactions.
- **Zero-Dependency Local Engine**: Built-in deterministic reasoning engine with mathematical urgency scoring, Eisenhower sorting, and pattern-based decomposition that works **100% offline without API keys**.

### 2. 🔮 Real-Time 3D Agentic Avatar (Three.js & R3F)
- Interactive, responsive WebGL wireframe sphere powered by `@react-three/fiber` and `@react-three/drei`.
- Dynamically reacts to cognitive state:
  - **Idle / Monitoring**: Slow chromatic blue/violet orbit.
  - **Thinking / Planning**: Accelerated pulse and high emissive glow.
  - **Panic Mode**: Immediate shift to warning red/orange distress aura.

### 3. 🚨 Panic Rescue Mode (<60m to Deadline)
- Triggers automatically when an uncompleted high-impact task is within 60 minutes of deadline.
- Strips away ambient distractions, flashes high-priority triage alerts, and presents a single hyper-focused action item to beat the clock.

### 4. 🎙️ Vibe Voice Hands-Free Interaction
- Speech-to-text natural language task capture.
- Speak naturally: *"Draft project proposal by 4 PM, medium effort"* — RESCUE extracts title, deadline, effort, tags, and instantly schedules it into your queue.

### 5. 🎯 Deep Focus Mode & Micro-Decomposition
- Integrated countdown timer with progress ring and fullscreen mode.
- One-click auto-decomposition: turns vague items (*"Finish research paper"*) into actionable sequential checkpoints.
- Copy/draft assistance for outreach emails, essays, and reports.

### 6. 📊 Behavioral Profiler & Habit Tracker
- Tracks historical completion rates, on-time rates, average lead times, and weak tag categories.
- Identifies optimal productive hours (0–23h) to schedule high-effort tasks when your cognitive energy peaks.

### 7. 📅 Google Calendar & .ics Export
- One-click export of the generated Rescue Plan to standard `.ics` format or direct Google Calendar web links.

### 8. 📱 Mobile-First & PWA Enabled
- Fully responsive across all modern mobile viewports (320px, 360px, 390px, 430px, 768px, 1440px+).
- Progressive Web App manifest and service worker caching for native app-like experience.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Application Layer                      │
│      React 18  ·  TypeScript  ·  Tailwind CSS  ·  Framer Motion        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│ 3D Viewport  │             │ Voice Engine │             │ State Store  │
│ Three.js R3F │             │ Web Speech   │             │ Zustand      │
│ Agentic Orb  │             │ Vibe Actions │             │ LocalStorage │
└──────────────┘             └──────────────┘             └──────┬───────┘
                                                                 │
                                    ┌────────────────────────────┘
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                   AI Reasoning Router                   │
       └─────────────┬─────────────────────────────┬─────────────┘
                     ▼                             ▼
       ┌───────────────────────────┐ ┌───────────────────────────┐
       │     Google Gemini API     │ │    Local Heuristic Brain  │
       │   (Flash / Pro Models)    │ │ (Deterministic Urgency)   │
       │  • Semantic Decomposition │ │  • Mathematical Scoring   │
       │  • Natural Reflection     │ │  • Eisenhower Matrix      │
       │  • Voice Parsing          │ │  • 100% Offline Capable   │
       └───────────────────────────┘ └───────────────────────────┘
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technologies |
| :--- | :--- |
| **Core Framework** | ![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript_5.6-007ACC?style=flat-square&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat-square&logo=vite&logoColor=white) |
| **Styling & UI** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion_11-black?style=flat-square&logo=framer&logoColor=blue) ![Lucide React](https://img.shields.io/badge/Lucide_Icons-F05032?style=flat-square) |
| **3D & Spatial** | ![Three.js](https://img.shields.io/badge/Three.js-0.169-black?style=flat-square&logo=three.js&logoColor=white) ![R3F](https://img.shields.io/badge/React_Three_Fiber-8.17-gray?style=flat-square) ![Drei](https://img.shields.io/badge/@react--three/drei-9.114-blueviolet?style=flat-square) |
| **State & Storage** | ![Zustand](https://img.shields.io/badge/Zustand_4.5-brown?style=flat-square) ![LocalStorage](https://img.shields.io/badge/LocalStorage-Persistence-4EAA25?style=flat-square) |
| **AI & LLM** | ![Google Gemini](https://img.shields.io/badge/Gemini_1.5_Flash_/_Pro-8E75FF?style=flat-square&logo=google) ![Deterministic Engine](https://img.shields.io/badge/Local_Reasoning-Heuristic-orange?style=flat-square) |
| **PWA & Build** | ![Vite PWA](https://img.shields.io/badge/Vite_PWA_Plugin-1.3-646CFF?style=flat-square) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Deploy-2088FF?style=flat-square&logo=githubactions&logoColor=white) |

<br/>

<img src="https://skillicons.dev/icons?i=react,ts,tailwind,threejs,vite,githubactions" alt="Tech Stack Icons" />

</div>

---

## 📂 Project Structure

```
The-Last-Minute-Life-Saver/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Actions deployment to GitHub Pages
├── public/
│   ├── favicon.svg               # Application branding icon
│   └── manifest.json             # PWA web manifest
├── src/
│   ├── components/
│   │   ├── AddTaskFAB.tsx        # Quick task capture modal with natural voice input
│   │   ├── AgentOrb.tsx          # Three.js 3D WebGL sphere avatar
│   │   ├── AgentOrbLazy.tsx      # Code-split lazy wrapper for 3D orb
│   │   ├── AgentPanel.tsx        # Live agent thought stream & reasoning log
│   │   ├── Autopilot.tsx         # Autonomous task queue manager
│   │   ├── Countdown.tsx         # Circular focus timer & progress ring
│   │   ├── Dashboard.tsx         # Command center, urgency matrix & active queue
│   │   ├── FocusMode.tsx         # Distraction-free single-task execution mode
│   │   ├── Goals.tsx             # Long-term habit streaks & milestone tracking
│   │   ├── Landing.tsx           # Mission-control landing page
│   │   ├── NudgeCenter.tsx       # Smart proactive notifications & time warnings
│   │   ├── Onboarding.tsx        # Interactive product walkthrough & feature tour
│   │   ├── OrbCanvas.tsx         # WebGL shaders, materials, and lighting rig
│   │   ├── Planner.tsx           # Hour-by-hour timeline & Google Calendar sync
│   │   ├── Recommendations.tsx   # AI strategic advice & optimization insights
│   │   ├── Reflection.tsx        # End-of-day retrospectives & behavioral logs
│   │   ├── RescueOverlay.tsx     # Fullscreen deadline panic response view
│   │   ├── SettingsSheet.tsx     # Gemini API key, model selection & preferences
│   │   ├── TabBar.tsx            # Fluid bottom navigation for mobile & desktop
│   │   ├── TaskCard.tsx          # Eisenhower-ranked task item with micro-steps
│   │   ├── ui.tsx                # Reusable glassmorphic UI kit & Lucide components
│   │   └── VibeVoiceButton.tsx   # Floating hands-free speech recognition controller
│   ├── hooks/
│   │   ├── useTicker.ts          # High-precision 1-second system heartbeat
│   │   ├── useVibeVoice.ts       # Speech-to-action intent parser
│   │   └── useVoice.ts           # Web Speech API wrapper
│   ├── lib/
│   │   ├── agent.ts              # Deterministic local reasoning engine (0–100 scoring)
│   │   ├── behavior.ts           # Historical productivity analytics & profile tracker
│   │   ├── gcal.ts               # Google Calendar web intent & .ics generator
│   │   ├── gemini.ts             # Google Gemini API connector & structured prompts
│   │   ├── time.ts               # Date math, deadline pressure & slack calculations
│   │   └── vibeActions.ts        # Natural language action dispatcher
│   ├── store/
│   │   └── useStore.ts           # Zustand global state manager with local persistence
│   ├── App.tsx                   # Main root view with 3D parallax background
│   ├── main.tsx                  # React DOM root mounting
│   ├── index.css                 # Custom Tailwind CSS utilities & animations
│   └── types.ts                  # TypeScript domain models & interfaces
├── index.html                    # HTML entry point with font preconnects
├── package.json                  # Dependencies & scripts
├── tailwind.config.js            # Custom design tokens, colors & typography
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build configuration with PWA plugin
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: `v18.0+` or `v20.0+`
- **npm** or **pnpm** or **yarn**
- Modern Web Browser with WebGL enabled

### 1. Clone the Repository
```bash
git clone https://github.com/NagarjunareddyDONDETI/The-Last-Minute-Life-Saver.git
cd The-Last-Minute-Life-Saver
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
*Application will be available at: `http://localhost:5173`*

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🔑 AI Engine Configuration

RESCUE provides flexible AI operation modes:

1. **Local Mode (Default - Zero Setup Required)**:
   - No API key needed.
   - Built-in mathematical scoring and pattern-based decomposition run instantly on your machine.
2. **Google Gemini Mode (Enhanced Reasoning)**:
   - Click the **Settings** icon (`⚙️`) in the top-right header.
   - Paste your [Google AI Studio API Key](https://aistudio.google.com/).
   - Choose your preferred model (e.g., `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`).
   - Keys are stored **strictly in browser `localStorage`** and never transmitted to external servers.

---

## 🌐 Deployment & CI/CD Pipeline

This project includes an automated **GitHub Actions CI/CD workflow** located at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

- **Automated Validation**: Type-checks and compiles TypeScript and Vite production assets on every push to `main`.
- **Zero-Downtime Deployment**: Automatically deploys the compiled PWA to **GitHub Pages**.

To deploy your own fork:
1. Navigate to **Repository Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` — GitHub Actions will automatically build and publish your instance.

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are welcome!

1. Fork the Repository (`https://github.com/NagarjunareddyDONDETI/The-Last-Minute-Life-Saver/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/NagarjunareddyDONDETI">Nagarjuna Reddy Dondeti</a></sub>
</div>
