import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { TraineeProgressModal } from "@/components/supervisor/TraineeProgressModal";
import { FeedbackModal } from "@/components/supervisor/FeedbackModal";
import { AssignScenarioModal } from "@/components/supervisor/AssignScenarioModal";
import { ManageTraineesModal } from "@/components/supervisor/ManageTraineesModal";
import { 
  useSupervisorDashboard, 
  useAssignedTrainees, 
  useTraineeProgress 
} from "@/hooks/use-supervisor-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  FileText,
  Calendar,
  Award,
  Target
} from "lucide-react";
import { Link } from "wouter";
import type { TraineeAssignmentWithDetails } from "@shared/schema";

// Helper functions
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

function formatDueDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays < 7) return `${diffInDays} days`;
  return date.toLocaleDateString();
}

function getTraineeStatus(lastActivity: string): 'on-track' | 'needs-attention' | 'behind' {
  const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceActivity <= 1) return 'on-track';
  if (daysSinceActivity <= 3) return 'needs-attention';
  return 'behind';
}

// Using TraineeAssignmentWithDetails from shared schema instead

interface SupervisorDashboardData {
  assignedTrainees: TraineeAssignmentWithDetails[];
  pendingReviews: any[];
  recentActivity: any[];
  performanceMetrics: {
    totalTrainees: number;
    averageProgress: number;
    completedSessions: number;
    pendingFeedback: number;
    averageTraineeProgress: number;
  };
  analytics: {
    competencyBreakdown: Record<string, { sessions: number; averageScore: number }>;
    moduleProgress: Record<string, { completedSessions: number; totalSessions: number }>;
    improvementTrends: Array<{ month: string; averageScore: number }>;
  };
}

