import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BookOpen, Calendar, CheckCircle, Clock, Target, TrendingUp, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface ModuleProgress {
  completedSessions: number;
  totalSessions: number;
  averageScore: number;
  competencyLevel: number;
  progressPercentage: number;
  strengths: string[];
  improvementAreas: string[];
}

interface UncompletedSession {
  id: string;
  title: string;
  module: string;
  therapeuticArea: string;
  practiceArea: string;
  progress: number;
  lastAccessed: string;
  professionalActivity: string;
  estimatedTimeRemaining: number;
  supervisionLevel: number;
}

interface CompetencyProgression {
  PA1: { sessions: number; averageScore: number; competencyLevel: number };
  PA2: { sessions: number; averageScore: number; competencyLevel: number };
  PA3: { sessions: number; averageScore: number; competencyLevel: number };
  PA4: { sessions: number; averageScore: number; competencyLevel: number };
}

interface ActivityItem {
  id: string;
  type: 'session' | 'assessment';
  title: string;
  module: string;
  status: string;
  date: string;
  score?: number;
  therapeuticArea: string;
}

interface CompetencyMetrics {
  overallCompetency: number;
  clinicalKnowledge: number;
  therapeuticReasoning: number;
  patientCommunication: number;
  professionalDevelopment: number;
  supervisionReadiness: number;
}

interface DashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    institution?: string;
  };
  moduleProgress: {
    prepare: ModuleProgress;
    practice: ModuleProgress;
    perform: ModuleProgress;
  };
  uncompletedSessions: UncompletedSession[];
  competencyProgression: CompetencyProgression;
  recentActivity: ActivityItem[];
  competencyMetrics: CompetencyMetrics;
  summary: {
    totalSessionsCompleted: number;
    totalSessionsInProgress: number;
    averageScore: number;
    portfolioEvidence: number;
  };
}

