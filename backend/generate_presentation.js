const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const pptx = new pptxgen();

// Set presentation properties
pptx.author = "Aryan Raj";
pptx.company = "AMSYS Infocom Pvt Ltd";
pptx.title = "Digital Operation Hub - Internship & Project Presentation";
pptx.subject = "MERN Stack Development Internship Evaluation";
pptx.layout = "LAYOUT_16x9";

// Color Palette Constants
const COLOR_PRIMARY_DARK = "0F172A"; // Slate 900
const COLOR_SECONDARY_DARK = "1E293B"; // Slate 800
const COLOR_ACCENT_BLUE = "4F46E5"; // Indigo 600
const COLOR_ACCENT_CYAN = "0284C7"; // Sky 600
const COLOR_ACCENT_EMERALD = "059669"; // Emerald 600
const COLOR_ACCENT_AMBER = "D97706"; // Amber 600
const COLOR_BG_LIGHT = "F8FAFC"; // Slate 50
const COLOR_CARD_BG = "FFFFFF"; // White
const COLOR_CARD_BORDER = "E2E8F0"; // Slate 200
const COLOR_TEXT_MAIN = "0F172A"; // Slate 900
const COLOR_TEXT_MUTED = "475569"; // Slate 600
const COLOR_TEXT_LIGHT = "94A3B8"; // Slate 400
const COLOR_WHITE = "FFFFFF";

// Helper function to add a standard slide header
function addSlideHeader(slide, category, title, subtitle) {
  // Category Tag
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.4,
    w: 8.0,
    h: 0.25,
    fontSize: 10,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_ACCENT_BLUE,
    letterSpacing: 1.5,
  });

  // Main Title
  slide.addText(title, {
    x: 0.8,
    y: 0.65,
    w: 11.5,
    h: 0.55,
    fontSize: 22,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_PRIMARY_DARK,
  });

  // Subtitle / Context
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.2,
      w: 11.5,
      h: 0.35,
      fontSize: 12,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
    });
  }

  // Top Right Minimal Badge
  slide.addShape(pptx.ShapeType.rect, {
    x: 10.8,
    y: 0.4,
    w: 2.0,
    h: 0.35,
    fill: { color: "EEF2F6" },
    line: { color: "CBD5E1", width: 1 },
    rectRadius: 0.05,
  });

  slide.addText("AMSYS INFOCOM", {
    x: 10.8,
    y: 0.4,
    w: 2.0,
    h: 0.35,
    fontSize: 9,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_SECONDARY_DARK,
    align: "center",
    valign: "middle",
  });
}

// =========================================================================
// SLIDE 1: TITLE SLIDE
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_PRIMARY_DARK };

  // Decorative header bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.15,
    fill: { color: COLOR_ACCENT_BLUE },
  });

  // Badge
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.0,
    y: 1.1,
    w: 3.8,
    h: 0.4,
    fill: { color: "1E293B" },
    line: { color: "334155", width: 1 },
    rectRadius: 0.08,
  });
  slide.addText("INTERNSHIP & PROJECT EVALUATION", {
    x: 1.0,
    y: 1.1,
    w: 3.8,
    h: 0.4,
    fontSize: 10,
    fontFace: "Segoe UI",
    bold: true,
    color: "818CF8",
    align: "center",
    valign: "middle",
  });

  // Title
  slide.addText("DIGITAL OPERATION HUB", {
    x: 1.0,
    y: 1.65,
    w: 11.0,
    h: 0.9,
    fontSize: 34,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_WHITE,
  });

  // Subtitle
  slide.addText("TeamSync B2B: Enterprise Multi-Tenant Operations & Agile Sprint Workspace", {
    x: 1.0,
    y: 2.55,
    w: 11.0,
    h: 0.45,
    fontSize: 15,
    fontFace: "Segoe UI",
    color: "94A3B8",
  });

  // Left Card: Presenter Details
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.0,
    y: 3.3,
    w: 5.4,
    h: 3.2,
    fill: { color: "1E293B" },
    line: { color: "334155", width: 1 },
    rectRadius: 0.1,
  });

  slide.addText("CANDIDATE INFORMATION", {
    x: 1.3,
    y: 3.55,
    w: 4.8,
    h: 0.3,
    fontSize: 11,
    fontFace: "Segoe UI",
    bold: true,
    color: "38BDF8",
  });

  const candidateInfo = [
    { text: "Name: ", options: { bold: true, color: "CBD5E1" } },
    { text: "Aryan Raj\n", options: { bold: true, color: COLOR_WHITE } },
    { text: "Role: ", options: { bold: true, color: "CBD5E1" } },
    { text: "MERN Stack Developer Intern\n", options: { color: "E2E8F0" } },
    { text: "Department: ", options: { bold: true, color: "CBD5E1" } },
    { text: "Software Development Department\n", options: { color: "E2E8F0" } },
    { text: "Domain: ", options: { bold: true, color: "CBD5E1" } },
    { text: "Full Stack Web Engineering (B2B SaaS)", options: { color: "E2E8F0" } },
  ];
  slide.addText(candidateInfo, {
    x: 1.3,
    y: 3.9,
    w: 4.8,
    h: 2.3,
    fontSize: 12,
    fontFace: "Segoe UI",
    lineSpacing: 22,
  });

  // Right Card: Organization & Internship Details
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 3.3,
    w: 5.5,
    h: 3.2,
    fill: { color: "1E293B" },
    line: { color: "334155", width: 1 },
    rectRadius: 0.1,
  });

  slide.addText("INTERNSHIP CREDENTIALS", {
    x: 7.1,
    y: 3.55,
    w: 4.9,
    h: 0.3,
    fontSize: 11,
    fontFace: "Segoe UI",
    bold: true,
    color: "34D399",
  });

  const companyInfo = [
    { text: "Company: ", options: { bold: true, color: "CBD5E1" } },
    { text: "Amsys Infocom Pvt Ltd\n", options: { bold: true, color: COLOR_WHITE } },
    { text: "Location: ", options: { bold: true, color: "CBD5E1" } },
    { text: "Devsha Business Park, Sector-63, Noida, UP\n", options: { color: "E2E8F0" } },
    { text: "Duration: ", options: { bold: true, color: "CBD5E1" } },
    { text: "1st July 2026 – 31st July 2026 (4 Weeks)\n", options: { color: "E2E8F0" } },
    { text: "Program Manager: ", options: { bold: true, color: "CBD5E1" } },
    { text: "Saurabh Shukla", options: { color: "E2E8F0" } },
  ];
  slide.addText(companyInfo, {
    x: 7.1,
    y: 3.9,
    w: 4.9,
    h: 2.3,
    fontSize: 12,
    fontFace: "Segoe UI",
    lineSpacing: 22,
  });

  slide.addNotes(
    "Good morning/afternoon respected evaluators, professors, and industry mentors. My name is Aryan Raj, and today I am excited to present my internship project report and final presentation on the 'Digital Operation Hub', also built as TeamSync B2B. During my four-week tenure as a MERN Stack Developer Intern at Amsys Infocom Pvt Ltd, under the Software Development Department in Noida, I worked on architecting and delivering an enterprise-ready operations and agile workflow platform. In this 10-minute presentation, I will walk you through the company background, industry problem statement, technical architecture, features implemented, personal contributions, challenges solved, and learning outcomes. Let us begin."
  );
}

