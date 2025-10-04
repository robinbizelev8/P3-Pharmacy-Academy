import type { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { requireAuth, requireAdmin, requireOrgAdmin, requireSameOrganization, checkAccountStatus } from "./jwt-auth";

// Validation schemas for organization management
const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  code: z.string().min(2, "Organization code must be at least 2 characters").max(50),
  type: z.enum(['hospital', 'community_pharmacy', 'training_center', 'educational_institution']),
  maxUsers: z.number().min(1).default(100),
  subscriptionTier: z.enum(['basic', 'professional', 'enterprise']).default('basic'),
  subscriptionExpiresAt: z.string().datetime().optional(),
});

const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['hospital', 'community_pharmacy', 'training_center', 'educational_institution']).optional(),
  isActive: z.boolean().optional(),
  maxUsers: z.number().min(1).optional(),
  subscriptionTier: z.enum(['basic', 'professional', 'enterprise']).optional(),
  subscriptionExpiresAt: z.string().datetime().optional().nullable(),
});

// User management schemas
const suspendUserSchema = z.object({
  userId: z.string(),
  reason: z.string().min(1, "Suspension reason is required"),
});

const terminateUserSchema = z.object({
  userId: z.string(),
  reason: z.string().min(1, "Termination reason is required"),
});

const reactivateUserSchema = z.object({
  userId: z.string(),
});

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['student', 'supervisor', 'org_admin']),
});

