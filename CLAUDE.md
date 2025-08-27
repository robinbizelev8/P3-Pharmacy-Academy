# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

P³ Pharmacy Academy is a comprehensive AI-powered pharmacy training platform designed for Singapore's Pre-registration Training pharmacist program. The platform follows a three-stage learning framework: **Prepare**, **Practice**, and **Perform**.

## Development Commands

### Core Development
```bash
# Start development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# TypeScript type checking
npm run check
```

### Database Management
```bash
# Push schema changes to database
npm run db:push
```

### File Size Management
```bash
# Check for large files before committing
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

- **Replit Auth**: OAuth-based authentication system
- **Session Management**: PostgreSQL-backed Express sessions
- **Environment Variables**: Secure API key management
- **Input Validation**: Client and server-side validation with Zod
- **File Security**: Pre-commit hooks prevent large file commits

## Development Environment

### Prerequisites
- Node.js 20+
- PostgreSQL database (DATABASE_URL required)
- OpenAI API key (OPENAI_API_KEY required)

### Path Aliases
- `@/*`: Points to `client/src/*`
- `@shared/*`: Points to `shared/*`
- `@assets/*`: Points to `attached_assets/*`

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

### File Size Validation
Large files are automatically detected by pre-commit hooks. The platform supports Git LFS for necessary large assets.

### Code Standards
- TypeScript strict mode throughout
- Consistent code formatting
- Comprehensive error handling
- Type-safe database operations with Drizzle

## Deployment

### Production Build
```bash
npm run build  # Builds both frontend and backend
npm start      # Serves production build
```

### Environment Configuration
- Development: Uses Vite dev server with HMR
- Production: Serves static files from `dist/public`
- Database: Neon Serverless PostgreSQL with connection pooling

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