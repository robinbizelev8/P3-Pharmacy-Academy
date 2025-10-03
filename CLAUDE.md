# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

P³ Pharmacy Academy is a comprehensive AI-powered pharmacy training platform designed for Singapore's Pre-registration Training pharmacist program. The platform follows a three-stage learning framework: **Prepare**, **Practice**, and **Perform**.

## Development Commands

### Core Development
```bash
# Start development server (frontend + backend with HMR)
npm run dev

# Build for production (frontend + backend bundle)
npm run build

# Start production server
npm start

# TypeScript type checking (run before commits)
npm run check
```

### Testing
```bash
# Run tests with Vitest
npm test

# Run tests with UI
npm test:ui

# Run tests once (no watch mode)
npm run test:run
```

### Database Management
```bash
# Push schema changes to database (Drizzle Kit)
npm run db:push

# Database migrations are in ./migrations/
```

### File Size Management
```bash
# Check for large files before committing (pre-commit hook)
./scripts/check-file-sizes.sh
```

## Architecture Overview

### Full-Stack TypeScript Application
- **Frontend**: React 18 with TypeScript, Vite build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with Express sessions
- **AI Integration**: OpenAI GPT-4o for clinical coaching
- **UI Framework**: Tailwind CSS with Shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query v5 for server state

### Project Structure
```
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Route-based page components
│   │   ├── hooks/      # Custom React hooks
│   │   └── lib/        # Utilities and configurations
├── server/          # Express.js backend
│   ├── services/    # AI services (OpenAI, Bedrock, etc.)
│   └── routes.ts    # API route definitions
├── shared/          # Shared TypeScript types and schemas
│   └── schema.ts    # Drizzle database schema
└── attached_assets/ # Static assets and documentation
```

### Key Technologies
- **Database ORM**: Drizzle with PostgreSQL (Neon Serverless)
- **Type Safety**: Zod for runtime validation, TypeScript throughout
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **Form Handling**: React Hook Form with Zod validation
- **Build Tools**: Vite for frontend, ESBuild for backend bundling
- **Testing**: Vitest with React Testing Library and jsdom

## Database Schema

The application uses a comprehensive pharmacy training data model with these core tables:

### User Management
- `users`: User accounts with Replit Auth integration
- `sessions`: Express session storage

### Module 1: Prepare
- `competency_assessments`: Self-assessment for PA1-PA4 competencies
- `learning_resources`: Educational content organized by therapeutic areas
- `learning_progress`: User progress tracking through resources

### Module 2: Practice  
- `pharmacy_scenarios`: Clinical scenarios for training
- `pharmacy_sessions`: Training session records with detailed scoring
- `pharmacy_messages`: Conversation history with AI coaching

### Module 3: Perform
- `perform_assessments`: Comprehensive clinical assessments
- `perform_scenarios`: Individual assessment scenarios
- `perform_portfolios`: Portfolio compilation and documentation
- `perform_analytics`: Performance metrics and benchmarking

### Pharmacy Training Constants
- **Therapeutic Areas**: Cardiovascular, Gastrointestinal, Renal, Endocrine, Respiratory, Dermatological, Neurological
- **Professional Activities**: PA1-PA4 as defined by Singapore Pharmacy Council
- **Supervision Levels**: 1-5 scale from observation to teaching capability
- **Practice Areas**: Hospital and Community settings

## AI Integration

### OpenAI GPT-4o Implementation
- Specialized pharmacy education prompts
- Structured 3-section coaching format (Feedback, Model Answer, Learning Tip)
- Multi-language support for 10 Southeast Asian languages
- Real-time scenario generation and clinical feedback

### AI Services Location
All AI service integrations are in `server/services/`:
- `anthropic.ts`: Claude integration
- `openai.ts`: OpenAI GPT-4o integration
- `bedrock.ts`: AWS Bedrock integration
- `sealion.ts`: SEA-Lion model integration

## Authentication & Security

- **JWT Authentication**: Token-based authentication with HTTP-only cookies
- **Role-Based Access Control**: Multi-tier permissions (student, supervisor, admin)
- **Password Security**: bcrypt hashing with comprehensive validation
- **Session Management**: Persistent sessions with JWT tokens (7-day expiry)
- **Environment Variables**: Secure API key management (JWT_SECRET, DATABASE_URL, OPENAI_API_KEY)
- **Input Validation**: Client and server-side validation with Zod
- **File Security**: Pre-commit hooks prevent large file commits

### Authentication Middleware
- `jwtAuth`: Validates JWT tokens from cookies or headers
- `requireAuth`: Ensures user is authenticated
- `requireRole`: Role-specific access control
- `requireStudent`, `requireSupervisor`, `requireAdmin`: Convenience middleware for specific roles

## Development Environment

### Prerequisites
- Node.js 20+
- PostgreSQL database (DATABASE_URL required)
- OpenAI API key (OPENAI_API_KEY required)
- JWT_SECRET for authentication (auto-generated in development)

