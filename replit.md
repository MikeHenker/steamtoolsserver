# Steamtools Gaming Platform

## Overview

Steamtools is a full-stack gaming platform for discovering, requesting, and managing game downloads. It's built with a modern tech stack featuring React on the frontend, Express.js on the backend, and PostgreSQL for data persistence. The platform supports user authentication, role-based access control, game management, user requests, ratings/reviews, and social features like comments and favorites.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing instead of React Router
- TanStack Query (React Query) for server state management and API caching

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library built on top of Radix UI
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for managing component variants

**State & Data Management**
- TanStack Query handles all server state, API requests, and caching
- Query invalidation pattern ensures UI stays in sync with backend
- Local storage for JWT token persistence
- React Context for authentication state

**Design Patterns**
- Protected route wrapper component for authentication
- Custom hooks for auth operations (useAuth, useLogin, useRegister)
- API request abstraction with automatic token injection
- Form validation using React Hook Form with Zod schemas

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and routing
- TypeScript for type safety across the stack
- Custom middleware for logging, authentication, and error handling

**Authentication & Authorization**
- JWT-based authentication with bcrypt password hashing
- Role-based access control with three tiers: basic, gameadder, admin
- Token verification middleware protects sensitive routes
- 7-day token expiration with automatic refresh on client

**API Design**
- RESTful API endpoints organized by resource
- Consistent error handling and response formatting
- File upload support via multer middleware (5MB limit)
- Request logging with response time tracking

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver for scalability
- Drizzle ORM for type-safe database queries
- Connection pooling for performance optimization

**Schema Design**
- Users table with roles (basic, gameadder, admin) and profile data
- Games table with verification and featured flags
- Comments with likes and cascading deletes
- Ratings with 1-5 star system and optional reviews
- Favorites for user game collections
- Requests for community-driven game additions
- Threads and messages for discussions
- Announcements for platform-wide notifications

**Data Relationships**
- User-to-games (uploader relationship)
- User-to-comments, ratings, favorites (many-to-many via join tables)
- Game-to-comments, ratings (one-to-many)
- Cascading deletes maintain referential integrity

### External Dependencies

**Core Infrastructure**
- Neon Database (PostgreSQL serverless)
- WebSocket support via 'ws' package for database connections

**Authentication & Security**
- jsonwebtoken for JWT generation and verification
- bcryptjs for password hashing
- Environment variable for JWT secret (SESSION_SECRET)

**File Management**
- multer for multipart form data and file uploads
- File storage in local 'uploads/' directory

**Development Tools**
- Replit-specific plugins for runtime error overlay, cartographer, and dev banner
- tsx for running TypeScript in development
- esbuild for production builds

**UI & Styling**
- Multiple font imports (Architects Daughter, DM Sans, Fira Code, Geist Mono)
- Extensive Radix UI component library
- Tailwind CSS with PostCSS

**Build & Deployment**
- Separate client and server builds
- Client builds to dist/public, server builds to dist
- Static file serving in production mode
- Vite dev server with HMR in development