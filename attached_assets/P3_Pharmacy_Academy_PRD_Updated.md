# P³ Pharmacy Academy - Product Requirements Document (Updated)

## Executive Summary

P³ Pharmacy Academy is a comprehensive, AI-powered pharmacy training platform specifically designed for Singapore's Pre-registration Training pharmacist program. The platform transforms traditional pharmacy education through a three-stage framework: **Prepare**, **Practice**, and **Perform**, targeting the critical 30-week rotation period where graduates develop competency in managing acute and chronic conditions.

### Target Audience
- **Primary**: Pre-registration Training pharmacists in Singapore (pharmacy graduates in their supervised practice year)
- **Secondary**: Pharmacy supervisors and training coordinators
- **Tertiary**: Healthcare institutions managing pre-registration programs

## Problem Statement

Singapore's pharmacy graduates face significant challenges transitioning from academic knowledge to clinical practice:
- **Competency Gap**: Difficulty bridging theoretical knowledge with real-world patient care
- **Assessment Inconsistency**: Lack of standardized competency evaluation across different practice settings
- **Portfolio Documentation**: Complex requirements for evidencing 14 prescription counseling records across therapeutic areas
- **Supervision Variability**: Inconsistent guidance quality across different preceptors and institutions
- **Language Barriers**: Need for multilingual support in Singapore's diverse healthcare environment

## Solution Overview

### Core Value Proposition
An integrated learning ecosystem that provides:
1. **Objective Competency Assessment**: Standardized evaluation aligned with Singapore pharmacy standards
2. **Personalized Learning Pathways**: AI-driven content curation based on individual competency gaps
3. **Realistic Clinical Simulation**: Text-based patient scenarios with real-time AI coaching
4. **Portfolio Automation**: Automated documentation and evidence compilation
5. **Multilingual Support**: 10 Southeast Asian languages via Sealion integration

### Three-Module Framework

#### Module 1: Prepare - Foundation Building
**Duration**: Self-paced, 2-3 hours per therapeutic area  
**Objective**: Establish clinical knowledge foundation and identify competency gaps

**Key Features**:
- Therapeutic area selection (7 core areas: Cardiovascular, GI, Renal, Endocrine, Respiratory, Dermatological, Neurological)
- Practice setting configuration (Hospital vs Community)
- PA1-PA4 competency self-assessment
- Evidence-based learning resource curation
- Personalized learning objective setting

#### Module 2: Practice - Clinical Scenarios
**Duration**: 45-60 minutes per scenario  
**Objective**: Apply knowledge through realistic patient case management

**Key Features**:
- Dynamic case generation powered by Anthropic Claude
- Progressive complexity (Supervision Level 2-3 to 4-5)
- Multi-stage interactions (History → Assessment → Planning → Counseling)
- Real-time clinical coaching
- SOAP documentation
- Prescription analysis with drug interaction detection

#### Module 3: Perform - Assessment & Portfolio
**Duration**: 90-120 minutes per session  
**Objective**: Demonstrate mastery and compile professional portfolio

**Key Features**:
- Standardized competency assessment
- Automated portfolio compilation
- Supervision level progression tracking
- Performance analytics
- Career progression planning

## Technical Implementation

### System Architecture

#### Frontend Stack
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized production builds
- **Shadcn/ui** components built on Radix UI primitives for accessibility
- **Tailwind CSS** with custom design system and CSS variables
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and intelligent caching
- **React Hook Form** with Zod validation for type-safe forms

#### Backend Infrastructure
- **Node.js** with Express.js and TypeScript for API development
- **PostgreSQL** with Neon serverless for scalable data storage
- **Drizzle ORM** for type-safe database operations
- **Anthropic Claude** (claude-sonnet-4-20250514) for AI-powered coaching
- **Express session management** with PostgreSQL storage
- **RESTful API design** with structured error handling