### Required Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key
NODE_ENV=development|production
```

### Path Aliases
- `@/*`: Points to `client/src/*` (configured in vite.config.ts and tsconfig.json)
- `@shared/*`: Points to `shared/*` (shared types and schemas)
- `@assets/*`: Points to `attached_assets/*` (static assets)

### Development Features
- Hot Module Replacement with Vite
- TypeScript strict mode enabled
- Automatic reloading for both frontend and backend
- Error boundaries with runtime error overlay

## Singapore Healthcare Integration

The platform integrates with official Singapore healthcare resources:
- **MOH Guidelines**: Ministry of Health clinical guidelines
- **HSA Drug Safety**: Health Sciences Authority updates
- **SPC Standards**: Singapore Pharmacy Council guidelines  
- **PSS Resources**: Pharmaceutical Society of Singapore
- **HealthHub**: Patient education materials
- **SMJ**: Singapore Medical Journal clinical evidence

## Testing and Quality

### Type Checking
Always run TypeScript checks before committing:
```bash
npm run check
```

### Running Tests
```bash
# Run tests in watch mode
npm test

# Run tests with UI dashboard
npm test:ui

# Run tests once (CI mode)
npm run test:run
```

### Test Structure
- Unit tests: Component and utility tests with Vitest
- Test setup: `client/src/test/setup.ts`
- Integration tests: Located in `tests/` directory (various .cjs files)
- E2E tests: Available for core user flows

### File Size Validation
Large files are automatically detected by pre-commit hooks:
- Files >1MB blocked from commits
- Patterns checked: *.pdf, *.docx, *.zip, *.mp4, image_*.png
- Use Git LFS for necessary large assets

### Code Standards
- TypeScript strict mode throughout
- Consistent code formatting
- Comprehensive error handling
- Type-safe database operations with Drizzle
- Zod validation for all user inputs

## Deployment

### Production Build
```bash
npm run build  # Builds both frontend (Vite) and backend (ESBuild)
npm start      # Serves production build
```

### Build Output
- Frontend: Bundled to `dist/public/` (static assets)
- Backend: Bundled to `dist/index.js` (single ESM file)
- Server serves static files from `dist/public` in production

### Environment Configuration
- **Development**: Uses Vite dev server with HMR on port 5000 (default)
- **Production**: Express serves static files from `dist/public`
- **Database**: Neon Serverless PostgreSQL with connection pooling
- **Hosting**: Optimized for Replit deployment

## Module-Specific Features

### Prepare Module
- Therapeutic area selection (7 core areas)
- Competency self-assessment (PA1-PA4)
- Evidence-based learning resources
- Progress tracking and recommendations

### Practice Module  
- Dynamic clinical scenario generation
- 4-stage patient interaction simulation
- Real-time AI coaching with structured feedback
- Multi-language patient dialogue support

### Perform Module
- Comprehensive clinical assessments
- Portfolio compilation and validation
- Performance analytics and benchmarking
- Singapore clinical decision-making framework integration

## Important Development Notes

### Data Storage Layer
- All database operations go through `server/storage.ts`
- Storage interface defined in `IStorage` type
- Use Drizzle ORM for type-safe queries
- Schema changes require `npm run db:push`

### API Routes Structure
- Main routes defined in `server/routes.ts`
- JWT auth routes in `server/auth-routes-jwt.ts`
- Protected routes use middleware: `requireAuth`, `requireRole`, etc.
- All API routes prefixed with `/api/`

### Frontend State Management
- Server state: TanStack Query (see `client/src/lib/queryClient.ts`)
- Auth state: Custom `useAuth` hook (see `client/src/hooks/use-auth.ts`)
- Student data: `useStudentData` hook
- Supervisor data: `useSupervisorData` hook
- Query keys follow pattern: `["/api/endpoint"]`

### AI Services Integration
- OpenAI GPT-4o: Primary AI service in `server/services/openai.ts`
- Alternative models available in `server/services/` (Anthropic, Bedrock, SEA-Lion)
- Coaching format: 3-section structure (Feedback, Model Answer, Learning Tip)
- Multi-language support: 10 Southeast Asian languages

### Common Development Patterns
1. **Adding new API endpoint**: Add to `server/routes.ts` with appropriate auth middleware
2. **Database schema changes**: Modify `shared/schema.ts`, then run `npm run db:push`
3. **New UI component**: Add to `client/src/components/`, use existing Shadcn/ui patterns
4. **New page**: Add to `client/src/pages/`, update routing in `client/src/App.tsx`
5. **Type-safe forms**: Use React Hook Form with Zod schemas from Drizzle

### Debugging Tips
- Backend logs: Console logs appear in terminal running `npm run dev`
- Frontend logs: Check browser console
- Database queries: Enable Drizzle logging in `server/db.ts`
- Auth issues: Check JWT token in cookies/headers (use browser dev tools)