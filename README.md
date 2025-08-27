# P³ Pharmacy Academy

**Empowering confident, competent pharmacists through AI-guided training that reduces burnout and builds clinical excellence for Singapore's healthcare future.**

A comprehensive AI-powered pharmacy training platform designed specifically for Singapore's Pre-registration Training pharmacist program. The platform follows a three-stage learning framework: **Prepare**, **Practice**, and **Perform**.

## 🎯 Overview

P³ Pharmacy Academy supports Pre-registration Training pharmacists in managing acute and chronic conditions through:

- **AI-powered clinical coaching** with real-time feedback
- **Dynamic case generation** tailored to therapeutic areas and practice settings
- **Multi-language support** for Singapore's diverse healthcare environment (10 Southeast Asian languages)
- **Comprehensive competency assessment** aligned with Singapore's pharmacy standards
- **Portfolio development** for professional progression

## 🛠️ Built With

### **Frontend Technologies**
- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for robust development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Shadcn/ui** - Accessible component library built on Radix UI primitives
- **Wouter** - Lightweight client-side routing (7KB alternative to React Router)
- **TanStack Query v5** - Powerful data synchronization and server state management
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

### **Backend Technologies**
- **Node.js 20+** - JavaScript runtime for server-side development
- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Full-stack type safety
- **Drizzle ORM** - Type-safe SQL toolkit with PostgreSQL dialect
- **Express Session** - Session middleware with PostgreSQL store
- **Connect-PG-Simple** - PostgreSQL session store for Express

### **Database & Storage**
- **PostgreSQL** - Primary relational database
- **Neon Serverless** - Cloud PostgreSQL with connection pooling
- **Database Schema** - Comprehensive pharmacy training data model
- **Drizzle Kit** - Database migrations and introspection

### **AI & Machine Learning**
- **OpenAI GPT-4o** - Latest language model for clinical coaching
- **Custom AI Prompting** - Specialized pharmacy education prompts
- **Multi-language Support** - 10 Southeast Asian languages
- **Dynamic Scenario Generation** - Real-time clinical case creation
- **Structured AI Responses** - 3-section coaching format (Feedback, Model Answer, Learning Tip)

### **Authentication & Security**
- **Replit Auth** - Integrated authentication system
- **Session Management** - Secure user sessions with PostgreSQL storage
- **Environment Variables** - Secure API key management
- **Role-based Access** - User/admin permission system

### **Development & Build Tools**
- **ESBuild** - Fast JavaScript bundler
- **TSX** - TypeScript execution for development
- **Git LFS** - Large file storage for assets
- **Pre-commit Hooks** - File size validation scripts
- **Hot Module Replacement** - Fast development iteration

### **UI/UX Libraries**
- **Lucide React** - Beautiful, customizable icons
- **React Icons** - Popular icon library with company logos
- **Framer Motion** - Production-ready motion library
- **Class Variance Authority** - Type-safe component variants
- **CLSX** - Conditional className utility
- **Tailwind Merge** - Merge Tailwind classes without conflicts

### **Form & Validation**
- **React Hook Form** - Performant forms with minimal re-renders
- **@hookform/resolvers** - Zod integration for form validation
- **Drizzle-Zod** - Generate Zod schemas from Drizzle tables
- **Input Validation** - Real-time client and server-side validation

### **Data Fetching & State**
- **TanStack Query** - Server state management with caching
- **React Context** - Client-side state management
- **Optimistic Updates** - Instant UI feedback
- **Background Refetching** - Keep data fresh automatically

### **Styling & Design**
- **Custom Design System** - Consistent theming with CSS variables
- **Dark Mode Support** - Theme switching capabilities
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG compliant components via Radix UI