// =========================================================================
// SLIDE 2: ABOUT AMSYS INFOCOM
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "Company Profile",
    "About Amsys Infocom Pvt. Ltd.",
    "A premier technology consulting and digital enterprise engineering firm"
  );

  // Card 1: Overview
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.7,
    w: 3.6,
    h: 4.9,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.1,
    y: 2.0,
    w: 0.5,
    h: 0.5,
    fill: { color: "EEF2FF" },
    rectRadius: 0.08,
  });
  slide.addText("🏢", { x: 1.1, y: 2.0, w: 0.5, h: 0.5, fontSize: 16, align: "center", valign: "middle" });

  slide.addText("Corporate Overview", {
    x: 1.1,
    y: 2.65,
    w: 3.0,
    h: 0.35,
    fontSize: 15,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_PRIMARY_DARK,
  });

  slide.addText(
    "• Organization: Amsys Infocom Private Limited\n• Corporate HQ: Devsha Business Park, Sector 63, Noida, UP\n• Digital Presence: www.amsysinfo.com\n• Mission: Delivering high-impact digital transformation and bespoke enterprise software solutions.",
    {
      x: 1.1,
      y: 3.1,
      w: 3.0,
      h: 3.2,
      fontSize: 11.5,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 20,
    }
  );

  // Card 2: Industry Domains
  slide.addShape(pptx.ShapeType.rect, {
    x: 4.8,
    y: 1.7,
    w: 3.6,
    h: 4.9,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.1,
    y: 2.0,
    w: 0.5,
    h: 0.5,
    fill: { color: "F0FDF4" },
    rectRadius: 0.08,
  });
  slide.addText("⚡", { x: 5.1, y: 2.0, w: 0.5, h: 0.5, fontSize: 16, align: "center", valign: "middle" });

  slide.addText("Domain & Expertise", {
    x: 5.1,
    y: 2.65,
    w: 3.0,
    h: 0.35,
    fontSize: 15,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_PRIMARY_DARK,
  });

  slide.addText(
    "• Enterprise Web & Cloud Applications\n• Full-Stack MERN Product Engineering\n• Secure B2B SaaS Architectures\n• Microservices & REST API Gateways\n• Database Optimization & DevOps Automation",
    {
      x: 5.1,
      y: 3.1,
      w: 3.0,
      h: 3.2,
      fontSize: 11.5,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 20,
    }
  );

  // Card 3: Engineering Culture
  slide.addShape(pptx.ShapeType.rect, {
    x: 8.8,
    y: 1.7,
    w: 3.7,
    h: 4.9,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 9.1,
    y: 2.0,
    w: 0.5,
    h: 0.5,
    fill: { color: "F8FAFC" },
    rectRadius: 0.08,
  });
  slide.addText("🚀", { x: 9.1, y: 2.0, w: 0.5, h: 0.5, fontSize: 16, align: "center", valign: "middle" });

  slide.addText("Development Culture", {
    x: 9.1,
    y: 2.65,
    w: 3.1,
    h: 0.35,
    fontSize: 15,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_PRIMARY_DARK,
  });

  slide.addText(
    "• Agile / Scrum Sprint Workflows\n• Clean Code & Multi-tier Modular Architecture\n• Rigorous Security (OAuth, RBAC, JWT)\n• Continuous Integration & Peer Code Reviews\n• Focus on High Performance & Scalability",
    {
      x: 9.1,
      y: 3.1,
      w: 3.1,
      h: 3.2,
      fontSize: 11.5,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 20,
    }
  );

  slide.addNotes(
    "Allow me to introduce the host company where I carried out my internship. AMSYS Infocom Private Limited is an established software engineering and IT consulting organization located at Sector 63, Noida. The company specializes in building robust, high-performance web applications, cloud-native systems, and customized enterprise B2B software solutions. The Software Development Department at AMSYS fosters a disciplined Agile environment focusing on scalable code, modular micro-architectures, data security, and collaborative sprint reviews. Working in this setting gave me real-world exposure to production-level standards, clean API design, and team-driven software engineering."
  );
}

