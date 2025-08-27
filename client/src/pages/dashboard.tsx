import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  Play, 
  Trophy, 
  User, 
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Target,
  Brain
} from "lucide-react";
import { Link } from "wouter";

interface DashboardData {
  progress: {
    prepare: { completed: number; total: number };
    practice: { completed: number; total: number };
    perform: { completed: number; total: number };
  };
  supervisor: {
    id: string;
    name: string;
    institution: string;
  } | null;
  assignedScenarios: any[];
  recentFeedback: any[];
  nextMilestones: string[];
}

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Always call useQuery hook to maintain consistent hook order
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/student/dashboard"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated && user?.role === 'student', // Only run query when conditions are met
  });

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

  // Redirect if not a student
  if (user?.role !== 'student') {
    const redirectUrl = user?.role === 'supervisor' ? '/supervisor/dashboard' : 
                       user?.role === 'admin' ? '/admin/dashboard' : '/';
    window.location.href = redirectUrl;
    return null;
  }

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'Student'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Continue your journey through the P³ Pharmacy Academy
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <User className="w-4 h-4 mr-1" />
                Student
              </Badge>
              {user?.institution && (
                <Badge variant="secondary" className="px-3 py-1">
                  {user.institution}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Supervisor Information */}
        {dashboardData?.supervisor && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <User className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Your Supervisor:</span> {dashboardData.supervisor.name}
                  <span className="text-blue-600 ml-2">({dashboardData.supervisor.institution})</span>
                </div>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Module Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ModuleProgressCard
                    title="Prepare"
                    icon={BookOpen}
                    progress={dashboardData?.progress?.prepare || { completed: 0, total: 10 }}
                    color="blue"
                    description="Foundation Building"
                    href="/prepare"
                  />
                  <ModuleProgressCard
                    title="Practice"
                    icon={Play}
                    progress={dashboardData?.progress?.practice || { completed: 0, total: 20 }}
                    color="green"
                    description="Clinical Scenarios"
                    href="/practice"
                  />
                  <ModuleProgressCard
                    title="Perform"
                    icon={Trophy}
                    progress={dashboardData?.progress?.perform || { completed: 0, total: 15 }}
                    color="purple"
                    description="Competency Assessment"
                    href="/perform"
                  />
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Overall Program Progress</span>
                    <span>32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                  <p className="text-xs text-gray-600">
                    Keep going! You're making great progress towards your pharmacy practice readiness.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Scenarios from Supervisor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-orange-600" />
                    Supervisor Assignments
                  </div>
                  {(dashboardData?.assignedScenarios?.length ?? 0) > 0 && (
                    <Badge variant="secondary">
                      {dashboardData?.assignedScenarios?.length ?? 0} pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(dashboardData?.assignedScenarios?.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {(dashboardData?.assignedScenarios ?? []).slice(0, 3).map((scenario, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Cardiovascular Case Study</h4>
                            <p className="text-sm text-gray-600">Due in 3 days</p>
                          </div>
                        </div>
                        <Button size="sm">
                          Start
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    ))}
                    <Link href="/assignments">
                      <Button variant="outline" className="w-full mt-3">
                        View All Assignments
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No assignments yet</p>
                    <p className="text-sm text-gray-500">Your supervisor will assign scenarios when available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem
                    icon={CheckCircle}
                    color="green"
                    title="Completed Cardiovascular Assessment"
                    description="Module 1: Prepare - Therapeutic Area Assessment"
                    time="2 hours ago"
                  />
                  <ActivityItem
                    icon={Brain}
                    color="blue"
                    title="Started Clinical Reasoning Practice"
                    description="Module 2: Practice - Patient Case Analysis"
                    time="1 day ago"
                  />
                  <ActivityItem
                    icon={Star}
                    color="yellow"
                    title="Achieved Competency Milestone"
                    description="PA2: Accurate Supply of Health Products - Level 3"
                    time="3 days ago"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Next Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <MilestoneItem
                    title="Complete PA3 Assessment"
                    description="Patient education competency"
                    dueDate="Next week"
                    priority="high"
                  />
                  <MilestoneItem
                    title="Portfolio Submission"
                    description="Compile evidence for Module 2"
                    dueDate="2 weeks"
                    priority="medium"
                  />
                  <MilestoneItem
                    title="Supervisor Review Meeting"
                    description="Monthly progress discussion"
                    dueDate="3 weeks"
                    priority="low"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(dashboardData?.recentFeedback?.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {(dashboardData?.recentFeedback ?? []).map((feedback, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Supervisor Feedback</span>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          "Excellent progress on clinical reasoning. Focus more on patient communication skills."
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No recent feedback</p>
                    <p className="text-xs text-gray-500">Complete more scenarios to receive feedback</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/prepare">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="w-4 h-4 mr-2" />
                    Practice Scenarios
                  </Button>
                </Link>
                <Link href="/perform">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="w-4 h-4 mr-2" />
                    Take Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for module progress cards
interface ModuleProgressCardProps {
  title: string;
  icon: any;
  progress: { completed: number; total: number };
  color: string;
  description: string;
  href: string;
}

function ModuleProgressCard({ title, icon: Icon, progress, color, description, href }: ModuleProgressCardProps) {
  const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    green: "border-green-200 bg-green-50 text-green-800", 
    purple: "border-purple-200 bg-purple-50 text-purple-800"
  };

  return (
    <Link href={href}>
      <Card className={`cursor-pointer hover:shadow-md transition-shadow ${colorClasses[color as keyof typeof colorClasses]} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{percentage}%</span>
          </div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-xs mb-3">{description}</p>
          <div className="space-y-2">
            <Progress value={percentage} className="h-2" />
            <p className="text-xs">{progress.completed} of {progress.total} completed</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Component for activity items
interface ActivityItemProps {
  icon: any;
  color: string;
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ icon: Icon, color, title, description, time }: ActivityItemProps) {
  const colorClasses = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    yellow: "text-yellow-600 bg-yellow-100"
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
    </div>
  );
}

// Component for milestone items
interface MilestoneItemProps {
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

function MilestoneItem({ title, description, dueDate, priority }: MilestoneItemProps) {
  const priorityColors = {
    high: "border-red-200 bg-red-50",
    medium: "border-yellow-200 bg-yellow-50",
    low: "border-green-200 bg-green-50"
  };

  return (
    <div className={`p-3 rounded-lg border ${priorityColors[priority]}`}>
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <span className="text-xs text-gray-500">{dueDate}</span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}