### **Healthcare Integration APIs**
- **MOH Guidelines API** - Singapore Ministry of Health resources (https://hpp.moh.gov.sg/guidelines)
- **HSA Drug Safety** - Health Sciences Authority updates (https://www.hsa.gov.sg/adverse-events)
- **SPC Standards** - Singapore Pharmacy Council guidelines (https://www.spc.gov.sg/)
- **PSS Resources** - Pharmaceutical Society of Singapore (https://pss.org.sg/)
- **HealthHub Resources** - Patient education materials (https://www.healthhub.sg/live-healthy)
- **SMJ Clinical Evidence** - Singapore Medical Journal (https://www.smj.org.sg/)

### **Deployment & Infrastructure**
- **Replit Hosting** - Cloud development and hosting platform
- **Environment Management** - Development/production configurations
- **Automated Deployments** - Git-based deployment workflow
- **SSL/TLS** - Secure HTTPS connections

### **Monitoring & Analytics**
- **Performance Tracking** - User interaction analytics
- **Error Handling** - Comprehensive error boundaries
- **Logging** - Structured application logging
- **Health Checks** - System monitoring endpoints

## 🏗️ Architecture Overview

### **Modern Full-Stack Architecture**
- **Frontend**: React SPA with TypeScript and modern tooling
- **Backend**: RESTful API with Express.js and PostgreSQL
- **AI Integration**: OpenAI GPT-4o for intelligent coaching
- **Authentication**: Secure session-based auth with Replit Auth
- **Data Layer**: Type-safe ORM with automatic migrations

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- OpenAI API key

### Environment Variables
```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
```

### Installation
```bash
npm install
npm run dev
```

### Database Setup
```bash
npm run db:push
```

### Git LFS Setup (for large files)
If you need to store large files (PDFs, videos, etc.):
```bash
# Install Git LFS
git lfs install

# Track large file types
git lfs track "*.pdf"
git lfs track "*.mp4"

# Check file size before committing
./scripts/check-file-sizes.sh
```

## 📚 Module Structure

### 🔵 Prepare - Foundation Building
- Therapeutic area selection (7 core areas)
- Competency self-assessment (PA1-PA4)
- Evidence-based learning resources
- AI-powered coaching with 3-section format

### 🟢 Practice - Clinical Simulation
- Dynamic scenario generation
- 4-stage patient interactions
- Real-time AI coaching
- Authentic patient dialogue simulation

### 🟣 Perform - Competency Assessment
- Standardized evaluation
- Portfolio documentation
- Supervision level tracking
- Performance analytics

## 🏥 Therapeutic Areas

1. **Cardiovascular** - Hypertension, heart failure, arrhythmias
2. **Gastrointestinal** - GERD, IBD, hepatic conditions
3. **Renal** - CKD, electrolyte disorders, nephrology
4. **Endocrine** - Diabetes, thyroid, hormonal disorders
5. **Respiratory** - Asthma, COPD, respiratory infections
6. **Dermatological** - Skin conditions, wound care
7. **Neurological** - Epilepsy, pain management, CNS disorders

## 🌏 Multi-Language Support

Supports 10 Southeast Asian languages:
- English
- Bahasa Malaysia
- Bahasa Indonesia
- Thai
- Vietnamese
- Filipino
- Myanmar
- Khmer
- Lao
- Chinese (Singapore)

## 🔐 Singapore Healthcare Integration

- **MOH Guidelines** compliance
- **HSA Drug Safety** updates
- **PSA Standards** alignment
- **HealthHub** patient resources
- **SMJ** clinical evidence

## 🛠️ Development

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared schemas and types
├── attached_assets/ # Static assets and images
```

### Key Technologies
- **Database**: Drizzle ORM with PostgreSQL
- **AI Services**: OpenAI GPT-4o
- **UI Framework**: Radix UI primitives
- **Styling**: Tailwind CSS with design system
- **State Management**: TanStack Query

## 📈 Recent Updates

- Enhanced loading indicators for assessment processes
- Improved AI coaching format consistency across modules
- Fixed page scrolling behavior in scenario loads
- Comprehensive visual design improvements
- Standardized iconography and navigation

## 🎓 Educational Framework

Built specifically for Singapore's **Pre-registration Training** program:
- 30-week rotation support
- Competency progression tracking (Level 2-3 to Level 4-5)
- Portfolio compilation automation
- Evidence-based clinical decision making
- Cultural sensitivity for Singapore's multicultural healthcare environment

---

**Developed for Singapore's pharmacy education excellence** 🇸🇬