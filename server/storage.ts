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
import { eq, desc, and, count, avg, sql } from "drizzle-orm";

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
      .innerJoin(pharmacyScenarios, eq(pharmacySessions.scenarioId, pharmacyScenarios.id))
      .where(eq(pharmacySessions.id, id));

    if (!session) return undefined;

    const messages = await this.getSessionMessages(id);
    return { ...session, messages };
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
        return { ...session, messages };
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
}

export const storage = new DatabaseStorage();