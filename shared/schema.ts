import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
  boolean,
  index,
  uuid,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Supported languages for Southeast Asia
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'ms': 'Bahasa Malaysia',
  'id': 'Bahasa Indonesia', 
  'th': 'ไทย (Thai)',
  'vi': 'Tiếng Việt (Vietnamese)',
  'fil': 'Filipino',
  'my': 'မြန်မာ (Myanmar)',
  'km': 'ខ្មែរ (Khmer)',
  'lo': 'ລາວ (Lao)',
  'zh-sg': '中文 (Chinese - Singapore)'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pharmacy clinical scenarios table for Pre-registration Training
export const pharmacyScenarios = pgTable("pharmacy_scenarios", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(), // prepare, practice, perform
  therapeuticArea: varchar("therapeutic_area", { length: 100 }).notNull(), // cardiovascular, gi, renal, etc.
  practiceArea: varchar("practice_area", { length: 50 }).notNull(), // hospital, community
  caseType: varchar("case_type", { length: 50 }).notNull(), // acute, chronic, complex
  professionalActivity: varchar("professional_activity", { length: 10 }).notNull(), // PA1, PA2, PA3, PA4
  supervisionLevel: integer("supervision_level").notNull(), // 1-5 scale
  patientAge: integer("patient_age"),
  patientGender: varchar("patient_gender", { length: 10 }),
  patientBackground: text("patient_background").notNull(),
  clinicalPresentation: text("clinical_presentation").notNull(),
  medicationHistory: text("medication_history").notNull(),
  assessmentObjectives: text("assessment_objectives").notNull(),
  keyLearningOutcomes: jsonb("key_learning_outcomes"), // array of learning goals
  difficulty: varchar("difficulty", { length: 20 }).default("intermediate"), // foundation, intermediate, advanced
  status: varchar("status", { length: 20 }).default("active"), // active, draft, inactive
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pharmacy training sessions table for Pre-registration Training
export const pharmacySessions = pgTable("pharmacy_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  scenarioId: uuid("scenario_id").notNull().references(() => pharmacyScenarios.id),
  module: varchar("module", { length: 50 }).notNull(), // prepare, practice, perform
  status: varchar("status", { length: 20 }).default("in_progress"), // in_progress, completed, abandoned
  currentStage: integer("current_stage").default(1),
  totalStages: integer("total_stages").default(10),
  // Pre-registration Training specific tracking
  therapeuticArea: varchar("therapeutic_area", { length: 100 }),
  practiceArea: varchar("practice_area", { length: 50 }),
  // Session language preference
  sessionLanguage: varchar("session_language", { length: 10 }).default("en"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in seconds
  
  // Pharmacy-specific scoring
  overallScore: numeric("overall_score", { precision: 3, scale: 2 }),
  clinicalKnowledgeScore: numeric("clinical_knowledge_score", { precision: 3, scale: 2 }),
  therapeuticReasoningScore: numeric("therapeutic_reasoning_score", { precision: 3, scale: 2 }),
  patientCommunicationScore: numeric("patient_communication_score", { precision: 3, scale: 2 }),
  professionalPracticeScore: numeric("professional_practice_score", { precision: 3, scale: 2 }),
  documentationScore: numeric("documentation_score", { precision: 3, scale: 2 }),
  
  // Supervision level assessment (1-5 scale)
  achievedSupervisionLevel: integer("achieved_supervision_level"),
  targetSupervisionLevel: integer("target_supervision_level"),
  
  // Portfolio documentation
  soapDocumentation: text("soap_documentation"), // SOAP format case notes
  prescriptionCounselingRecord: text("prescription_counseling_record"),
  pharmaceuticalCarePlan: text("pharmaceutical_care_plan"),
  
  // AI feedback and assessment
  qualitativeFeedback: text("qualitative_feedback"),
  strengths: jsonb("strengths"), // array of strings
  improvements: jsonb("improvements"), // array of strings
  recommendations: jsonb("recommendations"), // array of strings
  transcript: jsonb("transcript"), // conversation history
  
  autoSavedAt: timestamp("auto_saved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pharmacy session messages table for clinical interactions
export const pharmacyMessages = pgTable("pharmacy_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => pharmacySessions.id, { onDelete: "cascade" }),
  messageType: varchar("message_type", { length: 20 }).notNull(), // ai, user, system
  content: text("content").notNull(),
  stageNumber: integer("stage_number"),
  messageCategory: varchar("message_category", { length: 50 }), // patient_history, clinical_assessment, therapeutic_plan, etc.
  timestamp: timestamp("timestamp").defaultNow(),
  
  // Clinical assessment specific fields
  clinicalRelevance: integer("clinical_relevance"), // 1-5 scale
  therapeuticAccuracy: integer("therapeutic_accuracy"), // 1-5 scale
  communicationQuality: integer("communication_quality"), // 1-5 scale
  professionalismScore: integer("professionalism_score"), // 1-5 scale
  
  feedback: text("feedback"), // real-time clinical feedback
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdScenarios: many(pharmacyScenarios),
  pharmacySessions: many(pharmacySessions),
}));

export const pharmacyScenariosRelations = relations(pharmacyScenarios, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [pharmacyScenarios.createdBy],
    references: [users.id],
  }),
  sessions: many(pharmacySessions),
}));