#### Database Schema
**Core Entities**:
```sql
-- User management with Replit Auth integration
users (id, email, first_name, last_name, role, created_at, updated_at)

-- Module 1: Prepare
competency_assessments (id, user_id, professional_activity, therapeutic_area, 
                       practice_area, current_level, target_level, competency_score, 
                       knowledge_gaps, learning_objectives, completed_at)

learning_resources (id, title, description, resource_type, therapeutic_area, 
                   practice_area, professional_activity, content, difficulty_level, 
                   estimated_duration, is_active)

learning_progress (user_id, resource_id, assessment_id, progress_status, 
                  time_spent, completion_percentage, notes, last_accessed_at)

-- Module 2 & 3: Practice & Perform
pharmacy_scenarios (id, title, module, therapeutic_area, practice_area, case_type,
                   professional_activity, supervision_level, patient_background,
                   clinical_presentation, medication_history, assessment_objectives)

pharmacy_sessions (id, user_id, scenario_id, module, status, current_stage,
                  therapeutic_area, practice_area, session_language, 
                  soap_documentation, prescription_counseling_record,
                  pharmaceutical_care_plan, performance_scores)

pharmacy_messages (id, session_id, message_type, content, message_category,
                  stage_number, timestamp)
```

#### AI Integration Architecture
- **Claude Sonnet**: Primary AI engine for clinical coaching and scenario generation
- **Sealion Integration**: Multi-language support for Southeast Asian languages
- **Dynamic Question Generation**: Real-time creation of therapeutic area-specific scenarios
- **Intelligent Feedback**: STAR-based evaluation with clinical reasoning assessment

### API Endpoints

#### Module 1: Prepare Routes
```typescript
// Competency Assessment
POST   /api/pharmacy/assessments          // Create new assessment
GET    /api/pharmacy/assessments          // Get user assessments
GET    /api/pharmacy/assessments/:id      // Get assessment with progress
PATCH  /api/pharmacy/assessments/:id      // Update assessment

// Learning Resources
GET    /api/pharmacy/resources            // Get filtered resources
POST   /api/pharmacy/progress             // Update learning progress
GET    /api/pharmacy/progress             // Get user progress

// Training Sessions (Modules 2 & 3)
POST   /api/pharmacy/sessions             // Create training session
GET    /api/pharmacy/sessions             // Get user sessions
GET    /api/pharmacy/sessions/:id         // Get session with scenario
PATCH  /api/pharmacy/sessions/:id         // Update session
POST   /api/pharmacy/sessions/:id/messages // Add session message
POST   /api/pharmacy/sessions/:id/ai-response // Generate AI feedback
```

#### Configuration & Constants
```typescript
GET    /api/pharmacy/constants            // Get system constants
// Returns: therapeuticAreas, practiceAreas, professionalActivities, 
//          modules, supervisionLevels
```

### Data Flow Architecture

#### Module 1: Prepare Flow
1. **Assessment Creation**: User selects therapeutic area + practice setting
2. **Competency Evaluation**: AI-powered gap analysis across PA1-PA4
3. **Resource Curation**: Dynamic content filtering based on gaps
4. **Progress Tracking**: Real-time learning analytics and completion monitoring
5. **Objective Setting**: Personalized SMART goals aligned with supervision levels

#### Modules 2 & 3: Practice & Perform Flow
1. **Session Initialization**: Dynamic scenario generation based on Module 1 data
2. **Interactive Simulation**: Text-based patient interactions with AI coaching
3. **Real-time Assessment**: Continuous evaluation of clinical reasoning
4. **Documentation**: Automated SOAP notes and counseling record generation
5. **Portfolio Compilation**: Evidence collection for professional development

## User Experience Design

### Design Philosophy
- **Professional Medical Interface**: Clean, clinical aesthetic appropriate for healthcare
- **Progressive Disclosure**: Information revealed as needed to avoid cognitive overload
- **Accessibility First**: WCAG 2.1 AA compliance with screen reader support
- **Multilingual Ready**: Seamless language switching without layout disruption
- **Mobile Responsive**: Optimized for tablets and mobile devices used in clinical settings

