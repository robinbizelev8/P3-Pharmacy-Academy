import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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

interface SupervisorDashboardData {
  assignedTrainees: any[];
  pendingReviews: any[];
  recentActivity: any[];
  performanceMetrics: {
    totalTrainees: number;
    averageProgress: number;
    completedSessions: number;
    pendingFeedback: number;
  };
}

export default function SupervisorDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<SupervisorDashboardData>({
    queryKey: ["/api/supervisor/dashboard"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isDashboardLoading) {
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
    totalTrainees: 0,
    averageProgress: 0,
    completedSessions: 0,
    pendingFeedback: 0
  };

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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Scenario
              </Button>
              <Button variant="outline">
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
                    <ActivityItem
                      icon={CheckCircle}
                      color="green"
                      title="Sarah Chen completed Cardiovascular Module"
                      description="Module 2: Practice - Clinical scenario review pending"
                      time="2 hours ago"
                      action="Review"
                    />
                    <ActivityItem
                      icon={MessageSquare}
                      color="blue"
                      title="Feedback requested by David Kumar"
                      description="Module 1: PA3 competency assessment needs review"
                      time="4 hours ago"
                      action="Provide Feedback"
                    />
                    <ActivityItem
                      icon={AlertTriangle}
                      color="orange"
                      title="Portfolio submission overdue"
                      description="Jennifer Wong - Module 2 evidence compilation"
                      time="1 day ago"
                      action="Follow Up"
                    />
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
                    <TraineePerformanceItem
                      name="Sarah Chen"
                      progress={78}
                      currentModule="Practice"
                      status="on-track"
                      lastActivity="2 hours ago"
                    />
                    <TraineePerformanceItem
                      name="David Kumar"
                      progress={65}
                      currentModule="Prepare"
                      status="needs-attention"
                      lastActivity="1 day ago"
                    />
                    <TraineePerformanceItem
                      name="Jennifer Wong"
                      progress={45}
                      currentModule="Practice"
                      status="behind"
                      lastActivity="3 days ago"
                    />
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Users className="w-4 h-4 mr-2" />
                    View All Trainees
                  </Button>
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
                  <PendingReviewItem
                    trainee="Sarah Chen"
                    scenario="Cardiovascular Emergency Management"
                    module="Practice"
                    priority="high"
                    dueDate="Today"
                    sessionId="session-123"
                  />
                  <PendingReviewItem
                    trainee="David Kumar"
                    scenario="PA3 Competency Assessment"
                    module="Prepare"
                    priority="medium"
                    dueDate="Tomorrow"
                    sessionId="session-124"
                  />
                  <PendingReviewItem
                    trainee="Jennifer Wong"
                    scenario="Portfolio Evidence Review"
                    module="Perform"
                    priority="low"
                    dueDate="Next week"
                    sessionId="session-125"
                  />
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
                    My Trainees
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign New Trainee
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trainees assigned yet</h3>
                  <p className="text-gray-600 mb-4">
                    Trainees will appear here once they are assigned to your supervision
                  </p>
                  <Button>
                    Request Trainee Assignment
                  </Button>
                </div>
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
                  <Button>
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
                  <Button>
                    Create Your First Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
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
        <Button size="sm" variant="outline">
          {action}
        </Button>
      )}
    </div>
  );
}

// Trainee Performance Item Component
interface TraineePerformanceItemProps {
  name: string;
  progress: number;
  currentModule: string;
  status: 'on-track' | 'needs-attention' | 'behind';
  lastActivity: string;
}

function TraineePerformanceItem({ name, progress, currentModule, status, lastActivity }: TraineePerformanceItemProps) {
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
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Module: {currentModule}</span>
          <span>{progress}% complete</span>
        </div>
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-xs text-gray-500">Last active: {lastActivity}</p>
      </div>
      <div className="ml-4">
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </div>
    </div>
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
        <Button size="sm">
          Review
        </Button>
      </div>
    </div>
  );
}