export const pharmacySessionsRelations = relations(pharmacySessions, ({ one, many }) => ({
  user: one(users, {
    fields: [pharmacySessions.userId],
    references: [users.id],
  }),
  scenario: one(pharmacyScenarios, {
    fields: [pharmacySessions.scenarioId],
    references: [pharmacyScenarios.id],
  }),
  messages: many(pharmacyMessages),
}));

export const pharmacyMessagesRelations = relations(pharmacyMessages, ({ one }) => ({
  session: one(pharmacySessions, {
    fields: [pharmacyMessages.sessionId],
    references: [pharmacySessions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertPharmacyScenarioSchema = createInsertSchema(pharmacyScenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPharmacySessionSchema = createInsertSchema(pharmacySessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPharmacyMessageSchema = createInsertSchema(pharmacyMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPharmacyScenario = z.infer<typeof insertPharmacyScenarioSchema>;
export type PharmacyScenario = typeof pharmacyScenarios.$inferSelect;
export type InsertPharmacySession = z.infer<typeof insertPharmacySessionSchema>;
export type PharmacySession = typeof pharmacySessions.$inferSelect;
export type InsertPharmacyMessage = z.infer<typeof insertPharmacyMessageSchema>;
export type PharmacyMessage = typeof pharmacyMessages.$inferSelect;

// Extended types for API responses
export type PharmacySessionWithScenario = PharmacySession & {
  scenario: PharmacyScenario;
  messages: PharmacyMessage[];
};

export type PharmacyScenarioWithStats = PharmacyScenario & {
  sessionCount: number;
  averageScore: number;
};

// Pre-registration Training specific constants
export const THERAPEUTIC_AREAS = {
  'cardiovascular': 'Cardiovascular',
  'gastrointestinal': 'Gastrointestinal', 
  'renal': 'Renal',
  'endocrine': 'Endocrine',
  'respiratory': 'Respiratory',
  'dermatological': 'Dermatological',
  'neurological': 'Neurological'
} as const;

export const PRACTICE_AREAS = {
  'hospital': 'Hospital',
  'community': 'Community'
} as const;

export const PROFESSIONAL_ACTIVITIES = {
  'PA1': 'Develop and implement a care plan',
  'PA2': 'Accurate supply of health products',
  'PA3': 'Educate patients on appropriate use of health products',
  'PA4': 'Respond to drug information or health product enquiry'
} as const;

export const SUPERVISION_LEVELS = {
  1: 'Observe while trainer performs the activity',
  2: 'Require DIRECT supervision and proactive guidance',
  3: 'Complete with INDIRECT supervision (3a: all findings reviewed, 3b: key findings reviewed, 3c: discuss only on request)',
  4: 'Complete activity without supervision',
  5: 'Able to teach others in completing the activity'
} as const;

// Prepare specific schemas
export const competencyAssessments = pgTable('competency_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  professionalActivity: text('professional_activity').notNull(), // PA1, PA2, PA3, PA4
  therapeuticArea: text('therapeutic_area').notNull(),
  practiceArea: text('practice_area').notNull(), // hospital, community
  currentLevel: integer('current_level').notNull(), // 1-5 supervision levels
  targetLevel: integer('target_level').notNull(),
  competencyScore: integer('competency_score').notNull(), // 0-100
  knowledgeGaps: text('knowledge_gaps').array().notNull().default([]),
  learningObjectives: text('learning_objectives').array().notNull().default([]),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const learningResources = pgTable('learning_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  resourceType: text('resource_type').notNull(), // guideline, monograph, protocol, video, pdf
  therapeuticArea: text('therapeutic_area').notNull(),
  practiceArea: text('practice_area').notNull(),
  professionalActivity: text('professional_activity').notNull(),
  contentUrl: text('content_url'),
  content: text('content'), // For text-based resources
  metadata: jsonb('metadata'), // Additional resource metadata
  difficultyLevel: integer('difficulty_level').notNull(), // 1-5
  estimatedDuration: integer('estimated_duration'), // minutes
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const learningProgress = pgTable('learning_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resourceId: uuid('resource_id').notNull().references(() => learningResources.id, { onDelete: 'cascade' }),
  assessmentId: uuid('assessment_id').references(() => competencyAssessments.id, { onDelete: 'cascade' }),
  progressStatus: text('progress_status').notNull(), // not_started, in_progress, completed, bookmarked
  timeSpent: integer('time_spent').notNull().default(0), // minutes
  completionPercentage: integer('completion_percentage').notNull().default(0),
  notes: text('notes'),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Insert schemas
export const insertCompetencyAssessmentSchema = createInsertSchema(competencyAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningResourceSchema = createInsertSchema(learningResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningProgressSchema = createInsertSchema(learningProgress).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertCompetencyAssessment = z.infer<typeof insertCompetencyAssessmentSchema>;
export type CompetencyAssessment = typeof competencyAssessments.$inferSelect;
export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;
export type LearningResource = typeof learningResources.$inferSelect;
export type InsertLearningProgress = z.infer<typeof insertLearningProgressSchema>;
export type LearningProgress = typeof learningProgress.$inferSelect;

// Extended types for Module 1
export type CompetencyAssessmentWithProgress = CompetencyAssessment & {
  learningProgress: LearningProgress[];
  recommendedResources: LearningResource[];
};

export type LearningResourceWithProgress = LearningResource & {
  userProgress?: LearningProgress;
};

// Module 3: Perform Assessment Framework
export const performAssessments = pgTable('perform_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assessmentType: text('assessment_type').notNull(), // 'comprehensive', 'competency_validation', 'portfolio_review'
  therapeuticAreas: text('therapeutic_areas').array().notNull().default([]), // Areas covered in assessment
  practiceAreas: text('practice_areas').array().notNull().default([]), // Hospital, community settings
  
  // Assessment Configuration
  status: text('status').notNull().default('in_progress'), // in_progress, completed, submitted
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  timeLimitMinutes: integer('time_limit_minutes').notNull().default(120),
  actualDurationMinutes: integer('actual_duration_minutes'),
  
  // Singapore Clinical Decision-Making Framework (4-stage process)
  informationGatheringScore: numeric('information_gathering_score', { precision: 5, scale: 2 }),
  clinicalReasoningScore: numeric('clinical_reasoning_score', { precision: 5, scale: 2 }),
  clinicalJudgmentScore: numeric('clinical_judgment_score', { precision: 5, scale: 2 }),
  implementationPlanningScore: numeric('implementation_planning_score', { precision: 5, scale: 2 }),
  
  // P3 Academy Competency Domains
  clinicalKnowledgeScore: numeric('clinical_knowledge_score', { precision: 5, scale: 2 }),
  therapeuticReasoningScore: numeric('therapeutic_reasoning_score', { precision: 5, scale: 2 }),
  communicationScore: numeric('communication_score', { precision: 5, scale: 2 }),
  documentationScore: numeric('documentation_score', { precision: 5, scale: 2 }),
  professionalDevelopmentScore: numeric('professional_development_score', { precision: 5, scale: 2 }),
  
  // Overall Performance
  overallCompetencyScore: numeric('overall_competency_score', { precision: 5, scale: 2 }),
  supervisionLevelAchieved: numeric('supervision_level_achieved', { precision: 3, scale: 1 }), // 3.0, 3.5, 4.0, etc.
  readinessForPractice: boolean('readiness_for_practice').default(false),
  
  // Portfolio Evidence
  portfolioCompiled: boolean('portfolio_compiled').default(false),
  counselingRecordsCount: integer('counseling_records_count').default(0),
  evidenceQualityScore: numeric('evidence_quality_score', { precision: 5, scale: 2 }),
  
  // Assessment Feedback
  aiEvaluation: jsonb('ai_evaluation'), // Detailed AI assessment breakdown
  strengths: text('strengths').array().default([]),
  improvementAreas: text('improvement_areas').array().default([]),
  developmentRecommendations: text('development_recommendations').array().default([]),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const performScenarios = pgTable('perform_scenarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => performAssessments.id, { onDelete: 'cascade' }),
  scenarioOrder: integer('scenario_order').notNull(),
  
  // Scenario Configuration
  therapeuticArea: text('therapeutic_area').notNull(),
  practiceArea: text('practice_area').notNull(),
  complexityLevel: text('complexity_level').notNull(), // 'intermediate', 'advanced', 'expert'
  professionalActivity: text('professional_activity').notNull(), // PA1, PA2, PA3, PA4
  
  // Scenario Content
  patientBackground: text('patient_background').notNull(),
  clinicalPresentation: text('clinical_presentation').notNull(),
  medicationHistory: text('medication_history').notNull(),
  assessmentObjectives: text('assessment_objectives').notNull(),
  
  // User Response & Performance
  userResponses: jsonb('user_responses'), // Structured responses to scenario
  responseQuality: numeric('response_quality', { precision: 5, scale: 2 }),
  clinicalAccuracy: numeric('clinical_accuracy', { precision: 5, scale: 2 }),
  communicationEffectiveness: numeric('communication_effectiveness', { precision: 5, scale: 2 }),
  professionalismScore: numeric('professionalism_score', { precision: 5, scale: 2 }),
  
  // Documentation Generated
  soapNotes: text('soap_notes'),
  carePlan: text('care_plan'),
  counselingRecord: text('counseling_record'),
  interventionNotes: text('intervention_notes'),
  
  // AI Assessment
  aiEvaluation: jsonb('ai_evaluation'),
  feedback: text('feedback'),
  modelAnswer: text('model_answer'),
  learningTips: text('learning_tips'),
  
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const performPortfolios = pgTable('perform_portfolios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assessmentId: uuid('assessment_id').references(() => performAssessments.id, { onDelete: 'set null' }),
  
  // Portfolio Status
  status: text('status').notNull().default('draft'), // draft, compiled, submitted, approved
  completionPercentage: numeric('completion_percentage', { precision: 5, scale: 2 }).default('0'),
  
  // Evidence Collection
  practiceSessionsIncluded: integer('practice_sessions_included').default(0),
  counselingRecordsCompiled: integer('counseling_records_compiled').default(0),
  therapeuticAreasCovered: text('therapeutic_areas_covered').array().default([]),
  
  // Portfolio Content
  executiveSummary: text('executive_summary'),
  competencyEvidence: jsonb('competency_evidence'), // Structured evidence collection
  learningReflections: jsonb('learning_reflections'), // Reflection entries
  developmentPlan: jsonb('development_plan'), // Future learning goals
  
  // Professional Documentation
  portfolioDocument: text('portfolio_document'), // Generated portfolio content
  exportFormat: text('export_format'), // 'pdf', 'docx', 'html'
  documentUrl: text('document_url'), // Link to exported document
  
  // Validation
  supervisorValidated: boolean('supervisor_validated').default(false),
  validationNotes: text('validation_notes'),
  validatedBy: text('validated_by'),
  validatedAt: timestamp('validated_at'),
  
  compiledAt: timestamp('compiled_at'),
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const performAnalytics = pgTable('perform_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assessmentId: uuid('assessment_id').references(() => performAssessments.id, { onDelete: 'cascade' }),
  
  // Performance Metrics
  metricCategory: text('metric_category').notNull(), // 'competency', 'therapeutic_area', 'communication', etc.
  metricName: text('metric_name').notNull(),
  metricValue: numeric('metric_value', { precision: 10, scale: 4 }).notNull(),
  
  // Context
  therapeuticArea: text('therapeutic_area'),
  practiceArea: text('practice_area'),
  assessmentType: text('assessment_type'),
  
  // Benchmarking
  benchmarkType: text('benchmark_type'), // 'peer_cohort', 'singapore_standard', 'supervision_level'
  benchmarkValue: numeric('benchmark_value', { precision: 10, scale: 4 }),
  percentileRank: numeric('percentile_rank', { precision: 5, scale: 2 }),
  
  // Temporal tracking
  measurementDate: timestamp('measurement_date').defaultNow().notNull(),
  reportingPeriod: text('reporting_period'), // 'session', 'weekly', 'monthly'
  
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Relations for Module 3: Perform
export const performAssessmentsRelations = relations(performAssessments, ({ one, many }) => ({
  user: one(users, {
    fields: [performAssessments.userId],
    references: [users.id],
  }),
  scenarios: many(performScenarios),
  portfolio: one(performPortfolios),
  analytics: many(performAnalytics),
}));

export const performScenariosRelations = relations(performScenarios, ({ one }) => ({
  assessment: one(performAssessments, {
    fields: [performScenarios.assessmentId],
    references: [performAssessments.id],
  }),
}));

export const performPortfoliosRelations = relations(performPortfolios, ({ one }) => ({
  user: one(users, {
    fields: [performPortfolios.userId],
    references: [users.id],
  }),
  assessment: one(performAssessments, {
    fields: [performPortfolios.assessmentId],
    references: [performAssessments.id],
  }),
}));

export const performAnalyticsRelations = relations(performAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [performAnalytics.userId],
    references: [users.id],
  }),
  assessment: one(performAssessments, {
    fields: [performAnalytics.assessmentId],
    references: [performAssessments.id],
  }),
}));

// Insert schemas for Module 3: Perform
export const insertPerformAssessmentSchema = createInsertSchema(performAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformScenarioSchema = createInsertSchema(performScenarios).omit({
  id: true,
  createdAt: true,
});

export const insertPerformPortfolioSchema = createInsertSchema(performPortfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformAnalyticsSchema = createInsertSchema(performAnalytics).omit({
  id: true,
  createdAt: true,
});

// Types for Module 3: Perform
export type InsertPerformAssessment = z.infer<typeof insertPerformAssessmentSchema>;
export type PerformAssessment = typeof performAssessments.$inferSelect;
export type InsertPerformScenario = z.infer<typeof insertPerformScenarioSchema>;
export type PerformScenario = typeof performScenarios.$inferSelect;
export type InsertPerformPortfolio = z.infer<typeof insertPerformPortfolioSchema>;
export type PerformPortfolio = typeof performPortfolios.$inferSelect;
export type InsertPerformAnalytics = z.infer<typeof insertPerformAnalyticsSchema>;
export type PerformAnalytics = typeof performAnalytics.$inferSelect;

// Extended types for Module 3: Perform API responses
export type PerformAssessmentWithDetails = PerformAssessment & {
  scenarios: PerformScenario[];
  portfolio?: PerformPortfolio;
  analytics: PerformAnalytics[];
};

export type PerformPortfolioWithEvidence = PerformPortfolio & {
  practiceSessionsEvidence: PharmacySessionWithScenario[];
  competencyProgressions: CompetencyAssessment[];
};

// P3 Academy Assessment Configuration
export const P3_ASSESSMENT_TYPES = {
  'comprehensive': 'Comprehensive Clinical Assessment',
  'competency_validation': 'Competency Validation',
  'portfolio_review': 'Portfolio Development Review'
} as const;

export const P3_COMPLEXITY_LEVELS = {
  'intermediate': 'Intermediate',
  'advanced': 'Advanced', 
  'expert': 'Expert'
} as const;

export const SINGAPORE_DECISION_STAGES = {
  'information_gathering': 'Information Gathering',
  'clinical_reasoning': 'Clinical Reasoning',
  'clinical_judgment': 'Clinical Judgment',
  'implementation_planning': 'Implementation & Monitoring'
} as const;
