# P³ Pharmacy Academy - System Architecture (Mermaid)

## High-Level Architecture Overview

```mermaid
graph TB
    %% User Layer
    subgraph Users ["👥 User Layer"]
        Student[👨‍🎓 Students]
        Supervisor[👨‍⚕️ Supervisors]
        Admin[👨‍💼 Admin]
    end
    
    %% Frontend Layer
    subgraph Frontend ["🖥️ Frontend Layer (React 18 + TypeScript)"]
        subgraph UI ["UI Components"]
            Shadcn[Shadcn/ui + Radix]
            Tailwind[Tailwind CSS]
            Design[Custom Design System]
        end
        
        subgraph State ["State Management"]
            Context[React Context]
            TanStack[TanStack Query]
            Session[Session State]
        end
        
        subgraph Routing ["Routing & Forms"]
            Wouter[Wouter Router]
            RHF[React Hook Form]
            Zod[Zod Validation]
        end
        
        subgraph Build ["Build Tools"]
            Vite[Vite + HMR]
            TS[TypeScript]
            PWA[PWA Ready]
        end
    end
    
    %% Backend Layer
    subgraph Backend ["⚙️ Backend Layer (Node.js + Express.js)"]
        subgraph API ["RESTful API"]
            Express[Express.js + TS]
            JWT[JWT Auth]
            RBAC[Role-based Access]
            ErrorHandling[Structured Errors]
        end
        
        subgraph Services ["Core Services"]
            CompetencyEngine[Competency Assessment]
            ProgressTracking[Progress Tracking]
            Portfolio[Portfolio Development]
            ScenarioGen[Clinical Scenarios]
            MultiStage[Multi-stage Training]
        end
        
        subgraph Auth ["Authentication & Session"]
            ReplitAuth[Replit Auth]
            SessionStore[PostgreSQL Sessions]
            AutoSave[Auto-save Progress]
        end
    end
    
    %% Database Layer
    subgraph Database ["🗄️ Database Layer"]
        subgraph PostgreSQL ["PostgreSQL + Neon"]
            Users[Users & Roles]
            Assessments[Competency Assessments]
            Resources[Learning Resources]
            Progress[Progress Tracking]
            Sessions[Sessions & Messages]
        end
        
        subgraph ORM ["Drizzle ORM"]
            TypeSafe[Type-safe Operations]
            Schema[Schema Validation]
            Migrations[Migration Management]
            Analytics[Competency Analytics]
        end
    end
    
    %% AI Services Layer
    subgraph AI ["🤖 AI & External Services"]
        subgraph OpenAI ["OpenAI GPT-4o"]
            ClinicalCoaching[Clinical Coaching]
            DynamicCases[Dynamic Case Generation]
            RealtimeFeedback[Real-time Feedback]
            TherapeuticAreas[7 Therapeutic Areas]
        end
        
        subgraph Claude ["Claude AI + Sealion"]
            MultiLang[Multi-language Support]
            SEALang[10 SEA Languages]
            StructuredFeedback[Structured Feedback]
            ModelAnswers[Model Answers]
            LearningTips[Learning Tips]
        end
    end
    
    %% External Resources
    subgraph External ["🏥 Singapore Healthcare Resources"]
        MOH[MOH Clinical Guidelines]
        HSA[HSA Drug Information]
        SPC[SPC Requirements]
        Standards[Competency Standards]
        Evidence[Evidence-based Content]
    end
    
    %% Connections
    Users --> Frontend
    Frontend --> Backend
    Backend --> Database
    Backend --> AI
    Backend --> External
    
    %% Styling
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef frontendClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef backendClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef databaseClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef aiClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef externalClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class Users userClass
    class Frontend frontendClass
    class Backend backendClass
    class Database databaseClass
    class AI aiClass
    class External externalClass
```

## Detailed Data Flow Architecture

