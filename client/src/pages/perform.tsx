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
  Lightbulb
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

const createAssessmentSchema = z.object({
  assessmentType: z.string().min(1, "Assessment type is required"),
  therapeuticAreas: z.array(z.string()).min(1, "Select at least one therapeutic area"),
  practiceAreas: z.array(z.string()).min(1, "Select at least one practice area"),
  timeLimitMinutes: z.number().min(30).max(180, "Time limit must be between 30-180 minutes")
});

type CreateAssessmentData = z.infer<typeof createAssessmentSchema>;

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
  const [selectedAssessment, setSelectedAssessment] = useState<PerformAssessment | null>(null);
  const [currentScenario, setCurrentScenario] = useState<PerformScenario | null>(null);

  // Scroll to top when scenario loads
  useEffect(() => {
    if (currentScenario) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentScenario]);
  const [activeTab, setActiveTab] = useState("assessments");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's assessments
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/perform/assessments"],
    staleTime: 5 * 60 * 1000
  });

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

  // Create assessment form
  const assessmentForm = useForm<CreateAssessmentData>({
    resolver: zodResolver(createAssessmentSchema),
    defaultValues: {
      assessmentType: "competency_evaluation",
      therapeuticAreas: [],
      practiceAreas: [],
      timeLimitMinutes: 120
    }
  });

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

  // Create assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async (data: CreateAssessmentData) => {
      const response = await fetch("/api/perform/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create assessment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/perform/assessments"] });
      toast({ title: "Assessment created successfully" });
      assessmentForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create assessment", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Start assessment mutation
  const startAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const response = await fetch(`/api/perform/assessments/${assessmentId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to start assessment");
      return response.json();
    },
    onSuccess: (data: any) => {
      console.log('Start assessment response:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/perform/assessments"] });
      toast({ 
        title: "Assessment Ready!", 
        description: `Generated ${data.scenarios?.length || 0} clinical scenarios. Assessment started successfully.`
      });
      if (data.scenarios && data.scenarios.length > 0) {
        console.log('Setting current scenario:', data.scenarios[0]);
        setCurrentScenario(data.scenarios[0]);
        setSelectedAssessment(null); // Switch to scenario view
      } else {
        console.log('No scenarios in response, data:', data);
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to start assessment", 
        description: "Unable to generate assessment scenarios. Please check your connection and try again.",
        variant: "destructive" 
      });
    }
  });

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

  const handleCreateAssessment = (data: CreateAssessmentData) => {
    createAssessmentMutation.mutate(data);
  };

  const handleStartAssessment = (assessment: PerformAssessment) => {
    // Clear any existing scenario state to ensure fresh start
    setCurrentScenario(null);
    scenarioForm.reset();
    setSelectedAssessment(assessment);
    
    // Show immediate feedback to user about the generation process
    toast({ 
      title: "Generating Assessment Scenarios...", 
      description: "AI is creating personalized clinical scenarios. This may take up to 10 seconds.",
      duration: 8000 // Show for 8 seconds during generation
    });
    startAssessmentMutation.mutate(assessment.id);
  };

  const handleSubmitScenario = (data: ScenarioResponseData) => {
    if (currentScenario) {
      submitScenarioMutation.mutate({
        scenarioId: currentScenario.id,
        responses: data
      });
    }
  };

  const handleDeleteAssessment = (assessmentId: string) => {
    deleteAssessmentMutation.mutate(assessmentId);
  };

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

  if (assessmentsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg text-gray-600">Loading Module 3: Perform...</span>
        </div>
      </div>
    );
  }

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
            Back to Assessments
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

        <Card>
          <CardHeader>
            <CardTitle>Singapore 4-Stage Clinical Decision-Making Framework</CardTitle>
            <CardDescription>
              Complete each stage of the clinical assessment process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...scenarioForm}>
              <form onSubmit={scenarioForm.handleSubmit(handleSubmitScenario)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={scenarioForm.control}
                    name="informationGathering"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Stage 1: Information Gathering
                        </FormLabel>
                        <FormDescription>
                          Collect and analyze relevant patient information, medical history, and presenting complaints
                        </FormDescription>
                        <FormControl>
                          <textarea 
                            className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                            placeholder="Document your information gathering process, key questions, and relevant findings..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={scenarioForm.control}
                    name="clinicalReasoning"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Stage 2: Clinical Reasoning
                        </FormLabel>
                        <FormDescription>
                          Analyze information to identify drug-related problems and potential interventions
                        </FormDescription>
                        <FormControl>
                          <textarea 
                            className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                            placeholder="Describe your clinical reasoning process, differential diagnosis considerations, and therapeutic rationale..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={scenarioForm.control}
                    name="clinicalJudgment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Stage 3: Clinical Judgment
                        </FormLabel>
                        <FormDescription>
                          Make evidence-based decisions on optimal therapeutic interventions
                        </FormDescription>
                        <FormControl>
                          <textarea 
                            className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                            placeholder="Provide your clinical judgment, therapeutic recommendations, and evidence-based rationale..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={scenarioForm.control}
                    name="implementationPlanning"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Stage 4: Implementation & Monitoring
                        </FormLabel>
                        <FormDescription>
                          Develop monitoring plan and patient counseling strategy
                        </FormDescription>
                        <FormControl>
                          <textarea 
                            className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                            placeholder="Outline your implementation plan, monitoring parameters, and patient education approach..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <FormField
                    control={scenarioForm.control}
                    name="soapNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          SOAP Documentation
                        </FormLabel>
                        <FormDescription>
                          Document your assessment using the SOAP format
                        </FormDescription>
                        <FormControl>
                          <textarea 
                            className="w-full min-h-[120px] p-3 border rounded-md resize-none"
                            placeholder="Subjective: Patient reports...&#10;Objective: Clinical findings...&#10;Assessment: Drug-related problems...&#10;Plan: Therapeutic interventions..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={scenarioForm.control}
                    name="carePlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Patient Care Plan
                        </FormLabel>
                        <FormDescription>
                          Comprehensive care plan including lifestyle recommendations
                        </FormDescription>
                        <FormControl>
                          <textarea 
                            className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                            placeholder="Develop a comprehensive care plan including medication management, lifestyle modifications, and follow-up requirements..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentScenario(null)}>
                    Save & Exit
                  </Button>
                  <Button type="submit" disabled={submitScenarioMutation.isPending}>
                    {submitScenarioMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Response
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
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

      {/* Current Assessment Progress */}
      {selectedAssessment && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Active Assessment: {selectedAssessment.assessmentType.replace('_', ' ').toUpperCase()}
            </CardTitle>
            <CardDescription>
              Duration: {formatDuration(selectedAssessment.actualDurationMinutes)} / {formatDuration(selectedAssessment.timeLimitMinutes)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={selectedAssessment.scenarios ? 
                (selectedAssessment.scenarios.filter(s => s.completedAt).length / selectedAssessment.scenarios.length) * 100 : 0} 
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => completeAssessmentMutation.mutate(selectedAssessment.id)}
                  disabled={!selectedAssessment.scenarios?.every(s => s.completedAt)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Assessment
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedAssessment(null);
                  setCurrentScenario(null);
                  scenarioForm.reset();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Interface */}
      {currentScenario && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-green-500" />
                  Clinical Scenario {currentScenario.scenarioOrder}
                </CardTitle>
                <CardDescription>
                  {currentScenario.therapeuticArea} • {currentScenario.practiceArea} • {currentScenario.complexityLevel}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCurrentScenario(null);
                  scenarioForm.reset();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Exit Simulation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Scenario Details */}
              <div className="grid gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Patient Background</h4>
                  <p className="text-gray-700 dark:text-gray-300">{currentScenario.patientBackground}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Clinical Presentation</h4>
                  <p className="text-gray-700 dark:text-gray-300">{currentScenario.clinicalPresentation}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Medication History</h4>
                  <p className="text-gray-700 dark:text-gray-300">{currentScenario.medicationHistory}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Assessment Objectives</h4>
                  <p className="text-gray-700 dark:text-gray-300">{currentScenario.assessmentObjectives}</p>
                </div>
              </div>

              {/* Response Form */}
              <Form {...scenarioForm}>
                <form onSubmit={scenarioForm.handleSubmit(handleSubmitScenario)} className="space-y-6">
                  <div className="grid gap-4">
                    <FormField
                      control={scenarioForm.control}
                      name="informationGathering"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>1. Information Gathering</FormLabel>
                          <FormDescription>
                            Describe your approach to gathering additional patient information
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="What additional information would you gather? What questions would you ask the patient?"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scenarioForm.control}
                      name="clinicalReasoning"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>2. Clinical Reasoning</FormLabel>
                          <FormDescription>
                            Explain your clinical reasoning process and differential considerations
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="What is your clinical reasoning? What factors are you considering?"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scenarioForm.control}
                      name="clinicalJudgment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>3. Clinical Judgment</FormLabel>
                          <FormDescription>
                            Describe your clinical judgment and therapeutic recommendations
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="What is your clinical judgment? What are your therapeutic recommendations?"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scenarioForm.control}
                      name="implementationPlanning"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>4. Implementation & Monitoring</FormLabel>
                          <FormDescription>
                            Detail your implementation plan and monitoring strategy
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="How would you implement your recommendations? What monitoring would you establish?"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scenarioForm.control}
                      name="soapNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SOAP Notes (Optional)</FormLabel>
                          <FormDescription>
                            Provide professional SOAP documentation
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Subjective, Objective, Assessment, Plan..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scenarioForm.control}
                      name="carePlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comprehensive Care Plan (Optional)</FormLabel>
                          <FormDescription>
                            Develop a comprehensive pharmaceutical care plan
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed care plan including goals, interventions, and outcomes..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitScenarioMutation.isPending}
                    className="w-full"
                  >
                    {submitScenarioMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Submit Scenario Response
                  </Button>
                </form>
              </Form>

              {/* Assessment Evaluation Results */}
              {currentScenario.completedAt && currentScenario.feedback && (
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

      {/* Portfolio Development Framework */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Portfolio Development Framework</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Build evidence of competency across therapeutic areas and supervision levels for Singapore Pre-registration Training.
          </p>
        </div>
        
        <div className="mb-8">
          <img 
            src={portfolioFrameworkImage} 
            alt="Portfolio development framework diagram" 
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">PA1-PA4 Competencies</h3>
              <p className="text-sm text-gray-600">Direct patient care across 4 competency levels with supervision progression</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center mx-auto">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">7 Therapeutic Areas</h3>
              <p className="text-sm text-gray-600">Coverage across cardiovascular, respiratory, endocrine, and other core areas</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center mx-auto">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">14 Counseling Records</h3>
              <p className="text-sm text-gray-600">Comprehensive documentation for pre-registration training compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs with Enhanced Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-50">
            <TabsTrigger value="assessments" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
              <GraduationCap className="h-4 w-4" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
              <FileText className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white font-medium">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="assessments" className="space-y-6">
          {/* Create New Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Create New Assessment
              </CardTitle>
              <CardDescription>
                Start a new competency assessment for your Pre-registration Training portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...assessmentForm}>
                <form onSubmit={assessmentForm.handleSubmit(handleCreateAssessment)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={assessmentForm.control}
                      name="assessmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assessment Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select assessment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(constants as any)?.assessmentTypes?.map((type: string) => (
                                <SelectItem key={type} value={type}>
                                  {type.replace('_', ' ').split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                  ).join(' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assessmentForm.control}
                      name="timeLimitMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (minutes)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time limit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="60">60 minutes</SelectItem>
                              <SelectItem value="90">90 minutes</SelectItem>
                              <SelectItem value="120">120 minutes</SelectItem>
                              <SelectItem value="150">150 minutes</SelectItem>
                              <SelectItem value="180">180 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={assessmentForm.control}
                    name="therapeuticAreas"
                    render={() => (
                      <FormItem>
                        <FormLabel>Therapeutic Areas</FormLabel>
                        <FormDescription>Select the therapeutic areas for your assessment</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {(constants as any)?.therapeuticAreas?.map((area: string) => (
                            <FormField
                              key={area}
                              control={assessmentForm.control}
                              name="therapeuticAreas"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(area)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, area])
                                          : field.onChange(field.value?.filter((value) => value !== area))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal capitalize">
                                    {area}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={assessmentForm.control}
                    name="practiceAreas"
                    render={() => (
                      <FormItem>
                        <FormLabel>Practice Areas</FormLabel>
                        <FormDescription>Select the practice settings for your assessment</FormDescription>
                        <div className="grid grid-cols-2 gap-2">
                          {(constants as any)?.practiceAreas?.map((area: string) => (
                            <FormField
                              key={area}
                              control={assessmentForm.control}
                              name="practiceAreas"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(area)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, area])
                                          : field.onChange(field.value?.filter((value) => value !== area))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal capitalize">
                                    {area}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={createAssessmentMutation.isPending}
                    className="w-full"
                  >
                    {createAssessmentMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Create Assessment
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Assessment History with Better Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Assessment Management</h3>
              <div className="flex gap-2 text-sm text-gray-600">
                <Badge variant="outline" className="text-blue-600">
                  {(assessments as PerformAssessment[]).filter(a => a.status === 'in_progress').length} Active
                </Badge>
                <Badge variant="outline" className="text-green-600">
                  {(assessments as PerformAssessment[]).filter(a => a.status === 'completed').length} Complete
                </Badge>
              </div>
            </div>
            
            <div className="grid gap-4">
              {(assessments as PerformAssessment[]).map((assessment: PerformAssessment) => (
                <Card key={assessment.id} className={`hover:shadow-md transition-shadow ${assessment.status === 'in_progress' ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{assessment.assessmentType.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Started: {new Date(assessment.startedAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-1">
                          {assessment.therapeuticAreas.map(area => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                        {assessment.overallCompetencyScore && (
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Overall Score: {parseFloat(assessment.overallCompetencyScore).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {(assessment.status === 'draft' || assessment.status === 'in_progress') && !assessment.scenarios?.length && (
                          <Button 
                            onClick={() => handleStartAssessment(assessment)}
                            disabled={startAssessmentMutation.isPending}
                          >
                            {startAssessmentMutation.isPending ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Starting Assessment...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start Assessment
                              </>
                            )}
                          </Button>
                        )}
                        {assessment.status === 'in_progress' && (assessment.scenarios?.length ?? 0) > 0 && (
                          <Button onClick={() => setSelectedAssessment(assessment)}>
                            <Play className="h-4 w-4 mr-2" />
                            Continue Assessment
                          </Button>
                        )}
                        {assessment.status === 'completed' && (
                          <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                        )}
                        
                        {/* Delete button for draft and in-progress assessments */}
                        {(assessment.status === 'draft' || assessment.status === 'in_progress') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this {assessment.assessmentType.replace('_', ' ')} assessment? 
                                  This action cannot be undone and will remove all associated scenarios and progress.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAssessment(assessment.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Assessment
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Track your competency development and assessment performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics will be available after completing assessments</p>
              </div>
            </CardContent>
          </Card>
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