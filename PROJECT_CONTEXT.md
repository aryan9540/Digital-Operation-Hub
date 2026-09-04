# PROJECT CONTEXT: DIGITAL OPERATION HUB (TEAMSYNC B2B)

---

## 1. Executive Summary & Overview
- **Project Name:** Digital Operation Hub (Branded as **TeamSync B2B**)
- **Repository / Domain:** B2B SaaS Enterprise Project & Operations Workspace
- **Developer / Intern:** **Aryan Raj**
- **Role:** MERN Stack Developer Intern
- **Department:** Software Development Department
- **Host Company:** **AMSYS Infocom Pvt. Ltd.** (Devsha Business Park, Sector-63, Noida, UP, India)
- **Internship Period:** 1st July 2026 – 31st July 2026 (4 Weeks)
- **Program Manager / Mentor:** Saurabh Shukla
- **Core Architecture:** 3-Tier Layered Architecture (MERN Stack: React 18, Node.js v24, Express 5, MongoDB Atlas)

---

## 2. Business Problem & Solution
### The Problem:
1. **Tool Sprawl:** Modern tech teams struggle with disjointed standalone applications for sprint tracking, issue logs, audit histories, and team member directories.
2. **Lack of Secure Multi-Tenancy:** Enterprise teams managing cross-departmental operations or multiple client projects face risks of data leakage and permission clashes without strict workspace isolation.
3. **Visibility Gaps:** Managers lack unified real-time analytics for sprint velocity, task bottlenecks, and chronological audit streams.
4. **Complex Access Governance:** Inefficient user onboarding and permission assignment without granular Role-Based Access Control (RBAC).

### The Solution:
**Digital Operation Hub** is a cloud-native, multi-tenant B2B operations and agile sprint management workspace. It provides:
- Organization-level isolated workspaces.
- Hierarchical project and epic breakdown with automated unique project keys (e.g., `SIGMA-101`).
- Interactive drag-and-drop Kanban task boards across 4 stages (`To Do`, `In Progress`, `In Review`, `Completed`).
- 4-Tier Role-Based Access Control (`Owner`, `Admin`, `Member`, `Viewer`) with secure tokenized invitations.
- Automated chronological activity audit logging.
- Real-time productivity and workload analytics.

---

## 3. Technology Stack & Ecosystem

### Frontend Layer:
- **Framework & Runtime:** React.js 18 (Functional Components, Hooks)
- **Build Tool:** Vite 6.0 (High-performance ESM bundling & instant HMR)
- **Routing:** React Router DOM v6 (Nested layouts, protected routes, auth guards)
- **State Management:** React Context API (`AuthContext`, `WorkspaceContext`)
- **Iconography:** Lucide React (`lucide-react`)
- **Styling:** Modern Vanilla CSS 3 with custom CSS variables, glassmorphic dark-theme aesthetics, responsive flex/grid layouts.

### Backend Layer:
- **Runtime:** Node.js (v24.x)
- **Web Framework:** Express.js (v5.2.x) — modular router architecture
- **Validation Engine:** Zod (v4.5.x) — strict runtime request schema validation
- **Session & Security:** `cookie-session`, `cors`, `dotenv`
- **DNS Networking:** Native `dns.setServers(['1.1.1.1', '8.8.8.8'])` for reliable cloud MongoDB SRV cluster resolution

### Database Layer:
- **Database:** MongoDB Atlas (Cloud NoSQL Document Store)
- **ODM:** Mongoose (v9.9.x) with strict schemas, relational `ObjectId` references, population hooks, and compound indexes

### Authentication & Authorization:
- **Stateless Tokens:** JSON Web Tokens (`jsonwebtoken` v9) for API authorization
- **OAuth & Local Strategies:** Passport.js (`passport-google-oauth20`, `passport-local`)
- **Password Hashing:** `bcryptjs` (v3.0.x) salted hashing
- **Access Control:** Custom RBAC middleware verifying workspace roles per request

---

## 4. Database Schema & Data Models (9 Mongoose Collections)

1. **User (`User.js`):**
   - Fields: `name`, `email`, `password` (hashed), `avatar`, `provider` (local/google), `googleId`, `createdAt`.
2. **Workspace (`Workspace.js`):**
   - Fields: `name`, `slug`, `description`, `owner` (ref: User), `members` array `[{ user, role, joinedAt }]`.
   - Roles: `owner`, `admin`, `member`, `viewer`.
3. **Project (`Project.js`):**
   - Fields: `name`, `key` (e.g. `SIGMA`), `description`, `workspace` (ref: Workspace), `lead` (ref: User), `status` (active/archived), `startDate`, `targetDate`.
4. **Epic (`Epic.js`):**
   - Fields: `name`, `description`, `project` (ref: Project), `workspace` (ref: Workspace), `status`, `color`, `targetDate`.
5. **Task (`Task.js`):**
   - Fields: `title`, `key` (e.g. `SIGMA-101`), `description`, `workspace` (ref: Workspace), `project` (ref: Project), `epic` (ref: Epic), `assignee` (ref: User), `reporter` (ref: User), `status` (`todo`, `in-progress`, `in-review`, `completed`), `priority` (`low`, `medium`, `high`, `urgent`), `dueDate`, `order`.
6. **Comment (`Comment.js`):**
   - Fields: `task` (ref: Task), `author` (ref: User), `content`, `createdAt`.
7. **Activity (`Activity.js`):**
   - Fields: `workspace` (ref: Workspace), `project` (ref: Project), `user` (ref: User), `action` (e.g. `created_task`, `moved_task`, `added_member`), `targetType`, `targetId`, `metadata`, `createdAt`.
