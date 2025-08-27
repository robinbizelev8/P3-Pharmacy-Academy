# P³ Pharmacy Academy - Technology Stack

## Technology Categories

### **Core Framework & Runtime**
| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| Node.js | 20+ | Server runtime | Performance, ecosystem, TypeScript support |
| React | 18 | Frontend library | Modern hooks, concurrent features, large ecosystem |
| TypeScript | Latest | Type safety | Full-stack type safety, better developer experience |
| Express.js | Latest | Web framework | Lightweight, flexible, extensive middleware |

### **Build Tools & Development**
| Technology | Purpose | Benefits |
|------------|---------|----------|
| Vite | Build tool & dev server | Fast HMR, optimized bundling, modern ES modules |
| ESBuild | JavaScript bundler | Extremely fast builds, TypeScript support |
| TSX | TypeScript execution | Development server with hot reload |
| Drizzle Kit | Database tools | Type-safe migrations, schema introspection |

### **Database & ORM**
| Technology | Purpose | Benefits |
|------------|---------|----------|
| PostgreSQL | Primary database | ACID compliance, JSON support, scalability |
| Neon Serverless | Cloud database | Serverless scaling, connection pooling |
| Drizzle ORM | Database toolkit | Type safety, performance, minimal overhead |
| Connect-PG-Simple | Session store | PostgreSQL-backed sessions |

### **AI & Machine Learning**
| Technology | Purpose | Integration |
|------------|---------|-------------|
| OpenAI GPT-4o | Clinical coaching AI | Custom pharmacy education prompts |
| Structured Prompting | AI response format | 3-section coaching (Feedback, Model Answer, Learning Tip) |
| Multi-language AI | Localization | 10 Southeast Asian languages |
| Dynamic Generation | Scenario creation | Real-time clinical case generation |

### **Frontend UI/UX**
| Technology | Purpose | Benefits |
|------------|---------|----------|
| Tailwind CSS | Styling framework | Utility-first, custom design system |
| Shadcn/ui | Component library | Accessible, customizable, Radix UI based |
| Radix UI | Primitive components | WAI-ARIA compliant, unstyled components |
| Lucide React | Icon library | Beautiful, consistent icons |
| Framer Motion | Animations | Smooth, performant animations |

### **State Management & Data Fetching**
| Technology | Purpose | Features |
|------------|---------|----------|
| TanStack Query v5 | Server state | Caching, background updates, optimistic UI |
| React Context | Client state | Simple state sharing between components |
| React Hook Form | Form management | Performance, validation, minimal re-renders |
| Zod | Schema validation | TypeScript-first validation library |

### **Authentication & Security**
| Technology | Purpose | Implementation |
|------------|---------|----------------|
| Replit Auth | User authentication | Integrated OAuth, session management |
| Express Session | Session management | Secure, persistent sessions |
| Environment Variables | Secret management | API keys, database credentials |
| CORS | Cross-origin requests | Secure API access |

### **Development & Quality**
| Technology | Purpose | Benefits |
|------------|---------|----------|
| Git LFS | Large file storage | Efficient handling of images, documents |
| Pre-commit Hooks | Code quality | File size validation, linting |
| TypeScript Strict Mode | Type checking | Catch errors at compile time |
| Hot Module Replacement | Development speed | Instant feedback during development |

### **Healthcare Data Sources**
| Source | Type | Content |
|--------|------|---------|
| MOH Guidelines | Official API | Singapore Ministry of Health clinical guidelines |
| HSA Drug Safety | Data feed | Health Sciences Authority safety updates |
| PSA Standards | Documentation | Pharmaceutical Society standards |
| HealthHub | Educational content | Patient education materials |
| SMJ | Clinical evidence | Singapore Medical Journal articles |

### **Deployment & Infrastructure**
| Technology | Purpose | Features |
|------------|---------|----------|
| Replit Platform | Hosting & deployment | Integrated development environment |
| GitHub | Version control | Source code management, collaboration |
| Automated Deployments | CI/CD | Git-based deployment workflow |
| Environment Management | Configuration | Separate dev/prod configurations |

## Architecture Decisions

### **Why These Technologies?**

1. **TypeScript Everywhere**: Full-stack type safety reduces bugs and improves developer experience
2. **Modern React**: Hooks, concurrent features, and excellent ecosystem
3. **Drizzle ORM**: Type-safe database operations without the complexity of traditional ORMs
4. **TanStack Query**: Sophisticated server state management with caching and optimistic updates
5. **Tailwind CSS**: Rapid UI development with consistent design system
6. **OpenAI GPT-4o**: Latest AI model for high-quality clinical coaching responses

### **Performance Optimizations**

- **Vite**: Fast development builds and optimized production bundles
- **Code Splitting**: Automatic route-based code splitting
- **Database Indexing**: Optimized queries for pharmacy training data
- **Caching**: Intelligent caching with TanStack Query
- **Lazy Loading**: Components and routes loaded on demand

### **Scalability Considerations**

- **Serverless Database**: Neon automatically scales with usage
- **Stateless Backend**: Horizontal scaling capability
- **CDN-Ready**: Static assets optimized for content delivery
- **Modular Architecture**: Easy to extract microservices if needed

### **Security Features**

- **Session-based Auth**: Secure user authentication
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries with Drizzle
- **Environment Isolation**: Secrets management
- **HTTPS**: Encrypted connections