export default function SupervisorDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Modal state management
  const [progressModal, setProgressModal] = useState<{ isOpen: boolean; trainee: TraineeAssignmentWithDetails | null }>({
    isOpen: false,
    trainee: null,
  });
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; trainee: TraineeAssignmentWithDetails | null }>({
    isOpen: false,
    trainee: null,
  });
  const [scenarioModal, setScenarioModal] = useState<{ isOpen: boolean; trainee: TraineeAssignmentWithDetails | null }>({
    isOpen: false,
    trainee: null,
  });
  const [manageTraineesModal, setManageTraineesModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });

  // Modal handlers
  const openProgressModal = (trainee: TraineeAssignmentWithDetails) => {
    setProgressModal({ isOpen: true, trainee });
  };
  
  const openFeedbackModal = (trainee: TraineeAssignmentWithDetails) => {
    setFeedbackModal({ isOpen: true, trainee });
  };
  
  const openScenarioModal = (trainee: TraineeAssignmentWithDetails) => {
    setScenarioModal({ isOpen: true, trainee });
  };

  const openManageTraineesModal = () => {
    setManageTraineesModal({ isOpen: true });
  };

  const closeModals = () => {
    setProgressModal({ isOpen: false, trainee: null });
    setFeedbackModal({ isOpen: false, trainee: null });
    setScenarioModal({ isOpen: false, trainee: null });
    setManageTraineesModal({ isOpen: false });
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  // Redirect if not a supervisor
  if (user?.role !== 'supervisor') {
    const redirectUrl = user?.role === 'student' ? '/dashboard' : 
                       user?.role === 'admin' ? '/admin/dashboard' : '/';
    window.location.href = redirectUrl;
    return null;
  }

  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useSupervisorDashboard(user?.id);
  const { data: assignedTrainees, isLoading: isTraineesLoading, error: traineesError } = useAssignedTrainees(user?.id);

  // Show error state if dashboard fails to load
  if (dashboardError || traineesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
              <p className="text-gray-600 mb-4">
                We're having trouble loading your dashboard data. Please try refreshing the page.
              </p>
              {(dashboardError || traineesError) && (
                <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded border border-red-200">
                  Error: {dashboardError?.message || traineesError?.message || 'Unknown error occurred'}
                </div>
              )}
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isDashboardLoading || isTraineesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.performanceMetrics || {
    totalTrainees: assignedTrainees?.length || 0,
    averageProgress: 0,
    completedSessions: 0,
    pendingFeedback: 0,
    averageTraineeProgress: 0
  };

  const recentActivity = dashboardData?.recentActivity || [];
  const pendingReviews = dashboardData?.pendingReviews || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Supervisor Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and guide your trainees through their pharmacy education journey
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  <Users className="w-4 h-4 mr-1" />
                  Supervisor
                </Badge>
                {user?.institution && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {user.institution}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => setActiveTab('scenarios')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Scenario
              </Button>
              <Button variant="outline" onClick={() => alert('Generate Report functionality coming soon!')}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Trainees"
            value={metrics.totalTrainees.toString()}
            icon={Users}
            color="blue"
            change="+2 this month"
            changeType="positive"
          />
          <MetricCard
            title="Average Progress"
            value={`${metrics.averageProgress}%`}
            icon={TrendingUp}
            color="green"
            change="+5% from last month"
            changeType="positive"
          />
          <MetricCard
            title="Completed Sessions"
            value={metrics.completedSessions.toString()}
            icon={CheckCircle}
            color="purple"
            change="+12 this week"
            changeType="positive"
          />
          <MetricCard
            title="Pending Reviews"
            value={metrics.pendingFeedback.toString()}
            icon={Clock}
            color="orange"
            change="3 overdue"
            changeType="negative"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trainees">Trainees</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 5).map((activity: any, index: number) => (
                        <ActivityItem
                          key={index}
                          icon={activity.type === 'completed' ? CheckCircle : 
                                activity.type === 'feedback_request' ? MessageSquare : AlertTriangle}
                          color={activity.type === 'completed' ? 'green' : 
                                 activity.type === 'feedback_request' ? 'blue' : 'orange'}
                          title={activity.title}
                          description={activity.description}
                          time={formatTimeAgo(activity.date)}
                          action={activity.action}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No recent activity</p>
                        <p className="text-sm text-gray-400">Activity from your trainees will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trainee Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Trainee Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignedTrainees && assignedTrainees.length > 0 ? (
                      assignedTrainees.slice(0, 3).map((trainee: TraineeAssignmentWithDetails) => (
                        <div key={trainee.id}>
                          <TraineePerformanceItem trainee={trainee} onViewClick={() => setActiveTab('trainees')} />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No trainees assigned</p>
                        <p className="text-sm text-gray-400">Trainee performance will appear here once assigned</p>
                      </div>
                    )}
                  </div>
                  {assignedTrainees && assignedTrainees.length > 3 && (
                    <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('trainees')}>
                      <Users className="w-4 h-4 mr-2" />
                      View All {assignedTrainees.length} Trainees
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pending Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Pending Reviews
                  </div>
                  <Badge variant="secondary">
                    {metrics.pendingFeedback} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingReviews.length > 0 ? (
                    pendingReviews.map((review: any, index: number) => (
                      <PendingReviewItem
                        key={review.sessionId || index}
                        trainee={review.traineeName}
                        scenario={review.scenarioTitle}
                        module={review.module}
                        priority={review.priority || 'medium'}
                        dueDate={formatDueDate(review.dueDate)}
                        sessionId={review.sessionId}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No pending reviews</p>
                      <p className="text-sm text-gray-400">Reviews will appear here when trainees complete scenarios</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainees Tab */}
          <TabsContent value="trainees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    My Trainees ({assignedTrainees?.length || 0})
                  </div>
                  <Button onClick={openManageTraineesModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign New Trainee
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedTrainees && assignedTrainees.length > 0 ? (
                  <div className="space-y-4">
                    {assignedTrainees.map((trainee: TraineeAssignmentWithDetails) => (
                      <div key={trainee.id}>
                        <TraineeDetailCard 
                          trainee={trainee} 
                          onViewProgress={openProgressModal}
                          onSendFeedback={openFeedbackModal}
                          onAssignScenario={openScenarioModal}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No trainees assigned yet</h3>
                    <p className="text-gray-600 mb-4">
                      Trainees will appear here once they are assigned to your supervision
                    </p>
                    <Button onClick={() => alert('Request Trainee Assignment functionality coming soon!')}>
                      Request Trainee Assignment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Review Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reviews</h3>
                  <p className="text-gray-600">
                    Reviews will appear here when trainees complete scenarios or assessments
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    My Scenarios
                  </div>
                  <Button onClick={() => setActiveTab('scenarios')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Scenario
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scenarios created yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create custom scenarios for your trainees to practice specific competencies
                  </p>
                  <Button onClick={() => setActiveTab('scenarios')}>
                    Create Your First Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {progressModal.trainee && (
        <TraineeProgressModal
          trainee={progressModal.trainee}
          isOpen={progressModal.isOpen}
          onClose={closeModals}
        />
      )}

      {feedbackModal.trainee && (
        <FeedbackModal
          trainee={feedbackModal.trainee}
          isOpen={feedbackModal.isOpen}
          onClose={closeModals}
          onSubmitSuccess={() => {
            // Refresh dashboard data after successful feedback submission
            window.location.reload();
          }}
        />
      )}

      {scenarioModal.trainee && (
        <AssignScenarioModal
          trainee={scenarioModal.trainee}
          isOpen={scenarioModal.isOpen}
          onClose={closeModals}
          onAssignSuccess={() => {
            // Refresh dashboard data after successful scenario assignment
            window.location.reload();
          }}
        />
      )}

      <ManageTraineesModal
        isOpen={manageTraineesModal.isOpen}
        onClose={closeModals}
        onAssignmentChange={() => {
          // Refresh dashboard data after trainee assignments change
          window.location.reload();
        }}
      />
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  icon: any;
  color: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

function MetricCard({ title, value, icon: Icon, color, change, changeType }: MetricCardProps) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600"
  };

  const changeClasses = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs ${changeClasses[changeType]}`}>{change}</p>
          </div>
          <div className={`p-3 rounded-full bg-gray-100 ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Item Component
interface ActivityItemProps {
  icon: any;
  color: string;
  title: string;
  description: string;
  time: string;
  action?: string;
}

function ActivityItem({ icon: Icon, color, title, description, time, action }: ActivityItemProps) {
  const colorClasses = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    orange: "text-orange-600 bg-orange-100"
  };

  return (
    <div className="flex items-start space-x-3">
      <div className={`p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      {action && (
        <Button size="sm" variant="outline" onClick={() => alert(`${action} - functionality coming soon!`)}>
          {action}
        </Button>
      )}
    </div>
  );
}

// Trainee Performance Item Component
interface TraineePerformanceItemProps {
  trainee: TraineeAssignmentWithDetails;
  onViewClick?: () => void;
}

function TraineePerformanceItem({ trainee, onViewClick }: TraineePerformanceItemProps) {
  // Always call hooks at the top level
  const { data: traineeProgress, isLoading: progressLoading, error: progressError } = useTraineeProgress(trainee?.traineeId);

  const name = `${trainee?.trainee?.firstName || ''} ${trainee?.trainee?.lastName || ''}`.trim() || 'Unknown Trainee';
  const progress = traineeProgress?.overallProgress || 0;
  const currentModule = traineeProgress?.currentModule || 'Not Started';
  const lastActivity = traineeProgress?.lastActivityAt || trainee?.assignedAt;
  const status = getTraineeStatus(lastActivity);
  const statusColors = {
    'on-track': 'text-green-600 bg-green-100',
    'needs-attention': 'text-yellow-600 bg-yellow-100',
    'behind': 'text-red-600 bg-red-100'
  };

  const statusLabels = {
    'on-track': 'On Track',
    'needs-attention': 'Needs Attention',
    'behind': 'Behind Schedule'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{name}</h4>
          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
        {progressLoading ? (
          <div className="text-sm text-gray-500 mb-2">
            Loading progress data...
          </div>
        ) : progressError ? (
          <div className="text-sm text-red-500 mb-2">
            Failed to load progress data
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Module: {currentModule}</span>
              <span>{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
          </>
        )}
        <p className="text-xs text-gray-500">Last active: {formatTimeAgo(lastActivity)}</p>
        {trainee.trainee.institution && (
          <p className="text-xs text-gray-500">Institution: {trainee.trainee.institution}</p>
        )}
      </div>
      <div className="ml-4">
        <Button size="sm" variant="outline" onClick={onViewClick || (() => alert('View trainee details - functionality coming soon!'))}>
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </div>
    </div>
  );
}

// Trainee Detail Card Component
interface TraineeDetailCardProps {
  trainee: TraineeAssignmentWithDetails;
  onViewProgress?: (trainee: TraineeAssignmentWithDetails) => void;
  onSendFeedback?: (trainee: TraineeAssignmentWithDetails) => void;
  onAssignScenario?: (trainee: TraineeAssignmentWithDetails) => void;
}

function TraineeDetailCard({ trainee, onViewProgress, onSendFeedback, onAssignScenario }: TraineeDetailCardProps) {
  // Always call hooks at the top level
  const { data: traineeProgress, isLoading: progressLoading, error: progressError } = useTraineeProgress(trainee?.traineeId);

  const name = `${trainee?.trainee?.firstName || ''} ${trainee?.trainee?.lastName || ''}`.trim() || 'Unknown Trainee';
  const progress = traineeProgress?.overallProgress || 0;
  const status = getTraineeStatus(traineeProgress?.lastActivityAt || trainee?.assignedAt);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">{trainee.trainee.email}</p>
              {trainee.trainee.institution && (
                <p className="text-xs text-gray-400">{trainee.trainee.institution}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge variant={status === 'on-track' ? 'default' : status === 'needs-attention' ? 'secondary' : 'destructive'}>
              {status === 'on-track' ? 'On Track' : status === 'needs-attention' ? 'Needs Attention' : 'Behind Schedule'}
            </Badge>
            <p className="text-sm text-gray-500 mt-1">Assigned: {formatTimeAgo(trainee.assignedAt.toString())}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {traineeProgress && (
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="font-medium text-gray-900">{traineeProgress.completedSessions || 0}</p>
              <p className="text-gray-600">Completed</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="font-medium text-gray-900">{traineeProgress.averageScore || 0}%</p>
              <p className="text-gray-600">Avg Score</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="font-medium text-gray-900">{traineeProgress.pendingReviews || 0}</p>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onViewProgress?.(trainee)}>
            <Eye className="w-4 h-4 mr-2" />
            View Progress
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onSendFeedback?.(trainee)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Feedback
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onAssignScenario?.(trainee)}>
            <Target className="w-4 h-4 mr-2" />
            Assign Scenario
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Pending Review Item Component
interface PendingReviewItemProps {
  trainee: string;
  scenario: string;
  module: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  sessionId: string;
}

function PendingReviewItem({ trainee, scenario, module, priority, dueDate, sessionId }: PendingReviewItemProps) {
  const priorityColors = {
    high: 'text-red-600 bg-red-100',
    medium: 'text-yellow-600 bg-yellow-100',
    low: 'text-green-600 bg-green-100'
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-gray-900">{trainee}</h4>
          <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[priority]}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
        </div>
        <p className="text-sm text-gray-600">{scenario}</p>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <span>Module: {module}</span>
          <span className="mx-2">•</span>
          <span>Due: {dueDate}</span>
        </div>
      </div>
      <div className="ml-4">
        <Button size="sm" onClick={() => alert('Review functionality coming soon!')}>
          Review
        </Button>
      </div>
    </div>
  );
}