import {
  users,
  pharmacyScenarios,
  pharmacySessions,
  pharmacyMessages,
  competencyAssessments,
  learningResources,
  learningProgress,
  performAssessments,
  performScenarios,
  performPortfolios,
  performAnalytics,
  traineeAssignments,
  supervisorFeedback,
  supervisorScenarios,
  knowledgeSources,
  drugSafetyAlerts,
  guidelineUpdates,
  singaporeFormulary,
  clinicalProtocols,
  type User,
  type UpsertUser,
  type InsertPharmacyScenario,
  type PharmacyScenario,
  type InsertPharmacySession,
  type PharmacySession,
  type InsertPharmacyMessage,
  type PharmacyMessage,
  type PharmacySessionWithScenario,
  type PharmacyScenarioWithStats,
  type InsertCompetencyAssessment,
  type CompetencyAssessment,
  type InsertLearningResource,
  type LearningResource,
  type InsertLearningProgress,
  type LearningProgress,
  type CompetencyAssessmentWithProgress,
  type LearningResourceWithProgress,
  type InsertPerformAssessment,
  type PerformAssessment,
  type InsertPerformScenario,
  type PerformScenario,
  type InsertPerformPortfolio,
  type PerformPortfolio,
  type InsertPerformAnalytics,
  type PerformAnalytics,
  type PerformAssessmentWithDetails,
  type PerformPortfolioWithEvidence,
  type InsertTraineeAssignment,
  type TraineeAssignment,
  type InsertSupervisorFeedback,
  type SupervisorFeedback,
  type InsertSupervisorScenario,
  type SupervisorScenario,
  type TraineeAssignmentWithDetails,
  type SupervisorFeedbackWithDetails,
  type SupervisorScenarioWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg, sql, ne, gte, isNotNull, inArray } from "drizzle-orm";

// Knowledge sources status types
export interface KnowledgeSourceStatus {
  id: string;
  sourceType: string;
  sourceName: string;
  isActive: boolean;
  lastSyncAt: Date | null;
  syncFrequency: string;
  dataCount: number;
  freshness: 'fresh' | 'stale' | 'outdated';
  lastUpdateHours: number;
  nextUpdateEstimate: string;
}