8. **Notification (`Notification.js`):**
   - Fields: `recipient` (ref: User), `sender` (ref: User), `workspace` (ref: Workspace), `type`, `message`, `link`, `isRead`.
9. **Invitation (`Invitation.js`):**
   - Fields: `workspace` (ref: Workspace), `email`, `role`, `token`, `status` (`pending`, `accepted`, `expired`), `expiresAt`.

---

## 5. Backend REST API Architecture

| Base Route | Core Endpoints & Functionality |
| :--- | :--- |
| `/api/auth` | `POST /register`, `POST /login`, `GET /me`, `POST /logout`, `GET /google`, `GET /google/callback` |
| `/api/users` | `GET /profile`, `PUT /profile`, `PUT /password`, `GET /search` |
| `/api/workspaces` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/switch`, `GET /:id/members` |
| `/api/projects` | `GET /workspace/:workspaceId`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/api/epics` | `GET /project/:projectId`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/api/tasks` | `GET /workspace/:workspaceId`, `GET /project/:projectId`, `POST /`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id` |
| `/api/comments` | `GET /task/:taskId`, `POST /`, `DELETE /:id` |
| `/api/activities` | `GET /workspace/:workspaceId`, `GET /project/:projectId` (Paginated audit logs) |
| `/api/analytics` | `GET /workspace/:workspaceId` (Sprint velocity, status breakdown, task completion rates) |
| `/api/invitations`| `POST /workspace/:workspaceId`, `GET /verify/:token`, `POST /accept/:token` |
| `/api/notifications` | `GET /`, `PATCH /:id/read`, `PATCH /read-all` |

---

## 6. Frontend Architecture & Directory Structure

```
frontend/src/
├── api/                  # Modular Axios/Fetch HTTP service abstractions
│   ├── client.js         # Base API client with JWT interceptor & credentials
│   ├── authApi.js        # Authentication endpoints
│   ├── workspaceApi.js   # Workspace CRUD & membership
│   ├── projectApi.js     # Project operations
│   ├── epicApi.js        # Epics roadmap management
│   ├── taskApi.js        # Task CRUD & Kanban status mutations
│   ├── activityApi.js    # Chronological audit logs
│   ├── analyticsApi.js   # Dashboard metrics
│   ├── commentApi.js     # Task comments
│   ├── invitationApi.js  # Tokenized member invites
│   ├── notificationApi.js# In-app notifications
│   └── userApi.js        # User profile & settings
├── context/
│   ├── AuthContext.jsx   # Global user state, login/logout, token caching
│   └── WorkspaceContext.jsx # Active tenant workspace, workspace switcher state
├── components/
│   ├── common/           # Avatar, Badge, Button, Modal, Input, Spinner
│   ├── layout/           # Sidebar, Navbar, WorkspaceHeader, Layout wrapper
│   └── modals/           # CreateTaskModal, CreateProjectModal, TaskDetailModal, InviteMemberModal
├── pages/
│   ├── LandingPage.jsx   # High-converting product showcase & feature highlights
│   ├── Dashboard.jsx     # Workspace overview, quick stats, active tasks, activity stream
│   ├── Projects.jsx      # Project cards, creation modal, progress indicators
│   ├── ProjectDetail.jsx # Deep dive into project epics, task distribution, team leads
│   ├── Tasks.jsx         # 4-Lane interactive Kanban board & table view with filters
│   ├── Epics.jsx         # Epic roadmaps and goal tracking
│   ├── TeamMembers.jsx   # Member list, role modifiers, pending invite links
│   ├── ActivityLog.jsx   # Full workspace audit history with search/filters
│   ├── Analytics.jsx     # Visual charts for sprint velocity, priority spread, completion %
│   ├── Settings.jsx      # Workspace configuration & profile management
│   └── auth/             # Login.jsx, Register.jsx, AcceptInvite.jsx
├── App.jsx               # Route definitions & ProtectedRoute boundaries
└── index.css             # Comprehensive design system tokens & glassmorphism utilities
```

---

## 7. Key Engineering Highlights & Problem Solving

1. **MongoDB Atlas Cloud SRV Connectivity:**
   - *Problem:* Node.js locally threw `querySrv ECONNREFUSED` connection timeouts when querying cloud clusters.
   - *Fix:* Configured native `dns.setServers(['1.1.1.1', '8.8.8.8'])` before database initialization.
2. **Multi-Tenant Data Isolation:**
   - *Problem:* Preventing cross-tenant data leaks across workspace boundaries.
   - *Fix:* Built centralized workspace scoping middleware that validates membership and injects strict `{ workspace: req.workspaceId }` query clauses.
3. **Cross-Origin Cookie & Bearer Token Authentication:**
   - *Problem:* Maintaining session persistence across differing client (Vite: 5173) and server (Express: 5000) ports.
   - *Fix:* Configured permissive dynamic CORS with `credentials: true` combined with fallback JWT Bearer header interceptors.
4. **Automated Audit Logging:**
   - *Problem:* Tracking every task movement and workspace change without duplicating code.
   - *Fix:* Integrated centralized activity logging hooks inside task and project controllers.

---

## 8. Quick Start & Execution Guide

### Backend:
```bash
cd backend
npm install
npm run seed      # Seeds initial demo workspaces, projects, epics, and tasks
npm run dev       # Starts Express API server on http://localhost:5000
npm run verify    # Validates database connection and API health
```

### Frontend:
```bash
cd frontend
npm install
npm run dev       # Starts Vite React application on http://localhost:5173
```
