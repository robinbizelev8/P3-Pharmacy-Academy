import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  FileText,
  Target,
  Users,
  Calendar,
  Stethoscope,
  GraduationCap,
  BarChart3,
  Download,
  Play,
  Pause,
  RefreshCw,
  ArrowLeft,
  Activity,
  Search,
  Brain,
  Heart,
  Send,
  Plus,
  Trophy,
  Trash2,
  X,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  Star,
  AlertTriangle,
  Shield,
  Zap,
  Eye,
  Info,
  Gauge,
  Filter,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from "lucide-react";

// Import generated images
import assessmentDashboardImage from "@assets/generated_images/Pharmacy_competency_assessment_dashboard_d6f2a8b4.png";
import portfolioFrameworkImage from "@assets/generated_images/Portfolio_development_framework_diagram_9e456841.png";
import processFlowImage from "@assets/generated_images/Assessment_process_flow_diagram_e7ad701a.png";

interface PerformAssessment {
  id: string;
  assessmentType: string;
  therapeuticAreas: string[];
  practiceAreas: string[];
  status: string;
  startedAt: string;
  completedAt?: string;
  timeLimitMinutes: number;
  actualDurationMinutes?: number;
  overallCompetencyScore?: string;
  supervisionLevelAchieved?: string;
  readinessForPractice?: boolean;
  scenarios?: PerformScenario[];
}

interface PerformScenario {
  id: string;
  scenarioOrder: number;
  therapeuticArea: string;
  practiceArea: string;
  complexityLevel: string;
  professionalActivity: string;
  patientBackground: string;
  clinicalPresentation: string;
  medicationHistory: string;
  assessmentObjectives: string;
  userResponses?: any;
  responseQuality?: string;
  clinicalAccuracy?: string;
  communicationEffectiveness?: string;
  professionalismScore?: string;
  aiEvaluation?: any;
  feedback?: string;
  modelAnswer?: string;
  learningTips?: string;
  completedAt?: string;
}

interface PerformPortfolio {
  id: string;
  status: string;
  completionPercentage: string;
  practiceSessionsIncluded: number;
  counselingRecordsCompiled: number;
  therapeuticAreasCovered: string[];
  executiveSummary?: string;
  portfolioDocument?: string;
  supervisorValidated?: boolean;
}

// Removed assessment schema

const scenarioResponseSchema = z.object({
  informationGathering: z.string().min(50, "Provide detailed information gathering approach"),
  clinicalReasoning: z.string().min(50, "Explain your clinical reasoning process"),
  clinicalJudgment: z.string().min(50, "Describe your clinical judgment and decisions"),
  implementationPlanning: z.string().min(50, "Detail your implementation and monitoring plan"),
  soapNotes: z.string().optional(),
  carePlan: z.string().optional()
});

type ScenarioResponseData = z.infer<typeof scenarioResponseSchema>;

