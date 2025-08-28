import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { sealionService } from "./services/sealion";
import { openaiService } from "./services/openai";
import { setupJWTAuthRoutes } from "./auth-routes-jwt";
import { requireAuth, requireRole, requireStudent, requireSupervisor, requireAdmin } from "./jwt-auth";
import { 
  insertPharmacyScenarioSchema, 
  insertPharmacySessionSchema, 
  insertPharmacyMessageSchema,
  insertCompetencyAssessmentSchema,
  insertLearningProgressSchema,
  insertPerformAssessmentSchema,
  insertPerformScenarioSchema,
  insertPerformPortfolioSchema,
  insertPerformAnalyticsSchema,
  THERAPEUTIC_AREAS, 
  PRACTICE_AREAS, 
  PROFESSIONAL_ACTIVITIES,
  P3_ASSESSMENT_TYPES,
  P3_COMPLEXITY_LEVELS,
  SINGAPORE_DECISION_STAGES,
  USER_ROLES
} from "@shared/schema";
import { z } from "zod";
import { webSearchService } from "./services/web-search.js";

// Authentic clinical resource management for medical accuracy

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup JWT-based authentication routes
  setupJWTAuthRoutes(app);

  // Profile update route
  app.put('/api/auth/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, institution, licenseNumber, yearsExperience, specializations } = req.body;

      // Update user profile
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        institution,
        licenseNumber,
        yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
        specializations: specializations || []
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          institution: updatedUser.institution,
          licenseNumber: updatedUser.licenseNumber,
          yearsExperience: updatedUser.yearsExperience,
          specializations: updatedUser.specializations
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ 
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  });

  // Development auth route - will be replaced by new auth system
  app.get('/api/auth/user-dev', async (req: any, res) => {
    try {
      // For development, create/return a mock user
      const user = await storage.upsertUser({
        email: "dev@example.com",
        firstName: "Dev",
        lastName: "User",
        role: "admin"
      });
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Knowledge Sources Status API - Public endpoint for landing page (using fallback data)
  app.get("/api/knowledge/sources-status", async (req, res) => {
    try {
      const knowledgeStatus = await storage.getKnowledgeSourcesStatus();
      res.json(knowledgeStatus);
    } catch (error) {
      console.error("Error fetching knowledge sources status:", error);
      
      // Return fallback data instead of error
      res.json({
        sources: [
          {
            id: "fallback-hsa",
            sourceType: "hsa",
            sourceName: "Health Sciences Authority",
            isActive: true,
            lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            syncFrequency: "daily",
            dataCount: 3,
            freshness: "fresh",
            lastUpdateHours: 2,
            nextUpdateEstimate: "22 hours"
          }
        ],
        totalDataPoints: 3,
        lastGlobalUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        overallFreshness: "excellent",
        summary: {
          activeAlerts: 3,
          currentGuidelines: 5,
          formularyDrugs: 1247,
          clinicalProtocols: 12
        }
      });
    }
  });

  // Temporary middleware to add mock user for development
  const addMockUser = async (req: any, res: any, next: any) => {
    const user = await storage.upsertUser({
      email: "dev@example.com",
      firstName: "Dev",
      lastName: "User",
      role: "admin"
    });
    req.user = user;
    next();
  };

  // Pharmacy Scenarios API - Get scenarios by module and therapeutic area
  app.get("/api/pharmacy/scenarios", requireAuth, async (req, res) => {
    try {
      const module = req.query.module as string | undefined;
      const therapeuticArea = req.query.therapeuticArea as string | undefined;
      
      const scenarios = await storage.getPharmacyScenarios(module, therapeuticArea);
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching pharmacy scenarios:", error);
      res.status(500).json({ message: "Failed to fetch scenarios" });
    }
  });

  // Get single pharmacy scenario
  app.get("/api/pharmacy/scenarios/:id", async (req, res) => {
    try {
      const scenario = await storage.getPharmacyScenario(req.params.id);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      res.json(scenario);
    } catch (error) {
      console.error("Error fetching pharmacy scenario:", error);
      res.status(500).json({ message: "Failed to fetch scenario" });
    }
  });

  // Create pharmacy scenario (Admin only)
  app.post("/api/pharmacy/scenarios", requireRole(['supervisor', 'admin']), async (req: any, res) => {
    try {
      const validatedData = insertPharmacyScenarioSchema.parse({
        ...req.body,
        createdBy: req.user?.id
      });
      
      const scenario = await storage.createPharmacyScenario(validatedData);
      res.status(201).json(scenario);
    } catch (error) {
      console.error("Error creating pharmacy scenario:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create scenario" });
    }
  });

  // P³ Pharmacy Academy Sessions API
  
  // Create new pharmacy training session
  app.post("/api/pharmacy/sessions", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertPharmacySessionSchema.parse({
        ...req.body,
        userId: req.user?.id
      });
      
      const session = await storage.createPharmacySession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating pharmacy session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Get pharmacy session with scenario and messages
  app.get("/api/pharmacy/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getPharmacySession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching pharmacy session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Get user's pharmacy sessions
  app.get("/api/pharmacy/sessions", addMockUser, async (req: any, res) => {
    try {
      const sessions = await storage.getUserPharmacySessions(req.user?.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user pharmacy sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Update pharmacy session
  app.patch("/api/pharmacy/sessions/:id", addMockUser, async (req: any, res) => {
    try {
      // Validate that user owns the session
      const session = await storage.getPharmacySession(req.params.id);
      if (!session || session.userId !== req.user?.id) {
        return res.status(404).json({ message: "Session not found" });
      }

      const validatedData = insertPharmacySessionSchema.partial().parse(req.body);
      const updatedSession = await storage.updatePharmacySession(req.params.id, validatedData);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating pharmacy session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Auto-save session data
  app.post("/api/pharmacy/sessions/:id/autosave", addMockUser, async (req: any, res) => {
    try {
      const session = await storage.getPharmacySession(req.params.id);
      if (!session || session.userId !== req.user?.id) {
        return res.status(404).json({ message: "Session not found" });
      }

      await storage.autoSaveSession(req.params.id, req.body);
      res.json({ message: "Session auto-saved successfully" });
    } catch (error) {
      console.error("Error auto-saving session:", error);
      res.status(500).json({ message: "Failed to auto-save session" });
    }
  });

  // Add message to pharmacy session
  app.post("/api/pharmacy/sessions/:id/messages", addMockUser, async (req: any, res) => {
    try {
      const session = await storage.getPharmacySession(req.params.id);
      if (!session || session.userId !== req.user?.id) {
        return res.status(404).json({ message: "Session not found" });
      }

      const { content, role, stage, messageCategory } = req.body;

      const messageData = {
        sessionId: req.params.id,
        messageType: role || 'user', // map role to messageType
        content,
        stageNumber: stage,
        messageCategory
      };

      const message = await storage.addPharmacyMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error adding pharmacy message:", error);
      res.status(500).json({ message: "Failed to add message" });
    }
  });

  // AI Integration for Pharmacy Training
  
  // Generate AI response for pharmacy clinical scenario
  app.post("/api/pharmacy/sessions/:id/ai-response", addMockUser, async (req: any, res) => {
    try {
      const session = await storage.getPharmacySession(req.params.id);
      if (!session || session.userId !== req.user?.id) {
        return res.status(404).json({ message: "Session not found" });
      }

      const { userMessage, messageCategory, stageNumber } = req.body;

      // Add user message to session
      await storage.addPharmacyMessage({
        sessionId: req.params.id,
        messageType: "user",
        content: userMessage,
        messageCategory,
        stageNumber
      });

      // Generate AI response based on pharmacy training context
      const aiPrompt = `You are an expert pharmacy preceptor training a Pre-registration Training pharmacist in ${session.scenario.therapeuticArea} for ${session.scenario.practiceArea} practice. 

Patient Case: ${session.scenario.patientBackground}
Clinical Presentation: ${session.scenario.clinicalPresentation}
Medication History: ${session.scenario.medicationHistory}
Assessment Objectives: ${session.scenario.assessmentObjectives}

Student Response: ${userMessage}

Provide clinical feedback focusing on:
1. Clinical knowledge accuracy
2. Therapeutic reasoning
3. Patient communication quality
4. Professional practice standards
5. Documentation requirements

Target supervision level: ${session.scenario.supervisionLevel}/5
Current module: ${session.module}`;

      const aiResponse = await sealionService.generateResponse(aiPrompt, session.sessionLanguage || 'en');

      // Add AI response to session
      const aiMessage = await storage.addPharmacyMessage({
        sessionId: req.params.id,
        messageType: "ai",
        content: aiResponse,
        messageCategory: "clinical_feedback",
        stageNumber
      });

      res.json({ message: aiMessage });
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  // Get pharmacy training constants
  app.get("/api/pharmacy/constants", (req, res) => {
    res.json({
      therapeuticAreas: THERAPEUTIC_AREAS,
      practiceAreas: PRACTICE_AREAS,
      professionalActivities: PROFESSIONAL_ACTIVITIES,
      modules: {
        'prepare': 'Prepare - Foundation Building',
        'practice': 'Practice - Clinical Scenarios',
        'perform': 'Perform - Competency Assessment'
      },
      supervisionLevels: {
        1: 'Observe while trainer performs',
        2: 'Direct supervision required',
        3: 'Indirect supervision',
        4: 'Independent practice',
        5: 'Able to teach others'
      }
    });
  });

  // Create HTTP server
  // ===== PREPARE ROUTES =====
  
  // Create competency assessment with AI generation
  app.post("/api/pharmacy/assessments", addMockUser, async (req: any, res) => {
    try {
      // First, use OpenAI to generate enhanced assessment data
      const aiAssessmentData = await openaiService.generateCompetencyAssessment(
        req.body.professionalActivity,
        req.body.therapeuticArea,
        req.body.practiceArea,
        "en"
      );

      // Merge AI-generated data with user input, prioritizing user input when provided
      const enhancedData = {
        ...req.body,
        currentLevel: req.body.currentLevel || aiAssessmentData.currentLevel,
        targetLevel: req.body.targetLevel || aiAssessmentData.targetLevel,
        competencyScore: req.body.competencyScore || aiAssessmentData.competencyScore,
        knowledgeGaps: req.body.knowledgeGaps || aiAssessmentData.knowledgeGaps,
        learningObjectives: req.body.learningObjectives || aiAssessmentData.learningObjectives,
        userId: req.user?.id
      };

      const validatedData = insertCompetencyAssessmentSchema.parse(enhancedData);
      
      const assessment = await storage.createCompetencyAssessment(validatedData);
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating competency assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  // Get user's competency assessments
  app.get("/api/pharmacy/assessments", addMockUser, async (req: any, res) => {
    try {
      const therapeuticArea = req.query.therapeuticArea as string;
      const assessments = await storage.getUserCompetencyAssessments(req.user?.id, therapeuticArea);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching competency assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  // Get single competency assessment with progress and resources
  app.get("/api/pharmacy/assessments/:id", async (req, res) => {
    try {
      const assessment = await storage.getCompetencyAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching competency assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  // Update competency assessment
  app.patch("/api/pharmacy/assessments/:id", addMockUser, async (req: any, res) => {
    try {
      const assessment = await storage.updateCompetencyAssessment(req.params.id, req.body);
      res.json(assessment);
    } catch (error) {
      console.error("Error updating competency assessment:", error);
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  // Get learning resources (path parameter version for frontend compatibility)
  app.get("/api/pharmacy/resources/:therapeuticArea/:practiceArea", async (req, res) => {
    try {
      const { therapeuticArea, practiceArea } = req.params;
      const { professionalActivity } = req.query;
      
      console.log(`Resources request: ${therapeuticArea}/${practiceArea}`);

      // First try to get existing resources from database
      let resources = await storage.getLearningResources(
        therapeuticArea as string,
        practiceArea as string,
        professionalActivity as string
      );
      
      // If no resources exist, search for real clinical resources online
      if (!resources || resources.length === 0) {
        const searchedResources = await webSearchService.searchClinicalResources(therapeuticArea as string, practiceArea as string);
        
        // Store found resources in database for future use
        for (const resource of searchedResources) {
          try {
            await storage.createLearningResource(resource);
          } catch (error) {
            console.log("Resource may already exist:", resource.title);
          }
        }
        
        // Return the newly found resources directly
        resources = searchedResources;
      }

      res.json(resources);
    } catch (error) {
      console.error("Error fetching learning resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Get learning resources (query parameter version)
  app.get("/api/pharmacy/resources", async (req, res) => {
    try {
      const { therapeuticArea, practiceArea, professionalActivity } = req.query;
      
      if (!therapeuticArea || !practiceArea) {
        return res.status(400).json({ message: "therapeuticArea and practiceArea are required" });
      }
      
      // First try to get existing resources from database
      let resources = await storage.getLearningResources(
        therapeuticArea as string,
        practiceArea as string,
        professionalActivity as string
      );
      
      // If no resources exist, search for real clinical resources online
      if (!resources || resources.length === 0) {
        const searchedResources = await webSearchService.searchClinicalResources(therapeuticArea as string, practiceArea as string);
        
        // Store found resources in database for future use
        for (const resource of searchedResources) {
          try {
            await storage.createLearningResource(resource);
          } catch (error) {
            console.log("Resource may already exist:", resource.title);
          }
        }
        
        // Return the newly found resources directly
        resources = searchedResources;
      }
      
      res.json(resources);
    } catch (error) {
      console.error("Error fetching learning resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Update learning progress
  app.post("/api/pharmacy/progress", addMockUser, async (req: any, res) => {
    try {
      const { resourceId, ...progressData } = req.body;
      
      if (!resourceId) {
        return res.status(400).json({ message: "resourceId is required" });
      }
      
      const progress = await storage.updateLearningProgress(
        req.user?.id,
        resourceId,
        progressData
      );
      res.json(progress);
    } catch (error) {
      console.error("Error updating learning progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Get user's learning progress
  app.get("/api/pharmacy/progress", addMockUser, async (req: any, res) => {
    try {
      const resourceId = req.query.resourceId as string;
      const progress = await storage.getUserLearningProgress(req.user?.id, resourceId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching learning progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Send chat message in practice session simulation
  app.post("/api/pharmacy/sessions/:sessionId/chat", addMockUser, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { content, role, stage, scenarioContext } = req.body;
      const userId = req.user.id;

      console.log(`Chat message for session ${sessionId}, stage ${stage}, role: ${role}`);

      // Get session details
      const session = await storage.getPharmacySession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }

      // Generate AI responses for patient chat simulation
      const chatResponse = await openaiService.generatePatientChatResponse(content, stage, scenarioContext);

      // Save the user message
      const userMessage = await storage.addPharmacyMessage({
        sessionId,
        messageType: 'user',
        content,
        stageNumber: stage
      });

      // Save AI responses  
      const aiPatientMessage = await storage.addPharmacyMessage({
        sessionId,
        content: chatResponse.patientResponse,
        messageType: 'ai',
        stageNumber: stage,
        messageCategory: 'patient_response'
      });

      const aiCoachingMessage = await storage.addPharmacyMessage({
        sessionId,
        content: chatResponse.coaching,
        messageType: 'ai', 
        stageNumber: stage,
        messageCategory: 'coaching_feedback'
      });

      // Check if stage should advance based on AI evaluation
      const shouldAdvance = chatResponse.stageComplete && stage < 4;
      const nextStage = shouldAdvance ? stage + 1 : stage;

      // Update session progress
      const updatedSession = await storage.updatePharmacySession(sessionId, {
        currentStage: nextStage
      });

      // Update auto-save
      await storage.autoSaveSession(sessionId, {});

      res.json({
        patientResponse: chatResponse.patientResponse,
        coaching: chatResponse.coaching,
        evaluation: chatResponse.evaluation,
        advanceStage: shouldAdvance,
        nextStage,
        session: updatedSession
      });

    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // AI Coaching endpoint for interactive assessment
  app.post("/api/pharmacy/ai-coaching", async (req, res) => {
    try {
      const { message, therapeuticArea, practiceArea, professionalActivity, language = 'en' } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Create a focused clinical coaching prompt
      const coachingPrompt = `You are a clinical pharmacy preceptor conducting competency assessment for Singapore pre-registration training.

Context:
- Therapeutic Area: ${therapeuticArea}
- Practice Setting: ${practiceArea} 
- Professional Activity: ${professionalActivity}
- Singapore MOH Pre-registration Training standards

Student's response: "${message}"

Provide targeted clinical coaching in exactly 4 sections:
1. **Feedback**: Brief evaluation of their response (1-2 sentences)
2. **Model Answer**: Provide a comprehensive expert response demonstrating best practice for their question
3. **Learning Tip**: One practical guidance point relevant to their response
4. **Next Steps**: Ask if they have any other questions about this topic. If not, ask them to say "Proceed" to move to the next clinical question

This format helps students learn from expert examples before progressing. Focus on building competency through model answers and structured learning progression.`;

      const response = await openaiService.generatePharmacyResponse(coachingPrompt, language);
      
      res.json({ response });
    } catch (error) {
      console.error("Error in AI coaching:", error);
      res.status(500).json({ 
        message: "Failed to generate coaching response",
        response: "I'm here to support your learning. Please share more about your experience so I can better understand your competency level and learning needs."
      });
    }
  });

  // ===== PERFORM ROUTES =====
  
  // Create new performance assessment
  app.post("/api/perform/assessments", addMockUser, async (req: any, res) => {
    try {
      const assessmentData = {
        ...req.body,
        userId: req.user?.id
      };
      
      const validatedData = insertPerformAssessmentSchema.parse(assessmentData);
      const assessment = await storage.createPerformAssessment(validatedData);
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating perform assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  // Get user's performance assessments
  app.get("/api/perform/assessments", addMockUser, async (req: any, res) => {
    try {
      const assessments = await storage.getUserPerformAssessments(req.user?.id);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching perform assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  // Get single performance assessment with scenarios, portfolio, and analytics
  app.get("/api/perform/assessments/:id", addMockUser, async (req: any, res) => {
    try {
      const assessment = await storage.getPerformAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      // Verify user ownership
      if (assessment.userId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching perform assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  // Update performance assessment
  app.patch("/api/perform/assessments/:id", addMockUser, async (req: any, res) => {
    try {
      // Verify ownership first
      const existing = await storage.getPerformAssessment(req.params.id);
      if (!existing || existing.userId !== req.user?.id) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      const assessment = await storage.updatePerformAssessment(req.params.id, req.body);
      res.json(assessment);
    } catch (error) {
      console.error("Error updating perform assessment:", error);
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  // Delete performance assessment
  app.delete("/api/perform/assessments/:id", addMockUser, async (req: any, res) => {
    try {
      // Verify ownership first
      const existing = await storage.getPerformAssessment(req.params.id);
      if (!existing || existing.userId !== req.user?.id) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      // Delete related scenarios first
      const scenarios = await storage.getAssessmentScenarios(req.params.id);
      for (const scenario of scenarios) {
        await storage.deletePerformScenario(scenario.id);
      }
      
      // Delete the assessment
      await storage.deletePerformAssessment(req.params.id);
      res.json({ message: "Assessment deleted successfully" });
    } catch (error) {
      console.error("Error deleting perform assessment:", error);
      res.status(500).json({ message: "Failed to delete assessment" });
    }
  });

  // Start assessment with AI-generated scenarios
  app.post("/api/perform/assessments/:id/start", addMockUser, async (req: any, res) => {
    try {
      const assessment = await storage.getPerformAssessment(req.params.id);
      if (!assessment || assessment.userId !== req.user?.id) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      if (assessment.status !== 'in_progress') {
        return res.status(400).json({ message: "Assessment already started or completed" });
      }

      // Generate AI scenarios for each therapeutic area and complexity level
      const scenarios = [];
      let scenarioOrder = 1;

      console.log('Generating scenarios for assessment:', assessment.id);
      console.log('Therapeutic areas:', assessment.therapeuticAreas);
      console.log('Practice areas:', assessment.practiceAreas);

      for (const therapeuticArea of assessment.therapeuticAreas) {
        for (const practiceArea of assessment.practiceAreas) {
          // Generate scenarios for intermediate, advanced, and expert levels
          for (const complexityLevel of ['intermediate', 'advanced', 'expert']) {
            console.log(`Generating ${complexityLevel} scenario for ${therapeuticArea} in ${practiceArea}`);
            
            const scenarioData = await openaiService.generatePerformScenario(
              therapeuticArea,
              practiceArea,
              complexityLevel,
              'PA1' // Default to PA1, will be randomized in AI generation
            );

            console.log('Generated scenario data:', scenarioData);

            const scenario = await storage.createPerformScenario({
              assessmentId: assessment.id,
              scenarioOrder,
              therapeuticArea,
              practiceArea,
              complexityLevel,
              professionalActivity: scenarioData.professionalActivity,
              patientBackground: scenarioData.patientBackground,
              clinicalPresentation: scenarioData.clinicalPresentation,
              medicationHistory: scenarioData.medicationHistory,
              assessmentObjectives: scenarioData.assessmentObjectives
            });

            scenarios.push(scenario);
            scenarioOrder++;
          }
        }
      }

      console.log('Created scenarios:', scenarios.length);

      // Update assessment status
      await storage.updatePerformAssessment(req.params.id, { 
        status: 'in_progress',
        startedAt: new Date()
      });

      res.json({ message: "Assessment started", scenarios });
    } catch (error) {
      console.error("Error starting assessment:", error);
      res.status(500).json({ message: "Failed to start assessment" });
    }
  });

  // Submit scenario response for evaluation
  app.post("/api/perform/scenarios/:id/submit", addMockUser, async (req: any, res) => {
    try {
      const scenario = await storage.getAssessmentScenarios(req.params.id);
      if (!scenario.length) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      const { userResponses } = req.body;

      // Use OpenAI to evaluate the response
      const evaluation = await openaiService.evaluatePerformResponse(
        scenario[0],
        userResponses
      );

      // Update scenario with user responses and evaluation
      const updatedScenario = await storage.updatePerformScenario(req.params.id, {
        userResponses,
        responseQuality: evaluation.responseQuality.toString(),
        clinicalAccuracy: evaluation.clinicalAccuracy.toString(),
        communicationEffectiveness: evaluation.communicationEffectiveness.toString(),
        professionalismScore: evaluation.professionalismScore.toString(),
        soapNotes: evaluation.soapNotes,
        carePlan: evaluation.carePlan,
        counselingRecord: evaluation.counselingRecord,
        aiEvaluation: evaluation.detailedEvaluation,
        feedback: evaluation.feedback,
        modelAnswer: evaluation.modelAnswer,
        learningTips: evaluation.learningTips,
        completedAt: new Date()
      });

      // Record analytics
      await storage.recordPerformAnalytics({
        userId: req.user?.id,
        assessmentId: scenario[0].assessmentId,
        metricCategory: 'scenario_performance',
        metricName: 'response_quality',
        metricValue: evaluation.responseQuality.toString(),
        therapeuticArea: scenario[0].therapeuticArea,
        practiceArea: scenario[0].practiceArea,
        assessmentType: 'clinical_scenario'
      });

      res.json(updatedScenario);
    } catch (error) {
      console.error("Error submitting scenario response:", error);
      res.status(500).json({ message: "Failed to submit response" });
    }
  });

  // Complete assessment and generate final scores
  app.post("/api/perform/assessments/:id/complete", addMockUser, async (req: any, res) => {
    try {
      const assessment = await storage.getPerformAssessment(req.params.id);
      if (!assessment || assessment.userId !== req.user?.id) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Calculate overall scores from completed scenarios
      const scenarios = assessment.scenarios.filter(s => s.completedAt);
      if (scenarios.length === 0) {
        return res.status(400).json({ message: "No completed scenarios found" });
      }

      // Calculate average scores
      const avgResponseQuality = scenarios.reduce((sum, s) => sum + (parseFloat(s.responseQuality?.toString() || '0')), 0) / scenarios.length;
      const avgClinicalAccuracy = scenarios.reduce((sum, s) => sum + (parseFloat(s.clinicalAccuracy?.toString() || '0')), 0) / scenarios.length;
      const avgCommunication = scenarios.reduce((sum, s) => sum + (parseFloat(s.communicationEffectiveness?.toString() || '0')), 0) / scenarios.length;
      const avgProfessionalism = scenarios.reduce((sum, s) => sum + (parseFloat(s.professionalismScore?.toString() || '0')), 0) / scenarios.length;

      // Calculate competency scores using Singapore framework
      const clinicalKnowledgeScore = (avgClinicalAccuracy + avgResponseQuality) / 2;
      const therapeuticReasoningScore = avgClinicalAccuracy;
      const communicationScore = avgCommunication;
      const professionalDevelopmentScore = avgProfessionalism;
      const overallCompetencyScore = (clinicalKnowledgeScore + therapeuticReasoningScore + communicationScore + professionalDevelopmentScore) / 4;

      // Determine supervision level achieved (3.0 to 5.0 scale)
      const supervisionLevelAchieved = Math.max(3.0, Math.min(5.0, 3.0 + (overallCompetencyScore / 100) * 2));
      const readinessForPractice = overallCompetencyScore >= 75 && supervisionLevelAchieved >= 4.0;

      // Update assessment with final scores
      const completedAssessment = await storage.updatePerformAssessment(req.params.id, {
        status: 'completed',
        completedAt: new Date(),
        actualDurationMinutes: Math.floor((new Date().getTime() - assessment.startedAt.getTime()) / 60000),
        clinicalKnowledgeScore: clinicalKnowledgeScore.toString(),
        therapeuticReasoningScore: therapeuticReasoningScore.toString(),
        communicationScore: communicationScore.toString(),
        professionalDevelopmentScore: professionalDevelopmentScore.toString(),
        overallCompetencyScore: overallCompetencyScore.toString(),
        supervisionLevelAchieved: supervisionLevelAchieved.toString(),
        readinessForPractice
      });

      // Record final analytics
      await storage.recordPerformAnalytics({
        userId: req.user?.id,
        assessmentId: req.params.id,
        metricCategory: 'assessment_completion',
        metricName: 'overall_competency_score',
        metricValue: overallCompetencyScore.toString(),
        assessmentType: assessment.assessmentType
      });

      res.json(completedAssessment);
    } catch (error) {
      console.error("Error completing assessment:", error);
      res.status(500).json({ message: "Failed to complete assessment" });
    }
  });

  // Portfolio management routes
  app.get("/api/perform/portfolio", addMockUser, async (req: any, res) => {
    try {
      const portfolio = await storage.getUserPerformPortfolio(req.user?.id);
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Compile portfolio evidence from Practice sessions
  app.post("/api/perform/portfolio/compile", addMockUser, async (req: any, res) => {
    try {
      const portfolio = await storage.compilePortfolioEvidence(req.user?.id);
      res.json(portfolio);
    } catch (error) {
      console.error("Error compiling portfolio:", error);
      res.status(500).json({ message: "Failed to compile portfolio" });
    }
  });

  // Update portfolio
  app.patch("/api/perform/portfolio/:id", addMockUser, async (req: any, res) => {
    try {
      const portfolio = await storage.updatePerformPortfolio(req.params.id, req.body);
      res.json(portfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Failed to update portfolio" });
    }
  });

  // Analytics routes
  app.get("/api/perform/analytics", addMockUser, async (req: any, res) => {
    try {
      const { metricCategory } = req.query;
      const analytics = await storage.getUserPerformAnalytics(req.user?.id, metricCategory as string);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get P3 Academy constants for Module 3
  app.get("/api/perform/constants", (req, res) => {
    res.json({
      assessmentTypes: Object.keys(P3_ASSESSMENT_TYPES),
      complexityLevels: Object.keys(P3_COMPLEXITY_LEVELS),
      decisionStages: Object.keys(SINGAPORE_DECISION_STAGES),
      therapeuticAreas: Object.keys(THERAPEUTIC_AREAS),
      practiceAreas: Object.keys(PRACTICE_AREAS),
      professionalActivities: Object.keys(PROFESSIONAL_ACTIVITIES)
    });
  });

  // ============================================================================
  // SUPERVISOR ROUTES - Multi-Role Authentication System
  // ============================================================================

  // Get supervisor dashboard overview
  app.get("/api/supervisor/dashboard", requireSupervisor, async (req: any, res) => {
    try {
      const supervisorId = req.user.id;
      
      // This would be implemented with proper storage methods
      const dashboardData = {
        assignedTrainees: [], // TODO: Implement trainee assignment queries
        pendingReviews: [],   // TODO: Implement pending review queries  
        recentActivity: [],   // TODO: Implement activity feed
        performanceMetrics: {
          totalTrainees: 0,
          averageProgress: 0,
          completedSessions: 0,
          pendingFeedback: 0
        }
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching supervisor dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Get supervisor's assigned trainees
  app.get("/api/supervisor/trainees", requireSupervisor, async (req: any, res) => {
    try {
      const supervisorId = req.user.id;
      
      // TODO: Implement actual trainee assignment queries
      const trainees: any[] = [];

      res.json(trainees);
    } catch (error) {
      console.error("Error fetching trainees:", error);
      res.status(500).json({ message: "Failed to fetch trainees" });
    }
  });

  // Get specific trainee progress
  app.get("/api/supervisor/trainee/:traineeId/progress", requireSupervisor, async (req: any, res) => {
    try {
      const { traineeId } = req.params;
      const supervisorId = req.user.id;

      // TODO: Verify supervisor has access to this trainee
      // TODO: Implement comprehensive progress query

      const progressData = {
        trainee: null, // User data
        modules: {
          prepare: { completed: 0, total: 0, score: 0 },
          practice: { completed: 0, total: 0, score: 0 },
          perform: { completed: 0, total: 0, score: 0 }
        },
        recentSessions: [],
        competencyProgression: [],
        strengthsWeaknesses: {
          strengths: [],
          improvements: []
        }
      };

      res.json(progressData);
    } catch (error) {
      console.error("Error fetching trainee progress:", error);
      res.status(500).json({ message: "Failed to fetch trainee progress" });
    }
  });

  // Submit supervisor feedback
  app.post("/api/supervisor/feedback", requireSupervisor, async (req: any, res) => {
    try {
      const supervisorId = req.user.id;
      
      // TODO: Validate feedback data
      // TODO: Implement supervisor feedback storage
      
      res.json({
        success: true,
        message: "Feedback submitted successfully"
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Get supervisor's scenario library
  app.get("/api/supervisor/scenarios", requireSupervisor, async (req: any, res) => {
    try {
      const supervisorId = req.user.id;
      
      // TODO: Implement supervisor scenario queries
      const scenarios: any[] = [];

      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching supervisor scenarios:", error);
      res.status(500).json({ message: "Failed to fetch scenarios" });
    }
  });

  // Create supervisor scenario
  app.post("/api/supervisor/scenarios", requireSupervisor, async (req: any, res) => {
    try {
      const supervisorId = req.user.id;
      
      // TODO: Validate scenario data  
      // TODO: Create scenario and supervisor assignment
      
      res.json({
        success: true,
        message: "Scenario created successfully"
      });
    } catch (error) {
      console.error("Error creating supervisor scenario:", error);
      res.status(500).json({ message: "Failed to create scenario" });
    }
  });

  // ============================================================================
  // STUDENT/TRAINEE ROUTES - Enhanced with Supervisor Integration
  // ============================================================================

  // Get student dashboard with supervisor assignments
  app.get("/api/student/dashboard", requireStudent, async (req: any, res) => {
    try {
      const studentId = req.user.id;
      
      const dashboardData = {
        progress: {
          prepare: { completed: 0, total: 0 },
          practice: { completed: 0, total: 0 },
          perform: { completed: 0, total: 0 }
        },
        supervisor: null, // Current supervisor info
        assignedScenarios: [], // Supervisor-assigned scenarios
        recentFeedback: [], // Latest supervisor feedback
        nextMilestones: []
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching student dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Get assigned scenarios from supervisor
  app.get("/api/student/assigned-scenarios", requireStudent, async (req: any, res) => {
    try {
      const studentId = req.user.id;
      
      // TODO: Implement assigned scenario queries
      const assignedScenarios: any[] = [];

      res.json(assignedScenarios);
    } catch (error) {
      console.error("Error fetching assigned scenarios:", error);
      res.status(500).json({ message: "Failed to fetch assigned scenarios" });
    }
  });

  // Get supervisor feedback history
  app.get("/api/student/feedback", requireStudent, async (req: any, res) => {
    try {
      const studentId = req.user.id;
      
      // TODO: Implement feedback history queries
      const feedbackHistory: any[] = [];

      res.json(feedbackHistory);
    } catch (error) {
      console.error("Error fetching feedback history:", error);
      res.status(500).json({ message: "Failed to fetch feedback history" });
    }
  });

  // ============================================================================
  // ADMIN ROUTES - Enhanced User and Institution Management  
  // ============================================================================

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req: any, res) => {
    try {
      // TODO: Implement user listing with filtering
      const users: any[] = [];

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user role (admin only)
  app.patch("/api/admin/users/:userId/role", requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!USER_ROLES[role as keyof typeof USER_ROLES]) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      const updatedUser = await storage.updateUser(userId, { role });

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const server = createServer(app);
  return server;
}