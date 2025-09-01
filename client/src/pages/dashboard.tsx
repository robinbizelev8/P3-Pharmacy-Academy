import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useStudentDashboard, 
  useAssignedScenarios, 
  useStudentFeedback 
} from "@/hooks/use-student-data";
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

  // Use custom hooks for real API data
  const { data: dashboardData, isLoading: isDashboardLoading } = useStudentDashboard(user?.id);
  const { data: assignedScenarios, isLoading: isScenariosLoading } = useAssignedScenarios(user?.id);
  const { data: supervisorFeedback, isLoading: isFeedbackLoading } = useStudentFeedback(user?.id);

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

  // Redirect to login if not authenticated
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

  if (isDashboardLoading || isScenariosLoading || isFeedbackLoading) {
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
                  {(assignedScenarios?.length ?? 0) > 0 && (
                    <Badge variant="secondary">
                      {assignedScenarios?.length ?? 0} pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(assignedScenarios?.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {(assignedScenarios ?? []).slice(0, 3).map((scenario: any) => (
                      <div key={scenario.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">{scenario.title}</h4>
                            <p className="text-sm text-gray-600">
                              {scenario.therapeuticArea} • Due: {scenario.dueDate ? new Date(scenario.dueDate).toLocaleDateString() : 'No due date'}
                            </p>
                            <p className="text-xs text-gray-500">Assigned by: {scenario.supervisorName}</p>
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/practice/scenario/${scenario.id}`}>
                            Start
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-3" asChild>
                      <Link href="/assignments">
                        View All Assignments
                      </Link>
                    </Button>
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
            {/* Supervisor's View of Progress */}
            {dashboardData?.supervisor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Supervisor's Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Overall Performance Rating */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">Overall Performance</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-green-700">
                        "Showing excellent progress in clinical reasoning and patient care"
                      </p>
                    </div>
                    
                    {/* Competency Breakdown */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Competency Assessment</h4>
                      {['PA1: Clinical Knowledge', 'PA2: Health Products', 'PA3: Patient Education', 'PA4: Professional Practice'].map((competency, index) => {
                        const levels = [3, 4, 2, 3]; // Mock supervisor assessment levels
                        return (
                          <div key={competency} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{competency}</span>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500">Level {levels[index]}/5</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-full bg-green-500 rounded-full" 
                                  style={{ width: `${(levels[index] / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Next Review Date */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Next Review:</span>
                        <span className="font-medium text-gray-900">Dec 15, 2024</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Action Items from Supervisor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-orange-600" />
                    Action Items
                  </div>
                  <Badge variant="secondary">
                    {supervisorFeedback?.reduce((count: number, feedback: any) => 
                      count + (feedback.actionItems?.length || 0), 0) || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supervisorFeedback && supervisorFeedback.some((f: any) => f.actionItems?.length > 0) ? (
                  <div className="space-y-3">
                    {supervisorFeedback
                      .filter((feedback: any) => feedback.actionItems?.length > 0)
                      .slice(0, 2)
                      .map((feedback: any) => 
                        feedback.actionItems.slice(0, 2).map((item: string, index: number) => (
                          <ActionItemComponent
                            key={`${feedback.id}-${index}`}
                            title={item}
                            source={`From: ${feedback.scenarioTitle || 'General Feedback'}`}
                            priority={feedback.priority || 'medium'}
                            completed={false}
                          />
                        ))
                      )}
                    <Button variant="outline" className="w-full mt-3" asChild>
                      <Link href="/action-items">
                        View All Action Items
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No action items</p>
                    <p className="text-xs text-gray-500">Complete scenarios to receive targeted recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
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

            {/* Supervisor Feedback - Enhanced Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                    Supervisor Feedback
                  </div>
                  {(supervisorFeedback?.length ?? 0) > 0 && (
                    <Badge variant="outline">
                      {supervisorFeedback?.length ?? 0} items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(supervisorFeedback?.length ?? 0) > 0 ? (
                  <div className="space-y-6">
                    {(supervisorFeedback ?? []).slice(0, 2).map((feedback: any) => (
                      <div key={feedback.id} className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-sm transition-shadow">
                        {/* Header with supervisor info and rating */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-blue-900">
                                {feedback.supervisor?.firstName && feedback.supervisor?.lastName 
                                  ? `${feedback.supervisor.firstName} ${feedback.supervisor.lastName}`
                                  : feedback.supervisorName || 'Supervisor'}
                              </span>
                              <div className="flex items-center space-x-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < (feedback.overallRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                                <span className="text-sm text-gray-600 ml-2">
                                  ({feedback.overallRating || 'No rating'}/5)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500">
                              {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                            {feedback.feedbackType && (
                              <div className="mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {feedback.feedbackType.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Scenario context if available */}
                        {(feedback.scenarioTitle || feedback.sessionId) && (
                          <div className="mb-4 p-3 bg-white/60 rounded-md border border-blue-100">
                            <p className="text-sm font-medium text-blue-800 flex items-center">
                              <Target className="w-4 h-4 mr-2" />
                              Context: {feedback.scenarioTitle || `Session #${feedback.sessionId}`}
                            </p>
                          </div>
                        )}
                        
                        {/* Main feedback content */}
                        <div className="space-y-4">
                          {feedback.writtenFeedback && (
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">Feedback:</h4>
                              <p className="text-gray-700 leading-relaxed bg-white/60 p-3 rounded-md">
                                {feedback.writtenFeedback}
                              </p>
                            </div>
                          )}

                          {feedback.strengths && (
                            <div>
                              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Strengths:
                              </h4>
                              <p className="text-green-700 bg-green-50/80 p-3 rounded-md leading-relaxed">
                                {feedback.strengths}
                              </p>
                            </div>
                          )}

                          {feedback.improvementAreas && (
                            <div>
                              <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                Areas for Improvement:
                              </h4>
                              <p className="text-orange-700 bg-orange-50/80 p-3 rounded-md leading-relaxed">
                                {feedback.improvementAreas}
                              </p>
                            </div>
                          )}
                        
                          {feedback.recommendations && (
                            <div>
                              <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                                <Brain className="w-4 h-4 mr-1" />
                                Recommendations:
                              </h4>
                              <p className="text-purple-700 bg-purple-50/80 p-3 rounded-md leading-relaxed">
                                {feedback.recommendations}
                              </p>
                            </div>
                          )}
                        
                          {feedback.actionItems && feedback.actionItems.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Action Items:
                              </h4>
                              <ul className="space-y-2">
                                {feedback.actionItems.slice(0, 3).map((item: string, index: number) => (
                                  <li key={index} className="flex items-start bg-white/60 p-2 rounded">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                    <span className="text-gray-700">{item}</span>
                                  </li>
                                ))}
                                {feedback.actionItems.length > 3 && (
                                  <li className="text-sm text-gray-500 ml-5">
                                    +{feedback.actionItems.length - 3} more items
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Detailed ratings if available */}
                          {(feedback.clinicalKnowledgeRating || feedback.communicationRating || feedback.professionalismRating) && (
                            <div className="border-t border-blue-200 pt-4 mt-4">
                              <h4 className="font-medium text-gray-800 mb-3">Detailed Ratings:</h4>
                              <div className="grid grid-cols-3 gap-4">
                                {feedback.clinicalKnowledgeRating && (
                                  <div className="text-center">
                                    <p className="text-xs text-gray-600">Clinical Knowledge</p>
                                    <p className="font-semibold text-blue-600">{feedback.clinicalKnowledgeRating}/5</p>
                                  </div>
                                )}
                                {feedback.communicationRating && (
                                  <div className="text-center">
                                    <p className="text-xs text-gray-600">Communication</p>
                                    <p className="font-semibold text-green-600">{feedback.communicationRating}/5</p>
                                  </div>
                                )}
                                {feedback.professionalismRating && (
                                  <div className="text-center">
                                    <p className="text-xs text-gray-600">Professionalism</p>
                                    <p className="font-semibold text-purple-600">{feedback.professionalismRating}/5</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <Link href="/feedback">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View All Feedback ({supervisorFeedback?.length ?? 0})
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No supervisor feedback yet</p>
                    <p className="text-sm text-gray-500 mt-1">Complete scenarios and assessments to receive personalized feedback</p>
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
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/prepare">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/practice">
                    <Play className="w-4 h-4 mr-2" />
                    Practice Scenarios
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/perform">
                    <Trophy className="w-4 h-4 mr-2" />
                    Take Assessment
                  </Link>
                </Button>
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
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${colorClasses[color as keyof typeof colorClasses]} border-2`}
      onClick={() => window.location.href = href}
      data-testid={`card-module-${title.toLowerCase()}`}
    >
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

// Component for action items
interface ActionItemComponentProps {
  title: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

function ActionItemComponent({ title, source, priority, completed }: ActionItemComponentProps) {
  const priorityColors = {
    high: "border-red-200 bg-red-50 text-red-700",
    medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
    low: "border-green-200 bg-green-50 text-green-700"
  };

  return (
    <div className={`p-3 rounded-lg border ${priorityColors[priority]} ${completed ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 flex-1">
          <div className={`mt-1.5 w-2 h-2 rounded-full ${completed ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          <div className="flex-1">
            <h4 className={`font-medium text-sm ${completed ? 'line-through' : ''}`}>
              {title}
            </h4>
            <p className="text-xs text-gray-600 mt-1">{source}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {priority}
        </Badge>
      </div>
    </div>
  );
}