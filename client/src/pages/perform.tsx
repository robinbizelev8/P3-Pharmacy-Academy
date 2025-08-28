import { useState, useEffect } from "react";
import { Link } from "wouter";
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
import { PlusCircle, Upload, ExternalLink, Database } from "lucide-react";
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
  ProfessionalActivityBadge,
  ProfessionalActivitiesGrid,
  type ProfessionalActivityCode
} from "@/components/ui/professional-activity-badge";
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  FileText,
  Target,
  Stethoscope,
  GraduationCap,
  BarChart3,
  Play,
  Pause,
  RefreshCw,
  ArrowLeft,
  Activity,
  Search,
  Brain,
  Heart,
  Send,
  Trophy,
  Trash2,
  X,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  Star,
  Plus,
  ChevronRight,
  FileCheck,
  Shield,
  AlertTriangle,
  Zap,
  Eye,
  Info,
  Gauge,
  Filter,
  Calendar,
  Clock,
  Users,
  Download
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

  // Enhanced analytics queries - Now enabled for real data
  const { data: competencyProgress, isLoading: competencyLoading } = useQuery({
    queryKey: ["/api/perform/competency-progress"],
    staleTime: 2 * 60 * 1000,
    enabled: true
  });

  const { data: spcCompliance, isLoading: complianceLoading } = useQuery({
    queryKey: ["/api/perform/spc-compliance"], 
    staleTime: 2 * 60 * 1000,
    enabled: true
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/perform/dashboard"],
    staleTime: 2 * 60 * 1000,
    enabled: true
  });

  const { data: gapAnalysis, isLoading: gapLoading } = useQuery({
    queryKey: ["/api/perform/gap-analysis"],
    staleTime: 2 * 60 * 1000,
    enabled: true
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/perform/recommendations"],
    staleTime: 2 * 60 * 1000,
    enabled: true
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
    nextFocusAreas: [
      "Improve PA2 medication safety competency",
      "Expand neurological therapeutic area knowledge",
      "Practice patient counseling techniques"
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
    priorityAreas: [
      {
        competency: "PA2 - Medication Safety",
        therapeuticArea: "Cardiovascular",
        currentScore: 38,
        targetScore: 75,
        priority: "high",
        recommendation: "Focus on drug interaction assessments and safety monitoring protocols",
        suggestedActions: ["Complete drug interaction scenarios", "Practice safety protocols", "Study MOH guidelines"]
      },
      {
        competency: "PA4 - Clinical Research",
        therapeuticArea: "Endocrine",
        currentScore: 43,
        targetScore: 65,
        priority: "medium",
        recommendation: "Develop evidence-based practice skills and research methodology",
        suggestedActions: ["Review clinical studies", "Practice data interpretation", "Learn research methods"]
      }
    ],
    progressTrends: [
      { date: "2024-01-15", score: 35 },
      { date: "2024-01-22", score: 42 },
      { date: "2024-01-29", score: 48 },
      { date: "2024-02-05", score: 52 },
      { date: "2024-02-12", score: 58 }
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

  // Phase 1: Enable real data flow - Remove demo fallbacks
  const hasRealSPCData = spcCompliance && typeof spcCompliance === 'object' && !complianceLoading;
  const hasRealCompetencyData = competencyProgress && typeof competencyProgress === 'object' && !competencyLoading;
  const hasRealDashboardData = dashboardData && typeof dashboardData === 'object' && !dashboardLoading;
  const hasRealGapData = gapAnalysis && typeof gapAnalysis === 'object' && !gapLoading;
  const hasRealRecommendationData = recommendations && typeof recommendations === 'object' && !recommendationsLoading;

  // Use real data only - no more demo fallbacks
  const displaySPCCompliance: any = hasRealSPCData ? spcCompliance : null;
  const displayCompetencyProgress: any = hasRealCompetencyData ? competencyProgress : null;
  const displayDashboardData: any = hasRealDashboardData ? dashboardData : null;
  const displayGapAnalysis: any = hasRealGapData ? gapAnalysis : null;
  const displayRecommendations: any = hasRealRecommendationData ? recommendations : null;
  
  // Additional mock data for portfolio and knowledge features
  const displayPortfolioProgress = {
    completionPercentage: 65,
    competencyStatus: {
      PA1: { evidenceCount: 3, requiredEvidence: 5, completed: false },
      PA2: { evidenceCount: 5, requiredEvidence: 5, completed: true },
      PA3: { evidenceCount: 2, requiredEvidence: 5, completed: false },
      PA4: { evidenceCount: 1, requiredEvidence: 5, completed: false }
    },
    priorityTasks: [
      "Complete PA3 evidence documentation",
      "Submit PA1 portfolio for review",
      "Review PA4 competency requirements"
    ]
  };
  
  const displayPortfolioEntries = [
    {
      id: "1",
      title: "Cardiovascular Case Study",
      description: "Patient counseling for hypertension management",
      date: "2023-12-01",
      competencies: ["PA1", "PA2"],
      status: "approved"
    },
    {
      id: "2", 
      title: "Drug Interaction Assessment",
      description: "Analysis of ACE inhibitor and NSAID interactions",
      date: "2023-11-28",
      competencies: ["PA3"],
      status: "pending"
    }
  ];
  
  const knowledgeStatus = {
    mohGuidelines: 45,
    ndfEntries: 1200,
    spcResources: 89,
    lastUpdated: "2023-12-15"
  };

  // Removed assessment form

  // Removed scenario and assessment forms and mutations

  // Removed assessment-related mutations

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

  // Submit scenario mutation for portfolio documentation
  const submitScenarioMutation = useMutation({
    mutationFn: async ({ scenarioId, responses }: { scenarioId: string; responses: ScenarioResponseData }) => {
      const response = await fetch(`/api/perform/scenarios/${scenarioId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responses)
      });
      if (!response.ok) throw new Error("Failed to submit scenario response");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perform/portfolio"] });
      toast({ title: "Response submitted for portfolio documentation" });
      setCurrentScenario(null); // Return to dashboard
    },
    onError: (error: any) => {
      toast({ 
        title: "Submission failed", 
        description: error?.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

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
            <p className="text-sm text-gray-600 mb-3">Track progress across Professional Activities (Clinical Care, Supply & Safety, Patient Education, Drug Information)</p>
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
          <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-50">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
              <Target className="h-4 w-4" />
              Assessments
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
                           status.progressPercentage >= 70 ? <Clock className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                        </div>
                        <div className="mb-1">
                          <ProfessionalActivityBadge code={pa as ProfessionalActivityCode} size="sm" showDescription />
                        </div>
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
                  Professional Activities Competency
                  {!hasRealCompetencyData && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      Demo Data
                    </Badge>
                  )}
                  {hasRealCompetencyData && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      Live Data
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Your competency across Singapore's core pharmacy activities: Clinical Care, Supply & Safety, Patient Education, and Drug Information Services
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
                        <div className="mb-1">
                          <ProfessionalActivityBadge code={pa as ProfessionalActivityCode} size="sm" showDescription />
                        </div>
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
          {/* Professional Activities Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                Professional Activities (PA1-PA4) Guide
              </CardTitle>
              <CardDescription>
                Understanding Singapore Pharmacy Council's core competency framework for pre-registration training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfessionalActivitiesGrid />
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">About Singapore's Professional Activities Framework</h4>
                <p className="text-sm text-blue-800">
                  The Singapore Pharmacy Council requires pre-registration pharmacists to demonstrate competency across four core Professional Activities (PA1-PA4). 
                  Each activity represents essential skills needed for safe, effective pharmaceutical care in Singapore's healthcare system. 
                  Your progress in these activities determines your readiness for full registration as a practicing pharmacist.
                </p>
              </div>
            </CardContent>
          </Card>

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
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Use the same demo data as main component
  const displaySPCCompliance = {
    overallReadinessPercentage: 45,
    requirementStatus: {
      PA1: { minScore: 70, currentScore: 52, supervisionLevel: 2, minSupervisionLevel: 3, completed: false, progressPercentage: 74 },
      PA2: { minScore: 75, currentScore: 38, supervisionLevel: 1, minSupervisionLevel: 4, completed: false, progressPercentage: 51 },
      PA3: { minScore: 70, currentScore: 61, supervisionLevel: 2, minSupervisionLevel: 3, completed: false, progressPercentage: 87 },
      PA4: { minScore: 65, currentScore: 43, supervisionLevel: 2, minSupervisionLevel: 3, completed: false, progressPercentage: 66 }
    },
    nextFocusAreas: [
      "Improve PA2 medication safety competency",
      "Expand neurological therapeutic area knowledge",
      "Practice patient counseling techniques"
    ],
    readyForPreRegistration: false
  };
  
  const displayDashboardData = {
    totalSessions: 10,
    recentActivity: {
      sessionsThisWeek: 2,
      averageScoreThisWeek: 58
    }
  };
  
  const displayRecommendations = {
    nextSessionObjectives: [
      "Improve PA2 competency",
      "Practice Neurological therapeutic area scenarios",
      "Maintain excellence in PA3"
    ]
  };
  
  const displayCompetencyProgress = {
    competencyScores: {
      PA1: { averageScore: 52, sessionCount: 3, supervisionLevel: 2, competencyLevel: 'Advanced Beginner' },
      PA2: { averageScore: 38, sessionCount: 1, supervisionLevel: 1, competencyLevel: 'Novice' },
      PA3: { averageScore: 61, sessionCount: 4, supervisionLevel: 2, competencyLevel: 'Advanced Beginner' },
      PA4: { averageScore: 43, sessionCount: 2, supervisionLevel: 2, competencyLevel: 'Advanced Beginner' }
    }
  };

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
                <span className="text-sm font-medium text-gray-700">Professional Activities Framework</span>
                <div className="flex gap-1">
                  <ProfessionalActivityBadge code="PA1" size="sm" showTooltip={false} />
                  <ProfessionalActivityBadge code="PA2" size="sm" showTooltip={false} />
                  <ProfessionalActivityBadge code="PA3" size="sm" showTooltip={false} />
                  <ProfessionalActivityBadge code="PA4" size="sm" showTooltip={false} />
                </div>
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
                           status.progressPercentage >= 70 ? <Clock className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                        </div>
                        <div className="mb-1">
                          <ProfessionalActivityBadge code={pa as ProfessionalActivityCode} size="sm" showDescription />
                        </div>
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
                  Professional Activities Competency
                  {!hasRealCompetencyData && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      Demo Data
                    </Badge>
                  )}
                  {hasRealCompetencyData && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      Live Data
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Your competency across Singapore's core pharmacy activities: Clinical Care, Supply & Safety, Patient Education, and Drug Information Services
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

        <TabsContent value="assessments" className="space-y-6">
          {/* Assessment Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <FileText className="h-10 w-10 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-green-900 mb-2">Assessment Report</h3>
                <p className="text-sm text-green-700 mb-4">View detailed performance analysis with question feedback</p>
                <Link to="/perform/assessment-report/demo-assessment-id">
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-full" data-testid="button-view-report">
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Plus className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-blue-900 mb-2">Create Assessment</h3>
                <p className="text-sm text-blue-700 mb-4">Design custom competency evaluations</p>
                <Link to="/perform/create-assessment">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full" data-testid="button-create-assessment">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Brain className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold text-purple-900 mb-2">Adaptive Assessment</h3>
                <p className="text-sm text-purple-700 mb-4">AI-powered difficulty adjustment</p>
                <Link to="/perform/adaptive-assessment/demo-session-123">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full" data-testid="button-adaptive-assessment">
                    <Brain className="h-4 w-4 mr-2" />
                    Try Adaptive
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Statistics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">81.5%</p>
                </div>
                <div className="ml-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">94%</p>
                </div>
                <div className="ml-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                  <p className="text-2xl font-bold text-purple-600">12</p>
                </div>
                <div className="ml-4">
                  <FileCheck className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Improvement</p>
                  <p className="text-2xl font-bold text-emerald-600">+12%</p>
                </div>
                <div className="ml-4">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Your latest assessment activities and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">PA1-PA4 Competency Assessment</h4>
                      <p className="text-sm text-gray-500">Comprehensive • 2024-01-15</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">85/100</p>
                      <Badge className="text-xs bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                    <Link to="/perform/assessment-report/demo-assessment-id">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Adaptive Clinical Scenarios</h4>
                      <p className="text-sm text-gray-500">Adaptive • 2024-01-12</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">78/100</p>
                      <Badge variant="secondary" className="text-xs">Good</Badge>
                    </div>
                    <Link to="/perform/adaptive-assessment/demo-session-123">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Portfolio features coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assessment Performance Analytics</h2>
              <p className="text-gray-600 mt-1">
                Track your competency development according to Singapore Pharmacy Council guidelines
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/perform/assessment-report/demo-assessment-id">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" data-testid="button-view-report">
                  <FileText className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </Link>
              <Link to="/perform/create-assessment">
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-assessment">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              </Link>
            </div>
          </div>

          {/* Assessment Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Assessment Analysis</CardTitle>
              <CardDescription>
                Comprehensive breakdown of your latest assessment performance with question-by-question feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Report Available</h3>
                <p className="text-gray-600 mb-4">
                  View your detailed assessment analysis with question-by-question feedback, competency breakdown, and personalized learning recommendations.
                </p>
                <div className="flex gap-3">
                  <Link to="/perform/assessment-report/demo-assessment-id">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <FileText className="h-4 w-4 mr-2" />
                      View Detailed Report
                    </Button>
                  </Link>
                  <Link to="/perform/adaptive-assessment/demo-session-123">
                    <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                      <Brain className="h-4 w-4 mr-2" />
                      Try Adaptive Assessment
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      </div>{/* End content wrapper */}
    </div>
  );
}