### Navigation Structure
- **Logo-only Navigation**: Minimalist header with P³ branding
- **Module-based Routing**: Clear separation between Prepare/Practice/Perform
- **Progress Indicators**: Visual feedback on completion status across modules
- **Quick Access**: Bookmarked resources and recent activities dashboard

## Success Metrics & KPIs

### Learning Effectiveness
- **Competency Progression**: Average improvement from baseline to target supervision levels
- **Knowledge Retention**: Performance consistency across multiple therapeutic areas
- **Portfolio Completion**: Percentage of users achieving all 14 required counseling records
- **Time Efficiency**: Reduction in time-to-competency compared to traditional training

### User Engagement
- **Session Completion Rate**: Percentage of started scenarios completed
- **Return Engagement**: Weekly active users and session frequency
- **Resource Utilization**: Most accessed learning materials and completion rates
- **AI Interaction Quality**: User satisfaction with AI coaching feedback

### System Performance
- **Response Time**: <2s for AI-generated coaching responses
- **Uptime**: 99.9% availability during peak training periods
- **Scalability**: Support for 1000+ concurrent training sessions
- **Error Rate**: <0.1% for database operations and AI service calls

## Compliance & Security

### Data Protection
- **PDPA Compliance**: Singapore Personal Data Protection Act adherence
- **Healthcare Data Security**: Encrypted storage and transmission
- **User Consent Management**: Clear opt-in/opt-out mechanisms
- **Data Retention**: Automatic purging of sensitive training data

### Professional Standards
- **Singapore Pharmacy Board Alignment**: Content validated against current practice standards
- **CPE Credit Integration**: Continuing Professional Education hour tracking
- **Audit Trail**: Complete documentation of learning activities for regulatory review

## Implementation Timeline

### Phase 1: Foundation (Complete)
✅ Core database schema and API infrastructure  
✅ Module 1: Prepare frontend and backend implementation  
✅ Basic AI integration with Anthropic Claude  
✅ User authentication and session management  
✅ Learning resource database with sample content  

### Phase 2: Enhancement (In Progress)
🔄 Advanced competency assessment algorithms  
🔄 Comprehensive learning resource library  
🔄 Module 2: Practice scenario engine  
🔄 Real-time AI coaching optimization  

### Phase 3: Scale (Planned)
📋 Module 3: Perform assessment system  
📋 Multilingual support via Sealion  
📋 Portfolio automation features  
📋 Performance analytics dashboard  
📋 Integration with healthcare institutions  

## Risk Mitigation

### Technical Risks
- **AI Service Dependency**: Fallback mechanisms for API failures
- **Database Scalability**: Horizontal scaling strategy for high user loads
- **Content Accuracy**: Expert review process for all clinical content

### Regulatory Risks
- **Standards Compliance**: Regular review with Singapore Pharmacy Board
- **Data Privacy**: Regular security audits and compliance assessments
- **Professional Liability**: Clear disclaimers and supervised learning requirements

## Conclusion

P³ Pharmacy Academy represents a paradigm shift in pharmacy education, leveraging advanced AI technology to provide personalized, evidence-based training that directly addresses the practical challenges faced by pre-registration pharmacists in Singapore. The robust technical implementation ensures scalability, reliability, and measurable learning outcomes that benefit individual pharmacists, supervisors, and the broader healthcare system.

The platform's success lies in its integration of objective assessment, personalized learning, realistic simulation, and automated portfolio development - creating a comprehensive ecosystem that transforms pharmacy education from traditional academic-focused training to competency-based professional development aligned with real-world clinical practice requirements.

---

*Document Version: 2.0*  
*Last Updated: August 18, 2025*  
*Implementation Status: Phase 1 Complete, Phase 2 In Progress*