// =========================================================================
// SLIDE 3: INTERNSHIP OVERVIEW
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "Internship Scope",
    "Internship Role, Objectives & Responsibilities",
    "Structured 4-week engagement in full-stack software development"
  );

  // Banner Top
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.7,
    w: 11.7,
    h: 1.0,
    fill: { color: "0F172A" },
    rectRadius: 0.08,
  });
  slide.addText("Role: MERN Stack Developer Intern   |   Department: Software Development   |   Duration: 4 Weeks", {
    x: 1.1,
    y: 1.8,
    w: 11.0,
    h: 0.3,
    fontSize: 12,
    fontFace: "Segoe UI",
    bold: true,
    color: "38BDF8",
  });
  slide.addText("Mentorship & Evaluation: Under the guidance of Saurabh Shukla (Program Manager) & Senior Engineering Leads", {
    x: 1.1,
    y: 2.15,
    w: 11.0,
    h: 0.35,
    fontSize: 11,
    fontFace: "Segoe UI",
    color: "CBD5E1",
  });

  // Left Column: Key Objectives
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 2.9,
    w: 5.7,
    h: 3.8,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });
  slide.addText("🎯 Core Internship Objectives", {
    x: 1.1,
    y: 3.1,
    w: 5.1,
    h: 0.35,
    fontSize: 14,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_ACCENT_BLUE,
  });
  slide.addText(
    "1. Develop an enterprise-ready operations platform connecting workspaces, epics, and tasks.\n2. Engineer secure RESTful APIs using Node.js, Express 5, and Mongoose with Zod schema validation.\n3. Implement multi-tenant workspace isolation with role-based access control (RBAC).\n4. Build an interactive, responsive React frontend featuring Kanban boards and real-time activity feeds.\n5. Ensure production-grade reliability via error handling and automated database seeding.",
    {
      x: 1.1,
      y: 3.55,
      w: 5.1,
      h: 2.9,
      fontSize: 11,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 18,
    }
  );

  // Right Column: Key Responsibilities
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 2.9,
    w: 5.7,
    h: 3.8,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });
  slide.addText("📋 Primary Responsibilities", {
    x: 7.1,
    y: 3.1,
    w: 5.1,
    h: 0.35,
    fontSize: 14,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_ACCENT_EMERALD,
  });
  slide.addText(
    "1. Architecture & Schema Design: Modeled 9 relational collections in MongoDB Atlas.\n2. API Route & Middleware Implementation: Developed 11 core API modules with JWT and session auth.\n3. Component Engineering: Built reusable UI components (Kanban lanes, analytics cards, modals) with React 18.\n4. Quality Assurance: Tested endpoints using seed verifications, CastError/validation error handlers.\n5. Technical Documentation: Maintained API specifications, environment configs, and code reviews.",
    {
      x: 7.1,
      y: 3.55,
      w: 5.1,
      h: 2.9,
      fontSize: 11,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 18,
    }
  );

  slide.addNotes(
    "On this slide, I outline my internship scope. As a MERN Stack Developer Intern, my primary goal was to conceptualize, design, and implement the Digital Operation Hub. My responsibilities spanned both backend and frontend development. On the backend, I designed 9 MongoDB schemas, configured RESTful API route handlers in Express 5, integrated JWT and OAuth authentication, and implemented RBAC middleware. On the frontend, I engineered a responsive single-page application using React 18 and Vite, incorporating Kanban task boards, project milestone trackers, and real-time workspace metrics. Everything was executed with daily standups and weekly sprint deliverables under Program Manager Saurabh Shukla."
  );
}

// =========================================================================
// SLIDE 4: PROBLEM STATEMENT
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "The Problem",
    "Problem Statement & Industry Challenges",
    "Addressing operational friction and tool fragmentation in modern tech teams"
  );

  const problemCards = [
    {
      num: "01",
      title: "Tool Sprawl & Fragmentation",
      desc: "Companies juggle separate tools for task tracking, team communication, sprint planning, and activity auditing. This creates friction, context switching, and lost productivity.",
      color: "EF4444",
      x: 0.8,
    },
    {
      num: "02",
      title: "Multi-Tenancy & Data Isolation",
      desc: "Cross-functional organizations require strict separation between departments and clients. Without secure multi-tenant isolation, data leakage and permission clashes occur.",
      color: "F59E0B",
      x: 3.8,
    },
    {
      num: "03",
      title: "Lack of Real-Time Visibility",
      desc: "Project managers lack live visibility into task progression, bottleneck identification, epic completion rates, and chronological audit streams across distributed teams.",
      color: "6366F1",
      x: 6.8,
    },
    {
      num: "04",
      title: "Complex Access Governance",
      desc: "Managing diverse roles (Owners, Admins, Members, Viewers) via cumbersome email invite procedures often leads to onboarding delays and security vulnerabilities.",
      color: "10B981",
      x: 9.8,
    },
  ];

  problemCards.forEach((card) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: card.x,
      y: 1.7,
      w: 2.7,
      h: 4.8,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_CARD_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText(card.num, {
      x: card.x + 0.2,
      y: 2.0,
      w: 2.3,
      h: 0.5,
      fontSize: 24,
      fontFace: "Segoe UI",
      bold: true,
      color: card.color,
    });

    slide.addText(card.title, {
      x: card.x + 0.2,
      y: 2.65,
      w: 2.3,
      h: 0.65,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: COLOR_PRIMARY_DARK,
    });

    slide.addText(card.desc, {
      x: card.x + 0.2,
      y: 3.4,
      w: 2.3,
      h: 2.8,
      fontSize: 11,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 17,
    });
  });

  slide.addNotes(
    "Why did we build this project? Modern organizations face four critical bottlenecks. First, tool sprawl: developers and managers switch constantly between standalone task boards, chat apps, and issue trackers, leading to lost time. Second, data isolation: enterprises running multiple client accounts or business units struggle with data segregation without multi-tenant architecture. Third, visibility gaps: leadership lacks a single pane of glass to view sprint velocity, high-priority blockers, and historical audit logs. Fourth, access governance: granting precise role-based access safely and inviting team members frictionlessly remains a hassle. The Digital Operation Hub was created to eliminate these bottlenecks in one unified solution."
  );
}