export function setupOrgAdminRoutes(app: Express) {
  // ======================
  // ADMIN ROUTES - Organization Management (Platform-wide)
  // ======================

  // Create new organization (Admin only)
  app.post('/api/admin/organizations',
    requireAuth,
    checkAccountStatus,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const validation = createOrganizationSchema.safeParse(req.body);

        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const organizationData = validation.data;

        // Check if organization code already exists
        const existingOrg = await storage.getOrganizationByCode(organizationData.code);
        if (existingOrg) {
          return res.status(409).json({
            error: 'Organization code already exists',
            message: 'An organization with this code already exists.'
          });
        }

        // Convert subscriptionExpiresAt from string to Date if present
        const orgDataWithDates = {
          ...organizationData,
          subscriptionExpiresAt: organizationData.subscriptionExpiresAt
            ? new Date(organizationData.subscriptionExpiresAt)
            : undefined
        };

        const organization = await storage.createOrganization(orgDataWithDates);

        console.log(`Organization created: ${organization.id} (${organization.name})`);

        res.status(201).json({
          success: true,
          message: 'Organization created successfully',
          organization
        });

      } catch (error) {
        console.error('Create organization error:', error);
        res.status(500).json({
          error: 'Organization creation failed',
          message: 'An error occurred while creating the organization.'
        });
      }
    }
  );

  // List all organizations (Admin only)
  app.get('/api/admin/organizations',
    requireAuth,
    checkAccountStatus,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const organizations = await storage.getAllOrganizations();

        res.json({
          success: true,
          organizations
        });

      } catch (error) {
        console.error('List organizations error:', error);
        res.status(500).json({
          error: 'Failed to fetch organizations',
          message: 'An error occurred while fetching organizations.'
        });
      }
    }
  );

  // Get organization by ID (Admin only)
  app.get('/api/admin/organizations/:id',
    requireAuth,
    checkAccountStatus,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const organization = await storage.getOrganizationById(id);

        if (!organization) {
          return res.status(404).json({
            error: 'Organization not found',
            message: 'The requested organization does not exist.'
          });
        }

        res.json({
          success: true,
          organization
        });

      } catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({
          error: 'Failed to fetch organization',
          message: 'An error occurred while fetching the organization.'
        });
      }
    }
  );

  // Update organization (Admin only)
  app.patch('/api/admin/organizations/:id',
    requireAuth,
    checkAccountStatus,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const validation = updateOrganizationSchema.safeParse(req.body);

        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const organization = await storage.getOrganizationById(id);
        if (!organization) {
          return res.status(404).json({
            error: 'Organization not found',
            message: 'The requested organization does not exist.'
          });
        }

        // Convert subscriptionExpiresAt from string to Date if present
        const updateData = {
          ...validation.data,
          subscriptionExpiresAt: validation.data.subscriptionExpiresAt !== undefined
            ? (validation.data.subscriptionExpiresAt ? new Date(validation.data.subscriptionExpiresAt) : null)
            : undefined
        };

        const updatedOrganization = await storage.updateOrganization(id, updateData);

        console.log(`Organization updated: ${id} (${updatedOrganization.name})`);

        res.json({
          success: true,
          message: 'Organization updated successfully',
          organization: updatedOrganization
        });

      } catch (error) {
        console.error('Update organization error:', error);
        res.status(500).json({
          error: 'Organization update failed',
          message: 'An error occurred while updating the organization.'
        });
      }
    }
  );

  // Activate/Deactivate organization (Admin only)
  app.patch('/api/admin/organizations/:id/status',
    requireAuth,
    checkAccountStatus,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
          return res.status(400).json({
            error: 'Invalid request',
            message: 'isActive must be a boolean value'
          });
        }

        const organization = await storage.getOrganizationById(id);
        if (!organization) {
          return res.status(404).json({
            error: 'Organization not found',
            message: 'The requested organization does not exist.'
          });
        }

        const updatedOrganization = await storage.updateOrganization(id, { isActive });

        console.log(`Organization ${isActive ? 'activated' : 'deactivated'}: ${id}`);

        res.json({
          success: true,
          message: `Organization ${isActive ? 'activated' : 'deactivated'} successfully`,
          organization: updatedOrganization
        });

      } catch (error) {
        console.error('Update organization status error:', error);
        res.status(500).json({
          error: 'Status update failed',
          message: 'An error occurred while updating organization status.'
        });
      }
    }
  );

  // Get organization statistics (Admin only)
  app.get('/api/admin/organizations/:id/stats',
    requireAuth,
    checkAccountStatus,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        const organization = await storage.getOrganizationById(id);
        if (!organization) {
          return res.status(404).json({
            error: 'Organization not found',
            message: 'The requested organization does not exist.'
          });
        }

        const stats = await storage.getOrganizationStats(id);

        res.json({
          success: true,
          stats
        });

      } catch (error) {
        console.error('Get organization stats error:', error);
        res.status(500).json({
          error: 'Failed to fetch statistics',
          message: 'An error occurred while fetching organization statistics.'
        });
      }
    }
  );

  // ======================
  // ORG ADMIN ROUTES - User Management (Organization-scoped)
  // ======================

  // Get all users in organization
  app.get('/api/org-admin/users',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;

        // Admin can specify organizationId, org_admin uses their own
        const organizationId = user.role === 'admin'
          ? (req.query.organizationId as string || user.organizationId)
          : user.organizationId;

        if (!organizationId) {
          return res.status(400).json({
            error: 'Missing organization context',
            message: 'Organization ID is required'
          });
        }

        const users = await storage.getUsersByOrganization(organizationId);

        res.json({
          success: true,
          users
        });

      } catch (error) {
        console.error('List organization users error:', error);
        res.status(500).json({
          error: 'Failed to fetch users',
          message: 'An error occurred while fetching users.'
        });
      }
    }
  );

  // Suspend user (Org Admin with permission or Admin)
  app.patch('/api/org-admin/users/:userId/suspend',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const validation = suspendUserSchema.safeParse({
          userId: req.params.userId,
          reason: req.body.reason
        });

        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const { userId, reason } = validation.data;

        // Check if org admin has permission to suspend
        if (currentUser.role === 'org_admin' && !currentUser.canSuspendUsers) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: 'You do not have permission to suspend users.'
          });
        }

        const targetUser = await storage.getUserById(userId);
        if (!targetUser) {
          return res.status(404).json({
            error: 'User not found',
            message: 'The requested user does not exist.'
          });
        }

        // Org admins can only suspend users in their own organization
        if (currentUser.role === 'org_admin' && targetUser.organizationId !== currentUser.organizationId) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You can only manage users in your own organization.'
          });
        }

        // Cannot suspend admin users
        if (targetUser.role === 'admin') {
          return res.status(403).json({
            error: 'Cannot suspend admin',
            message: 'Admin users cannot be suspended.'
          });
        }

        const updatedUser = await storage.suspendUser(userId, currentUser.id, reason);

        console.log(`User suspended: ${userId} by ${currentUser.id}`);

        res.json({
          success: true,
          message: 'User suspended successfully',
          user: updatedUser
        });

      } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({
          error: 'User suspension failed',
          message: 'An error occurred while suspending the user.'
        });
      }
    }
  );

  // Terminate user (Org Admin with permission or Admin)
  app.patch('/api/org-admin/users/:userId/terminate',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const validation = terminateUserSchema.safeParse({
          userId: req.params.userId,
          reason: req.body.reason
        });

        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const { userId, reason } = validation.data;

        // Check if org admin has permission to terminate
        if (currentUser.role === 'org_admin' && !currentUser.canTerminateUsers) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: 'You do not have permission to terminate users.'
          });
        }

        const targetUser = await storage.getUserById(userId);
        if (!targetUser) {
          return res.status(404).json({
            error: 'User not found',
            message: 'The requested user does not exist.'
          });
        }

        // Org admins can only terminate users in their own organization
        if (currentUser.role === 'org_admin' && targetUser.organizationId !== currentUser.organizationId) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You can only manage users in your own organization.'
          });
        }

        // Cannot terminate admin users
        if (targetUser.role === 'admin') {
          return res.status(403).json({
            error: 'Cannot terminate admin',
            message: 'Admin users cannot be terminated.'
          });
        }

        const updatedUser = await storage.terminateUser(userId, currentUser.id, reason);

        console.log(`User terminated: ${userId} by ${currentUser.id}`);

        res.json({
          success: true,
          message: 'User terminated successfully',
          user: updatedUser
        });

      } catch (error) {
        console.error('Terminate user error:', error);
        res.status(500).json({
          error: 'User termination failed',
          message: 'An error occurred while terminating the user.'
        });
      }
    }
  );

  // Reactivate user (Org Admin or Admin)
  app.patch('/api/org-admin/users/:userId/reactivate',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const validation = reactivateUserSchema.safeParse({
          userId: req.params.userId
        });

        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const { userId } = validation.data;

        const targetUser = await storage.getUserById(userId);
        if (!targetUser) {
          return res.status(404).json({
            error: 'User not found',
            message: 'The requested user does not exist.'
          });
        }

        // Org admins can only reactivate users in their own organization
        if (currentUser.role === 'org_admin' && targetUser.organizationId !== currentUser.organizationId) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You can only manage users in your own organization.'
          });
        }

        const updatedUser = await storage.reactivateUser(userId, currentUser.id);

        console.log(`User reactivated: ${userId} by ${currentUser.id}`);

        res.json({
          success: true,
          message: 'User reactivated successfully',
          user: updatedUser
        });

      } catch (error) {
        console.error('Reactivate user error:', error);
        res.status(500).json({
          error: 'User reactivation failed',
          message: 'An error occurred while reactivating the user.'
        });
      }
    }
  );

  // Update user role (Org Admin or Admin)
  app.patch('/api/org-admin/users/:userId/role',
    requireAuth,
    checkAccountStatus,
    requireOrgAdmin,
    async (req: Request, res: Response) => {
      try {
        const currentUser = (req as any).user;
        const validation = updateUserRoleSchema.safeParse({
          userId: req.params.userId,
          role: req.body.role
        });

        if (!validation.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.error.issues
          });
        }

        const { userId, role } = validation.data;

        const targetUser = await storage.getUserById(userId);
        if (!targetUser) {
          return res.status(404).json({
            error: 'User not found',
            message: 'The requested user does not exist.'
          });
        }

        // Org admins can only update users in their own organization
        if (currentUser.role === 'org_admin' && targetUser.organizationId !== currentUser.organizationId) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You can only manage users in your own organization.'
          });
        }

        // Note: Org admins cannot assign admin role - this is enforced by the validation schema
        // which only allows 'student', 'supervisor', 'org_admin' roles

        const updatedUser = await storage.updateUser(userId, { role });

        console.log(`User role updated: ${userId} to ${role} by ${currentUser.id}`);

        res.json({
          success: true,
          message: 'User role updated successfully',
          user: updatedUser
        });

      } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
          error: 'Role update failed',
          message: 'An error occurred while updating user role.'
        });
      }
    }
  );
}