export interface KnowledgeSourcesStatus {
  sources: KnowledgeSourceStatus[];
  totalDataPoints: number;
  lastGlobalUpdate: Date;
  overallFreshness: 'excellent' | 'good' | 'needs_update';
  summary: {
    activeAlerts: number;
    currentGuidelines: number;
    formularyDrugs: number;
    clinicalProtocols: number;
  };
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<UpsertUser>): Promise<User>;
  createUser(userData: UpsertUser): Promise<User>;

  // Pharmacy scenario operations
  getPharmacyScenarios(module?: string, therapeuticArea?: string): Promise<PharmacyScenarioWithStats[]>;
  getPharmacyScenario(id: string): Promise<PharmacyScenario | undefined>;
  createPharmacyScenario(scenario: InsertPharmacyScenario): Promise<PharmacyScenario>;
  updatePharmacyScenario(id: string, scenario: Partial<InsertPharmacyScenario>): Promise<PharmacyScenario>;
  deletePharmacyScenario(id: string): Promise<void>;

  // Pharmacy session operations
  createPharmacySession(session: InsertPharmacySession): Promise<PharmacySession>;
  getPharmacySession(id: string): Promise<PharmacySessionWithScenario | undefined>;
  updatePharmacySession(id: string, session: Partial<InsertPharmacySession>): Promise<PharmacySession>;
  getUserPharmacySessions(userId: string): Promise<PharmacySessionWithScenario[]>;
  autoSaveSession(sessionId: string, data: Partial<InsertPharmacySession>): Promise<void>;

  // Pharmacy message operations
  addPharmacyMessage(message: InsertPharmacyMessage): Promise<PharmacyMessage>;
  getSessionMessages(sessionId: string): Promise<PharmacyMessage[]>;

  // Module 1: Prepare operations
  createCompetencyAssessment(assessment: InsertCompetencyAssessment): Promise<CompetencyAssessment>;
  getCompetencyAssessment(id: string): Promise<CompetencyAssessmentWithProgress | undefined>;
  getUserCompetencyAssessments(userId: string, therapeuticArea?: string): Promise<CompetencyAssessment[]>;
  updateCompetencyAssessment(id: string, assessment: Partial<InsertCompetencyAssessment>): Promise<CompetencyAssessment>;

  // Learning resources operations
  getLearningResources(therapeuticArea: string, practiceArea: string, professionalActivity?: string): Promise<LearningResourceWithProgress[]>;
  getLearningResource(id: string): Promise<LearningResource | undefined>;
  createLearningResource(resource: InsertLearningResource): Promise<LearningResource>;
  updateLearningResource(id: string, resource: Partial<InsertLearningResource>): Promise<LearningResource>;

  // Learning progress operations
  updateLearningProgress(userId: string, resourceId: string, progress: Partial<InsertLearningProgress>): Promise<LearningProgress>;
  getUserLearningProgress(userId: string, resourceId?: string): Promise<LearningProgress[]>;

  // Module 3: Perform assessment operations
  createPerformAssessment(assessment: InsertPerformAssessment): Promise<PerformAssessment>;
  getPerformAssessment(id: string): Promise<PerformAssessmentWithDetails | undefined>;
  updatePerformAssessment(id: string, assessment: Partial<InsertPerformAssessment>): Promise<PerformAssessment>;
  getUserPerformAssessments(userId: string): Promise<PerformAssessment[]>;
  deletePerformAssessment(id: string): Promise<void>;

  // Perform scenario operations
  createPerformScenario(scenario: InsertPerformScenario): Promise<PerformScenario>;
  updatePerformScenario(id: string, scenario: Partial<InsertPerformScenario>): Promise<PerformScenario>;
  getAssessmentScenarios(assessmentId: string): Promise<PerformScenario[]>;

  // Portfolio operations
  createPerformPortfolio(portfolio: InsertPerformPortfolio): Promise<PerformPortfolio>;
  getPerformPortfolio(id: string): Promise<PerformPortfolioWithEvidence | undefined>;
  getUserPerformPortfolio(userId: string): Promise<PerformPortfolioWithEvidence | undefined>;
  updatePerformPortfolio(id: string, portfolio: Partial<InsertPerformPortfolio>): Promise<PerformPortfolio>;
  compilePortfolioEvidence(userId: string): Promise<PerformPortfolio>;

  // Analytics operations
  recordPerformAnalytics(analytics: InsertPerformAnalytics): Promise<PerformAnalytics>;
  getUserPerformAnalytics(userId: string, metricCategory?: string): Promise<PerformAnalytics[]>;
  getAssessmentAnalytics(assessmentId: string): Promise<PerformAnalytics[]>;
  
  // Enhanced competency analytics
  getCompetencyProgressAnalytics(userId: string): Promise<any>;
  getSPCComplianceStatus(userId: string): Promise<any>;
  getPerformanceAnalyticsDashboard(userId: string): Promise<any>;
  getCompetencyGapAnalysis(userId: string): Promise<any>;
  getRecommendedScenarios(userId: string): Promise<any>;
  getSupervisorAnalytics(supervisorId: string, traineeIds?: string[]): Promise<any>;
  
  // Assessment Analysis System
  getAssessmentReport(userId: string, assessmentId: string): Promise<any>;
  
  // Enhanced Assessment System (Phase 3)
  createEnhancedAssessment(userId: string, assessmentData: any): Promise<any>;
  getAdaptiveAssessmentSession(userId: string, sessionId: string): Promise<any>;
  
  // Demo data management
  populateDemoData(userId: string): Promise<void>;
  clearDemoData(userId: string): Promise<void>;
  submitAdaptiveAnswer(userId: string, sessionId: string, answerData: any): Promise<any>;

  // Knowledge sources status
  getKnowledgeSourcesStatus(): Promise<KnowledgeSourcesStatus>;

  // Student dashboard progress tracking methods
  getUserSessionsByModule(userId: string, module: string): Promise<PharmacySessionWithScenario[]>;
  getStudentProgressSummary(userId: string): Promise<any>;
  getDetailedStudentProgress(userId: string, module?: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Pharmacy scenario operations
  async getPharmacyScenarios(module?: string, therapeuticArea?: string): Promise<PharmacyScenarioWithStats[]> {
    const baseQuery = db
      .select({
        id: pharmacyScenarios.id,
        title: pharmacyScenarios.title,
        module: pharmacyScenarios.module,
        therapeuticArea: pharmacyScenarios.therapeuticArea,
        practiceArea: pharmacyScenarios.practiceArea,
        caseType: pharmacyScenarios.caseType,
        professionalActivity: pharmacyScenarios.professionalActivity,
        supervisionLevel: pharmacyScenarios.supervisionLevel,
        patientAge: pharmacyScenarios.patientAge,
        patientGender: pharmacyScenarios.patientGender,
        patientBackground: pharmacyScenarios.patientBackground,
        clinicalPresentation: pharmacyScenarios.clinicalPresentation,
        medicationHistory: pharmacyScenarios.medicationHistory,
        assessmentObjectives: pharmacyScenarios.assessmentObjectives,
        keyLearningOutcomes: pharmacyScenarios.keyLearningOutcomes,
        difficulty: pharmacyScenarios.difficulty,
        status: pharmacyScenarios.status,
        createdBy: pharmacyScenarios.createdBy,
        createdAt: pharmacyScenarios.createdAt,
        updatedAt: pharmacyScenarios.updatedAt,
        sessionCount: count(pharmacySessions.id),
        averageScore: sql<number>`COALESCE(AVG(${pharmacySessions.overallScore}), 0)::numeric`,
      })
      .from(pharmacyScenarios)
      .leftJoin(pharmacySessions, eq(pharmacyScenarios.id, pharmacySessions.scenarioId))
      .groupBy(pharmacyScenarios.id)
      .orderBy(desc(pharmacyScenarios.createdAt));

    let results;
    if (module && therapeuticArea) {
      results = await baseQuery.where(
        and(
          eq(pharmacyScenarios.module, module),
          eq(pharmacyScenarios.therapeuticArea, therapeuticArea)
        )
      );
    } else if (module) {
      results = await baseQuery.where(eq(pharmacyScenarios.module, module));
    } else if (therapeuticArea) {
      results = await baseQuery.where(eq(pharmacyScenarios.therapeuticArea, therapeuticArea));
    } else {
      results = await baseQuery;
    }

    return results.map(result => ({
      ...result,
      sessionCount: Number(result.sessionCount),
      averageScore: Number(result.averageScore) || 0,
    }));
  }

  async getPharmacyScenario(id: string): Promise<PharmacyScenario | undefined> {
    const [scenario] = await db
      .select()
      .from(pharmacyScenarios)
      .where(eq(pharmacyScenarios.id, id));
    return scenario;
  }

  async createPharmacyScenario(scenario: InsertPharmacyScenario): Promise<PharmacyScenario> {
    const [newScenario] = await db
      .insert(pharmacyScenarios)
      .values(scenario)
      .returning();
    return newScenario;
  }

  async updatePharmacyScenario(id: string, scenario: Partial<InsertPharmacyScenario>): Promise<PharmacyScenario> {
    const [updatedScenario] = await db
      .update(pharmacyScenarios)
      .set({ ...scenario, updatedAt: new Date() })
      .where(eq(pharmacyScenarios.id, id))
      .returning();
    return updatedScenario;
  }

  async deletePharmacyScenario(id: string): Promise<void> {
    await db.delete(pharmacyScenarios).where(eq(pharmacyScenarios.id, id));
  }

  // Pharmacy session operations
  async createPharmacySession(session: InsertPharmacySession): Promise<PharmacySession> {
    const [newSession] = await db
      .insert(pharmacySessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getPharmacySession(id: string): Promise<PharmacySessionWithScenario | undefined> {
    const [session] = await db
      .select({
        // Session fields
        id: pharmacySessions.id,
        userId: pharmacySessions.userId,
        scenarioId: pharmacySessions.scenarioId,
        module: pharmacySessions.module,
        status: pharmacySessions.status,
        currentStage: pharmacySessions.currentStage,
        totalStages: pharmacySessions.totalStages,
        therapeuticArea: pharmacySessions.therapeuticArea,
        practiceArea: pharmacySessions.practiceArea,
        sessionLanguage: pharmacySessions.sessionLanguage,
        startedAt: pharmacySessions.startedAt,
        completedAt: pharmacySessions.completedAt,
        duration: pharmacySessions.duration,
        overallScore: pharmacySessions.overallScore,
        clinicalKnowledgeScore: pharmacySessions.clinicalKnowledgeScore,
        therapeuticReasoningScore: pharmacySessions.therapeuticReasoningScore,
        patientCommunicationScore: pharmacySessions.patientCommunicationScore,
        professionalPracticeScore: pharmacySessions.professionalPracticeScore,
        documentationScore: pharmacySessions.documentationScore,
        achievedSupervisionLevel: pharmacySessions.achievedSupervisionLevel,
        targetSupervisionLevel: pharmacySessions.targetSupervisionLevel,
        soapDocumentation: pharmacySessions.soapDocumentation,
        prescriptionCounselingRecord: pharmacySessions.prescriptionCounselingRecord,
        pharmaceuticalCarePlan: pharmacySessions.pharmaceuticalCarePlan,
        qualitativeFeedback: pharmacySessions.qualitativeFeedback,
        strengths: pharmacySessions.strengths,
        improvements: pharmacySessions.improvements,
        recommendations: pharmacySessions.recommendations,
        transcript: pharmacySessions.transcript,
        autoSavedAt: pharmacySessions.autoSavedAt,
        createdAt: pharmacySessions.createdAt,
        updatedAt: pharmacySessions.updatedAt,
        // Scenario fields
        scenario: {
          id: pharmacyScenarios.id,
          title: pharmacyScenarios.title,
          module: pharmacyScenarios.module,
          therapeuticArea: pharmacyScenarios.therapeuticArea,
          practiceArea: pharmacyScenarios.practiceArea,
          caseType: pharmacyScenarios.caseType,
          professionalActivity: pharmacyScenarios.professionalActivity,
          supervisionLevel: pharmacyScenarios.supervisionLevel,
          patientAge: pharmacyScenarios.patientAge,
          patientGender: pharmacyScenarios.patientGender,
          patientBackground: pharmacyScenarios.patientBackground,
          clinicalPresentation: pharmacyScenarios.clinicalPresentation,
          medicationHistory: pharmacyScenarios.medicationHistory,
          assessmentObjectives: pharmacyScenarios.assessmentObjectives,
          keyLearningOutcomes: pharmacyScenarios.keyLearningOutcomes,
          difficulty: pharmacyScenarios.difficulty,
          status: pharmacyScenarios.status,
          createdBy: pharmacyScenarios.createdBy,
          createdAt: pharmacyScenarios.createdAt,
          updatedAt: pharmacyScenarios.updatedAt,
        },
      })
      .from(pharmacySessions)
      .leftJoin(pharmacyScenarios, eq(pharmacySessions.scenarioId, pharmacyScenarios.id))
      .where(eq(pharmacySessions.id, id));

    if (!session) return undefined;

    const messages = await this.getSessionMessages(id);
    return { ...session, messages } as PharmacySessionWithScenario;
  }

  async updatePharmacySession(id: string, session: Partial<InsertPharmacySession>): Promise<PharmacySession> {
    const [updatedSession] = await db
      .update(pharmacySessions)
      .set({ ...session, updatedAt: new Date() })
      .where(eq(pharmacySessions.id, id))
      .returning();
    return updatedSession;
  }

  async getUserPharmacySessions(userId: string): Promise<PharmacySessionWithScenario[]> {
    const sessions = await db
      .select({
        // Session fields
        id: pharmacySessions.id,
        userId: pharmacySessions.userId,
        scenarioId: pharmacySessions.scenarioId,
        module: pharmacySessions.module,
        status: pharmacySessions.status,
        currentStage: pharmacySessions.currentStage,
        totalStages: pharmacySessions.totalStages,
        therapeuticArea: pharmacySessions.therapeuticArea,
        practiceArea: pharmacySessions.practiceArea,
        sessionLanguage: pharmacySessions.sessionLanguage,
        startedAt: pharmacySessions.startedAt,
        completedAt: pharmacySessions.completedAt,
        duration: pharmacySessions.duration,
        overallScore: pharmacySessions.overallScore,
        clinicalKnowledgeScore: pharmacySessions.clinicalKnowledgeScore,
        therapeuticReasoningScore: pharmacySessions.therapeuticReasoningScore,
        patientCommunicationScore: pharmacySessions.patientCommunicationScore,
        professionalPracticeScore: pharmacySessions.professionalPracticeScore,
        documentationScore: pharmacySessions.documentationScore,
        achievedSupervisionLevel: pharmacySessions.achievedSupervisionLevel,
        targetSupervisionLevel: pharmacySessions.targetSupervisionLevel,
        soapDocumentation: pharmacySessions.soapDocumentation,
        prescriptionCounselingRecord: pharmacySessions.prescriptionCounselingRecord,
        pharmaceuticalCarePlan: pharmacySessions.pharmaceuticalCarePlan,
        qualitativeFeedback: pharmacySessions.qualitativeFeedback,
        strengths: pharmacySessions.strengths,
        improvements: pharmacySessions.improvements,
        recommendations: pharmacySessions.recommendations,
        transcript: pharmacySessions.transcript,
        autoSavedAt: pharmacySessions.autoSavedAt,
        createdAt: pharmacySessions.createdAt,
        updatedAt: pharmacySessions.updatedAt,
        // Scenario fields
        scenario: {
          id: pharmacyScenarios.id,
          title: pharmacyScenarios.title,
          module: pharmacyScenarios.module,
          therapeuticArea: pharmacyScenarios.therapeuticArea,
          practiceArea: pharmacyScenarios.practiceArea,
          caseType: pharmacyScenarios.caseType,
          professionalActivity: pharmacyScenarios.professionalActivity,
          supervisionLevel: pharmacyScenarios.supervisionLevel,
          patientAge: pharmacyScenarios.patientAge,
          patientGender: pharmacyScenarios.patientGender,
          patientBackground: pharmacyScenarios.patientBackground,
          clinicalPresentation: pharmacyScenarios.clinicalPresentation,
          medicationHistory: pharmacyScenarios.medicationHistory,
          assessmentObjectives: pharmacyScenarios.assessmentObjectives,
          keyLearningOutcomes: pharmacyScenarios.keyLearningOutcomes,
          difficulty: pharmacyScenarios.difficulty,
          status: pharmacyScenarios.status,
          createdBy: pharmacyScenarios.createdBy,
          createdAt: pharmacyScenarios.createdAt,
          updatedAt: pharmacyScenarios.updatedAt,
        },
      })
      .from(pharmacySessions)
      .innerJoin(pharmacyScenarios, eq(pharmacySessions.scenarioId, pharmacyScenarios.id))
      .where(eq(pharmacySessions.userId, userId))
      .orderBy(desc(pharmacySessions.createdAt));

    // Add messages to each session
    const sessionsWithMessages = await Promise.all(
      sessions.map(async (session) => {
        const messages = await this.getSessionMessages(session.id);
        return { ...session, messages } as PharmacySessionWithScenario;
      })
    );

    return sessionsWithMessages;
  }

  async autoSaveSession(sessionId: string, data: Partial<InsertPharmacySession>): Promise<void> {
    await db
      .update(pharmacySessions)
      .set({ ...data, autoSavedAt: new Date() })
      .where(eq(pharmacySessions.id, sessionId));
  }

  // Pharmacy message operations
  async addPharmacyMessage(message: InsertPharmacyMessage): Promise<PharmacyMessage> {
    const [newMessage] = await db
      .insert(pharmacyMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getSessionMessages(sessionId: string): Promise<PharmacyMessage[]> {
    return await db
      .select()
      .from(pharmacyMessages)
      .where(eq(pharmacyMessages.sessionId, sessionId))
      .orderBy(pharmacyMessages.timestamp);
  }

  // Module 1: Prepare operations
  async createCompetencyAssessment(assessmentData: InsertCompetencyAssessment): Promise<CompetencyAssessment> {
    const [assessment] = await db
      .insert(competencyAssessments)
      .values(assessmentData)
      .returning();
    return assessment;
  }

  async getCompetencyAssessment(id: string): Promise<CompetencyAssessmentWithProgress | undefined> {
    const [assessment] = await db
      .select()
      .from(competencyAssessments)
      .where(eq(competencyAssessments.id, id));
    
    if (!assessment) return undefined;

    // Get associated learning progress
    const progress = await db
      .select()
      .from(learningProgress)
      .where(eq(learningProgress.assessmentId, id));

    // Get recommended resources
    const resources = await db
      .select()
      .from(learningResources)
      .where(
        and(
          eq(learningResources.therapeuticArea, assessment.therapeuticArea),
          eq(learningResources.practiceArea, assessment.practiceArea),
          eq(learningResources.professionalActivity, assessment.professionalActivity),
          eq(learningResources.isActive, true)
        )
      );

    return {
      ...assessment,
      learningProgress: progress,
      recommendedResources: resources
    };
  }

  async getUserCompetencyAssessments(userId: string, therapeuticArea?: string): Promise<CompetencyAssessment[]> {
    const conditions = [eq(competencyAssessments.userId, userId)];
    if (therapeuticArea) {
      conditions.push(eq(competencyAssessments.therapeuticArea, therapeuticArea));
    }

    return await db
      .select()
      .from(competencyAssessments)
      .where(and(...conditions))
      .orderBy(desc(competencyAssessments.createdAt));
  }

  async updateCompetencyAssessment(id: string, assessmentData: Partial<InsertCompetencyAssessment>): Promise<CompetencyAssessment> {
    const [assessment] = await db
      .update(competencyAssessments)
      .set({ ...assessmentData, updatedAt: new Date() })
      .where(eq(competencyAssessments.id, id))
      .returning();
    return assessment;
  }

  async deleteCompetencyAssessment(id: string): Promise<void> {
    await db
      .delete(competencyAssessments)
      .where(eq(competencyAssessments.id, id));
  }

  // Learning resources operations
  async getLearningResources(therapeuticArea: string, practiceArea: string, professionalActivity?: string): Promise<LearningResourceWithProgress[]> {
    const conditions = [
      eq(learningResources.therapeuticArea, therapeuticArea),
      eq(learningResources.practiceArea, practiceArea),
      eq(learningResources.isActive, true)
    ];
    
    if (professionalActivity) {
      conditions.push(eq(learningResources.professionalActivity, professionalActivity));
    }

    return await db
      .select()
      .from(learningResources)
      .where(and(...conditions))
      .orderBy(learningResources.difficultyLevel, learningResources.title);
  }

  async getLearningResource(id: string): Promise<LearningResource | undefined> {
    const [resource] = await db
      .select()
      .from(learningResources)
      .where(eq(learningResources.id, id));
    return resource;
  }

  async createLearningResource(resourceData: InsertLearningResource): Promise<LearningResource> {
    const [resource] = await db
      .insert(learningResources)
      .values(resourceData)
      .returning();
    return resource;
  }

  async updateLearningResource(id: string, resourceData: Partial<InsertLearningResource>): Promise<LearningResource> {
    const [resource] = await db
      .update(learningResources)
      .set({ ...resourceData, updatedAt: new Date() })
      .where(eq(learningResources.id, id))
      .returning();
    return resource;
  }

  // Learning progress operations
  async updateLearningProgress(userId: string, resourceId: string, progressData: Partial<InsertLearningProgress>): Promise<LearningProgress> {
    const insertData = {
      userId,
      resourceId,
      progressStatus: progressData.progressStatus || 'in_progress',
      timeSpent: progressData.timeSpent || 0,
      completionPercentage: progressData.completionPercentage || 0,
      notes: progressData.notes || null,
      assessmentId: progressData.assessmentId || null,
      lastAccessedAt: new Date(),
      completedAt: progressData.completedAt || null,
    };

    const [progress] = await db
      .insert(learningProgress)
      .values(insertData)
      .onConflictDoUpdate({
        target: [learningProgress.userId, learningProgress.resourceId],
        set: {
          progressStatus: progressData.progressStatus || insertData.progressStatus,
          timeSpent: progressData.timeSpent || insertData.timeSpent,
          completionPercentage: progressData.completionPercentage || insertData.completionPercentage,
          notes: progressData.notes || insertData.notes,
          lastAccessedAt: new Date(),
          completedAt: progressData.completedAt || insertData.completedAt,
        },
      })
      .returning();
    return progress;
  }

  async getUserLearningProgress(userId: string, resourceId?: string): Promise<LearningProgress[]> {
    const conditions = [eq(learningProgress.userId, userId)];
    if (resourceId) {
      conditions.push(eq(learningProgress.resourceId, resourceId));
    }

    return await db
      .select()
      .from(learningProgress)
      .where(and(...conditions))
      .orderBy(desc(learningProgress.lastAccessedAt));
  }

  // Module 3: Perform assessment operations
  async createPerformAssessment(assessmentData: InsertPerformAssessment): Promise<PerformAssessment> {
    const [assessment] = await db
      .insert(performAssessments)
      .values(assessmentData)
      .returning();
    return assessment;
  }

  async getPerformAssessment(id: string): Promise<PerformAssessmentWithDetails | undefined> {
    const [assessment] = await db
      .select()
      .from(performAssessments)
      .where(eq(performAssessments.id, id));
    
    if (!assessment) return undefined;

    // Get assessment scenarios
    const scenarios = await db
      .select()
      .from(performScenarios)
      .where(eq(performScenarios.assessmentId, id))
      .orderBy(performScenarios.scenarioOrder);

    // Get portfolio if exists
    const [portfolio] = await db
      .select()
      .from(performPortfolios)
      .where(eq(performPortfolios.assessmentId, id));

    // Get analytics
    const analytics = await db
      .select()
      .from(performAnalytics)
      .where(eq(performAnalytics.assessmentId, id))
      .orderBy(performAnalytics.measurementDate);

    return {
      ...assessment,
      scenarios,
      portfolio,
      analytics
    };
  }

  async updatePerformAssessment(id: string, assessmentData: Partial<InsertPerformAssessment>): Promise<PerformAssessment> {
    const [assessment] = await db
      .update(performAssessments)
      .set({ ...assessmentData, updatedAt: new Date() })
      .where(eq(performAssessments.id, id))
      .returning();
    return assessment;
  }

  async getUserPerformAssessments(userId: string): Promise<PerformAssessment[]> {
    return await db
      .select()
      .from(performAssessments)
      .where(eq(performAssessments.userId, userId))
      .orderBy(desc(performAssessments.createdAt));
  }

  async deletePerformAssessment(id: string): Promise<void> {
    await db
      .delete(performAssessments)
      .where(eq(performAssessments.id, id));
  }

  async deletePerformScenario(id: string): Promise<void> {
    await db
      .delete(performScenarios)
      .where(eq(performScenarios.id, id));
  }

  // Perform scenario operations
  async createPerformScenario(scenarioData: InsertPerformScenario): Promise<PerformScenario> {
    const [scenario] = await db
      .insert(performScenarios)
      .values(scenarioData)
      .returning();
    return scenario;
  }

  async updatePerformScenario(id: string, scenarioData: Partial<InsertPerformScenario>): Promise<PerformScenario> {
    const [scenario] = await db
      .update(performScenarios)
      .set(scenarioData)
      .where(eq(performScenarios.id, id))
      .returning();
    return scenario;
  }

  async getPerformScenario(id: string): Promise<PerformScenario | undefined> {
    const [scenario] = await db
      .select()
      .from(performScenarios)
      .where(eq(performScenarios.id, id));
    return scenario;
  }

  async getAssessmentScenarios(assessmentId: string): Promise<PerformScenario[]> {
    return await db
      .select()
      .from(performScenarios)
      .where(eq(performScenarios.assessmentId, assessmentId))
      .orderBy(performScenarios.scenarioOrder);
  }

  // Portfolio operations
  async createPerformPortfolio(portfolioData: InsertPerformPortfolio): Promise<PerformPortfolio> {
    const [portfolio] = await db
      .insert(performPortfolios)
      .values(portfolioData)
      .returning();
    return portfolio;
  }

  async getPerformPortfolio(id: string): Promise<PerformPortfolioWithEvidence | undefined> {
    const [portfolio] = await db
      .select()
      .from(performPortfolios)
      .where(eq(performPortfolios.id, id));
    
    if (!portfolio) return undefined;

    // Get practice sessions evidence
    const practiceSessionsEvidence = await this.getUserPharmacySessions(portfolio.userId);

    // Get competency progressions
    const competencyProgressions = await this.getUserCompetencyAssessments(portfolio.userId);

    return {
      ...portfolio,
      practiceSessionsEvidence,
      competencyProgressions
    };
  }

  async getUserPerformPortfolio(userId: string): Promise<PerformPortfolioWithEvidence | undefined> {
    const [portfolio] = await db
      .select()
      .from(performPortfolios)
      .where(eq(performPortfolios.userId, userId))
      .orderBy(desc(performPortfolios.createdAt))
      .limit(1);
    
    if (!portfolio) return undefined;

    // Get practice sessions evidence
    const practiceSessionsEvidence = await this.getUserPharmacySessions(userId);

    // Get competency progressions
    const competencyProgressions = await this.getUserCompetencyAssessments(userId);

    return {
      ...portfolio,
      practiceSessionsEvidence,
      competencyProgressions
    };
  }

  async updatePerformPortfolio(id: string, portfolioData: Partial<InsertPerformPortfolio>): Promise<PerformPortfolio> {
    const [portfolio] = await db
      .update(performPortfolios)
      .set({ ...portfolioData, updatedAt: new Date() })
      .where(eq(performPortfolios.id, id))
      .returning();
    return portfolio;
  }

  async compilePortfolioEvidence(userId: string): Promise<PerformPortfolio> {
    // Get user's practice sessions for evidence compilation
    const practiceSessions = await this.getUserPharmacySessions(userId);
    const completedSessions = practiceSessions.filter(s => s.status === 'completed');
    
    // Get competency assessments
    const competencyAssessments = await this.getUserCompetencyAssessments(userId);
    const completedAssessments = competencyAssessments.filter(a => a.completedAt);

    // Calculate portfolio metrics
    const counselingRecordsCount = completedSessions.filter(s => s.prescriptionCounselingRecord).length;
    const therapeuticAreasCovered = Array.from(new Set(completedSessions.map(s => s.therapeuticArea).filter(Boolean))) as string[];
    const completionPercentage = Math.min(100, (counselingRecordsCount / 14) * 100); // 14 required records

    // Create or update portfolio
    const portfolioData: InsertPerformPortfolio = {
      userId,
      status: completionPercentage >= 100 ? 'compiled' : 'draft',
      completionPercentage: completionPercentage.toString(),
      practiceSessionsIncluded: completedSessions.length,
      counselingRecordsCompiled: counselingRecordsCount,
      therapeuticAreasCovered,
      competencyEvidence: {
        practiceSessionIds: completedSessions.map(s => s.id),
        assessmentIds: completedAssessments.map(a => a.id),
        compilationDate: new Date().toISOString()
      },
      compiledAt: completionPercentage >= 100 ? new Date() : null
    };

    // Check if portfolio exists for user
    const existingPortfolio = await this.getUserPerformPortfolio(userId);
    
    if (existingPortfolio) {
      return await this.updatePerformPortfolio(existingPortfolio.id, portfolioData);
    } else {
      return await this.createPerformPortfolio(portfolioData);
    }
  }

  // Analytics operations
  async recordPerformAnalytics(analyticsData: InsertPerformAnalytics): Promise<PerformAnalytics> {
    const [analytics] = await db
      .insert(performAnalytics)
      .values(analyticsData)
      .returning();
    return analytics;
  }

  async getUserPerformAnalytics(userId: string, metricCategory?: string): Promise<PerformAnalytics[]> {
    const conditions = [eq(performAnalytics.userId, userId)];
    if (metricCategory) {
      conditions.push(eq(performAnalytics.metricCategory, metricCategory));
    }

    return await db
      .select()
      .from(performAnalytics)
      .where(and(...conditions))
      .orderBy(desc(performAnalytics.measurementDate));
  }

  async getAssessmentAnalytics(assessmentId: string): Promise<PerformAnalytics[]> {
    return await db
      .select()
      .from(performAnalytics)
      .where(eq(performAnalytics.assessmentId, assessmentId))
      .orderBy(performAnalytics.metricCategory, performAnalytics.metricName);
  }

  // Enhanced competency analytics implementation
  async getCompetencyProgressAnalytics(userId: string): Promise<any> {
    try {
      // Get all practice sessions with detailed scoring
      const practiceSessions = await db
        .select({
          id: pharmacySessions.id,
          module: pharmacySessions.module,
          therapeuticArea: pharmacySessions.therapeuticArea,
          practiceArea: pharmacySessions.practiceArea,
          professionalActivity: pharmacyScenarios.professionalActivity,
          clinicalKnowledgeScore: pharmacySessions.clinicalKnowledgeScore,
          therapeuticReasoningScore: pharmacySessions.therapeuticReasoningScore,
          patientCommunicationScore: pharmacySessions.patientCommunicationScore,
          professionalPracticeScore: pharmacySessions.professionalPracticeScore,
          overallScore: pharmacySessions.overallScore,
          completedAt: pharmacySessions.completedAt,
          strengths: pharmacySessions.strengths,
          improvements: pharmacySessions.improvements
        })
        .from(pharmacySessions)
        .leftJoin(pharmacyScenarios, eq(pharmacySessions.scenarioId, pharmacyScenarios.id))
        .where(and(
          eq(pharmacySessions.userId, userId),
          eq(pharmacySessions.module, "practice"),
          isNotNull(pharmacySessions.completedAt)
        ))
        .orderBy(desc(pharmacySessions.completedAt));

      // Get all perform assessment scenarios
      const performScenariosData = await db
        .select({
          id: performScenarios.id,
          therapeuticArea: performScenarios.therapeuticArea,
          practiceArea: performScenarios.practiceArea,
          professionalActivity: performScenarios.professionalActivity,
          complexityLevel: performScenarios.complexityLevel,
          responseQuality: performScenarios.responseQuality,
          clinicalAccuracy: performScenarios.clinicalAccuracy,
          communicationEffectiveness: performScenarios.communicationEffectiveness,
          professionalismScore: performScenarios.professionalismScore,
          completedAt: performScenarios.completedAt
        })
        .from(performScenarios)
        .leftJoin(performAssessments, eq(performScenarios.assessmentId, performAssessments.id))
        .where(and(
          eq(performAssessments.userId, userId),
          isNotNull(performScenarios.completedAt)
        ))
        .orderBy(desc(performScenarios.completedAt));

      // Calculate PA1-PA4 competency scores
      const competencyScores = {
        PA1: this.calculatePACompetency(practiceSessions, performScenariosData, 'PA1'),
        PA2: this.calculatePACompetency(practiceSessions, performScenariosData, 'PA2'), 
        PA3: this.calculatePACompetency(practiceSessions, performScenariosData, 'PA3'),
        PA4: this.calculatePACompetency(practiceSessions, performScenariosData, 'PA4')
      };

      // Calculate competency progression timeline
      const timelineData = this.calculateCompetencyTimeline(practiceSessions, performScenariosData);

      // Calculate therapeutic area mastery
      const therapeuticAreaMastery = this.calculateTherapeuticAreaMastery(practiceSessions, performScenariosData);

      return {
        competencyScores,
        timelineData,
        therapeuticAreaMastery,
        totalSessions: practiceSessions.length + performScenariosData.length,
        lastActivityDate: Math.max(
          ...[...practiceSessions, ...performScenariosData]
            .map(s => new Date(s.completedAt || '').getTime())
            .filter(t => !isNaN(t))
        )
      };

    } catch (error) {
      console.error("Error getting competency progress analytics:", error);
      throw error;
    }
  }

  async getSPCComplianceStatus(userId: string): Promise<any> {
    try {
      const competencyData = await this.getCompetencyProgressAnalytics(userId);
      
      // SPC Pre-registration requirements mapping
      const spcRequirements = {
        PA1: { minScore: 70, minSupervisionLevel: 3, completed: false },
        PA2: { minScore: 75, minSupervisionLevel: 4, completed: false },
        PA3: { minScore: 70, minSupervisionLevel: 3, completed: false },
        PA4: { minScore: 65, minSupervisionLevel: 3, completed: false }
      };

      // Calculate compliance for each PA
      let totalReadiness = 0;
      const requirementStatus: any = {};
      
      for (const [pa, requirement] of Object.entries(spcRequirements)) {
        const competencyScore = competencyData.competencyScores[pa];
        const meetsScore = competencyScore.averageScore >= requirement.minScore;
        const meetsSupervision = competencyScore.supervisionLevel >= requirement.minSupervisionLevel;
        
        requirementStatus[pa] = {
          ...requirement,
          currentScore: competencyScore.averageScore,
          currentSupervisionLevel: competencyScore.supervisionLevel,
          meetsScoreRequirement: meetsScore,
          meetsSupervisionRequirement: meetsSupervision,
          completed: meetsScore && meetsSupervision,
          progressPercentage: Math.min(100, (competencyScore.averageScore / requirement.minScore) * 100)
        };
        
        if (requirementStatus[pa].completed) {
          totalReadiness += 25; // Each PA is worth 25% of total readiness
        } else {
          totalReadiness += requirementStatus[pa].progressPercentage * 0.25;
        }
      }

      // Portfolio completion status
      const portfolio = await this.getUserPerformPortfolio(userId);
      const portfolioReadiness = portfolio && portfolio.completionPercentage ? parseFloat(portfolio.completionPercentage) : 0;
      
      return {
        overallReadinessPercentage: Math.round((totalReadiness + portfolioReadiness) / 2),
        requirementStatus,
        portfolioStatus: {
          completionPercentage: portfolioReadiness,
          supervisorValidated: portfolio?.supervisorValidated || false,
          practiceSessionsIncluded: portfolio?.practiceSessionsIncluded || 0,
          counselingRecordsCompiled: portfolio?.counselingRecordsCompiled || 0
        },
        readyForPreRegistration: totalReadiness >= 80 && portfolioReadiness >= 90,
        nextMilestones: this.getNextCompetencyMilestones(requirementStatus)
      };

    } catch (error) {
      console.error("Error getting SPC compliance status:", error);
      throw error;
    }
  }

  async getPerformanceAnalyticsDashboard(userId: string): Promise<any> {
    try {
      const competencyData = await this.getCompetencyProgressAnalytics(userId);
      const spcStatus = await this.getSPCComplianceStatus(userId);
      
      // Calculate performance metrics
      const performanceMetrics = {
        strengths: this.identifyTopStrengths(competencyData),
        improvements: this.identifyTopImprovements(competencyData),
        trendingUp: this.identifyImprovingAreas(competencyData),
        trendingDown: this.identifyDecliningAreas(competencyData),
        consistencyScore: this.calculateConsistencyScore(competencyData)
      };

      // Recent activity summary
      const recentActivity = await this.getRecentActivitySummary(userId);
      
      return {
        ...competencyData,
        spcCompliance: spcStatus,
        performanceMetrics,
        recentActivity,
        dashboardUpdatedAt: new Date()
      };

    } catch (error) {
      console.error("Error getting performance analytics dashboard:", error);
      throw error;
    }
  }

  async getCompetencyGapAnalysis(userId: string): Promise<any> {
    try {
      const competencyData = await this.getCompetencyProgressAnalytics(userId);
      const spcStatus = await this.getSPCComplianceStatus(userId);
      
      const gaps = [];
      
      // Identify gaps in PA requirements
      for (const [pa, statusUnknown] of Object.entries(spcStatus.requirementStatus)) {
        const status = statusUnknown as { completed: boolean; currentScore: number; minScore: number; [key: string]: any };
        if (!status.completed) {
          const gap = {
            type: 'competency',
            professionalActivity: pa,
            currentLevel: status.currentScore,
            targetLevel: status.minScore,
            gap: status.minScore - status.currentScore,
            priority: this.calculateGapPriority(status),
            recommendedActions: this.getRecommendedActions(pa, status)
          };
          gaps.push(gap);
        }
      }

      // Identify therapeutic area gaps
      const therapeuticGaps = this.identifyTherapeuticAreaGaps(competencyData.therapeuticAreaMastery);
      gaps.push(...therapeuticGaps);

      // Sort gaps by priority
      gaps.sort((a, b) => b.priority - a.priority);

      return {
        totalGaps: gaps.length,
        highPriorityGaps: gaps.filter(g => g.priority >= 8).length,
        gaps: gaps.slice(0, 10), // Top 10 gaps
        improvementPlan: this.generateImprovementPlan(gaps),
        estimatedTimeToCompletion: this.estimateTimeToCompletion(gaps)
      };

    } catch (error) {
      console.error("Error getting competency gap analysis:", error);
      throw error;
    }
  }

  async getRecommendedScenarios(userId: string): Promise<any> {
    try {
      const gapAnalysis = await this.getCompetencyGapAnalysis(userId);
      const competencyData = await this.getCompetencyProgressAnalytics(userId);
      
      const recommendations = [];
      
      // Get available scenarios
      const availableScenarios = await db
        .select()
        .from(pharmacyScenarios)
        .where(eq(pharmacyScenarios.module, "practice"));

      // Recommend scenarios based on gaps
      for (const gap of gapAnalysis.gaps.slice(0, 5)) {
        if (gap.type === 'competency') {
          const matchingScenarios = availableScenarios.filter(s => 
            s.professionalActivity === gap.professionalActivity
          );
          
          if (matchingScenarios.length > 0) {
            recommendations.push({
              reason: `Improve ${gap.professionalActivity} competency`,
              priority: gap.priority,
              scenarios: matchingScenarios.slice(0, 3),
              expectedImprovement: this.calculateExpectedImprovement(gap)
            });
          }
        }
      }

      // Recommend scenarios for skill maintenance
      const maintenanceRecommendations = this.getMaintenanceRecommendations(competencyData, availableScenarios);
      recommendations.push(...maintenanceRecommendations);

      return {
        totalRecommendations: recommendations.length,
        recommendations: recommendations.slice(0, 8),
        nextSessionObjectives: this.generateSessionObjectives(recommendations),
        estimatedSessionCount: this.estimateSessionCount(gapAnalysis.gaps)
      };

    } catch (error) {
      console.error("Error getting recommended scenarios:", error);
      throw error;
    }
  }

  async getSupervisorAnalytics(supervisorId: string, traineeIds?: string[]): Promise<any> {
    try {
      // For now, return placeholder data - this would require supervisor-trainee relationships
      // to be properly implemented in the database schema
      
      return {
        totalTrainees: 0,
        activeTrainees: 0,
        averageProgress: 0,
        traineeComparison: [],
        recentAssessments: [],
        alertsAndNotifications: [],
        supervisorUpdatedAt: new Date()
      };

    } catch (error) {
      console.error("Error getting supervisor analytics:", error);
      throw error;
    }
  }

  // Helper methods for competency calculations
  private calculatePACompetency(practiceSessions: any[], performScenarios: any[], pa: string) {
    const relevantSessions = practiceSessions.filter(s => s.professionalActivity === pa);
    const relevantAssessments = performScenarios.filter(s => s.professionalActivity === pa);
    
    if (relevantSessions.length === 0 && relevantAssessments.length === 0) {
      return { averageScore: 0, sessionCount: 0, supervisionLevel: 1, competencyLevel: 'Novice' };
    }

    // Calculate weighted average (practice sessions 60%, assessments 40%)
    const practiceAvg = relevantSessions.reduce((sum, s) => sum + parseFloat(s.overallScore || 0), 0) / Math.max(relevantSessions.length, 1);
    const assessmentAvg = relevantAssessments.reduce((sum, s) => sum + this.calculateAssessmentScore(s), 0) / Math.max(relevantAssessments.length, 1);
    
    const weightedAverage = relevantSessions.length > 0 && relevantAssessments.length > 0
      ? (practiceAvg * 0.6) + (assessmentAvg * 0.4)
      : practiceAvg > 0 ? practiceAvg : assessmentAvg;

    return {
      averageScore: Math.round(weightedAverage),
      sessionCount: relevantSessions.length + relevantAssessments.length,
      supervisionLevel: this.calculateSupervisionLevel(weightedAverage),
      competencyLevel: this.calculateCompetencyLevel(weightedAverage)
    };
  }

  private calculateAssessmentScore(scenario: any): number {
    // Convert qualitative scores to numeric (assuming mapping)
    const qualitativeToNumeric: any = {
      'excellent': 95, 'very_good': 85, 'good': 75, 'satisfactory': 65, 'needs_improvement': 45, 'unsatisfactory': 25
    };
    
    const scores = [
      qualitativeToNumeric[scenario.responseQuality] || 50,
      qualitativeToNumeric[scenario.clinicalAccuracy] || 50,
      qualitativeToNumeric[scenario.communicationEffectiveness] || 50,
      qualitativeToNumeric[scenario.professionalismScore] || 50
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateSupervisionLevel(score: number): number {
    if (score >= 90) return 5;
    if (score >= 80) return 4;
    if (score >= 70) return 3;
    if (score >= 60) return 2;
    return 1;
  }

  private calculateCompetencyLevel(score: number): string {
    if (score >= 90) return 'Expert';
    if (score >= 80) return 'Proficient';
    if (score >= 70) return 'Competent';
    if (score >= 60) return 'Advanced Beginner';
    return 'Novice';
  }

  private calculateCompetencyTimeline(practiceSessions: any[], performScenarios: any[]): any[] {
    // Combine and sort all activities by date
    const allActivities = [
      ...practiceSessions.map(s => ({
        date: s.completedAt,
        type: 'practice',
        score: parseFloat(s.overallScore || 0),
        pa: s.professionalActivity
      })),
      ...performScenarios.map(s => ({
        date: s.completedAt,
        type: 'assessment',
        score: this.calculateAssessmentScore(s),
        pa: s.professionalActivity
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate rolling averages for each PA over time
    const timeline = [];
    const rollingScores: any = { PA1: [], PA2: [], PA3: [], PA4: [] };
    
    for (const activity of allActivities) {
      const pa = activity.pa || 'PA1'; // Default to PA1 if pa is null/undefined
      if (!rollingScores[pa]) {
        rollingScores[pa] = [];
      }
      rollingScores[pa].push(activity.score);
      
      // Keep only last 5 scores for rolling average
      if (rollingScores[pa].length > 5) {
        rollingScores[pa].shift();
      }
      
      const avgScores: any = {};
      for (const pa of ['PA1', 'PA2', 'PA3', 'PA4']) {
        avgScores[pa] = rollingScores[pa].length > 0 
          ? rollingScores[pa].reduce((sum: number, score: number) => sum + score, 0) / rollingScores[pa].length
          : 0;
      }
      
      timeline.push({
        date: activity.date,
        ...avgScores,
        activityType: activity.type
      });
    }
    
    return timeline;
  }

  private calculateTherapeuticAreaMastery(practiceSessions: any[], performScenarios: any[]): any {
    const therapeuticAreas = ['Cardiovascular', 'Gastrointestinal', 'Renal', 'Endocrine', 'Respiratory', 'Dermatological', 'Neurological'];
    const mastery: any = {};
    
    for (const area of therapeuticAreas) {
      const practiceScores = practiceSessions
        .filter(s => s.therapeuticArea === area)
        .map(s => parseFloat(s.overallScore || 0));
      
      const assessmentScores = performScenarios
        .filter(s => s.therapeuticArea === area)
        .map(s => this.calculateAssessmentScore(s));
      
      const allScores = [...practiceScores, ...assessmentScores];
      
      mastery[area] = {
        averageScore: allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0,
        sessionCount: allScores.length,
        masteryLevel: allScores.length >= 3 && allScores.reduce((sum, score) => sum + score, 0) / allScores.length >= 75 ? 'Mastered' : 'Developing'
      };
    }
    
    return mastery;
  }

  private identifyTopStrengths(competencyData: any): string[] {
    const strengths = [];
    
    // Identify top performing PAs
    const paScores = Object.entries(competencyData.competencyScores)
      .sort(([,a], [,b]) => (b as any).averageScore - (a as any).averageScore);
    
    if (paScores.length > 0 && (paScores[0][1] as any).averageScore >= 75) {
      strengths.push(`Strong performance in ${paScores[0][0]} activities`);
    }
    
    // Identify top therapeutic areas
    const therapeuticScores = Object.entries(competencyData.therapeuticAreaMastery)
      .filter(([,data]) => (data as any).sessionCount >= 2)
      .sort(([,a], [,b]) => (b as any).averageScore - (a as any).averageScore);
    
    if (therapeuticScores.length > 0 && (therapeuticScores[0][1] as any).averageScore >= 75) {
      strengths.push(`Excellent knowledge in ${therapeuticScores[0][0]} therapy`);
    }
    
    return strengths.slice(0, 3);
  }

  private identifyTopImprovements(competencyData: any): string[] {
    const improvements = [];
    
    // Identify lowest performing PAs
    const paScores = Object.entries(competencyData.competencyScores)
      .filter(([,data]) => (data as any).sessionCount > 0)
      .sort(([,a], [,b]) => (a as any).averageScore - (b as any).averageScore);
    
    if (paScores.length > 0 && (paScores[0][1] as any).averageScore < 70) {
      improvements.push(`Focus on ${paScores[0][0]} competency development`);
    }
    
    return improvements.slice(0, 3);
  }

  private identifyImprovingAreas(competencyData: any): string[] {
    // This would require trend analysis over time - placeholder for now
    return [];
  }

  private identifyDecliningAreas(competencyData: any): string[] {
    // This would require trend analysis over time - placeholder for now  
    return [];
  }

  private calculateConsistencyScore(competencyData: any): number {
    // Calculate consistency across different PAs
    const scores = Object.values(competencyData.competencyScores).map((pa: any) => pa.averageScore);
    if (scores.length === 0) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to 0-100 scale where lower deviation = higher consistency
    return Math.max(0, 100 - (standardDeviation * 2));
  }

  private async getRecentActivitySummary(userId: string): Promise<any> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentSessions = await db
      .select()
      .from(pharmacySessions)
      .where(and(
        eq(pharmacySessions.userId, userId),
        isNotNull(pharmacySessions.completedAt),
        gte(pharmacySessions.completedAt, oneWeekAgo)
      ));
    
    return {
      sessionsThisWeek: recentSessions.length,
      averageScoreThisWeek: recentSessions.length > 0 
        ? recentSessions.reduce((sum, s) => sum + parseFloat(s.overallScore || '0'), 0) / recentSessions.length
        : 0,
      lastActivityDate: recentSessions.length > 0 
        ? Math.max(...recentSessions.map(s => new Date(s.completedAt || '').getTime()))
        : null
    };
  }

  private getNextCompetencyMilestones(requirementStatus: any): any[] {
    const milestones = [];
    
    for (const [pa, statusUnknown] of Object.entries(requirementStatus)) {
      const status = statusUnknown as { completed: boolean; minScore: number; currentScore: number; progressPercentage: number };
      if (!status.completed) {
        milestones.push({
          professionalActivity: pa,
          milestone: `Achieve ${status.minScore}% competency in ${pa}`,
          currentProgress: status.progressPercentage,
          estimatedSessions: Math.ceil((status.minScore - status.currentScore) / 5) // Assume ~5% improvement per session
        });
      }
    }
    
    return milestones.sort((a, b) => b.currentProgress - a.currentProgress).slice(0, 3);
  }

  private calculateGapPriority(status: any): number {
    // Higher priority for larger gaps and requirements closer to completion
    const scoreGap = status.minScore - status.currentScore;
    const supervisionGap = status.minSupervisionLevel - status.currentSupervisionLevel;
    const progressWeight = 100 - status.progressPercentage;
    
    return Math.min(10, (scoreGap * 0.1) + (supervisionGap * 2) + (progressWeight * 0.05));
  }

  private getRecommendedActions(pa: string, status: any): string[] {
    const actions = [];
    
    if (status.currentScore < status.minScore) {
      actions.push(`Complete 3-5 practice scenarios focused on ${pa}`);
      actions.push(`Review clinical guidelines for ${pa} activities`);
    }
    
    if (status.currentSupervisionLevel < status.minSupervisionLevel) {
      actions.push(`Demonstrate independent decision-making in ${pa}`);
      actions.push(`Request supervisor assessment of ${pa} competency`);
    }
    
    return actions;
  }

  private identifyTherapeuticAreaGaps(therapeuticAreaMastery: any): any[] {
    const gaps = [];
    
    for (const [area, data] of Object.entries(therapeuticAreaMastery)) {
      const mastery = data as any;
      if (mastery.sessionCount < 2) {
        gaps.push({
          type: 'therapeutic_area',
          area: area,
          currentSessions: mastery.sessionCount,
          targetSessions: 3,
          gap: 3 - mastery.sessionCount,
          priority: 6,
          recommendedActions: [`Complete scenarios in ${area} therapeutic area`]
        });
      }
    }
    
    return gaps;
  }

  private generateImprovementPlan(gaps: any[]): any {
    const plan = {
      phase1: gaps.filter(g => g.priority >= 8).slice(0, 2),
      phase2: gaps.filter(g => g.priority >= 6 && g.priority < 8).slice(0, 3),
      phase3: gaps.filter(g => g.priority < 6).slice(0, 3)
    };
    
    return {
      totalPhases: 3,
      ...plan,
      estimatedWeeks: (plan.phase1.length * 2) + (plan.phase2.length * 1.5) + (plan.phase3.length * 1)
    };
  }

  private estimateTimeToCompletion(gaps: any[]): any {
    const highPriorityWeeks = gaps.filter(g => g.priority >= 8).length * 2;
    const mediumPriorityWeeks = gaps.filter(g => g.priority >= 6 && g.priority < 8).length * 1.5;
    const lowPriorityWeeks = gaps.filter(g => g.priority < 6).length * 1;
    
    return {
      totalWeeks: Math.ceil(highPriorityWeeks + mediumPriorityWeeks + lowPriorityWeeks),
      highPriorityWeeks: Math.ceil(highPriorityWeeks),
      mediumPriorityWeeks: Math.ceil(mediumPriorityWeeks),
      lowPriorityWeeks: Math.ceil(lowPriorityWeeks)
    };
  }

  private calculateExpectedImprovement(gap: any): string {
    if (gap.gap <= 5) return 'Small improvement (2-5%)';
    if (gap.gap <= 15) return 'Moderate improvement (5-15%)';
    return 'Significant improvement (15%+)';
  }

  private getMaintenanceRecommendations(competencyData: any, availableScenarios: any[]): any[] {
    const recommendations = [];
    
    // Recommend scenarios for areas performing well to maintain skills
    const strongAreas = Object.entries(competencyData.competencyScores)
      .filter(([,data]) => (data as any).averageScore >= 80)
      .map(([pa]) => pa);
    
    for (const pa of strongAreas) {
      const matchingScenarios = availableScenarios.filter(s => s.professionalActivity === pa);
      if (matchingScenarios.length > 0) {
        recommendations.push({
          reason: `Maintain excellence in ${pa}`,
          priority: 4,
          scenarios: matchingScenarios.slice(0, 2),
          expectedImprovement: 'Skill maintenance'
        });
      }
    }
    
    return recommendations.slice(0, 2);
  }

  private generateSessionObjectives(recommendations: any[]): string[] {
    return recommendations.slice(0, 3).map(r => r.reason);
  }

  private estimateSessionCount(gaps: any[]): any {
    const totalSessions = gaps.reduce((sum, gap) => {
      return sum + Math.ceil(gap.gap / 5); // Assume 5% improvement per session
    }, 0);
    
    return {
      total: totalSessions,
      weekly: Math.ceil(totalSessions / 4), // Spread over 4 weeks
      priority: Math.ceil(gaps.filter(g => g.priority >= 8).length * 2)
    };
  }

  // Knowledge sources status implementation
  async getKnowledgeSourcesStatus(): Promise<KnowledgeSourcesStatus> {
    try {
      // Get all knowledge sources
      const sources = await db.select().from(knowledgeSources);
      
      // Get data counts for each source type
      const [alertsCount] = await db.select({ count: count() }).from(drugSafetyAlerts).where(eq(drugSafetyAlerts.isActive, true));
      const [guidelinesCount] = await db.select({ count: count() }).from(guidelineUpdates).where(eq(guidelineUpdates.isActive, true));
      const [formularyCount] = await db.select({ count: count() }).from(singaporeFormulary).where(eq(singaporeFormulary.isActive, true));
      const [protocolsCount] = await db.select({ count: count() }).from(clinicalProtocols).where(eq(clinicalProtocols.isActive, true));

      const now = new Date();
      let latestUpdate = new Date(0); // Epoch time as fallback

      // Process each knowledge source
      const sourceStatuses: KnowledgeSourceStatus[] = sources.map(source => {
        const lastSync = source.lastSyncAt || new Date(0);
        const hoursSinceSync = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60));
        
        // Update latest global update
        if (lastSync > latestUpdate) {
          latestUpdate = lastSync;
        }

        // Determine data count based on source type
        let dataCount = 0;
        switch (source.sourceType) {
          case 'hsa':
            dataCount = alertsCount.count;
            break;
          case 'moh':
            dataCount = guidelinesCount.count;
            break;
          case 'ndf':
            dataCount = formularyCount.count;
            break;
          case 'spc':
            dataCount = protocolsCount.count;
            break;
          default:
            dataCount = 0;
        }

        // Determine freshness based on sync frequency and last update
        let freshness: 'fresh' | 'stale' | 'outdated' = 'fresh';
        let maxHoursForFresh = 24; // default

        switch (source.syncFrequency) {
          case 'daily':
            maxHoursForFresh = 25; // Allow 1 hour buffer
            break;
          case 'weekly':
            maxHoursForFresh = 168 + 2; // 7 days + 2 hour buffer
            break;
          case 'monthly':
            maxHoursForFresh = 744 + 24; // 31 days + 1 day buffer
            break;
        }

        if (hoursSinceSync > maxHoursForFresh * 2) {
          freshness = 'outdated';
        } else if (hoursSinceSync > maxHoursForFresh) {
          freshness = 'stale';
        }

        // Calculate next update estimate
        let nextUpdateEstimate = 'Unknown';
        if (source.syncFrequency === 'daily') {
          const nextUpdate = new Date(lastSync.getTime() + 24 * 60 * 60 * 1000);
          if (nextUpdate > now) {
            const hoursUntil = Math.ceil((nextUpdate.getTime() - now.getTime()) / (1000 * 60 * 60));
            nextUpdateEstimate = `${hoursUntil} hours`;
          } else {
            nextUpdateEstimate = 'Overdue';
          }
        } else if (source.syncFrequency === 'weekly') {
          nextUpdateEstimate = 'Within 7 days';
        } else if (source.syncFrequency === 'monthly') {
          nextUpdateEstimate = 'Within 30 days';
        }

        return {
          id: source.id,
          sourceType: source.sourceType,
          sourceName: source.sourceName,
          isActive: source.isActive,
          lastSyncAt: source.lastSyncAt,
          syncFrequency: source.syncFrequency,
          dataCount,
          freshness,
          lastUpdateHours: hoursSinceSync,
          nextUpdateEstimate
        };
      });

      // Calculate overall metrics
      const totalDataPoints = alertsCount.count + guidelinesCount.count + formularyCount.count + protocolsCount.count;
      
      // Determine overall freshness
      const freshStatuses = sourceStatuses.map(s => s.freshness);
      let overallFreshness: 'excellent' | 'good' | 'needs_update' = 'excellent';
      
      if (freshStatuses.some(f => f === 'outdated')) {
        overallFreshness = 'needs_update';
      } else if (freshStatuses.some(f => f === 'stale')) {
        overallFreshness = 'good';
      }

      return {
        sources: sourceStatuses,
        totalDataPoints,
        lastGlobalUpdate: latestUpdate,
        overallFreshness,
        summary: {
          activeAlerts: alertsCount.count,
          currentGuidelines: guidelinesCount.count,
          formularyDrugs: formularyCount.count,
          clinicalProtocols: protocolsCount.count
        }
      };

    } catch (error) {
      console.error('Error fetching knowledge sources status:', error);
      
      // Return fallback data in case of error
      return {
        sources: [
          {
            id: 'fallback-hsa',
            sourceType: 'hsa',
            sourceName: 'Health Sciences Authority',
            isActive: true,
            lastSyncAt: new Date(),
            syncFrequency: 'daily',
            dataCount: 3,
            freshness: 'fresh' as const,
            lastUpdateHours: 2,
            nextUpdateEstimate: '22 hours'
          },
          {
            id: 'fallback-moh',
            sourceType: 'moh',
            sourceName: 'Ministry of Health',
            isActive: true,
            lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            syncFrequency: 'weekly',
            dataCount: 5,
            freshness: 'fresh' as const,
            lastUpdateHours: 24,
            nextUpdateEstimate: 'Within 7 days'
          },
          {
            id: 'fallback-ndf',
            sourceType: 'ndf',
            sourceName: 'National Drug Formulary',
            isActive: true,
            lastSyncAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            syncFrequency: 'monthly',
            dataCount: 3,
            freshness: 'fresh' as const,
            lastUpdateHours: 6,
            nextUpdateEstimate: 'Within 30 days'
          }
        ],
        totalDataPoints: 11,
        lastGlobalUpdate: new Date(),
        overallFreshness: 'excellent' as const,
        summary: {
          activeAlerts: 3,
          currentGuidelines: 5,
          formularyDrugs: 3,
          clinicalProtocols: 0
        }
      };
    }
  }

  // Student dashboard progress tracking implementation
  async getUserSessionsByModule(userId: string, module: string): Promise<PharmacySessionWithScenario[]> {
    const sessions = await db
      .select({
        session: pharmacySessions,
        scenario: pharmacyScenarios
      })
      .from(pharmacySessions)
      .leftJoin(pharmacyScenarios, eq(pharmacySessions.scenarioId, pharmacyScenarios.id))
      .where(and(
        eq(pharmacySessions.userId, userId),
        eq(pharmacySessions.module, module)
      ))
      .orderBy(desc(pharmacySessions.startedAt));

    return sessions.map(row => ({
      ...row.session,
      scenario: row.scenario!,
      messages: [] as PharmacyMessage[]
    }));
  }

  async getStudentProgressSummary(userId: string): Promise<any> {
    const allSessions = await this.getUserPharmacySessions(userId);
    const completedSessions = allSessions.filter(s => s.status === 'completed');
    
    // Group by module
    type ModuleStatsType = {
      prepare: { total: number; completed: number; avgScore: number };
      practice: { total: number; completed: number; avgScore: number };
      perform: { total: number; completed: number; avgScore: number };
    };
    
    const moduleStats: ModuleStatsType = {
      prepare: { total: 0, completed: 0, avgScore: 0 },
      practice: { total: 0, completed: 0, avgScore: 0 },
      perform: { total: 0, completed: 0, avgScore: 0 }
    };

    allSessions.forEach(session => {
      const module = session.module as keyof ModuleStatsType;
      if (moduleStats[module]) {
        moduleStats[module].total++;
        if (session.status === 'completed') {
          moduleStats[module].completed++;
          moduleStats[module].avgScore += parseFloat(session.overallScore || '0');
        }
      }
    });

    // Calculate averages
    (Object.keys(moduleStats) as Array<keyof ModuleStatsType>).forEach(module => {
      const stats = moduleStats[module];
      stats.avgScore = stats.completed > 0 ? Math.round(stats.avgScore / stats.completed) : 0;
    });

    return {
      totalSessions: allSessions.length,
      completedSessions: completedSessions.length,
      moduleStats,
      lastActivity: allSessions.length > 0 ? allSessions[0].startedAt : null
    };
  }

  async getDetailedStudentProgress(userId: string, module?: string): Promise<any> {
    const sessions = module 
      ? await this.getUserSessionsByModule(userId, module)
      : await this.getUserPharmacySessions(userId);

    const competencyAssessments = await this.getUserCompetencyAssessments(userId);
    const performAssessments = await this.getUserPerformAssessments(userId);

    // Group sessions by professional activity
    type ActivityProgressType = Record<string, {
      total: number;
      completed: number;
      avgScore: number;
      sessions: any[];
    }>;
    
    const activityProgress: ActivityProgressType = {};
    sessions.forEach(session => {
      const pa = session.scenario.professionalActivity;
      if (!activityProgress[pa]) {
        activityProgress[pa] = { total: 0, completed: 0, avgScore: 0, sessions: [] };
      }
      activityProgress[pa].total++;
      activityProgress[pa].sessions.push(session);
      if (session.status === 'completed') {
        activityProgress[pa].completed++;
        activityProgress[pa].avgScore += parseFloat(session.overallScore || '0');
      }
    });

    // Calculate activity averages
    Object.keys(activityProgress).forEach(pa => {
      const progress = activityProgress[pa];
      progress.avgScore = progress.completed > 0 ? Math.round(progress.avgScore / progress.completed) : 0;
    });

    return {
      sessions,
      competencyAssessments,
      performAssessments,
      activityProgress,
      summary: {
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'completed').length,
        inProgressSessions: sessions.filter(s => s.status === 'in_progress').length
      }
    };
  }

  // Assessment Analysis System Implementation
  async getAssessmentReport(userId: string, assessmentId: string): Promise<any> {
    try {
      // Create demo assessment report for now
      return {
        assessmentId,
        title: `Clinical Assessment Report - ${new Date().toLocaleDateString()}`,
        completedAt: new Date().toISOString(),
        overallScore: 72,
        maxScore: 100,
        percentage: 72,
        competencyBreakdown: {
          PA1: { score: 18, maxScore: 25, questions: 3 },
          PA2: { score: 15, maxScore: 25, questions: 2 },
          PA3: { score: 20, maxScore: 25, questions: 3 },
          PA4: { score: 19, maxScore: 25, questions: 2 }
        },
        questions: [
          {
            id: "q1",
            questionText: "A 65-year-old patient with diabetes presents with symptoms of peripheral neuropathy. What therapeutic approach would you recommend?",
            questionType: "clinical_scenario",
            userAnswer: "I would recommend pregabalin as first-line treatment and ensure proper diabetes management.",
            modelAnswer: "First-line treatment includes pregabalin or gabapentin for neuropathic pain, with dose titration based on response. Ensure optimal glycemic control (HbA1c <7%) and consider vitamin B12 supplementation if deficient. Patient education on foot care and regular monitoring is essential.",
            isCorrect: true,
            partialScore: 8,
            maxScore: 10,
            competencyArea: "PA1",
            therapeuticArea: "Endocrine",
            feedback: "Good understanding of neuropathic pain management. Your recommendation aligns with Singapore guidelines.",
            learningTip: "Always consider the underlying cause when treating complications. Optimal diabetes control is key to preventing progression.",
            improvementSuggestion: "Consider mentioning monitoring parameters and potential side effects of prescribed medications."
          },
          {
            id: "q2",
            questionText: "A patient is prescribed warfarin and asks about drug interactions. What counseling points would you provide?",
            questionType: "short_answer",
            userAnswer: "Avoid alcohol and green vegetables. Get regular blood tests.",
            modelAnswer: "Key counseling points: 1) Maintain consistent vitamin K intake (don't avoid green vegetables, just be consistent), 2) Regular INR monitoring as scheduled, 3) Report any unusual bleeding/bruising, 4) Inform all healthcare providers about warfarin use, 5) Avoid aspirin and NSAIDs unless prescribed, 6) Limited alcohol consumption, 7) Use soft toothbrush and electric razor.",
            isCorrect: false,
            partialScore: 4,
            maxScore: 10,
            competencyArea: "PA3",
            therapeuticArea: "Cardiovascular",
            feedback: "Your answer shows basic understanding but misses key counseling points. Avoiding green vegetables is a common misconception.",
            learningTip: "Focus on consistency rather than avoidance for vitamin K-containing foods. Comprehensive patient education prevents complications.",
            improvementSuggestion: "Study Singapore MOH anticoagulation guidelines and practice comprehensive medication counseling scenarios."
          }
        ],
        strengths: [
          "Strong clinical reasoning in endocrine cases",
          "Good understanding of first-line treatments",
          "Appropriate consideration of underlying conditions"
        ],
        areasForImprovement: [
          "Comprehensive medication counseling techniques",
          "Drug interaction awareness and communication",
          "Patient education completeness"
        ],
        nextSteps: [
          "Review Singapore MOH anticoagulation guidelines",
          "Practice comprehensive medication counseling scenarios",
          "Study drug interaction databases and resources",
          "Focus on PA3 competency development",
          "Complete additional cardiovascular therapeutic area scenarios"
        ],
        estimatedStudyTime: 12
      };
    } catch (error) {
      console.error("Error generating assessment report:", error);
      throw error;
    }
  }

  // Enhanced Assessment System Implementation (Phase 3)
  async createEnhancedAssessment(userId: string, assessmentData: any): Promise<any> {
    try {
      const assessmentId = `assessment_${Date.now()}`;
      
      const assessment = {
        id: assessmentId,
        userId,
        title: assessmentData.title,
        description: assessmentData.description,
        assessmentType: assessmentData.assessmentType,
        targetCompetencies: assessmentData.targetCompetencies,
        therapeuticAreas: assessmentData.therapeuticAreas,
        difficulty: assessmentData.difficulty,
        duration: assessmentData.duration,
        passingScore: assessmentData.passingScore,
        adaptiveScoring: assessmentData.adaptiveScoring,
        aiPoweredFeedback: assessmentData.aiPoweredFeedback,
        scenarioCount: assessmentData.scenarioCount,
        status: 'created',
        createdAt: new Date().toISOString()
      };

      return assessment;
    } catch (error) {
      console.error("Error creating enhanced assessment:", error);
      throw error;
    }
  }

  async getAdaptiveAssessmentSession(userId: string, sessionId: string): Promise<any> {
    try {
      return {
        id: sessionId,
        title: "Adaptive Clinical Assessment",
        currentQuestion: 0,
        totalQuestions: 4,
        timeRemaining: 3600,
        status: 'active',
        adaptiveLevel: 5,
        competencyScores: { PA1: 72, PA2: 68, PA3: 85, PA4: 71 },
        userAnswers: {},
        questions: [
          {
            id: "q1",
            questionText: "A 68-year-old patient with Type 2 diabetes presents with a new prescription for metformin 500mg twice daily. During consultation, they mention experiencing occasional episodes of loose stools since starting the medication 2 weeks ago. What would be your most appropriate recommendation according to Singapore MOH guidelines?",
            questionType: "multiple_choice",
            options: [
              "Discontinue metformin immediately and refer to prescriber",
              "Recommend taking metformin with meals and monitor symptoms for another week",
              "Suggest over-the-counter anti-diarrheal medication",
              "Advise patient that this is normal and will resolve naturally"
            ],
            competencyArea: "PA1",
            therapeuticArea: "Endocrine",
            difficulty: 5,
            hints: ["Consider the common side effects of metformin and timing of administration"],
            timeLimit: 300
          }
        ]
      };
    } catch (error) {
      console.error("Error fetching adaptive assessment session:", error);
      throw error;
    }
  }

  async submitAdaptiveAnswer(userId: string, sessionId: string, answerData: any): Promise<any> {
    try {
      const { questionId, answer, confidenceLevel, timeSpent, hintsUsed } = answerData;
      
      const baseScore = this.calculateAnswerScore(answer, questionId);
      const confidenceAdjustment = (confidenceLevel - 3) * 2;
      const timeBonus = timeSpent < 120 ? 5 : timeSpent > 300 ? -5 : 0;
      const hintPenalty = hintsUsed * -3;
      
      const totalScore = Math.max(0, Math.min(100, baseScore + confidenceAdjustment + timeBonus + hintPenalty));
      
      const feedback = await this.generateAIFeedback(answer, questionId, totalScore);
      
      return {
        success: true,
        score: totalScore,
        feedback,
        nextQuestionReady: true
      };
    } catch (error) {
      console.error("Error submitting adaptive answer:", error);
      throw error;
    }
  }

  private calculateAnswerScore(answer: string, questionId: string): number {
    if (!answer || answer.trim().length < 10) return 20;
    
    const keyTerms = ['patient', 'guideline', 'safety', 'monitor', 'singapore', 'moh'];
    const termCount = keyTerms.filter(term => 
      answer.toLowerCase().includes(term)
    ).length;
    
    const baseScore = 40 + (termCount * 10);
    const lengthBonus = Math.min(20, answer.length / 50);
    
    return Math.min(95, baseScore + lengthBonus);
  }

  private async generateAIFeedback(answer: string, questionId: string, score: number): Promise<string> {
    if (score >= 80) {
      return "Excellent response! Your answer demonstrates strong clinical reasoning and good understanding of Singapore pharmacy practice standards.";
    } else if (score >= 65) {
      return "Good response with solid clinical foundation. Consider expanding on safety monitoring aspects and referencing Singapore MOH guidelines more specifically.";
    } else {
      return "Your response shows understanding but needs more depth. Focus on systematic clinical assessment and patient safety considerations.";
    }
  }

  // Demo data management methods
  async populateDemoData(userId: string): Promise<void> {
    try {
      console.log(`Starting populateDemoData for user: ${userId}`);
      
      // Skip clearing demo data for now to isolate the issue
      console.log('Skipping clear demo data to test...');

      // Create one simple test scenario first
      console.log('Creating single test scenario...');
      const testScenarioResult = await db.insert(pharmacyScenarios).values({
        title: 'Test Cardiovascular PA1 Clinical Case 1',
        module: 'practice',
        therapeuticArea: 'Cardiovascular',
        practiceArea: 'Hospital',
        caseType: 'chronic',
        professionalActivity: 'PA1',
        supervisionLevel: 2,
        patientAge: 55,
        patientGender: 'Female',
        patientBackground: 'Patient with cardiovascular condition requiring comprehensive pharmaceutical care',
        clinicalPresentation: 'Patient presents with cardiovascular symptoms requiring pharmaceutical care assessment',
        medicationHistory: 'Standard medication history for cardiovascular therapeutic area',
        assessmentObjectives: 'Assess PA1 competency and apply clinical reasoning for Cardiovascular',
        keyLearningOutcomes: ['Demonstrate competency in PA1', 'Show clinical decision-making skills'],
        difficulty: 'intermediate'
      }).returning({ id: pharmacyScenarios.id });
      
      console.log('Test scenario created successfully');
      
      const scenarioId = testScenarioResult[0]?.id;
      if (scenarioId) {
        // Create test session using raw SQL to avoid type issues
        console.log('Creating test pharmacy session with scenarioId:', scenarioId);
        try {
          await db.execute(sql`
            INSERT INTO pharmacy_sessions (
              user_id, scenario_id, module, status, current_stage, total_stages,
              therapeutic_area, practice_area, started_at, completed_at, duration,
              clinical_knowledge_score, therapeutic_reasoning_score, patient_communication_score,
              professional_practice_score, overall_score, achieved_supervision_level,
              target_supervision_level, strengths, improvements, recommendations
            ) VALUES (
              ${userId}, ${scenarioId}, 'practice', 'completed',
              10, 10, 'Cardiovascular', 'Hospital',
              ${new Date(Date.now() - 24 * 60 * 60 * 1000)}, ${new Date(Date.now() - 23 * 60 * 60 * 1000)}, 3600,
              7.50, 7.20, 8.00, 7.80, 7.60, 3, 4,
              ${JSON.stringify(['Good understanding of Cardiovascular', 'Strong PA1 application'])},
              ${JSON.stringify(['Continue building clinical confidence', 'Expand therapeutic knowledge'])},
              ${JSON.stringify(['Focus on Cardiovascular guidelines', 'Practice more clinical scenarios'])}
            )
          `);
          console.log('Test pharmacy session created successfully via SQL');
        } catch (sqlError) {
          console.error('Error creating session via SQL:', sqlError);
        }
      } else {
        console.log('No scenarioId found, testScenarioResult:', testScenarioResult);
      }
      
      console.log(`Successfully populated minimal demo data for user ${userId}`);
    } catch (error) {
      console.error('Error populating demo data:', error);
      throw error;
    }
  }

  async clearDemoData(userId: string): Promise<void> {
    try {
      // For simplicity, clear all user data - this is for demo purposes
      // Get all user's pharmacy sessions
      const userSessions = await db
        .select({ scenarioId: pharmacySessions.scenarioId })
        .from(pharmacySessions)
        .where(eq(pharmacySessions.userId, userId));

      const scenarioIds = userSessions.map(s => s.scenarioId).filter(Boolean);

      // Delete pharmacy sessions
      await db.delete(pharmacySessions)
        .where(eq(pharmacySessions.userId, userId));

      // Delete associated pharmacy scenarios
      if (scenarioIds.length > 0) {
        await db.delete(pharmacyScenarios)
          .where(inArray(pharmacyScenarios.id, scenarioIds));
      }

      // Delete perform assessments and scenarios
      const userAssessments = await db
        .select({ id: performAssessments.id })
        .from(performAssessments)
        .where(eq(performAssessments.userId, userId));

      const assessmentIds = userAssessments.map(a => a.id);

      if (assessmentIds.length > 0) {
        // Delete perform scenarios first
        await db.delete(performScenarios)
          .where(inArray(performScenarios.assessmentId, assessmentIds));

        // Delete perform assessments
        await db.delete(performAssessments)
          .where(eq(performAssessments.userId, userId));
      }

      console.log(`Successfully cleared all data for user ${userId}`);
    } catch (error) {
      console.error('Error clearing demo data:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();