// =========================================================================
// SLIDE 5: PROJECT OVERVIEW & SOLUTION
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "The Solution",
    "Project Overview: Digital Operation Hub (TeamSync B2B)",
    "A unified enterprise operations hub engineered for agile collaboration and transparency"
  );

  // Left Large Card: Product Vision & Solution
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.7,
    w: 6.8,
    h: 4.9,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });

  slide.addText("💡 What is Digital Operation Hub?", {
    x: 1.1,
    y: 1.95,
    w: 6.2,
    h: 0.35,
    fontSize: 15,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_ACCENT_BLUE,
  });

  slide.addText(
    "Digital Operation Hub (TeamSync B2B) is a centralized, cloud-hosted enterprise workspace platform designed to streamline sprint execution, multi-project workflows, and cross-functional team management.\n\nIt bridges the gap between high-level company initiatives (Epics) and day-to-day developer tasks through interactive Kanban boards, automated audit logging, and role-governed workspaces.",
    {
      x: 1.1,
      y: 2.4,
      w: 6.2,
      h: 1.7,
      fontSize: 11.5,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 18,
    }
  );

  slide.addShape(pptx.ShapeType.rect, {
    x: 1.1,
    y: 4.25,
    w: 6.2,
    h: 2.1,
    fill: { color: "F1F5F9" },
    rectRadius: 0.08,
  });

  slide.addText("🌟 Core Solution Pillars:", {
    x: 1.3,
    y: 4.4,
    w: 5.8,
    h: 0.25,
    fontSize: 11,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_PRIMARY_DARK,
  });

  const pillars = [
    { text: "✔ Multi-Tenant Isolation: ", options: { bold: true, color: COLOR_ACCENT_BLUE } },
    { text: "Distinct organization workspaces with scoped database queries.\n", options: { color: COLOR_TEXT_MUTED } },
    { text: "✔ Interactive Task Board: ", options: { bold: true, color: COLOR_ACCENT_EMERALD } },
    { text: "To Do, In Progress, In Review, Completed drag/status workflows.\n", options: { color: COLOR_TEXT_MUTED } },
    { text: "✔ Real-time Audit & Analytics: ", options: { bold: true, color: COLOR_ACCENT_CYAN } },
    { text: "Live chronological activity stream and completion metrics.", options: { color: COLOR_TEXT_MUTED } },
  ];
  slide.addText(pillars, {
    x: 1.3,
    y: 4.7,
    w: 5.8,
    h: 1.5,
    fontSize: 10.5,
    fontFace: "Segoe UI",
    lineSpacing: 17,
  });

  // Right Side: 3 KPI Feature Stat Boxes
  const stats = [
    {
      title: "11+ REST Modules",
      subtitle: "Full CRUD & analytics endpoints for workspaces, tasks, epics, and activities.",
      color: "EEF2FF",
      border: "C7D2FE",
      textColor: "4F46E5",
      y: 1.7,
    },
    {
      title: "Role-Based Security",
      subtitle: "4-tier RBAC (Owner, Admin, Member, Viewer) with secure invitation tokens.",
      color: "F0FDF4",
      border: "BBF7D0",
      textColor: "059669",
      y: 3.4,
    },
    {
      title: "Live Activity Stream",
      subtitle: "Automated event interception logging every status shift and team action.",
      color: "F0F9FF",
      border: "BAE6FD",
      textColor: "0284C7",
      y: 5.1,
    },
  ];

  stats.forEach((st) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 8.0,
      y: st.y,
      w: 4.5,
      h: 1.5,
      fill: { color: st.color },
      line: { color: st.border, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText(st.title, {
      x: 8.3,
      y: st.y + 0.2,
      w: 4.0,
      h: 0.35,
      fontSize: 14,
      fontFace: "Segoe UI",
      bold: true,
      color: st.textColor,
    });

    slide.addText(st.subtitle, {
      x: 8.3,
      y: st.y + 0.6,
      w: 4.0,
      h: 0.75,
      fontSize: 11,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 16,
    });
  });

  slide.addNotes(
    "To solve these industry challenges, we engineered the Digital Operation Hub (TeamSync B2B). The platform serves as a unified SaaS operations center. Teams can register an organization workspace, invite team members with specific roles like Admin, Member, or Viewer, create projects with custom project keys, break initiatives down into epics, and assign tasks with deadlines and priority tags. We designed it with three foundational pillars: strict multi-tenant data isolation, fluid Kanban task progression, and comprehensive auditability. Every action triggers an activity log entry, providing absolute transparency across the organization."
  );
}

// =========================================================================
// SLIDE 6: TECHNOLOGY STACK
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "Technical Foundation",
    "Technology Stack & Tooling Ecosystem",
    "Modern, scalable MERN stack architecture with robust security and validation libraries"
  );

  const techCategories = [
    {
      name: "Frontend Layer",
      icon: "⚛️",
      accent: "38BDF8",
      items: [
        { label: "React.js 18", desc: "Component-based declarative UI" },
        { label: "Vite 6.0", desc: "Ultra-fast build & HMR tool" },
        { label: "React Router v6", desc: "Client-side SPA routing" },
        { label: "Lucide React", desc: "Modern vector icon system" },
        { label: "Vanilla CSS 3", desc: "Glassmorphism & dark theme" },
      ],
      x: 0.8,
    },
    {
      name: "Backend Layer",
      icon: "🟢",
      accent: "22C55E",
      items: [
        { label: "Node.js (v24)", desc: "Asynchronous event-driven runtime" },
        { label: "Express.js 5.2", desc: "RESTful routing framework" },
        { label: "Zod 4.5", desc: "Strict schema runtime validation" },
        { label: "CORS & Cookie-Session", desc: "Secure cross-origin session mgmt" },
        { label: "Nodemon", desc: "Development hot reloading" },
      ],
      x: 3.8,
    },
    {
      name: "Database Layer",
      icon: "🍃",
      accent: "10B981",
      items: [
        { label: "MongoDB Atlas", desc: "Cloud NoSQL document database" },
        { label: "Mongoose 9.9", desc: "Schema modeling & ODM layer" },
        { label: "Indexed Queries", desc: "Workspace-scoped fast lookups" },
        { label: "Population Hooks", desc: "Relational foreign key joins" },
        { label: "DNS SRV Config", desc: "Dual Cloudflare/Google DNS resolvers" },
      ],
      x: 6.8,
    },
    {
      name: "Security & Auth",
      icon: "🛡️",
      accent: "6366F1",
      items: [
        { label: "JWT (JsonWebToken)", desc: "Stateless bearer token auth" },
        { label: "Passport.js", desc: "Google OAuth 2.0 & Local strategy" },
        { label: "Bcrypt.js 3.0", desc: "Salted password hashing" },
        { label: "RBAC Middleware", desc: "Role authorization guards" },
        { label: "Global Error Handlers", desc: "Safe sanitized error responses" },
      ],
      x: 9.8,
    },
  ];

  techCategories.forEach((cat) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: cat.x,
      y: 1.7,
      w: 2.7,
      h: 4.9,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_CARD_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    // Top Header Box
    slide.addShape(pptx.ShapeType.rect, {
      x: cat.x,
      y: 1.7,
      w: 2.7,
      h: 0.7,
      fill: { color: "0F172A" },
      rectRadius: 0.08,
    });

    slide.addText(`${cat.icon} ${cat.name}`, {
      x: cat.x + 0.1,
      y: 1.8,
      w: 2.5,
      h: 0.45,
      fontSize: 12,
      fontFace: "Segoe UI",
      bold: true,
      color: COLOR_WHITE,
      align: "center",
      valign: "middle",
    });

    let itemY = 2.55;
    cat.items.forEach((it) => {
      slide.addText(`▪ ${it.label}`, {
        x: cat.x + 0.15,
        y: itemY,
        w: 2.4,
        h: 0.25,
        fontSize: 11,
        fontFace: "Segoe UI",
        bold: true,
        color: COLOR_PRIMARY_DARK,
      });

      slide.addText(it.desc, {
        x: cat.x + 0.3,
        y: itemY + 0.22,
        w: 2.25,
        h: 0.28,
        fontSize: 9.5,
        fontFace: "Segoe UI",
        color: COLOR_TEXT_MUTED,
      });

      itemY += 0.72;
    });
  });

  slide.addNotes(
    "Turning to our technology stack, we adopted the robust MERN stack architecture with carefully selected supporting libraries. On the frontend, we used React 18 with Vite for instantaneous hot module replacement, React Router v6 for clean single-page routing, and Lucide icons for crisp visual indicators, styled with a modern dark-mode design system. On the backend, we leveraged Node.js v24 with Express 5, using Zod for strict runtime schema validation of inbound payloads. On the database tier, we utilized MongoDB Atlas alongside Mongoose ODM, utilizing compound indexing and document population. For authentication and security, we implemented dual-flow authentication with JWT and Passport.js Google OAuth 2.0, Bcrypt password hashing, and custom RBAC middleware."
  );
}

