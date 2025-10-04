import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  useOrganizationAnalytics,
  useActivityLogs
} from "@/hooks/use-org-admin-data";
import { StatsCard } from "@/components/org-admin/StatsCard";
import { QuickActionButton } from "@/components/org-admin/QuickActionButton";
import { ActivityFeedItem } from "@/components/org-admin/ActivityFeedItem";
import { OrgAdminNav } from "@/components/org-admin/OrgAdminNav";
import {
  Users,
  UserCheck,
  Activity,
  TrendingUp,
  UserPlus,
  FileUp,
  FlaskConical,
  ArrowLeft
} from "lucide-react";

export default function OrgAdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showCreateScenarioModal, setShowCreateScenarioModal] = useState(false);

  // Fetch analytics and activity data
  const { data: analytics, isLoading: analyticsLoading } = useOrganizationAnalytics();
  const { data: activityLogs, isLoading: activityLoading } = useActivityLogs();

  // Redirect if not org admin
  if (user?.role !== 'org_admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the organization admin dashboard.
            </p>
            <Button onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = analytics?.metrics || {};
  const recentActivity = activityLogs?.activityLogs || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">P³ Pharmacy Academy</h1>
              <span className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                Organization Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName || 'Admin'} {user?.lastName || ''}
              </span>
              <button
                onClick={async () => {
                  const { logout } = await import('@/lib/auth-logout');
                  await logout();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-navigation */}
      <OrgAdminNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Overview of your organization's training activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={analyticsLoading ? "..." : stats.totalUsers || 0}
            icon={Users}
            description="All users in organization"
          />
          <StatsCard
            title="Active Users"
            value={analyticsLoading ? "..." : stats.activeUsers || 0}
            icon={UserCheck}
            description="Currently active accounts"
          />
          <StatsCard
            title="Sessions This Month"
            value={analyticsLoading ? "..." : stats.totalSessions || 0}
            icon={Activity}
            description="Training sessions completed"
          />
          <StatsCard
            title="Average Score"
            value={analyticsLoading ? "..." : `${stats.averageCompetencyScore || 0}%`}
            icon={TrendingUp}
            description="Across all assessments"
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <QuickActionButton
                label="Add User"
                icon={UserPlus}
                onClick={() => setLocation("/org-admin/users")}
                variant="default"
              />
              <QuickActionButton
                label="Upload Document"
                icon={FileUp}
                onClick={() => setLocation("/org-admin/documents")}
                variant="outline"
              />
              <QuickActionButton
                label="Create Scenario"
                icon={FlaskConical}
                onClick={() => setLocation("/org-admin/scenarios")}
                variant="outline"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button
              variant="link"
              onClick={() => setLocation("/org-admin/analytics")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading activity...
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            ) : (
              <div className="space-y-0">
                {recentActivity.slice(0, 10).map((activity: any, index: number) => (
                  <ActivityFeedItem
                    key={activity.id || index}
                    activityType={activity.activityType}
                    description={activity.description || `${activity.activityType} activity`}
                    timestamp={activity.createdAt || activity.timestamp}
                    userName={activity.userId}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
