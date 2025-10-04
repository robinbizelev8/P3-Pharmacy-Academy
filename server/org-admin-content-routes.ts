import type { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { requireAuth, requireOrgAdmin, checkAccountStatus } from "./jwt-auth";

// Document management schemas
const uploadDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  filePath: z.string().min(1),
  fileSize: z.number().optional(),
  category: z.string().optional(),
  therapeuticAreas: z.array(z.string()).default([]),
  practiceAreas: z.array(z.string()).default([]),
  professionalActivities: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  targetUserIds: z.array(z.string()).default([]),
  targetRoles: z.array(z.string()).default([]),
});

// Scenario management schemas
const createScenarioSchema = z.object({
  title: z.string().min(1),
  module: z.enum(['prepare', 'practice', 'perform']),
  therapeuticArea: z.string().min(1),
  practiceArea: z.enum(['hospital', 'community']),
  caseType: z.string().min(1),
  professionalActivity: z.enum(['PA1', 'PA2', 'PA3', 'PA4']),
  supervisionLevel: z.number().min(1).max(5),
  patientAge: z.number().optional(),
  patientGender: z.string().optional(),
  patientBackground: z.string().min(1),
  clinicalPresentation: z.string().min(1),
  medicationHistory: z.string().min(1),
  assessmentObjectives: z.string().min(1),
  keyLearningOutcomes: z.array(z.string()).optional(),
  difficulty: z.enum(['foundation', 'intermediate', 'advanced']).default('intermediate'),
  status: z.enum(['active', 'draft', 'inactive']).default('draft'),
});

// Knowledge base management schemas
const triggerKnowledgeSyncSchema = z.object({
  sourceType: z.enum(['hsa', 'moh', 'spc', 'ndf', 'psa', 'healthhub', 'smj']),
  sourceName: z.string().min(1),
  baseUrl: z.string().url(),
  apiEndpoint: z.string().optional(),
  syncFrequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
});