// =========================================================================
// SLIDE 7: SYSTEM ARCHITECTURE & WORKFLOW
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "Architecture",
    "System Architecture & End-to-End Workflow",
    "Three-tier modular design ensuring security, scalability, and loose coupling"
  );

  // 3 Large Horizontal Tier Blocks
  const tiers = [
    {
      title: "TIER 1: CLIENT PRESENTATION LAYER (React 18 + Vite)",
      badge: "FRONTEND",
      color: "38BDF8",
      bgColor: "F0F9FF",
      borderColor: "BAE6FD",
      y: 1.7,
      desc: "• React Single Page Application (SPA) with Context API (AuthContext, WorkspaceContext)\n• Interactive Views: Dashboard, Kanban Tasks, Epics, Project Detail, Analytics, Team Management\n• Client HTTP Adapter: Fetch/Axios API client with credentials, JWT interceptors, and error handling",
    },
    {
      title: "TIER 2: APPLICATION & API GATEWAY LAYER (Node.js + Express 5)",
      badge: "BACKEND API",
      color: "6366F1",
      bgColor: "EEF2FF",
      borderColor: "C7D2FE",
      y: 3.35,
      desc: "• Security Middlewares: CORS whitelist, Cookie Session, JWT Bearer verifier, Role Check (RBAC)\n• 11 RESTful Controllers: /auth, /users, /workspaces, /projects, /epics, /tasks, /comments, /activities\n• Validation & Logging: Zod request validation, CastError handling, automated activity audit triggers",
    },
    {
      title: "TIER 3: DATA PERSISTENCE LAYER (MongoDB Atlas + Mongoose)",
      badge: "DATABASE",
      color: "10B981",
      bgColor: "F0FDF4",
      borderColor: "BBF7D0",
      y: 5.0,
      desc: "• 9 Normalized Mongoose Collections: Users, Workspaces, Projects, Epics, Tasks, Comments, Activities\n• Relational Schema Integrity: Foreign key ObjectIds, cascade deletion hooks, and composite indexes\n• Cloud DNS Optimization: Cloudflare 1.1.1.1 & Google 8.8.8.8 SRV resolvers for guaranteed cloud uptime",
    },
  ];

  tiers.forEach((t) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: t.y,
      w: 11.7,
      h: 1.45,
      fill: { color: t.bgColor },
      line: { color: t.borderColor, width: 1.5 },
      rectRadius: 0.08,
    });

    slide.addText(t.title, {
      x: 1.1,
      y: t.y + 0.12,
      w: 8.5,
      h: 0.3,
      fontSize: 12.5,
      fontFace: "Segoe UI",
      bold: true,
      color: COLOR_PRIMARY_DARK,
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 10.7,
      y: t.y + 0.12,
      w: 1.5,
      h: 0.28,
      fill: { color: COLOR_PRIMARY_DARK },
      rectRadius: 0.04,
    });
    slide.addText(t.badge, {
      x: 10.7,
      y: t.y + 0.12,
      w: 1.5,
      h: 0.28,
      fontSize: 9,
      fontFace: "Segoe UI",
      bold: true,
      color: t.color,
      align: "center",
      valign: "middle",
    });

    slide.addText(t.desc, {
      x: 1.1,
      y: t.y + 0.45,
      w: 11.1,
      h: 0.9,
      fontSize: 10.5,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 16,
    });
  });

  slide.addNotes(
    "Here we present the 3-Tier System Architecture. At the top is the Presentation Tier built with React 18, utilizing the Context API for seamless authentication and workspace state synchronization. When a user interacts with the UI, requests are securely dispatched with authentication tokens. In Tier 2, the Express.js Application Gateway processes requests through security layers: CORS origin checking, session/token verification, and RBAC authorization. Once authorized, controllers validate inputs with Zod schemas and perform business logic. In Tier 3, MongoDB Atlas persists normalized data across 9 collections with indexed query optimization. Whenever a task or project is updated, an automated trigger creates an activity log entry, guaranteeing end-to-end data traceability."
  );
}