```mermaid
flowchart TD
    %% User Interactions
    subgraph UserFlow ["User Interaction Flow"]
        A[User Login] --> B{Role Check}
        B -->|Student| C[Student Dashboard]
        B -->|Supervisor| D[Supervisor Dashboard]
        B -->|Admin| E[Admin Dashboard]
        
        C --> F[Select Learning Stage]
        F --> G[Prepare: Study Materials]
        F --> H[Practice: Clinical Scenarios]
        F --> I[Perform: Competency Assessment]
        
        D --> J[Manage Trainees]
        D --> K[Review Progress]
        D --> L[Provide Feedback]
    end
    
    %% Core Learning Flow
    subgraph LearningFlow ["Three-Stage Learning Framework"]
        G --> G1[Knowledge Base Access]
        G --> G2[MOH Guidelines]
        G --> G3[Clinical Resources]
        
        H --> H1[AI-Generated Scenarios]
        H --> H2[Real-time Coaching]
        H --> H3[Interactive Cases]
        
        I --> I1[Competency Evaluation]
        I --> I2[Portfolio Building]
        I --> I3[Progress Analytics]
    end
    
    %% AI Processing Flow
    subgraph AIFlow ["AI Processing Pipeline"]
        H1 --> AI1[OpenAI GPT-4o]
        H2 --> AI2[Claude AI]
        H3 --> AI3[Sealion Multi-lang]
        
        AI1 --> AI4[Clinical Accuracy Check]
        AI2 --> AI5[Structured Feedback]
        AI3 --> AI6[Cultural Context]
        
        AI4 --> Output[Personalized Learning]
        AI5 --> Output
        AI6 --> Output
    end
    
    %% Data Persistence
    subgraph DataFlow ["Data Persistence Flow"]
        Output --> DB1[(User Progress)]
        L --> DB2[(Supervisor Feedback)]
        I2 --> DB3[(Portfolio Data)]
        
        DB1 --> Analytics[Real-time Analytics]
        DB2 --> Analytics
        DB3 --> Analytics
        
        Analytics --> Insights[Learning Insights]
        Insights --> Recommendations[Personalized Recommendations]
    end
```

## Technical Stack Overview

```mermaid
graph LR
    subgraph Frontend ["Frontend Stack"]
        React["React 18"] --> TS1["TypeScript"]
        TS1 --> Vite1["Vite"]
        Vite1 --> Shadcn1["Shadcn/ui"]
        Shadcn1 --> Tailwind1["Tailwind CSS"]
        Tailwind1 --> Wouter1["Wouter"]
        Wouter1 --> TanStack1["TanStack Query"]
    end
    
    subgraph Backend ["Backend Stack"]
        Node["Node.js"] --> Express1["Express.js"]
        Express1 --> TS2["TypeScript"]
        TS2 --> JWT1["JWT Auth"]
        JWT1 --> Drizzle1["Drizzle ORM"]
    end
    
    subgraph Database ["Database Stack"]
        PostgreSQL1["PostgreSQL"] --> Neon["Neon Serverless"]
        Neon --> Sessions1["Session Store"]
    end
    
    subgraph AI ["AI Stack"]
        OpenAI1["OpenAI GPT-4o"] --> Claude1["Claude AI"]
        Claude1 --> Sealion1["Sealion"]
    end
    
    Frontend --> Backend
    Backend --> Database
    Backend --> AI
```

## Deployment & Infrastructure

```mermaid
graph TB
    subgraph Replit ["Replit Platform"]
        subgraph Dev ["Development Environment"]
            DevServer[Vite Dev Server]
            HMR[Hot Module Replacement]
            DevDB[Development Database]
        end
        
        subgraph Prod ["Production Environment"]
            ProdServer[Express Server :5000]
            ProdDB[Neon PostgreSQL]
            JWT[JWT Authentication]
        end
        
        subgraph Services ["Integrated Services"]
            ReplitAuth[Replit Authentication]
            Secrets[Environment Secrets]
            Storage[Session Storage]
        end
    end
    
    subgraph External ["External Integrations"]
        OpenAIAPI[OpenAI API]
        ClaudeAPI[Claude API]
        SGHealthcare[Singapore Healthcare APIs]
        MOHData[MOH Clinical Data]
    end
    
    Dev --> Prod
    Prod --> Services
    Services --> External
```

## Key Features & Capabilities

```mermaid
mindmap
  root((P³ Pharmacy Academy))
    Learning Framework
      Prepare
        Knowledge Base
        Clinical Guidelines
        Study Materials
      Practice
        AI Scenarios
        Real-time Coaching
        Interactive Cases
      Perform
        Competency Assessment
        Portfolio Building
        Progress Analytics
    
    AI Capabilities
      Clinical Coaching
        GPT-4o Integration
        Real-time Feedback
        Medical Accuracy
      Multi-language
        10 SEA Languages
        Cultural Context
        Sealion AI
      Dynamic Content
        7 Therapeutic Areas
        Personalized Scenarios
        Evidence-based
    
    Platform Features
      Authentication
        Role-based Access
        JWT Security
        Session Management
      Progress Tracking
        Real-time Analytics
        Competency Scoring
        Portfolio Development
      Compliance
        Singapore Standards
        MOH Guidelines
        SPC Requirements
```

## Usage Instructions

1. **For Presentations**: Copy any of the Mermaid code blocks above
2. **Online Rendering**: Paste into [Mermaid Live Editor](https://mermaid.live/)
3. **Documentation**: Include in Markdown files for automatic rendering
4. **Integration**: Most platforms (GitHub, GitLab, Notion) support Mermaid natively

Each diagram focuses on different aspects of your architecture:
- **Overview**: High-level system components and relationships
- **Data Flow**: How information moves through your system
- **Tech Stack**: Specific technologies and their connections
- **Deployment**: Infrastructure and hosting setup
- **Features**: Mind map of key capabilities

These diagrams are perfect for technical presentations, documentation, and stakeholder communications!