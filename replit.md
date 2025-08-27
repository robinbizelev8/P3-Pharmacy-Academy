# P³ Pharmacy Academy

## Overview
P³ Pharmacy Academy is a comprehensive pharmacy training platform for Pre-registration Training pharmacists in Singapore, focusing on acute and chronic conditions. It utilizes a three-stage learning framework (Prepare, Practice, Perform) and offers AI-powered clinical coaching with real-time feedback, text-based interactions, and evaluation aligned with Singapore's pharmacy competency standards. The system features fully dynamic case generation across 7 core therapeutic areas, creating personalized clinical scenarios. The platform also supports 10 Southeast Asian languages for multi-language clinical interactions, aiming to reduce pharmacist burnout and stress during Pre-registration Training.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React 18 and TypeScript, using Vite for development. UI components are built with Shadcn/ui (based on Radix UI primitives) and styled with Tailwind CSS, utilizing a custom design system for theming. Wouter is used for client-side routing. State management uses React Context for session state and TanStack Query for server state. Form handling is managed by React Hook Form with Zod validation. The design emphasizes a professional aesthetic with consistent branding, color palette, and typography, focusing on progressive disclosure, accessibility, and high contrast for readability.

### Backend Architecture
The server runs on Node.js with Express.js, using TypeScript and ES modules. It follows RESTful design principles with structured error handling. The backend integrates with Vite for SSR and HMR. Session management tracks multi-stage training progress with auto-save. AI integration leverages OpenAI GPT-4o for intelligent clinical coaching and dynamic case scenario generation tailored to selected therapeutic areas and practice settings. AI coaching provides structured feedback (Feedback, Model Answer, Learning Tip). The platform prioritizes medical accuracy by sourcing authentic clinical resources from verified Singapore healthcare authorities and supports multi-language AI interactions via Sealion.

### Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe operations, deployed with Neon serverless for connection pooling. The schema includes users, competency assessments, learning resources, progress tracking, pharmacy scenarios, sessions, and messages. It supports comprehensive competency analytics and portfolio development tracking.

### Authentication & Session Management
User authentication is handled via Replit Auth, with session storage in PostgreSQL using connect-pg-simple. The system supports role-based access control.

### Clinical Content & Portfolio Management
The platform supports dynamic clinical scenario generation with evidence-based content. Portfolio development functionality automatically compiles required documentation for Singapore's Pre-registration Training program compliance.

## External Dependencies

### Core Infrastructure
- @neondatabase/serverless: PostgreSQL connection management
- drizzle-orm: Type-safe ORM
- @tanstack/react-query: Server state management

### AI Services
- @anthropic-ai/sdk: Integration with Claude AI (Note: The original text also mentions OpenAI GPT-4o for AI integration, but lists Anthropic SDK here. Please verify which AI service is primarily used, as both are mentioned for AI functionality.)

### UI Framework
- @radix-ui/*: Accessible UI primitives
- tailwindcss: Utility-first CSS framework
- class-variance-authority: Type-safe component variants
- clsx: Conditional className utility

### Development & Build
- vite: Build tool and development server
- typescript: Type safety
- wouter: Client-side routing
- react-hook-form: Form management
- zod: Runtime type validation

### Session & Storage
- connect-pg-simple: PostgreSQL session store
- express-session: Session middleware