// =========================================================================
// SLIDE 8: KEY FEATURES & MODULES
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "Core Capabilities",
    "Key Functional Modules & Feature Suite",
    "Comprehensive suite of enterprise collaboration and sprint tracking capabilities"
  );

  const features = [
    {
      icon: "🏢",
      title: "Multi-Tenant Workspaces",
      desc: "Isolated organization contexts with custom branding, member directories, and easy switching.",
      x: 0.8,
      y: 1.7,
    },
    {
      icon: "📌",
      title: "Projects & Epics Hub",
      desc: "Hierarchical project management with unique project keys (e.g., SIGMA-101) and epic roadmaps.",
      x: 4.8,
      y: 1.7,
    },
    {
      icon: "📊",
      title: "Interactive Kanban Board",
      desc: "Live status lanes (To Do, In Progress, In Review, Done) with priority tags and modal detail editors.",
      x: 8.8,
      y: 1.7,
    },
    {
      icon: "👥",
      title: "Role-Based Access (RBAC)",
      desc: "Granular permissions for Owner, Admin, Member, and Viewer with token-based email invite links.",
      x: 0.8,
      y: 4.2,
    },
    {
      icon: "📜",
      title: "Audit Logs & Activity Stream",
      desc: "Chronological event interception recording task moves, member joins, and milestone completions.",
      x: 4.8,
      y: 4.2,
    },
    {
      icon: "📈",
      title: "Real-Time Analytics Dashboard",
      desc: "Visual charts for sprint velocity, task status breakdown, priority distribution, and completion rates.",
      x: 8.8,
      y: 4.2,
    },
  ];

  features.forEach((feat) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: feat.x,
      y: feat.y,
      w: 3.7,
      h: 2.3,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_CARD_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText(feat.icon, {
      x: feat.x + 0.2,
      y: feat.y + 0.2,
      w: 0.6,
      h: 0.4,
      fontSize: 20,
    });

    slide.addText(feat.title, {
      x: feat.x + 0.8,
      y: feat.y + 0.2,
      w: 2.7,
      h: 0.4,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: COLOR_PRIMARY_DARK,
    });

    slide.addText(feat.desc, {
      x: feat.x + 0.2,
      y: feat.y + 0.75,
      w: 3.3,
      h: 1.35,
      fontSize: 10.5,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 16,
    });
  });

  slide.addNotes(
    "This slide highlights the six core modules implemented in Digital Operation Hub. First, Multi-Tenant Workspaces allow organizations to create multiple separated domains. Second, Projects and Epics provide top-level milestone tracking with automated key generation. Third, the interactive Kanban board allows team members to drag or transition tasks across four distinct stages with urgent, high, medium, and low priority indicators. Fourth, RBAC governance secures sensitive operations based on member roles. Fifth, our Activity Stream serves as an immutable audit log of workspace events. Finally, the Analytics module generates real-time completion statistics and workload distribution metrics for project managers."
  );
}

// =========================================================================
// SLIDE 9: MY CONTRIBUTION & KEY DELIVERABLES
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "Personal Impact",
    "My Contributions & Key Engineering Deliverables",
    "Direct technical contributions made during the 4-week internship at AMSYS Infocom"
  );

  // Left Column: Backend & Database Deliverables
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.7,
    w: 5.7,
    h: 4.9,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 1.1,
    y: 1.9,
    w: 5.1,
    h: 0.35,
    fill: { color: "EEF2FF" },
    rectRadius: 0.05,
  });
  slide.addText("💻 Backend & Database Engineering", {
    x: 1.2,
    y: 1.9,
    w: 4.9,
    h: 0.35,
    fontSize: 12,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_ACCENT_BLUE,
    valign: "middle",
  });

  const backendContributions = [
    "• RESTful API Architecture: Engineered 11 API controllers (/auth, /workspaces, /projects, /epics, /tasks, /activities, /analytics).",
    "• Schema Modeling: Designed 9 normalized Mongoose schemas with indexed foreign keys, cascade hooks, and populated references.",
    "• Authentication Engine: Built dual-auth system integrating JWT bearer tokens and Passport.js Google OAuth 2.0 with Bcrypt password hashing.",
    "• Security & Validation: Enforced strict Zod runtime payload validators, CORS whitelisting, and centralized CastError/ValidationError middleware.",
    "• Seed & Verification Tools: Wrote automated database seeding scripts (`seed.js`) and health verification utilities (`verifyBackend.js`).",
  ];
  slide.addText(backendContributions.join("\n\n"), {
    x: 1.1,
    y: 2.35,
    w: 5.1,
    h: 4.1,
    fontSize: 10.5,
    fontFace: "Segoe UI",
    color: COLOR_TEXT_MUTED,
    lineSpacing: 15,
  });

  // Right Column: Frontend & Integration Deliverables
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 1.7,
    w: 5.7,
    h: 4.9,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 7.1,
    y: 1.9,
    w: 5.1,
    h: 0.35,
    fill: { color: "F0FDF4" },
    rectRadius: 0.05,
  });
  slide.addText("⚛️ Frontend & Full-Stack Integration", {
    x: 7.2,
    y: 1.9,
    w: 4.9,
    h: 0.35,
    fontSize: 12,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_ACCENT_EMERALD,
    valign: "middle",
  });

  const frontendContributions = [
    "• SPA Architecture: Developed 10+ core pages (Dashboard, Projects, Kanban Tasks, Epics, Analytics, Team Management, Landing Page).",
    "• Global State Contexts: Implemented `AuthContext` and `WorkspaceContext` for seamless user session and active workspace persistence.",
    "• Reusable Component System: Built modular UI components including TaskDetailModal, StatusBadge, PriorityBadge, and Avatar generators.",
    "• API Integration Layer: Created 12 modular API client services (`client.js`, `taskApi`, `projectApi`, `activityApi`) with async/await error handling.",
    "• UI/UX Design System: Crafted a responsive, glassmorphic dark-themed interface with custom CSS tokens and micro-interactions.",
  ];
  slide.addText(frontendContributions.join("\n\n"), {
    x: 7.1,
    y: 2.35,
    w: 5.1,
    h: 4.1,
    fontSize: 10.5,
    fontFace: "Segoe UI",
    color: COLOR_TEXT_MUTED,
    lineSpacing: 15,
  });

  slide.addNotes(
    "Moving to my direct contributions during the internship: I worked across the full stack. On the backend, I designed and coded all 11 API route modules, created the 9 Mongoose data schemas, built the authentication pipeline supporting both JWT and Google OAuth 2.0, implemented Zod payload validation, and crafted automated database seeders and verification utilities. On the frontend, I engineered over 10 responsive views in React 18, integrated centralized state management via React Contexts, built the entire API client abstraction layer, and styled a custom dark-mode UI with smooth micro-interactions. My code was reviewed and merged during weekly sprint milestones."
  );
}

