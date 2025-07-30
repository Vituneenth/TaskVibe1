# TaskVibe Replit Project Guide

## Overview

TaskVibe is a minimal yet colorful, gamified task management application that helps users organize, prioritize, and stay motivated with their personal and work tasks. The app uses smart patterns and gentle nudges to keep users organized while providing a gamified experience with streaks, achievements, and visual feedback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

TaskVibe follows a full-stack web application architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom theme provider supporting light, dark, and system themes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Neon Database (serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth (OIDC-based) with session management
- **Session Storage**: PostgreSQL with connect-pg-simple

## Key Components

### Database Schema
The application uses a PostgreSQL database with the following core tables:
- **sessions**: Session storage for Replit Auth (required)
- **users**: User profiles with gamification data (level, XP, streak)
- **tasks**: Task management with urgency categorization
- **achievements**: Gamification system for user motivation
- **daily_stats**: Daily tracking for user productivity metrics

### Task Management System
Tasks are organized into three urgency categories:
- **Immediate**: High-priority tasks requiring immediate attention
- **Medium**: Important but less urgent tasks
- **Delayed**: Tasks that can be postponed

Each category has distinct color coding:
- Immediate: Red/warm colors for urgency
- Medium: Yellow/orange for moderate priority
- Delayed: Blue/cool colors for low priority

### Gamification Features
- **XP System**: Users earn experience points for completing tasks
- **Level Progression**: Users advance through levels based on XP
- **Streak Tracking**: Daily completion streaks to maintain motivation
- **Achievement System**: Unlockable badges for various accomplishments
- **Visual Feedback**: Progress bars, statistics, and colorful interfaces

### Authentication & Authorization
- **Replit Auth Integration**: OIDC-based authentication system
- **Session Management**: Secure session handling with PostgreSQL storage
- **User Profile**: Automatic user creation and profile management
- **Onboarding Flow**: First-time user setup with nickname and theme selection

## Data Flow

1. **User Authentication**: Replit Auth handles login/logout with OIDC
2. **Session Management**: Express sessions stored in PostgreSQL
3. **Task Operations**: CRUD operations through REST API endpoints
4. **Real-time Updates**: React Query for automatic cache invalidation
5. **Theme Persistence**: User preferences stored in database and localStorage
6. **Gamification Updates**: Automatic XP, streak, and achievement calculations

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Utilities**: date-fns for date handling, wouter for routing

### Backend Dependencies
- **Database**: Neon Database (PostgreSQL), Drizzle ORM
- **Authentication**: Replit Auth, Passport.js, OpenID Client
- **Session Management**: express-session, connect-pg-simple
- **Validation**: Zod for schema validation
- **Utilities**: memoizee for caching

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Frontend development with HMR
- **Node.js Server**: Backend API development with tsx
- **Database**: Neon Database connection for development
- **Replit Integration**: Built-in development tools and debugging

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Database Migrations**: Drizzle Kit handles schema migrations
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID required

### Key Architectural Decisions

**Monorepo Structure**: Frontend (`client/`), backend (`server/`), and shared code (`shared/`) in single repository for easier development and deployment.

**Drizzle ORM**: Chosen for type-safe database operations and excellent TypeScript integration over traditional ORMs.

**React Query**: Selected for robust server state management, caching, and automatic background updates.

**shadcn/ui**: Provides high-quality, accessible components while maintaining design flexibility.

**Urgency-Based Task Organization**: Three-tier system (immediate/medium/delayed) provides simple yet effective task prioritization.

**Gamification Integration**: XP, levels, streaks, and achievements built into core task completion flow to maintain user engagement.

**Theme System**: Comprehensive light/dark/system theme support with CSS custom properties for consistent styling.

**Replit Auth**: Leverages platform authentication for seamless user onboarding without custom auth implementation.