# Sliding Door Game

## Overview

This is an interactive browser-based game where players must stop a sliding door at precisely the right position to fit it into a house opening. The application features customizable difficulty levels, game modes (classic, timed, limited attempts), and allows users to upload their own house and door images. Built with React, TypeScript, and Express, it uses Canvas API for rendering and Zustand for state management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for UI components
- Vite as the build tool and development server
- TailwindCSS with Radix UI components for styling
- Zustand for global state management with persistence
- HTML Canvas API for game rendering

**Key Design Patterns:**
- Component-based architecture with clear separation of concerns
- Custom hooks for game logic and mobile detection
- Store-based state management using Zustand with middleware (persist, subscribeWithSelector)
- Path aliases (@/ for client, @shared/ for shared code) for clean imports

**Core Components:**
- `SlidingDoorGame`: Main game orchestrator component
- `GameCanvas`: Handles Canvas-based rendering and game physics
- `GameSettings`: Configuration UI for game customization
- UI components from Radix UI for consistent design system

**State Management:**
- `useSlidingDoor`: Game configuration, door physics, stats, and game phases
- `useAudio`: Sound effects and music control with mute functionality
- `useGame`: Game phase transitions (ready → playing → ended)
- Local storage persistence for settings and stats

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- ESM module system throughout
- Vite middleware for development hot reload
- Static file serving for production builds

**Server Structure:**
- Minimal API surface - routes defined in `server/routes.ts`
- Storage abstraction layer with interface-based design (`IStorage`)
- In-memory storage implementation (`MemStorage`) as default
- Request/response logging middleware with truncation
- Error handling middleware with proper status codes

**Build Process:**
- Development: `tsx` for running TypeScript directly
- Production: Vite builds client, esbuild bundles server
- Separate output directories (dist/public for client, dist/ for server)

### Data Storage Solutions

**Database Setup:**
- Drizzle ORM configured for PostgreSQL via Neon serverless
- Schema-first approach with TypeScript types generated from schema
- Migrations stored in `/migrations` directory
- Database URL required via environment variable

**Current Implementation:**
- In-memory storage (`MemStorage`) for development/testing
- Designed for easy swap to database storage via `IStorage` interface
- User schema defined with username/password fields
- Zod schemas for validation (insertUserSchema)

**Storage Interface Pattern:**
- Abstract interface defines CRUD operations
- Memory implementation for prototyping
- Can be replaced with Drizzle-based implementation without changing application code

### Authentication and Authorization

**Current State:**
- User schema exists in database (username, password fields)
- No authentication system currently implemented
- Session infrastructure available (connect-pg-simple for sessions)
- Ready for implementation: basic auth, session-based, or token-based patterns

**Session Management:**
- `connect-pg-simple` package included for PostgreSQL-backed sessions
- Express session configuration not yet implemented
- Credentials: "include" configured in API requests for cookie support

### External Dependencies

**Third-Party Services:**
- Neon Database: Serverless PostgreSQL database hosting
- Replit runtime: Development environment with error overlay plugin

**Frontend Libraries:**
- Radix UI: Comprehensive accessible component primitives
- TanStack Query: Data fetching and caching (configured but minimal usage)
- React Three Fiber/Drei/Postprocessing: 3D rendering capabilities (included but unused in current game)
- Zustand: Lightweight state management
- date-fns: Date manipulation utilities
- cmdk: Command palette component

**Build and Development Tools:**
- Vite with React plugin and GLSL shader support
- PostCSS with TailwindCSS and Autoprefixer
- Drizzle Kit for database migrations
- esbuild for server bundling
- TypeScript with strict mode enabled

**Asset Handling:**
- Support for 3D models (GLTF/GLB)
- Audio files (MP3, OGG, WAV)
- Custom fonts (Inter font family via @fontsource)
- Image uploads for game customization

**API Client Configuration:**
- Custom fetch wrapper with error handling
- Automatic 401 handling with configurable behavior
- JSON content-type management
- Cookie-based credentials for authentication readiness