// =========================================================================
// SLIDE 10: CHALLENGES & SOLUTIONS
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "Problem Solving",
    "Technical Challenges Encountered & Implemented Solutions",
    "Demonstrating engineering resilience, analytical debugging, and architectural problem solving"
  );

  const challenges = [
    {
      num: "Challenge 01",
      title: "MongoDB Atlas DNS SRV Resolution",
      issue: "Encountered DNS query timeouts (`querySrv ECONNREFUSED`) when resolving MongoDB Atlas cloud cluster URIs on local development environments.",
      solution: "Configured custom upstream DNS servers using Node.js native `dns.setServers(['1.1.1.1', '8.8.8.8'])` before initiating Mongoose database connections.",
      learning: "Gained deeper insight into cloud networking, DNS resolution layers, and resilient database connection patterns.",
      accent: "EF4444",
      x: 0.8,
    },
    {
      num: "Challenge 02",
      title: "Multi-Tenant Data Leakage Prevention",
      issue: "Risk of cross-workspace data exposure if task or project queries did not strictly isolate entities belonging to different organizational workspaces.",
      solution: "Architected centralized workspace scoping middleware that automatically verifies user membership and injects `workspaceId` filters into all Mongoose queries.",
      learning: "Mastered enterprise multi-tenancy principles, middleware chaining, and authorization boundaries.",
      accent: "F59E0B",
      x: 4.8,
    },
    {
      num: "Challenge 03",
      title: "Cross-Origin Session & JWT State Sync",
      issue: "Managing seamless session persistence across differing client ports (Vite 5173 vs Express 5000) with strict cookie-security policies and CORS.",
      solution: "Configured CORS with dynamic origin resolution, `credentials: true`, combined with fallback JWT Bearer headers and custom React auth interceptors.",
      learning: "Developed deep expertise in modern web security, cookie flags (`SameSite`, `HttpOnly`), and hybrid auth token architectures.",
      accent: "6366F1",
      x: 8.8,
    },
  ];

  challenges.forEach((ch) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: ch.x,
      y: 1.7,
      w: 3.7,
      h: 4.9,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_CARD_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText(ch.num.toUpperCase(), {
      x: ch.x + 0.2,
      y: 1.9,
      w: 3.3,
      h: 0.25,
      fontSize: 10,
      fontFace: "Segoe UI",
      bold: true,
      color: ch.accent,
      letterSpacing: 1,
    });

    slide.addText(ch.title, {
      x: ch.x + 0.2,
      y: 2.15,
      w: 3.3,
      h: 0.45,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: COLOR_PRIMARY_DARK,
    });

    // Issue Box
    slide.addShape(pptx.ShapeType.rect, {
      x: ch.x + 0.2,
      y: 2.65,
      w: 3.3,
      h: 1.1,
      fill: { color: "FEF2F2" },
      rectRadius: 0.05,
    });
    slide.addText(`⚠️ Problem:\n${ch.issue}`, {
      x: ch.x + 0.3,
      y: 2.7,
      w: 3.1,
      h: 1.0,
      fontSize: 9.5,
      fontFace: "Segoe UI",
      color: "991B1B",
      lineSpacing: 14,
    });

    // Solution Box
    slide.addShape(pptx.ShapeType.rect, {
      x: ch.x + 0.2,
      y: 3.85,
      w: 3.3,
      h: 1.4,
      fill: { color: "F0FDF4" },
      rectRadius: 0.05,
    });
    slide.addText(`✅ Solution:\n${ch.solution}`, {
      x: ch.x + 0.3,
      y: 3.9,
      w: 3.1,
      h: 1.3,
      fontSize: 9.5,
      fontFace: "Segoe UI",
      color: "166534",
      lineSpacing: 14,
    });

    // Key Learning
    slide.addText(`💡 Key Takeaway: ${ch.learning}`, {
      x: ch.x + 0.2,
      y: 5.35,
      w: 3.3,
      h: 1.1,
      fontSize: 9.5,
      fontFace: "Segoe UI",
      color: COLOR_TEXT_MUTED,
      lineSpacing: 14,
    });
  });

  slide.addNotes(
    "During development, I encountered several real-world technical challenges that enhanced my problem-solving abilities. One notable issue was MongoDB Atlas DNS SRV resolution timeouts in Node.js. I solved this by explicitly configuring DNS servers with Cloudflare and Google nameservers at the application entry point. Another critical challenge was preventing multi-tenant data leakage. I resolved this by engineering a custom workspace-scoping middleware that automatically verifies tenant permissions and injects workspace filters into database queries. Lastly, handling cross-origin cookie sessions between the Vite frontend and Express backend required precise CORS credential headers and hybrid JWT fallback handling. These challenges provided valuable insights into production-grade systems."
  );
}

