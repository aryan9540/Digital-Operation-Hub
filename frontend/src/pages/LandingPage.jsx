import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Kanban,
  Users,
  CheckCircle2,
  BarChart3,
  Clock,
  Activity,
  FolderGit2,
  Plus,
  Target,
  MessageSquare,
  Lock,
  ChevronRight,
  Zap,
  Globe,
  Star
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* =========================================================================
          1. NAVBAR
          ========================================================================= */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                TeamSync <span style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', fontWeight: 700, marginLeft: '4px' }}>B2B</span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
            <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
              Features
            </a>
            <a href="#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
              How It Works
            </a>
            <a href="#collaboration" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
              Collaboration
            </a>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/login"
              className="btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                border: '1px solid var(--border-main)',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary"
              style={{
                padding: '8px 18px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 100px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.18), transparent)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              marginBottom: '24px',
            }}
          >
            <Sparkles size={14} color="#818cf8" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.02em' }}>
              Next-Gen Enterprise Project Workspace
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}
          >
            Collaborate. Manage.{' '}
            <span
              style={{
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Deliver.
            </span>
          </h1>

          {/* Supporting Text */}
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: '0 auto 36px',
            }}
          >
            TeamSync B2B unites your company’s isolated workspaces, projects, sprint tasks,
            and cross-functional team members in one seamless, high-performance platform.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              marginBottom: '60px',
            }}
          >
            <Link
              to="/register"
              className="btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: '14.5px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              }}
            >
              <span>Get Started Free</span>
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/login"
              className="btn-secondary"
              style={{
                padding: '12px 24px',
                fontSize: '14.5px',
                fontWeight: 600,
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup: Authentic TeamSync Dashboard Preview */}
        <div style={{ maxWidth: '1140px', margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-15px',
              background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.05) 100%)',
              filter: 'blur(32px)',
              zIndex: 0,
              borderRadius: '24px',
            }}
          />

          <div
            className="glass-panel"
            style={{
              position: 'relative',
              zIndex: 1,
              borderRadius: '16px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              backgroundColor: '#0e1526',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)',
              overflow: 'hidden',
              textAlign: 'left',
            }}
          >
            {/* Mockup Window Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: '#090d16',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: '12px', fontFamily: 'monospace' }}>
                  teamsync.app / workspace / sigmaxdo
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  ● Live Sync
                </span>
              </div>
            </div>

            {/* Mockup Board Grid */}
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {/* Column 1: To Do */}
              <div style={{ background: '#090d16', borderRadius: '10px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>To Do</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: '#1e293b', padding: '1px 6px', borderRadius: '10px' }}>2</span>
                </div>
                <div style={{ background: '#131b2c', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-main)', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--primary)' }}>SIGMA-101</span>
                    <span style={{ fontSize: '10px', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>Medium</span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 600 }}>Design system authentication revamp</p>
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div style={{ background: '#090d16', borderRadius: '10px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#60a5fa' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>In Progress</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: '#1e293b', padding: '1px 6px', borderRadius: '10px' }}>1</span>
                </div>
                <div style={{ background: '#131b2c', borderRadius: '8px', padding: '12px', border: '1px solid rgba(99, 102, 241, 0.35)', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--primary)' }}>SIGMA-102</span>
                    <span style={{ fontSize: '10px', color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>High</span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 600 }}>Interactive Kanban drag & drop lanes</p>
                </div>
              </div>

              {/* Column 3: In Review */}
              <div style={{ background: '#090d16', borderRadius: '10px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c084fc' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>In Review</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: '#1e293b', padding: '1px 6px', borderRadius: '10px' }}>1</span>
                </div>
                <div style={{ background: '#131b2c', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--primary)' }}>SIGMA-103</span>
                    <span style={{ fontSize: '10px', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>Low</span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 600 }}>Role-based member invitations flow</p>
                </div>
              </div>

              {/* Column 4: Completed */}
              <div style={{ background: '#090d16', borderRadius: '10px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Completed</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: '#1e293b', padding: '1px 6px', borderRadius: '10px' }}>3</span>
                </div>
                <div style={{ background: '#131b2c', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-main)', opacity: 0.85 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>SIGMA-099</span>
                    <CheckCircle2 size={13} color="#34d399" />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 500, textDecoration: 'line-through', color: 'var(--text-muted)' }}>Multi-tenant workspace isolation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURES SECTION (Only Authentic Implemented Features)
          ========================================================================= */}
      <section
        id="features"
        style={{
          padding: '100px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Built for Modern Teams
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '8px', marginBottom: '14px' }}>
            Everything You Need to Ship Faster
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Robust enterprise-grade tools designed to simplify your sprint cycles, project tracking, and member administration.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Feature 1 */}
          <div
            className="card hover-card"
            style={{
              padding: '28px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Multi-Tenant Workspaces</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Create isolated company workspaces. Keep organizations, projects, and permissions cleanly separated while switching effortlessly.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className="card hover-card"
            style={{
              padding: '28px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <FolderGit2 size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Project & Epic Management</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Organize company initiatives with unique project keys, target milestones, epic roadmaps, and real-time completion tracking.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className="card hover-card"
            style={{
              padding: '28px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
              <Kanban size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Drag-and-Drop Kanban Board</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Move tasks smoothly across To Do, In Progress, In Review, and Completed stages with instant visual feedback and priority controls.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            className="card hover-card"
            style={{
              padding: '28px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Granular Roles & Permissions</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Assign Owner, Admin, Member, or Viewer roles. Send email invites or instant links, and manage permissions from a central team hub.
            </p>
          </div>

          {/* Feature 5 */}
          <div
            className="card hover-card"
            style={{
              padding: '28px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Audit Logs & Activity Stream</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Maintain complete transparency with chronological activity tracking for task transitions, project edits, and team member actions.
            </p>
          </div>

          {/* Feature 6 */}
          <div
            className="card hover-card"
            style={{
              padding: '28px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
              <BarChart3 size={22} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Metrics & Performance Analytics</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Gain instant visibility into sprint status distribution, workload balancing, velocity, and completion rates across all projects.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS SECTION
          ========================================================================= */}
      <section
        id="how-it-works"
        style={{
          padding: '100px 24px',
          backgroundColor: '#0c1220',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Streamlined Process
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '8px', marginBottom: '14px' }}>
              How TeamSync Works in 4 Steps
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              From initial company onboarding to final project delivery, experience a frictionless workflow.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {/* Step 1 */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid var(--border-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>01</div>
              <h4 style={{ fontSize: '17px', fontWeight: 700 }}>Create Workspace</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Launch a dedicated company or team workspace with custom descriptions and settings.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid var(--border-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>02</div>
              <h4 style={{ fontSize: '17px', fontWeight: 700 }}>Create Projects & Epics</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Define deliverables, assign project keys, set target schedules, and group goals under epics.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid var(--border-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>03</div>
              <h4 style={{ fontSize: '17px', fontWeight: 700 }}>Assign & Manage Tasks</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Delegate work to teammates, attach due dates, checklists, priority tags, and collaborate via comments.
              </p>
            </div>

            {/* Step 4 */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid var(--border-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>04</div>
              <h4 style={{ fontSize: '17px', fontWeight: 700 }}>Track Progress & Deliver</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Use the Kanban board and live metrics to monitor milestones and ship quality projects on time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. TEAM COLLABORATION SECTION
          ========================================================================= */}
      <section
        id="collaboration"
        style={{
          padding: '100px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
          {/* Left: Content */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Seamless Teamwork
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '8px', marginBottom: '16px' }}>
              Empower Every Role in Your Organization
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              Whether you are an Owner directing company goals, an Admin managing permissions, or an Engineer shipping sprint tasks, TeamSync keeps everyone aligned in real time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', marginTop: '2px' }}>
                  <Shield size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Secure Role Hierarchy</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Fine-tuned permission levels from full workspace ownership to read-only viewing.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', marginTop: '2px' }}>
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>In-Context Task Comments</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Discuss implementation details, tag teammates, and share feedback directly inside task cards.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', marginTop: '2px' }}>
                  <Zap size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Instant Invitation Engine</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Invite members by direct email or 1-click tokenized invite URLs with 1-click acceptance.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual Card */}
          <div
            className="glass-panel"
            style={{
              padding: '28px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={20} color="var(--primary)" />
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Workspace Members</span>
              </div>
              <span style={{ fontSize: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                4 Active
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>AD</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Aditya Kumar</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>adi123@gmail.com</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ec4899', background: 'rgba(236, 72, 153, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>Owner</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>AR</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Aryan Raj</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>arba.127711@gmail.com</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', background: 'rgba(96, 165, 250, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>Admin</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>JD</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>John Doe</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>admin@teamsync.com</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', background: 'rgba(52, 211, 153, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>Developer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CTA SECTION
          ========================================================================= */}
      <section style={{ padding: '80px 24px', maxWidth: '1140px', margin: '0 auto' }}>
        <div
          className="glass-panel"
          style={{
            padding: '56px 32px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(124, 58, 237, 0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35), transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px', position: 'relative' }}>
            Ready to bring your team together?
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 32px', position: 'relative', lineHeight: 1.6 }}>
            Set up your organization's workspace in seconds. Streamline your project pipelines, Kanban boards, and task execution.
          </p>

          <div style={{ position: 'relative', display: 'inline-flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to="/register"
              className="btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: '14.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
              }}
            >
              <span>Get Started Free</span>
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/login"
              className="btn-secondary"
              style={{
                padding: '12px 24px',
                fontSize: '14.5px',
                fontWeight: 600,
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FOOTER
          ========================================================================= */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '48px 24px 32px',
          backgroundColor: '#070a12',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          {/* Logo & Description */}
          <div style={{ maxWidth: '360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'var(--brand-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={16} color="#fff" />
              </div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                TeamSync <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>B2B</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Enterprise-grade workspace management, task tracking, and team collaboration platform.
            </p>
          </div>

          {/* Useful Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#features" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Features
            </a>
            <a href="#how-it-works" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
              How It Works
            </a>
            <Link to="/login" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Sign Up
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '24px auto 0',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-dim)',
          }}
        >
          © {new Date().getFullYear()} TeamSync B2B. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