export function setupOrgAdminContentRoutes(app: Express) {
  // ======================
  // DOCUMENT MANAGEMENT ROUTES
  // ======================

  // Upload document
  app.post('/api/org-admin/documents',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const validation = uploadDocumentSchema.safeParse(req.body);

        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const organizationId = currentUser.role === 'admin'
          ? (req.body.organizationId || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const documentData = {
          ...validation.data,
          organizationId,
          uploadedBy: currentUser.id,
        };

        const document = await storage.createDocument(documentData);

        // Log activity
        await storage.logActivity({
          organizationId,
          userId: currentUser.id,
          activityType: 'document_upload',
          activityCategory: 'documentation',
          description: `Uploaded document: ${document.title}`,
          resourceType: 'document',
          resourceId: document.id,
          result: 'success',
        });

        console.log(`Document uploaded: ${document.id} by ${currentUser.id}`);

        res.status(201).json({
          success: true,
          message: 'Document uploaded successfully',
          document
        });

      } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({
          error: 'Document upload failed',
          message: 'An error occurred while uploading the document.'
        });
      }
    }
  );

  // List documents for organization
  app.get('/api/org-admin/documents',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;

        const organizationId = currentUser.role === 'admin'
          ? (req.query.organizationId as string || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const documents = await storage.getDocumentsByOrganization(organizationId);

        res.json({
          success: true,
          documents
        });

      } catch (error) {
        console.error('List documents error:', error);
        res.status(500).json({
          error: 'Failed to fetch documents',
          message: 'An error occurred while fetching documents.'
        });
      }
    }
  );

  // Delete document
  app.delete('/api/org-admin/documents/:documentId',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const { documentId } = req.params;

        const document = await storage.getDocumentById(documentId);
        if (!document) {
          return res.status(404).json({
            error: 'Document not found',
            message: 'The requested document does not exist.'
          });
        }

        // Org admins can only delete documents in their own organization
        if (currentUser.role === 'org_admin' && document.organizationId !== currentUser.organizationId) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You can only manage documents in your own organization.'
          });
        }

        await storage.deleteDocument(documentId);

        console.log(`Document deleted: ${documentId} by ${currentUser.id}`);

        res.json({
          success: true,
          message: 'Document deleted successfully'
        });

      } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
          error: 'Document deletion failed',
          message: 'An error occurred while deleting the document.'
        });
      }
    }
  );

  // ======================
  // SCENARIO MANAGEMENT ROUTES
  // ======================

  // Create scenario
  app.post('/api/org-admin/scenarios',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const validation = createScenarioSchema.safeParse(req.body);

        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const organizationId = currentUser.role === 'admin'
          ? (req.body.organizationId || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const scenarioData = {
          ...validation.data,
          organizationId,
          createdBy: currentUser.id,
        };

        const scenario = await storage.createScenario(scenarioData);

        // Log activity
        await storage.logActivity({
          organizationId,
          userId: currentUser.id,
          activityType: 'scenario_created',
          activityCategory: 'administration',
          description: `Created scenario: ${scenario.title}`,
          resourceType: 'scenario',
          resourceId: scenario.id,
          result: 'success',
        });

        console.log(`Scenario created: ${scenario.id} by ${currentUser.id}`);

        res.status(201).json({
          success: true,
          message: 'Scenario created successfully',
          scenario
        });

      } catch (error) {
        console.error('Create scenario error:', error);
        res.status(500).json({
          error: 'Scenario creation failed',
          message: 'An error occurred while creating the scenario.'
        });
      }
    }
  );

  // List scenarios for organization
  app.get('/api/org-admin/scenarios',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;

        const organizationId = currentUser.role === 'admin'
          ? (req.query.organizationId as string || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const scenarios = await storage.getScenariosByOrganization(organizationId);

        res.json({
          success: true,
          scenarios
        });

      } catch (error) {
        console.error('List scenarios error:', error);
        res.status(500).json({
          error: 'Failed to fetch scenarios',
          message: 'An error occurred while fetching scenarios.'
        });
      }
    }
  );

  // Update scenario
  app.patch('/api/org-admin/scenarios/:scenarioId',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const { scenarioId } = req.params;

        const scenario = await storage.getScenarioById(scenarioId);
        if (!scenario) {
          return res.status(404).json({
            error: 'Scenario not found',
            message: 'The requested scenario does not exist.'
          });
        }

        // Org admins can only update scenarios in their own organization
        if (currentUser.role === 'org_admin' && scenario.organizationId !== currentUser.organizationId) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You can only manage scenarios in your own organization.'
          });
        }

        const updatedScenario = await storage.updateScenario(scenarioId, req.body);

        console.log(`Scenario updated: ${scenarioId} by ${currentUser.id}`);

        res.json({
          success: true,
          message: 'Scenario updated successfully',
          scenario: updatedScenario
        });

      } catch (error) {
        console.error('Update scenario error:', error);
        res.status(500).json({
          error: 'Scenario update failed',
          message: 'An error occurred while updating the scenario.'
        });
      }
    }
  );

  // Delete scenario
  app.delete('/api/org-admin/scenarios/:scenarioId',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const { scenarioId } = req.params;

        const scenario = await storage.getScenarioById(scenarioId);
        if (!scenario) {
          return res.status(404).json({
            error: 'Scenario not found',
            message: 'The requested scenario does not exist.'
          });
        }

        // Org admins can only delete scenarios in their own organization
        if (currentUser.role === 'org_admin' && scenario.organizationId !== currentUser.organizationId) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You can only manage scenarios in your own organization.'
          });
        }

        await storage.deleteScenario(scenarioId);

        console.log(`Scenario deleted: ${scenarioId} by ${currentUser.id}`);

        res.json({
          success: true,
          message: 'Scenario deleted successfully'
        });

      } catch (error) {
        console.error('Delete scenario error:', error);
        res.status(500).json({
          error: 'Scenario deletion failed',
          message: 'An error occurred while deleting the scenario.'
        });
      }
    }
  );

  // ======================
  // KNOWLEDGE BASE MANAGEMENT ROUTES
  // ======================

  // Trigger knowledge base sync
  app.post('/api/org-admin/knowledge/sync',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const validation = triggerKnowledgeSyncSchema.safeParse(req.body);

        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const organizationId = currentUser.role === 'admin'
          ? (req.body.organizationId || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const sourceData = {
          ...validation.data,
          organizationId,
        };

        const knowledgeSource = await storage.createKnowledgeSource(sourceData);

        // Log activity
        await storage.logActivity({
          organizationId,
          userId: currentUser.id,
          activityType: 'knowledge_sync_triggered',
          activityCategory: 'administration',
          description: `Triggered knowledge sync: ${knowledgeSource.sourceName}`,
          resourceType: 'knowledge_source',
          resourceId: knowledgeSource.id,
          result: 'success',
        });

        console.log(`Knowledge sync triggered: ${knowledgeSource.id} by ${currentUser.id}`);

        res.status(201).json({
          success: true,
          message: 'Knowledge base sync initiated successfully',
          knowledgeSource
        });

      } catch (error) {
        console.error('Knowledge sync error:', error);
        res.status(500).json({
          error: 'Knowledge sync failed',
          message: 'An error occurred while initiating knowledge base sync.'
        });
      }
    }
  );

  // List knowledge sources for organization
  app.get('/api/org-admin/knowledge/sources',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;

        const organizationId = currentUser.role === 'admin'
          ? (req.query.organizationId as string || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const knowledgeSources = await storage.getKnowledgeSourcesByOrganization(organizationId);

        res.json({
          success: true,
          knowledgeSources
        });

      } catch (error) {
        console.error('List knowledge sources error:', error);
        res.status(500).json({
          error: 'Failed to fetch knowledge sources',
          message: 'An error occurred while fetching knowledge sources.'
        });
      }
    }
  );

  // ======================
  // ANALYTICS ROUTES
  // ======================

  // Get organization analytics overview
  app.get('/api/org-admin/analytics/overview',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;

        const organizationId = currentUser.role === 'admin'
          ? (req.query.organizationId as string || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const analytics = await storage.getOrganizationAnalytics(organizationId);

        res.json({
          success: true,
          analytics
        });

      } catch (error) {
        console.error('Get analytics overview error:', error);
        res.status(500).json({
          error: 'Failed to fetch analytics',
          message: 'An error occurred while fetching analytics.'
        });
      }
    }
  );

  // Get user activity logs
  app.get('/api/org-admin/analytics/activity',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;

        const organizationId = currentUser.role === 'admin'
          ? (req.query.organizationId as string || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const { startDate, endDate, userId, activityType } = req.query;

        const activityLogs = await storage.getActivityLogs(organizationId, {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          userId: userId as string,
          activityType: activityType as string,
        });

        res.json({
          success: true,
          activityLogs
        });

      } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({
          error: 'Failed to fetch activity logs',
          message: 'An error occurred while fetching activity logs.'
        });
      }
    }
  );

  // Get usage statistics
  app.get('/api/org-admin/analytics/usage',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;

        const organizationId = currentUser.role === 'admin'
          ? (req.query.organizationId as string || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const { periodType, startDate, endDate } = req.query;

        const usageStats = await storage.getUsageStatistics(organizationId, {
          periodType: periodType as string,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        });

        res.json({
          success: true,
          usageStats
        });

      } catch (error) {
        console.error('Get usage statistics error:', error);
        res.status(500).json({
          error: 'Failed to fetch usage statistics',
          message: 'An error occurred while fetching usage statistics.'
        });
      }
    }
  );

  // Export analytics (CSV/PDF)
  app.get('/api/org-admin/analytics/export',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;

        const organizationId = currentUser.role === 'admin'
          ? (req.query.organizationId as string || currentUser.organizationId)
          : currentUser.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const { format, reportType, startDate, endDate } = req.query;

        const exportData = await storage.exportAnalytics(organizationId, {
          format: format as string || 'csv',
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        });

        // Set appropriate headers for download
        if (format === 'csv') {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="analytics-${organizationId}-${Date.now()}.csv"`);
        } else if (format === 'pdf') {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="analytics-${organizationId}-${Date.now()}.pdf"`);
        }

        res.send(exportData);

      } catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({
          error: 'Analytics export failed',
          message: 'An error occurred while exporting analytics.'
        });
      }
    }
  );
}