// =========================================================================
// SLIDE 11: RESULTS & LEARNING OUTCOMES
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_BG_LIGHT };
  addSlideHeader(
    slide,
    "Impact & Growth",
    "Results, Deliverables & Learning Outcomes",
    "Measurable project achievements and comprehensive skill acquisition"
  );

  // Left Card: Key Achievements
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.7,
    w: 5.7,
    h: 4.9,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });

  slide.addText("🏆 Project Achievements & Deliverables", {
    x: 1.1,
    y: 1.95,
    w: 5.1,
    h: 0.35,
    fontSize: 14,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_ACCENT_BLUE,
  });

  const achievements = [
    { label: "Fully Functional Platform: ", text: "Delivered an end-to-end B2B operations hub unifying workspaces, projects, epics, and tasks." },
    { label: "100% Verified API Endpoints: ", text: "All 11+ REST endpoints tested with automated seed verification scripts." },
    { label: "Robust Security Compliance: ", text: "Implemented multi-tenant isolation, 4-tier RBAC, and protected route guards." },
    { label: "High Performance: ", text: "Achieved sub-100ms API response times on indexed Mongoose queries." },
    { label: "Exceptional Evaluation: ", text: "Awarded Certificate of Excellence from AMSYS Infocom for maximal efficiency and technical competence." },
  ];

  let achY = 2.4;
  achievements.forEach((ach) => {
    slide.addText(
      [
        { text: `✔ ${ach.label}`, options: { bold: true, color: COLOR_PRIMARY_DARK } },
        { text: ach.text, options: { color: COLOR_TEXT_MUTED } },
      ],
      {
        x: 1.1,
        y: achY,
        w: 5.1,
        h: 0.65,
        fontSize: 10.5,
        fontFace: "Segoe UI",
        lineSpacing: 15,
      }
    );
    achY += 0.75;
  });

  // Right Card: Skills Acquired
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 1.7,
    w: 5.7,
    h: 4.9,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_CARD_BORDER, width: 1 },
    rectRadius: 0.1,
  });

  slide.addText("📚 Professional & Technical Growth", {
    x: 7.1,
    y: 1.95,
    w: 5.1,
    h: 0.35,
    fontSize: 14,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_ACCENT_EMERALD,
  });

  const learnings = [
    { label: "Full-Stack MERN Mastery: ", text: "Gained hands-on confidence architecting scalable Node/Express backends and React frontends." },
    { label: "Database Design & Indexing: ", text: "Learned schema normalization, foreign key populations, and performance tuning in MongoDB." },
    { label: "Enterprise Security: ", text: "Mastered JWT stateless tokens, OAuth 2.0 flows, cookie security, and RBAC authorization." },
    { label: "Agile & DevOps Workflows: ", text: "Experienced structured sprint cycles, Git branching strategies, and automated testing." },
    { label: "Professional Demeanor: ", text: "Enhanced technical communication, sprint demo delivery, and collaborative problem-solving." },
  ];

  let lrnY = 2.4;
  learnings.forEach((lrn) => {
    slide.addText(
      [
        { text: `⭐ ${lrn.label}`, options: { bold: true, color: COLOR_PRIMARY_DARK } },
        { text: lrn.text, options: { color: COLOR_TEXT_MUTED } },
      ],
      {
        x: 7.1,
        y: lrnY,
        w: 5.1,
        h: 0.65,
        fontSize: 10.5,
        fontFace: "Segoe UI",
        lineSpacing: 15,
      }
    );
    lrnY += 0.75;
  });

  slide.addNotes(
    "Summarizing the outcomes of this internship: We delivered a fully functioning, high-performance Digital Operation Hub that met all project specifications within our 4-week timeline. The project earned an official Internship Certificate and high commendation from Program Manager Saurabh Shukla for efficiency and technical execution. On a personal level, this internship significantly accelerated my engineering capabilities—from advanced Mongoose data modeling and enterprise security to modern React state management and Agile collaboration practices."
  );
}

// =========================================================================
// SLIDE 12: CONCLUSION & FUTURE SCOPE
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_PRIMARY_DARK };

  // Decorative header bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.15,
    fill: { color: COLOR_ACCENT_BLUE },
  });

  // Top Section: Summary
  slide.addText("CONCLUSION & ROADMAP", {
    x: 1.0,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 11,
    fontFace: "Segoe UI",
    bold: true,
    color: "38BDF8",
    letterSpacing: 1.5,
  });

  slide.addText("Summary & Future Roadmap", {
    x: 1.0,
    y: 0.9,
    w: 11.0,
    h: 0.5,
    fontSize: 24,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_WHITE,
  });

  // Future Scope Grid (3 Cards)
  const futureItems = [
    {
      title: "Real-Time WebSockets",
      desc: "Implement Socket.io for instant live notifications, collaborative Kanban card dragging, and active user presence indicators.",
      x: 1.0,
    },
    {
      title: "AI Sprint Summarization",
      desc: "Integrate LLM-powered sprint insights to automatically summarize epic progress, identify blockers, and forecast task completion.",
      x: 4.8,
    },
    {
      title: "Mobile App & Integrations",
      desc: "Build a React Native mobile companion app and integrate third-party webhooks (GitHub commits, Slack alerts, Jira sync).",
      x: 8.6,
    },
  ];

  futureItems.forEach((f) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: f.x,
      y: 1.6,
      w: 3.7,
      h: 2.1,
      fill: { color: "1E293B" },
      line: { color: "334155", width: 1 },
      rectRadius: 0.08,
    });

    slide.addText(`🚀 ${f.title}`, {
      x: f.x + 0.2,
      y: 1.8,
      w: 3.3,
      h: 0.35,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: "818CF8",
    });

    slide.addText(f.desc, {
      x: f.x + 0.2,
      y: 2.2,
      w: 3.3,
      h: 1.3,
      fontSize: 10.5,
      fontFace: "Segoe UI",
      color: "CBD5E1",
      lineSpacing: 16,
    });
  });

  // Thank you & Q&A Box
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.0,
    y: 4.0,
    w: 11.3,
    h: 2.5,
    fill: { color: "1E293B" },
    line: { color: "4F46E5", width: 1.5 },
    rectRadius: 0.1,
  });

  slide.addText("THANK YOU!", {
    x: 1.0,
    y: 4.25,
    w: 11.3,
    h: 0.5,
    fontSize: 28,
    fontFace: "Segoe UI",
    bold: true,
    color: COLOR_WHITE,
    align: "center",
  });

  slide.addText("Questions & Discussion Welcome", {
    x: 1.0,
    y: 4.8,
    w: 11.3,
    h: 0.35,
    fontSize: 14,
    fontFace: "Segoe UI",
    color: "38BDF8",
    align: "center",
  });

  slide.addText(
    "Presenter: Aryan Raj (MERN Stack Developer Intern) | AMSYS Infocom Pvt Ltd\nProject: Digital Operation Hub (TeamSync B2B) | Guide: Saurabh Shukla (Program Manager)",
    {
      x: 1.0,
      y: 5.3,
      w: 11.3,
      h: 0.8,
      fontSize: 11,
      fontFace: "Segoe UI",
      color: "94A3B8",
      align: "center",
      lineSpacing: 18,
    }
  );

  slide.addNotes(
    "In conclusion, the internship at AMSYS Infocom has been an invaluable learning experience. We successfully conceived and delivered the Digital Operation Hub, creating a cohesive, secure, and intuitive operations platform. Looking ahead, future enhancements will incorporate Socket.io WebSockets for real-time collaboration, AI-driven sprint forecasting, and mobile application support. I would like to express my sincere gratitude to my mentor Saurabh Shukla, the entire software development team at AMSYS Infocom, and my evaluators and professors for their guidance and support. I am now open to any questions or feedback. Thank you!"
  );
}

// Generate Presentation
const outputPath = path.join(__dirname, "Digital_Operation_Hub_Presentation.pptx");
pptx
  .writeFile({ fileName: outputPath })
  .then((fileName) => {
    console.log(`Presentation successfully created at: ${fileName}`);
  })
  .catch((err) => {
    console.error("Error generating presentation:", err);
    process.exit(1);
  });