export default function StudentDashboard() {
  const [, setLocation] = useLocation();

  // Fetch comprehensive dashboard data
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/student/dashboard'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch uncompleted sessions for resume functionality
  const { data: uncompletedSessions } = useQuery<UncompletedSession[]>({
    queryKey: ['/api/student/progress/uncompleted'],
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSupervisionLevelBadge = (level: number) => {
    const levels: Record<number, { label: string; color: string }> = {
      1: { label: "Observe", color: "bg-gray-500" },
      2: { label: "Direct", color: "bg-blue-500" },
      3: { label: "Indirect", color: "bg-yellow-500" },
      4: { label: "Independent", color: "bg-green-500" },
      5: { label: "Teaching", color: "bg-purple-500" }
    };
    
    const levelInfo = levels[level] || levels[1];
    return (
      <Badge className={`${levelInfo.color} text-white`}>
        Level {level}: {levelInfo.label}
      </Badge>
    );
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'prepare': return <BookOpen className="w-5 h-5" />;
      case 'practice': return <Target className="w-5 h-5" />;
      case 'perform': return <CheckCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8" data-testid="student-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {dashboardData.user.firstName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track your Singapore pharmacy pre-registration training progress
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {dashboardData.user.institution || 'P³ Pharmacy Academy'}
          </span>
        </div>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card data-testid="overall-progress-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Competency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.competencyMetrics.overallCompetency}%</div>
            <p className="text-xs text-muted-foreground">
              Supervision Level {dashboardData.competencyMetrics.supervisionReadiness}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="sessions-completed-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.summary.totalSessionsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.summary.totalSessionsInProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card data-testid="average-score-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.summary.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Across all modules
            </p>
          </CardContent>
        </Card>

        <Card data-testid="portfolio-evidence-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Evidence</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.summary.portfolioEvidence}</div>
            <p className="text-xs text-muted-foreground">
              Documentation items
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules" data-testid="tab-modules">Module Progress</TabsTrigger>
          <TabsTrigger value="resume" data-testid="tab-resume">Resume Sessions</TabsTrigger>
          <TabsTrigger value="competencies" data-testid="tab-competencies">PA Competencies</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Module Progress Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(dashboardData.moduleProgress).map(([module, progress]) => (
              <Card key={module} data-testid={`module-${module}-card`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getModuleIcon(module)}
                    <span className="capitalize">{module}</span>
                  </CardTitle>
                  <CardDescription>
                    {progress.completedSessions} of {progress.totalSessions} sessions completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progress.progressPercentage} className="w-full" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Average Score: {progress.averageScore}%</span>
                    <span>Level {progress.competencyLevel}</span>
                  </div>

                  {progress.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-600 mb-1">Strengths:</h4>
                      <ul className="text-xs text-green-700 space-y-1">
                        {progress.strengths.map((strength, idx) => (
                          <li key={idx}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {progress.improvementAreas.length > 0 && (
                    <div>
                      <h4 className="font-medium text-amber-600 mb-1">Improvement Areas:</h4>
                      <ul className="text-xs text-amber-700 space-y-1">
                        {progress.improvementAreas.map((area, idx) => (
                          <li key={idx}>• {area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => setLocation(`/${module}`)}
                    data-testid={`button-continue-${module}`}
                  >
                    Continue {module.charAt(0).toUpperCase() + module.slice(1)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resume Sessions Tab */}
        <TabsContent value="resume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Your Training Sessions</CardTitle>
              <CardDescription>
                Continue where you left off in your pharmacy training
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.uncompletedSessions.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No sessions to resume. Start a new training session!
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.uncompletedSessions.map((session) => (
                    <Card key={session.id} className="border-l-4 border-l-blue-500" data-testid={`resume-session-${session.id}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {session.therapeuticArea} • {session.practiceArea} • {session.professionalActivity}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Progress value={session.progress} className="flex-1" />
                              <span className="text-sm font-medium">{session.progress}%</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {session.estimatedTimeRemaining} min remaining
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(session.lastAccessed)}
                              </span>
                              {getSupervisionLevelBadge(session.supervisionLevel)}
                            </div>
                          </div>
                          <Button 
                            className="ml-4"
                            onClick={() => setLocation(`/practice/sessions/${session.id}`)}
                            data-testid={`button-resume-${session.id}`}
                          >
                            Resume
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PA Competencies Tab */}
        <TabsContent value="competencies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(dashboardData.competencyProgression).map(([pa, progression]) => (
              <Card key={pa} data-testid={`competency-${pa}-card`}>
                <CardHeader>
                  <CardTitle>{pa}: Professional Activity</CardTitle>
                  <CardDescription>
                    {progression.sessions} sessions completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Score</span>
                      <span className="text-lg font-bold">{progression.averageScore}%</span>
                    </div>
                    <Progress value={progression.averageScore} className="w-full" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Competency Level</span>
                      {getSupervisionLevelBadge(progression.competencyLevel)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Competency Metrics Detail */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Competency Metrics</CardTitle>
              <CardDescription>
                Singapore Pharmacy Pre-registration Training Standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Clinical Knowledge</span>
                      <span className="text-sm">{dashboardData.competencyMetrics.clinicalKnowledge}%</span>
                    </div>
                    <Progress value={dashboardData.competencyMetrics.clinicalKnowledge} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Therapeutic Reasoning</span>
                      <span className="text-sm">{dashboardData.competencyMetrics.therapeuticReasoning}%</span>
                    </div>
                    <Progress value={dashboardData.competencyMetrics.therapeuticReasoning} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Patient Communication</span>
                      <span className="text-sm">{dashboardData.competencyMetrics.patientCommunication}%</span>
                    </div>
                    <Progress value={dashboardData.competencyMetrics.patientCommunication} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Professional Development</span>
                      <span className="text-sm">{dashboardData.competencyMetrics.professionalDevelopment}%</span>
                    </div>
                    <Progress value={dashboardData.competencyMetrics.professionalDevelopment} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Timeline</CardTitle>
              <CardDescription>
                Your latest training sessions and assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentActivity.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No recent activity. Start your first training session!
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg" data-testid={`activity-${activity.id}`}>
                      <div className="flex-shrink-0">
                        {getModuleIcon(activity.module)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {activity.therapeuticArea} • {activity.module}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {activity.score && (
                          <Badge variant="secondary">
                            {activity.score}%
                          </Badge>
                        )}
                        <Badge className={activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {activity.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(activity.date)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}