export default function PerformPage() {
  const [currentScenario, setCurrentScenario] = useState<PerformScenario | null>(null);

  // Scroll to top when scenario loads
  useEffect(() => {
    if (currentScenario) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentScenario]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Removed assessments query

  // Fetch portfolio
  const { data: portfolio } = useQuery({
    queryKey: ["/api/perform/portfolio"],
    staleTime: 5 * 60 * 1000
  });

  // Fetch constants
  const { data: constants } = useQuery({
    queryKey: ["/api/perform/constants"],
    staleTime: 30 * 60 * 1000
  });

  // Enhanced analytics queries - Always enabled for dashboard
  const { data: competencyProgress, isLoading: competencyLoading } = useQuery({
    queryKey: ["/api/perform/competency-progress"],
    staleTime: 2 * 60 * 1000
  });

  const { data: spcCompliance, isLoading: complianceLoading } = useQuery({
    queryKey: ["/api/perform/spc-compliance"], 
    staleTime: 2 * 60 * 1000
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/perform/dashboard"],
    staleTime: 2 * 60 * 1000
  });

  const { data: gapAnalysis, isLoading: gapLoading } = useQuery({
    queryKey: ["/api/perform/gap-analysis"],
    staleTime: 2 * 60 * 1000
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/perform/recommendations"],
    staleTime: 2 * 60 * 1000
  });

  // Demo/Placeholder data for transparency and expectation setting
  const getDemoSPCCompliance = () => ({
    overallReadinessPercentage: 45,
    requirementStatus: {
      PA1: { minScore: 70, currentScore: 52, supervisionLevel: 2, minSupervisionLevel: 3, completed: false, progressPercentage: 74 },
      PA2: { minScore: 75, currentScore: 38, supervisionLevel: 1, minSupervisionLevel: 4, completed: false, progressPercentage: 51 },
      PA3: { minScore: 70, currentScore: 61, supervisionLevel: 2, minSupervisionLevel: 3, completed: false, progressPercentage: 87 },
      PA4: { minScore: 65, currentScore: 43, supervisionLevel: 2, minSupervisionLevel: 3, completed: false, progressPercentage: 66 }
    },
    nextMilestones: [
      { professionalActivity: "PA3", milestone: "Achieve 70% competency in PA3", currentProgress: 87, estimatedSessions: 2 },
      { professionalActivity: "PA1", milestone: "Achieve 70% competency in PA1", currentProgress: 74, estimatedSessions: 4 },
      { professionalActivity: "PA4", milestone: "Achieve 65% competency in PA4", currentProgress: 66, estimatedSessions: 5 }
    ],
    readyForPreRegistration: false
  });

  const getDemoCompetencyProgress = () => ({
    competencyScores: {
      PA1: { averageScore: 52, sessionCount: 3, supervisionLevel: 2, competencyLevel: 'Advanced Beginner' },
      PA2: { averageScore: 38, sessionCount: 1, supervisionLevel: 1, competencyLevel: 'Novice' },
      PA3: { averageScore: 61, sessionCount: 4, supervisionLevel: 2, competencyLevel: 'Advanced Beginner' },
      PA4: { averageScore: 43, sessionCount: 2, supervisionLevel: 2, competencyLevel: 'Advanced Beginner' }
    },
    timelineData: [
      { date: "2024-01-15", PA1: 30, PA2: 25, PA3: 35, PA4: 28, activityType: 'practice' },
      { date: "2024-01-22", PA1: 42, PA2: 30, PA3: 45, PA4: 38, activityType: 'assessment' },
      { date: "2024-01-29", PA1: 48, PA2: 35, PA3: 52, PA4: 41, activityType: 'practice' },
      { date: "2024-02-05", PA1: 52, PA2: 38, PA3: 58, PA4: 43, activityType: 'practice' },
      { date: "2024-02-12", PA1: 55, PA2: 40, PA3: 61, PA4: 47, activityType: 'assessment' }
    ],
    therapeuticAreaMastery: {
      'Cardiovascular': { averageScore: 58, sessionCount: 2, masteryLevel: 'Developing' },
      'Gastrointestinal': { averageScore: 42, sessionCount: 1, masteryLevel: 'Developing' },
      'Endocrine': { averageScore: 65, sessionCount: 3, masteryLevel: 'Developing' },
      'Respiratory': { averageScore: 48, sessionCount: 2, masteryLevel: 'Developing' },
      'Renal': { averageScore: 35, sessionCount: 1, masteryLevel: 'Developing' },
      'Neurological': { averageScore: 0, sessionCount: 0, masteryLevel: 'Not Started' },
      'Dermatological': { averageScore: 0, sessionCount: 0, masteryLevel: 'Not Started' }
    },
    totalSessions: 10
  });

  const getDemoDashboardData = () => ({
    ...getDemoCompetencyProgress(),
    performanceMetrics: {
      strengths: ["Strong analytical thinking in clinical scenarios", "Good patient communication skills"],
      improvements: ["Focus on PA2 competency development", "Expand therapeutic area coverage"],
      consistencyScore: 72
    },
    recentActivity: {
      sessionsThisWeek: 2,
      averageScoreThisWeek: 58,
      lastActivityDate: Date.now() - (2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    totalSessions: 10
  });

  const getDemoGapAnalysis = () => ({
    totalGaps: 6,
    highPriorityGaps: 2,
    gaps: [
      { professionalActivity: "PA2", currentLevel: 38, targetLevel: 75, gap: 37, priority: 9, type: 'competency' },
      { professionalActivity: "PA4", currentLevel: 43, targetLevel: 65, gap: 22, priority: 8, type: 'competency' },
      { area: "Neurological", currentSessions: 0, targetSessions: 3, gap: 3, priority: 7, type: 'therapeutic_area' },
      { area: "Dermatological", currentSessions: 0, targetSessions: 3, gap: 3, priority: 6, type: 'therapeutic_area' }
    ],
    estimatedTimeToCompletion: { totalWeeks: 8, highPriorityWeeks: 4, mediumPriorityWeeks: 2, lowPriorityWeeks: 2 }
  });

  const getDemoRecommendations = () => ({
    recommendations: [
      {
        reason: "Improve PA2 competency", 
        priority: 9, 
        scenarios: [
          { title: "Medication Safety Review", therapeuticArea: "Cardiovascular" },
          { title: "Drug Interaction Analysis", therapeuticArea: "Endocrine" }
        ], 
        expectedImprovement: "Significant improvement (15%+)"
      },
      {
        reason: "Expand therapeutic area coverage", 
        priority: 7, 
        scenarios: [
          { title: "Neurological Case Studies", therapeuticArea: "Neurological" }
        ], 
        expectedImprovement: "Moderate improvement (5-15%)"
      }
    ],
    nextSessionObjectives: [
      "Improve PA2 competency",
      "Practice Neurological therapeutic area scenarios",
      "Maintain excellence in PA3"
    ]
  });

  // Use demo data when real data is not available
  const displaySPCCompliance = spcCompliance || getDemoSPCCompliance();
  const displayCompetencyProgress = competencyProgress || getDemoCompetencyProgress();
  const displayDashboardData = dashboardData || getDemoDashboardData();
  const displayGapAnalysis = gapAnalysis || getDemoGapAnalysis();
  const displayRecommendations = recommendations || getDemoRecommendations();

  // Removed assessment form

  // Scenario response form
  const scenarioForm = useForm<ScenarioResponseData>({
    resolver: zodResolver(scenarioResponseSchema),
    defaultValues: {
      informationGathering: "",
      clinicalReasoning: "",
      clinicalJudgment: "",
      implementationPlanning: "",
      soapNotes: "",
      carePlan: ""
    }
  });

  // Removed assessment mutations

  // Removed start assessment mutation

  // Submit scenario response mutation
  const submitScenarioMutation = useMutation({
    mutationFn: async ({ scenarioId, responses }: { scenarioId: string; responses: ScenarioResponseData }) => {
      const response = await fetch(`/api/perform/scenarios/${scenarioId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userResponses: responses })
      });
      if (!response.ok) throw new Error("Failed to submit scenario response");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perform/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/perform/scenarios"] });
      toast({ title: "Scenario response submitted successfully" });
      scenarioForm.reset();
      setCurrentScenario(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit response", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Complete assessment mutation
  const completeAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const response = await fetch(`/api/perform/assessments/${assessmentId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to complete assessment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perform/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/perform/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/perform/scenarios"] });
      toast({ title: "Assessment completed successfully" });
      setSelectedAssessment(null);
      setCurrentScenario(null);
      scenarioForm.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Delete assessment mutation
  const deleteAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const response = await fetch(`/api/perform/assessments/${assessmentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to delete assessment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perform/assessments"] });
      toast({ title: "Assessment deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete assessment", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Compile portfolio mutation
  const compilePortfolioMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/perform/portfolio/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to compile portfolio");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perform/portfolio"] });
      toast({ title: "Portfolio compiled successfully" });
    }
  });

  // Removed assessment handlers

  const handleSubmitScenario = (data: ScenarioResponseData) => {
    if (currentScenario) {
      submitScenarioMutation.mutate({
        scenarioId: currentScenario.id,
        responses: data
      });
    }
  };

  // Removed delete assessment handler

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Removed assessment loading check

  // Show scenario interface if currentScenario is set
  if (currentScenario) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold">Clinical Assessment Scenario</h1>
          </div>
          <Button variant="outline" onClick={() => setCurrentScenario(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Scenario {currentScenario?.scenarioOrder}: {currentScenario?.therapeuticArea} ({currentScenario?.complexityLevel})
            </CardTitle>
            <CardDescription>
              Practice Area: {currentScenario?.practiceArea} • Professional Activity: {currentScenario?.professionalActivity}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wide text-gray-500 mb-2">Patient Background</h3>
                <p className="text-sm leading-relaxed">{currentScenario?.patientBackground}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wide text-gray-500 mb-2">Clinical Presentation</h3>
                <p className="text-sm leading-relaxed">{currentScenario?.clinicalPresentation}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wide text-gray-500 mb-2">Medication History</h3>
                <p className="text-sm leading-relaxed">{currentScenario?.medicationHistory}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wide text-gray-500 mb-2">Assessment Objectives</h3>
                <p className="text-sm leading-relaxed">{currentScenario?.assessmentObjectives}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Building Section - No Assessment Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Portfolio Development</CardTitle>
            <CardDescription>
              Build your professional portfolio with documented clinical experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200">
                <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">Portfolio Documentation</h3>
                <p className="text-green-700 mb-4">
                  This scenario is available for portfolio documentation and competency development tracking.
                </p>
                <p className="text-sm text-green-600">
                  Use the Portfolio tab to document your learning outcomes and competency progression.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section with Visual Elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-3xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Perform</h1>
                <p className="text-lg text-purple-700 font-medium">Competency Assessment & Portfolio</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Build your professional competency portfolio with comprehensive documentation of clinical learning experiences, competency development, and evidence-based practice progression across all 7 therapeutic areas.
            </p>
          </div>
          
          <div className="lg:text-right">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg mb-6">
              <FileText className="w-12 h-12 text-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gray-900">{displayDashboardData?.totalSessions || 0}</div>
              <div className="text-sm text-gray-600">Portfolio Entries</div>
            </div>
          </div>
        </div>
        
        {/* Progress Journey */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-purple-100">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Clinical Documentation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Document clinical scenarios and learning outcomes</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Competency Tracking</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Track progress across PA1-PA4 professional activities</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Portfolio Review</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Compile evidence of competency development</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Competency Validation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Receive detailed feedback and progression recommendations</p>
          </div>
        </div>
      </div>

      <div className="px-6">{/* Content wrapper */}

      {/* Main Content Tabs with Enhanced Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-50">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white font-medium">
              <FileText className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Training Progress Overview */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Overall Readiness */}
            <Card className="lg:col-span-2 border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <CardTitle>Your Training Progress</CardTitle>
                  </div>
                  <Badge 
                    className={`${
                      displaySPCCompliance?.readyForPreRegistration 
                        ? 'bg-green-100 text-green-800' 
                        : displaySPCCompliance?.overallReadinessPercentage >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {displaySPCCompliance?.overallReadinessPercentage}% Ready
                  </Badge>
                </div>
                <CardDescription>
                  Track your progress towards Singapore Pharmacy Council pre-registration requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Overall Readiness</span>
                      <span className="text-purple-600 font-bold">{displaySPCCompliance?.overallReadinessPercentage}%</span>
                    </div>
                    <Progress value={displaySPCCompliance?.overallReadinessPercentage} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current Level</span>
                      <span>Pre-registration Ready</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displaySPCCompliance?.requirementStatus && Object.entries(displaySPCCompliance.requirementStatus).map(([pa, status]: [string, any]) => (
                      <div key={pa} className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${
                          status.completed ? 'bg-green-100 text-green-600' : 
                          status.progressPercentage >= 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {status.completed ? <CheckCircle className="h-8 w-8" /> : 
                           status.progressPercentage >= 70 ? <ClockIcon className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                        </div>
                        <div className="text-sm font-medium">{pa}</div>
                        <div className="text-xs text-gray-500">{status.currentScore}% / {status.minScore}%</div>
                        <Progress value={status.progressPercentage} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Next Focus Areas</h4>
                    <div className="space-y-2">
                      {displaySPCCompliance?.nextFocusAreas?.slice(0, 3).map((area: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span className="text-purple-800">{area}</span>
                        </div>
                      )) || (
                        <p className="text-sm text-purple-700">Complete more scenarios to see focus areas!</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Summary */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{displayDashboardData?.totalSessions || 0}</div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{displayDashboardData?.recentActivity?.sessionsThisWeek || 0}</div>
                  <div className="text-sm text-gray-600">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{Math.round(displayDashboardData?.recentActivity?.averageScoreThisWeek || 0)}%</div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Current Focus Areas</h4>
                  {displayRecommendations?.nextSessionObjectives?.slice(0, 2).map((objective: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">{objective}</span>
                    </div>
                  )) || (
                    <p className="text-xs text-gray-500">Start practicing to see focus areas!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Competency Visualization */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* PA1-PA4 Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Professional Activities (PA1-PA4)
                </CardTitle>
                <CardDescription>
                  Your competency across Singapore's core pharmacy activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      data={displayCompetencyProgress?.competencyScores ? Object.entries(displayCompetencyProgress.competencyScores).map(([pa, data]: [string, any]) => ({
                        pa,
                        score: data.averageScore,
                        target: pa === 'PA2' ? 75 : pa === 'PA1' || pa === 'PA3' ? 70 : 65
                      })) : []}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="pa" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                      <PolarRadiusAxis 
                        angle={0} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }}
                        tickCount={6}
                      />
                      <Radar
                        name="Your Score"
                        dataKey="score"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                        strokeWidth={3}
                      />
                      <Radar
                        name="Target"
                        dataKey="target"
                        stroke="#E5E7EB"
                        fill="transparent"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Progress Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Learning Progress Trends
                </CardTitle>
                <CardDescription>
                  Track your improvement over time across all therapeutic areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={displayGapAnalysis?.progressTrends ? displayGapAnalysis.progressTrends.slice(-12) : []}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ccc', 
                          borderRadius: '8px' 
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.2}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gap Analysis */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Competency Gap Analysis
              </CardTitle>
              <CardDescription>
                Personalized recommendations to improve your weakest areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayGapAnalysis?.priorityAreas && displayGapAnalysis.priorityAreas.length > 0 ? (
                  displayGapAnalysis.priorityAreas.map((area: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            area.priority === 'high' ? 'bg-red-500' :
                            area.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{area.competency}</h4>
                            <p className="text-sm text-gray-600">{area.therapeuticArea}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{area.currentScore}%</div>
                          <div className="text-xs text-gray-500">Target: {area.targetScore}%</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Progress value={area.currentScore} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-700 mb-3">{area.recommendation}</div>
                      <div className="flex flex-wrap gap-2">
                        {area.suggestedActions?.map((action: string, actionIndex: number) => (
                          <span key={actionIndex} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Complete more scenarios to see personalized gap analysis!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Portfolio Building Dashboard */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Portfolio Overview */}
            <Card className="lg:col-span-2 border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-green-600" />
                    <CardTitle>Portfolio Development</CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {Math.round((displayPortfolioProgress?.completionPercentage || 0))}% Complete
                  </Badge>
                </div>
                <CardDescription>
                  Track your learning evidence collection across all PA competencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Portfolio Completion</span>
                      <span className="text-green-600 font-bold">{Math.round((displayPortfolioProgress?.completionPercentage || 0))}%</span>
                    </div>
                    <Progress value={displayPortfolioProgress?.completionPercentage || 0} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Getting Started</span>
                      <span>Ready for Assessment</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displayPortfolioProgress?.competencyStatus && Object.entries(displayPortfolioProgress.competencyStatus).map(([pa, status]: [string, any]) => (
                      <div key={pa} className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${
                          status.evidenceCount >= status.requiredEvidence ? 'bg-green-100 text-green-600' : 
                          status.evidenceCount >= Math.ceil(status.requiredEvidence * 0.7) ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {status.evidenceCount >= status.requiredEvidence ? <CheckCircle className="h-8 w-8" /> : 
                           status.evidenceCount >= Math.ceil(status.requiredEvidence * 0.7) ? <Clock className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                        </div>
                        <div className="text-sm font-medium">{pa}</div>
                        <div className="text-xs text-gray-500">{status.evidenceCount} / {status.requiredEvidence}</div>
                        <Progress value={Math.min((status.evidenceCount / status.requiredEvidence) * 100, 100)} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Actions */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Portfolio Entry
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Portfolio
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Evidence
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Portfolio
                </Button>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Priority Tasks</h4>
                  {displayPortfolioProgress?.priorityTasks?.slice(0, 3).map((task: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">{task}</span>
                    </div>
                  )) || (
                    <p className="text-xs text-gray-500">Complete scenarios to see priority tasks!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Evidence Timeline */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Portfolio Evidence Timeline
              </CardTitle>
              <CardDescription>
                Chronological view of your learning evidence and competency development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayPortfolioEntries && displayPortfolioEntries.length > 0 ? (
                  displayPortfolioEntries.slice(0, 5).map((entry: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                          <span className="text-xs text-gray-500">{entry.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {entry.competencies?.map((comp: string, compIndex: number) => (
                            <span key={compIndex} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Start completing scenarios to build your portfolio evidence!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Clinical Resources */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Singapore Guidelines */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-red-600" />
                  Singapore Clinical Guidelines
                </CardTitle>
                <CardDescription>
                  Official MOH and SPC clinical practice guidelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    MOH Clinical Practice Guidelines
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    National Drug Formulary (NDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    SPC Professional Guidelines
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Therapeutic Guidelines
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Learning Resources */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  Learning Resources
                </CardTitle>
                <CardDescription>
                  Educational materials and reference resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    PA Competency Framework
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Case Study Library
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Assessment Criteria
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Portfolio Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Knowledge Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Knowledge Base Status
              </CardTitle>
              <CardDescription>
                Current status of Singapore healthcare knowledge integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{knowledgeStatus?.mohGuidelines || 0}</div>
                  <div className="text-sm text-gray-600">MOH Guidelines</div>
                  <div className="text-xs text-green-600 mt-1">Active</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{knowledgeStatus?.ndfEntries || 0}</div>
                  <div className="text-sm text-gray-600">NDF Entries</div>
                  <div className="text-xs text-blue-600 mt-1">Updated</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{knowledgeStatus?.spcResources || 0}</div>
                  <div className="text-sm text-gray-600">SPC Resources</div>
                  <div className="text-xs text-purple-600 mt-1">Current</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Knowledge base last updated: {knowledgeStatus?.lastUpdated || 'Recently'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      </div>{/* End content wrapper */}
    </div>
  );
}

function PerformAssessment() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section with Visual Elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-3xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Perform</h1>
                <p className="text-lg text-purple-700 font-medium">Competency Assessment & Portfolio</p>
              </div>
            </div>
            
            <p className="text-xl text-gray-700 leading-relaxed">
              Demonstrate clinical mastery through standardized assessments and comprehensive portfolio development for Singapore Pre-registration Training.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white/70 rounded-full px-4 py-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">PA1-PA4 Competency Framework</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 rounded-full px-4 py-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Multi-domain Scoring</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 rounded-full px-4 py-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Portfolio Development</span>
              </div>
            </div>
          </div>
          
          <div className="lg:justify-self-end">
            <img 
              src={assessmentDashboardImage} 
              alt="Competency assessment dashboard interface" 
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Assessment Process Overview */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Assessment & Portfolio Process</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow our comprehensive evaluation framework aligned with Singapore's pharmacy competency standards.
          </p>
        </div>
        
        <div className="mb-8">
          <img 
            src={processFlowImage} 
            alt="Assessment process flow visualization" 
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Knowledge Assessment</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Evaluate clinical knowledge across therapeutic areas</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Clinical Simulation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Apply knowledge through structured patient scenarios</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Portfolio Review</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Compile evidence of competency development</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Competency Validation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Receive detailed feedback and progression recommendations</p>
          </div>
        </div>
      </div>

      <div className="px-6">{/* Content wrapper */}

      {/* Main Content Tabs with Enhanced Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-50">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white font-medium">
              <FileText className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Training Progress Overview */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Overall Readiness */}
            <Card className="lg:col-span-2 border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <CardTitle>Your Training Progress</CardTitle>
                  </div>
                  <Badge 
                    className={`${
                      displaySPCCompliance?.readyForPreRegistration 
                        ? 'bg-green-100 text-green-800' 
                        : displaySPCCompliance?.overallReadinessPercentage >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {displaySPCCompliance?.overallReadinessPercentage}% Ready
                  </Badge>
                </div>
                <CardDescription>
                  Track your progress towards Singapore Pharmacy Council pre-registration requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Overall Readiness</span>
                      <span className="text-purple-600 font-bold">{displaySPCCompliance?.overallReadinessPercentage}%</span>
                    </div>
                    <Progress value={displaySPCCompliance?.overallReadinessPercentage} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current Level</span>
                      <span>Pre-registration Ready</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displaySPCCompliance?.requirementStatus && Object.entries(displaySPCCompliance.requirementStatus).map(([pa, status]: [string, any]) => (
                      <div key={pa} className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${
                          status.completed ? 'bg-green-100 text-green-600' : 
                          status.progressPercentage >= 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {status.completed ? <CheckCircle className="h-8 w-8" /> : 
                           status.progressPercentage >= 70 ? <ClockIcon className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                        </div>
                        <div className="text-sm font-medium">{pa}</div>
                        <div className="text-xs text-gray-500">{status.currentScore}% / {status.minScore}%</div>
                        <Progress value={status.progressPercentage} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Next Focus Areas</h4>
                    <div className="space-y-2">
                      {displaySPCCompliance?.nextFocusAreas?.slice(0, 3).map((area: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span className="text-purple-800">{area}</span>
                        </div>
                      )) || (
                        <p className="text-sm text-purple-700">Complete more scenarios to see focus areas!</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Summary */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{displayDashboardData?.totalSessions || 0}</div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{displayDashboardData?.recentActivity?.sessionsThisWeek || 0}</div>
                  <div className="text-sm text-gray-600">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{Math.round(displayDashboardData?.recentActivity?.averageScoreThisWeek || 0)}%</div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Current Focus Areas</h4>
                  {displayRecommendations?.nextSessionObjectives?.slice(0, 2).map((objective: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">{objective}</span>
                    </div>
                  )) || (
                    <p className="text-xs text-gray-500">Start practicing to see focus areas!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Competency Visualization */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* PA1-PA4 Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Professional Activities (PA1-PA4)
                </CardTitle>
                <CardDescription>
                  Your competency across Singapore's core pharmacy activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      data={displayCompetencyProgress?.competencyScores ? Object.entries(displayCompetencyProgress.competencyScores).map(([pa, data]: [string, any]) => ({
                        pa,
                        score: data.averageScore,
                        target: pa === 'PA2' ? 75 : pa === 'PA1' || pa === 'PA3' ? 70 : 65
                      })) : []}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="pa" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                      <PolarRadiusAxis 
                        angle={0} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }}
                        tickCount={6}
                      />
                      <Radar
                        name="Your Score"
                        dataKey="score"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                        strokeWidth={3}
                      />
                      <Radar
                        name="Target"
                        dataKey="target"
                        stroke="#E5E7EB"
                        fill="transparent"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Portfolio features coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Assessment resources coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
      
      </div>{/* End content wrapper */}
    </div>
  );
}
                <div className="mt-8 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assessment Results</h3>
                  </div>

                  {/* Performance Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {currentScenario.responseQuality || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Response Quality</div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {currentScenario.clinicalAccuracy || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Clinical Accuracy</div>
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {currentScenario.communicationEffectiveness || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Communication</div>
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {currentScenario.professionalismScore || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Professionalism</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        Clinical Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentScenario.feedback}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Model Answer */}
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Expert Model Answer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentScenario.modelAnswer}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Learning Tips */}
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-purple-500" />
                        Learning Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentScenario.learningTips}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Professional Documentation */}
                  {currentScenario.soapNotes && (
                    <Card className="border-gray-200 dark:border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-500" />
                          SOAP Notes Documentation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {currentScenario.soapNotes}
                        </pre>
                      </CardContent>
                    </Card>
                  )}

                  {/* Care Plan */}
                  {currentScenario.carePlan && (
                    <Card className="border-indigo-200 dark:border-indigo-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-indigo-500" />
                          Comprehensive Care Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentScenario.carePlan}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs with Enhanced Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-50">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white font-medium">
              <FileText className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Training Progress Overview */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Overall Readiness */}
            <Card className="lg:col-span-2 border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <CardTitle>Your Training Progress</CardTitle>
                  </div>
                  <Badge 
                    className={`${
                      displaySPCCompliance?.readyForPreRegistration 
                        ? 'bg-green-100 text-green-800' 
                        : displaySPCCompliance?.overallReadinessPercentage >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {displaySPCCompliance?.overallReadinessPercentage}% Ready
                  </Badge>
                </div>
                <CardDescription>
                  Track your progress towards Singapore Pharmacy Council pre-registration requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Overall Readiness</span>
                      <span className="text-purple-600 font-bold">{displaySPCCompliance?.overallReadinessPercentage}%</span>
                    </div>
                    <Progress value={displaySPCCompliance?.overallReadinessPercentage} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current Level</span>
                      <span>Pre-registration Ready</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displaySPCCompliance?.requirementStatus && Object.entries(displaySPCCompliance.requirementStatus).map(([pa, status]: [string, any]) => (
                      <div key={pa} className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${
                          status.completed ? 'bg-green-100 text-green-600' : 
                          status.progressPercentage >= 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {status.completed ? <CheckCircle className="h-8 w-8" /> : 
                           status.progressPercentage >= 70 ? <ClockIcon className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                        </div>
                        <div className="text-sm font-medium">{pa}</div>
                        <div className="text-xs text-gray-500">{status.currentScore}% / {status.minScore}%</div>
                        <Progress value={status.progressPercentage} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-purple-800">
                      <Target className="h-4 w-4" />
                      Next Steps to Improve
                    </h4>
                    {displaySPCCompliance?.nextMilestones?.length > 0 ? (
                      <div className="space-y-2">
                        {displaySPCCompliance.nextMilestones.slice(0, 3).map((milestone: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-purple-700">{milestone.milestone}</span>
                            <Badge variant="outline" className="text-purple-600 border-purple-300">
                              ~{milestone.estimatedSessions} sessions
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-purple-600">Complete practice sessions to see personalized milestones!</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{displayDashboardData?.totalSessions || 0}</div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{displayDashboardData?.recentActivity?.sessionsThisWeek || 0}</div>
                  <div className="text-sm text-gray-600">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{Math.round(displayDashboardData?.recentActivity?.averageScoreThisWeek || 0)}%</div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Current Focus Areas</h4>
                  {displayRecommendations?.nextSessionObjectives?.slice(0, 2).map((objective: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">{objective}</span>
                    </div>
                  )) || (
                    <p className="text-xs text-gray-500">Start practicing to see focus areas!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Competency Visualization */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* PA1-PA4 Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Professional Activities (PA1-PA4)
                </CardTitle>
                <CardDescription>
                  Your competency across Singapore's core pharmacy activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      data={displayCompetencyProgress?.competencyScores ? Object.entries(displayCompetencyProgress.competencyScores).map(([pa, data]: [string, any]) => ({
                        pa,
                        score: data.averageScore,
                        target: pa === 'PA2' ? 75 : pa === 'PA1' || pa === 'PA3' ? 70 : 65
                      })) : []}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="pa" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                      <PolarRadiusAxis 
                        angle={0} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }}
                        tickCount={6}
                      />
                      <Radar
                        name="Your Score"
                        dataKey="score"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                        strokeWidth={3}
                      />
                      <Radar
                        name="Target Score"
                        dataKey="target"
                        stroke="#E5E7EB"
                        fill="none"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{data.pa}</p>
                                <p className="text-purple-600">Current: {data.score}%</p>
                                <p className="text-gray-600">Target: {data.target}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {!displayCompetencyProgress && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 mb-3">Complete practice sessions to see your actual progress!</p>
                    <Button onClick={() => setActiveTab("assessments")} size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      Start Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Therapeutic Area Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Therapeutic Area Coverage
                </CardTitle>
                <CardDescription>
                  Your experience across different therapeutic domains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={displayCompetencyProgress?.therapeuticAreaMastery ? 
                        Object.entries(displayCompetencyProgress.therapeuticAreaMastery)
                          .map(([area, data]: [string, any]) => ({
                            area: area.slice(0, 8),
                            score: Math.round(data.averageScore),
                            sessions: data.sessionCount,
                            fullName: area
                          }))
                          .sort((a, b) => b.score - a.score) : []}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="area" 
                        tick={{ fontSize: 10 }} 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{data.fullName}</p>
                                <p className="text-red-600">Score: {data.score}%</p>
                                <p className="text-gray-600">Sessions: {data.sessions}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="score" 
                        fill="#DC2626"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {!displayCompetencyProgress && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">This shows your mastery across 7 therapeutic areas once you start practicing!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress Timeline */}
          {displayCompetencyProgress?.timelineData?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Your Learning Journey
                </CardTitle>
                <CardDescription>
                  Track your competency development over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayCompetencyProgress.timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-SG')}
                        formatter={(value: any, name: string) => [`${Math.round(value)}%`, name]}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="PA1" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="PA2" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="PA3" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="PA4" stackId="4" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Insights & Recommendations */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayDashboardData?.performanceMetrics?.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Your Strengths
                    </h4>
                    <ul className="space-y-1">
                      {displayDashboardData.performanceMetrics.strengths.map((strength: string, index: number) => (
                        <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {displayDashboardData?.performanceMetrics?.improvements?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Growth Opportunities
                    </h4>
                    <ul className="space-y-1">
                      {displayDashboardData.performanceMetrics.improvements.map((improvement: string, index: number) => (
                        <li key={index} className="text-sm text-orange-700 flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Performance Consistency</span>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round(displayDashboardData?.performanceMetrics?.consistencyScore || 0)}%
                    </span>
                  </div>
                  <Progress value={displayDashboardData?.performanceMetrics?.consistencyScore || 0} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">How consistent your performance is across different areas</p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Smart Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered suggestions to accelerate your learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                {displayRecommendations?.recommendations?.length > 0 ? (
                  <div className="space-y-4">
                    {displayRecommendations.recommendations.slice(0, 3).map((rec: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            className={`text-xs ${rec.priority >= 8 
                              ? 'bg-red-100 text-red-800' 
                              : rec.priority >= 6 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Priority {rec.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">{rec.expectedImprovement}</span>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{rec.reason}</h4>
                        <div className="text-xs text-gray-600 mb-2">
                          {rec.scenarios?.length || 0} practice scenarios available
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => setActiveTab("portfolio")}
                          className="w-full text-xs"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Build Portfolio
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50 text-yellow-500" />
                    <p className="text-gray-600 mb-4">Complete practice sessions to unlock personalized recommendations!</p>
                    <Button onClick={() => setActiveTab("portfolio")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Start Building Portfolio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gap Analysis Summary */}
          {displayGapAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Learning Gap Analysis
                </CardTitle>
                <CardDescription>
                  Identify areas that need attention to meet SPC requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{displayGapAnalysis.totalGaps}</div>
                    <div className="text-sm text-gray-600">Total Gaps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{displayGapAnalysis.highPriorityGaps}</div>
                    <div className="text-sm text-gray-600">High Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{displayGapAnalysis.estimatedTimeToCompletion?.totalWeeks || 0}</div>
                    <div className="text-sm text-gray-600">Estimated Weeks</div>
                  </div>
                  <div className="text-center">
                    <Button onClick={() => setActiveTab("portfolio")} className="h-auto flex-col py-3">
                      <Play className="h-6 w-6 mb-1" />
                      <span className="text-xs">Build Portfolio</span>
                    </Button>
                  </div>
                </div>

                {displayGapAnalysis.gaps?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Priority Areas for Improvement</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {displayGapAnalysis.gaps.slice(0, 4).map((gap: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {gap.professionalActivity ? `${gap.professionalActivity} Competency` : `${gap.area} Coverage`}
                            </div>
                            <div className="text-xs text-gray-600">
                              Gap: {gap.gap}{gap.professionalActivity ? '% below target' : ' sessions needed'}
                            </div>
                          </div>
                          <Badge 
                            className={`ml-2 ${gap.priority >= 8 
                              ? 'bg-red-100 text-red-800' 
                              : gap.priority >= 6 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            P{gap.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                Ready to Advance Your Training?
              </CardTitle>
              <CardDescription>
                Take the next step in your pharmacy pre-registration journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Button onClick={() => setActiveTab("portfolio")} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Build Portfolio
                </Button>
                <Button onClick={() => setActiveTab("dashboard")} variant="outline" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="portfolio" className="space-y-6">
          {/* Portfolio Overview */}
          {(portfolio as PerformPortfolio) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                  Pre-registration Training Portfolio
                </CardTitle>
                <CardDescription>
                  Comprehensive documentation of your competency development journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {parseFloat((portfolio as PerformPortfolio).completionPercentage).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {(portfolio as PerformPortfolio).counselingRecordsCompiled}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Counseling Records</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {(portfolio as PerformPortfolio).therapeuticAreasCovered.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Therapeutic Areas</div>
                    </div>
                  </div>

                  <Progress value={parseFloat((portfolio as PerformPortfolio).completionPercentage)} className="w-full" />

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => compilePortfolioMutation.mutate()}
                      disabled={compilePortfolioMutation.isPending}
                    >
                      {compilePortfolioMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Compile Portfolio
                    </Button>
                    {(portfolio as PerformPortfolio).portfolioDocument && (
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Portfolio
                      </Button>
                    )}
                  </div>

                  {(portfolio as PerformPortfolio).supervisorValidated && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Supervisor Validated</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {dashboardLoading || competencyLoading || complianceLoading || gapLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
                  <p className="text-gray-600">Loading analytics data...</p>
                </div>
              </CardContent>
            </Card>
          ) : !dashboardData?.totalSessions ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                  <p className="text-gray-600 mb-4">Complete practice sessions and assessments to view analytics</p>
                  <Button onClick={() => setActiveTab("assessments")} className="bg-purple-600 hover:bg-purple-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* SPC Compliance Overview */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <CardTitle>SPC Pre-Registration Readiness</CardTitle>
                    </div>
                    <Badge 
                      className={`${
                        spcCompliance?.readyForPreRegistration 
                          ? 'bg-green-100 text-green-800' 
                          : spcCompliance?.overallReadinessPercentage >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {spcCompliance?.overallReadinessPercentage}% Ready
                    </Badge>
                  </div>
                  <CardDescription>
                    Singapore Pharmacy Council competency requirements tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span className="font-medium">{spcCompliance?.overallReadinessPercentage}%</span>
                      </div>
                      <Progress value={spcCompliance?.overallReadinessPercentage} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {spcCompliance?.requirementStatus && Object.entries(spcCompliance.requirementStatus).map(([pa, status]: [string, any]) => (
                        <div key={pa} className="text-center">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                            status.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {status.completed ? <CheckCircle className="h-6 w-6" /> : <ClockIcon className="h-6 w-6" />}
                          </div>
                          <div className="text-sm font-medium">{pa}</div>
                          <div className="text-xs text-gray-500">{status.currentScore}/{status.minScore}</div>
                          <Progress value={status.progressPercentage} className="h-1 mt-1" />
                        </div>
                      ))}
                    </div>

                    {spcCompliance?.nextMilestones?.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Next Milestones
                        </h4>
                        <div className="space-y-2">
                          {spcCompliance.nextMilestones.map((milestone: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm">{milestone.milestone}</span>
                              <Badge variant="outline">{milestone.estimatedSessions} sessions</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Competency Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Professional Activity Competencies (PA1-PA4)
                  </CardTitle>
                  <CardDescription>
                    Your performance across Singapore's core pharmacy activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart 
                          data={competencyProgress?.competencyScores ? Object.entries(competencyProgress.competencyScores).map(([pa, data]: [string, any]) => ({
                            pa,
                            score: data.averageScore,
                            sessions: data.sessionCount,
                            level: data.competencyLevel
                          })) : []}
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="pa" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis 
                            angle={0} 
                            domain={[0, 100]} 
                            tick={{ fontSize: 10 }}
                            tickCount={6}
                          />
                          <Radar
                            name="Current Score"
                            dataKey="score"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                                    <p className="font-medium">{data.pa}</p>
                                    <p className="text-blue-600">Score: {data.score}%</p>
                                    <p className="text-gray-600">Sessions: {data.sessions}</p>
                                    <p className="text-purple-600">Level: {data.level}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-4">
                      {competencyProgress?.competencyScores && Object.entries(competencyProgress.competencyScores).map(([pa, data]: [string, any]) => (
                        <div key={pa} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{pa}</div>
                            <div className="text-sm text-gray-500">{data.competencyLevel} • {data.sessionCount} sessions</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{data.averageScore}%</div>
                            <div className="text-xs text-gray-500">Level {data.supervisionLevel}/5</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Timeline */}
              {competencyProgress?.timelineData?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-purple-600" />
                      Competency Development Timeline
                    </CardTitle>
                    <CardDescription>
                      Track your progress over time across all professional activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={competencyProgress.timelineData.slice(-20)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            formatter={(value: any, name: string) => [`${Math.round(value)}%`, name]}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="PA1" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="PA2" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="PA3" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="PA4" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Therapeutic Area Mastery */}
              {competencyProgress?.therapeuticAreaMastery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      Therapeutic Area Mastery
                    </CardTitle>
                    <CardDescription>
                      Your expertise across different therapeutic domains
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={Object.entries(competencyProgress.therapeuticAreaMastery)
                              .map(([area, data]: [string, any]) => ({
                                area: area.slice(0, 10),
                                score: Math.round(data.averageScore),
                                sessions: data.sessionCount,
                                mastery: data.masteryLevel
                              }))
                              .sort((a, b) => b.score - a.score)}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="area" 
                              tick={{ fontSize: 10 }} 
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Tooltip 
                              formatter={(value: any, name: string, props: any) => [
                                `${value}%`, 
                                `${props.payload.mastery} (${props.payload.sessions} sessions)`
                              ]}
                              labelFormatter={(label) => `Therapeutic Area: ${label}`}
                            />
                            <Bar 
                              dataKey="score" 
                              fill="#DC2626"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="space-y-3">
                        {Object.entries(competencyProgress.therapeuticAreaMastery)
                          .sort(([,a], [,b]) => (b as any).averageScore - (a as any).averageScore)
                          .slice(0, 5)
                          .map(([area, data]: [string, any]) => (
                            <div key={area} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium text-sm">{area}</div>
                                <div className="text-xs text-gray-500">{data.sessionCount} sessions</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={data.masteryLevel === 'Mastered' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                  }
                                >
                                  {data.masteryLevel}
                                </Badge>
                                <span className="text-sm font-medium">{Math.round(data.averageScore)}%</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Performance Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths & Improvements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      Performance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData?.performanceMetrics?.strengths?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {dashboardData.performanceMetrics.strengths.map((strength: string, index: number) => (
                            <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                              <CheckCircle className="h-3 w-3" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {dashboardData?.performanceMetrics?.improvements?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                          {dashboardData.performanceMetrics.improvements.map((improvement: string, index: number) => (
                            <li key={index} className="text-sm text-orange-700 flex items-center gap-2">
                              <AlertCircle className="h-3 w-3" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Consistency Score</span>
                        <span className="text-lg font-bold text-blue-600">
                          {Math.round(dashboardData?.performanceMetrics?.consistencyScore || 0)}%
                        </span>
                      </div>
                      <Progress value={dashboardData?.performanceMetrics?.consistencyScore || 0} className="mt-1" />
                    </div>
                  </CardContent>
                </Card>

                {/* Gap Analysis Summary */}
                {gapAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Gap Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-red-600">{gapAnalysis.totalGaps}</div>
                          <div className="text-xs text-gray-600">Total Gaps</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{gapAnalysis.highPriorityGaps}</div>
                          <div className="text-xs text-gray-600">High Priority</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{gapAnalysis.estimatedTimeToCompletion?.totalWeeks || 0}</div>
                          <div className="text-xs text-gray-600">Weeks to Complete</div>
                        </div>
                      </div>

                      {gapAnalysis.gaps?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Top Priority Gaps</h4>
                          <div className="space-y-2">
                            {gapAnalysis.gaps.slice(0, 3).map((gap: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <div className="text-sm font-medium">
                                    {gap.professionalActivity ? `${gap.professionalActivity} Competency` : `${gap.area} Coverage`}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Gap: {gap.gap}{gap.professionalActivity ? '%' : ' sessions'}
                                  </div>
                                </div>
                                <Badge 
                                  className={`${gap.priority >= 8 
                                    ? 'bg-red-100 text-red-800' 
                                    : gap.priority >= 6 
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  Priority {gap.priority}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Scenario Recommendations */}
              {recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Personalized Recommendations
                    </CardTitle>
                    <CardDescription>
                      AI-powered scenario recommendations based on your performance gaps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recommendations.recommendations?.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {recommendations.recommendations.slice(0, 4).map((rec: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge 
                                className={`${rec.priority >= 8 
                                  ? 'bg-red-100 text-red-800' 
                                  : rec.priority >= 6 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                Priority {rec.priority}
                              </Badge>
                              <span className="text-xs text-gray-500">{rec.expectedImprovement}</span>
                            </div>
                            <h4 className="font-medium mb-2">{rec.reason}</h4>
                            <div className="text-sm text-gray-600 mb-3">
                              {rec.scenarios?.length || 0} scenarios available
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => setActiveTab("assessments")}
                              className="w-full"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start Practice
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50 text-yellow-500" />
                        <p className="text-gray-600 mb-4">Complete more assessments to get personalized recommendations</p>
                        <Button onClick={() => setActiveTab("assessments")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Assessment
                        </Button>
                      </div>
                    )}

                    {recommendations.nextSessionObjectives?.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2 text-blue-800">Next Session Objectives</h4>
                        <ul className="space-y-1">
                          {recommendations.nextSessionObjectives.map((objective: string, index: number) => (
                            <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                              <Target className="h-3 w-3" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity Summary */}
              {dashboardData?.recentActivity && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-indigo-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">{dashboardData.recentActivity.sessionsThisWeek}</div>
                        <div className="text-sm text-gray-600">Sessions This Week</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{Math.round(dashboardData.recentActivity.averageScoreThisWeek)}%</div>
                        <div className="text-sm text-gray-600">Average Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{dashboardData.totalSessions}</div>
                        <div className="text-sm text-gray-600">Total Sessions</div>
                      </div>
                    </div>
                    
                    {dashboardData.recentActivity.lastActivityDate && (
                      <div className="mt-4 text-center text-sm text-gray-600">
                        Last activity: {new Date(dashboardData.recentActivity.lastActivityDate).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-gray-600" />
                    Export & Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF Report
                    </Button>
                    <Button variant="outline" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Competency Summary
                    </Button>
                    <Button variant="outline" disabled>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Progress Charts
                    </Button>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Coming Soon
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Assessment Resources
              </CardTitle>
              <CardDescription>
                Clinical guidelines, competency frameworks, and reference materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Assessment resources will be populated based on your selected therapeutic areas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div> {/* Close px-6 wrapper */}
    </div>
  );
}