import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Clock, 
  User, 
  Activity, 
  Heart, 
  Search,
  Filter,
  Building2,
  MapPin,
  Zap,
  CalendarDays,
  GraduationCap,
  TrendingUp,
  MessageCircle,
  Users,
  Stethoscope,
  Send,
  Target,
  FileText,
  HelpCircle,
  X,
  CheckCircle,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

// Import generated images
import clinicalSimulationImage from "@assets/generated_images/Clinical_Pharmacy_AI_Simulation_5f537ce8.png";
import decisionProcessImage from "@assets/generated_images/Clinical_Decision_Making_Process_0d453270.png";
import caseInterfaceImage from "@assets/generated_images/Interactive_Case_Scenario_Interface_32755a7e.png";

// Patient Chat Simulation Interface
export default function PracticePage() {
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentStage, setCurrentStage] = useState(1);
  const [showSessionNotes, setShowSessionNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState("all");
  const [practiceAreaFilter, setPracticeAreaFilter] = useState("all");
  const [caseTypeFilter, setCaseTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");

  // Fetch practice scenarios
  const { data: allScenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ["/api/pharmacy/scenarios", { module: "practice" }]
  });

  // Fetch pharmacy constants for filtering
  const { data: constants } = useQuery({
    queryKey: ["/api/pharmacy/constants"]
  }) as { data: any };

  // Session stages for chat simulation
  const sessionStages = [
    { 
      id: 1, 
      title: "Patient History Taking",
      objective: "Gather comprehensive patient history and current symptoms",
      guidance: "Ask open-ended questions about the patient's chief complaint, medical history, and current medications."
    },
    { 
      id: 2, 
      title: "Clinical Assessment", 
      objective: "Analyze symptoms and identify potential drug-related problems",
      guidance: "Evaluate the information gathered and identify clinical concerns or medication issues."
    },
    { 
      id: 3, 
      title: "Therapeutic Planning",
      objective: "Develop and discuss treatment recommendations",
      guidance: "Propose therapeutic interventions and explain your clinical reasoning to the patient."
    },
    { 
      id: 4, 
      title: "Patient Counseling",
      objective: "Provide medication counseling and follow-up instructions",
      guidance: "Educate the patient about their medications, side effects, and adherence strategies."
    }
  ];

  // Helper functions for current stage
  const getCurrentStageNumber = () => currentStage;
  const getCurrentStageTitle = () => sessionStages[currentStage - 1]?.title || "Unknown Stage";
  const getCurrentObjective = () => sessionStages[currentStage - 1]?.objective || "";
  const getCurrentGuidance = () => sessionStages[currentStage - 1]?.guidance || "";

  // Filter and sort scenarios
  const filteredAndSortedScenarios = useMemo(() => {
    if (!allScenarios || !Array.isArray(allScenarios)) return [];
    
    let filtered = allScenarios.filter((scenario: any) => {
      const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scenario.patientBackground.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scenario.clinicalPresentation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTherapeutic = therapeuticAreaFilter === "all" || scenario.therapeuticArea === therapeuticAreaFilter;
      const matchesPractice = practiceAreaFilter === "all" || scenario.practiceArea === practiceAreaFilter;
      const matchesCaseType = caseTypeFilter === "all" || scenario.caseType === caseTypeFilter;
      const matchesDifficulty = difficultyFilter === "all" || scenario.difficulty === difficultyFilter;
      
      return matchesSearch && matchesTherapeutic && matchesPractice && matchesCaseType && matchesDifficulty;
    });

    // Sort filtered results
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "therapeuticArea":
          return a.therapeuticArea.localeCompare(b.therapeuticArea);
        case "practiceArea":
          return a.practiceArea.localeCompare(b.practiceArea);
        case "difficulty":
          const difficultyOrder = ["beginner", "intermediate", "advanced"];
          return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
        case "caseType":
          return a.caseType.localeCompare(b.caseType);
        case "patientAge":
          return a.patientAge - b.patientAge;
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [allScenarios, searchTerm, therapeuticAreaFilter, practiceAreaFilter, caseTypeFilter, difficultyFilter, sortBy]);

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      const response = await fetch("/api/pharmacy/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scenarioId,
          module: "practice",
          sessionType: "chat_simulation"
        })
      });
      if (!response.ok) throw new Error("Failed to create session");
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      // Initialize chat with patient's opening message
      const initialMessage = {
        role: 'patient',
        content: getPatientOpeningMessage(selectedScenario),
        timestamp: new Date().toISOString(),
        stage: 1
      };
      setMessages([initialMessage]);
      setCurrentStage(1);
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/sessions"] });
      toast({
        title: "Session Started",
        description: `Chat simulation with ${selectedScenario?.patientGender} patient has begun.`
      });
    }
  });

  // Get patient's opening message based on scenario
  const getPatientOpeningMessage = (scenario: any) => {
    if (!scenario) return "";
    
    const setting = scenario.practiceArea === 'hospital' ? 'hospital' : 'pharmacy';
    
    // Generate natural, layperson opening based on therapeutic area
    const naturalOpenings = {
      'cardiovascular': [
        "I am here about my heart medication. The doctor said my blood pressure is high.",
        "I need to speak with someone about my heart pills. I have some questions.",
        "Hello, the doctor started me on some medication for my heart. I wanted to ask about it."
      ],
      'respiratory': [
        "I am having trouble breathing and the doctor gave me an inhaler.",
        "I came to get my asthma medication. I am not sure how to use it properly.",
        "I have been having breathing problems and need help with my new medicine."
      ],
      'endocrine': [
        "I was told I have diabetes and need to take medication now.",
        "The doctor said my sugar is high and gave me these pills.",
        "I am here about my diabetes medication. I am quite worried about it."
      ],
      'gi': [
        "I have been having stomach problems and the doctor gave me some medicine.",
        "I need help with my stomach medication. It has been hurting a lot.",
        "The doctor said I have stomach issues and prescribed something for it."
      ],
      'renal': [
        "I have kidney problems and the doctor wants me to take this medication.",
        "I am here about pills for my kidneys. The doctor said they are not working well.",
        "I need to ask about my kidney medication. I am a bit confused about it."
      ],
      'dermatological': [
        "I have a skin problem and the doctor gave me this cream.",
        "My skin has been really bad lately. I need help with this medication.",
        "I am here about my skin condition. The doctor prescribed something for it."
      ],
      'neurological': [
        "I have been having headaches and the doctor gave me medication.",
        "I need help with my medication for headaches and dizziness.",
        "The doctor said I have nerve problems and prescribed these pills."
      ]
    };
    
    const areaOpenings = naturalOpenings[scenario.therapeuticArea] || [
      "I need help with my medication. The doctor said I should speak with you.",
      "I have some questions about my new prescription.",
      "Hello, I am here about my medication. Can you help me understand it?"
    ];
    
    // Randomly select an opening for this therapeutic area
    const selectedOpening = areaOpenings[Math.floor(Math.random() * areaOpenings.length)];
    
    return selectedOpening;
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, stage }: { message: string; stage: number }) => {
      const response = await fetch(`/api/pharmacy/sessions/${currentSession.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message,
          role: "user",
          stage: stage,
          scenarioContext: selectedScenario
        })
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: (response) => {
      // Add AI patient response and coaching
      const patientResponse = {
        role: 'patient',
        content: response.patientResponse,
        timestamp: new Date().toISOString(),
        stage: currentStage
      };
      
      const coachingResponse = {
        role: 'coach',
        content: response.coaching,
        timestamp: new Date().toISOString(),
        stage: currentStage
      };

      setMessages(prev => [...prev, patientResponse, coachingResponse]);
      
      // Check if stage should advance
      if (response.advanceStage && currentStage < 4) {
        setCurrentStage(prev => prev + 1);
        toast({
          title: "Stage Complete",
          description: `Moving to ${sessionStages[currentStage]?.title}`
        });
      }
      
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString(),
      stage: currentStage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Send to AI for patient response and coaching
    sendMessageMutation.mutate({
      message: currentMessage,
      stage: currentStage
    });
    
    setCurrentMessage("");
  };

  const startScenario = (scenario: any) => {
    setSelectedScenario(scenario);
    createSessionMutation.mutate(scenario.id);
  };

  const endSession = () => {
    setCurrentSession(null);
    setSelectedScenario(null);
    setMessages([]);
    setCurrentStage(1);
    setCurrentMessage("");
    toast({
      title: "Session Ended",
      description: "Your clinical simulation has been completed."
    });
  };

  // Get coaching tip mutation
  const getCoachingTipMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/pharmacy/ai-coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I need guidance for ${sessionStages[currentStage - 1]?.title} stage in this ${selectedScenario?.therapeuticArea} case. What should I focus on?`,
          therapeuticArea: selectedScenario?.therapeuticArea || 'general',
          practiceArea: selectedScenario?.practiceArea || 'hospital',
          professionalActivity: selectedScenario?.professionalActivity || 'PA3',
          language: 'en'
        })
      });
      if (!response.ok) throw new Error("Failed to get coaching tip");
      return response.json();
    },
    onSuccess: (response) => {
      // Add coaching tip as a special message
      const coachingTip = {
        role: 'coach',
        content: response.response,
        timestamp: new Date().toISOString(),
        stage: currentStage,
        isCoachingTip: true
      };
      
      setMessages(prev => [...prev, coachingTip]);
      toast({
        title: "Coaching Tip Received",
        description: "Expert guidance has been added to your chat."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get coaching tip. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getCoachingTip = () => {
    if (!currentSession || !selectedScenario) {
      toast({
        title: "No Active Session",
        description: "Please start a scenario first to get coaching tips.",
        variant: "destructive"
      });
      return;
    }
    getCoachingTipMutation.mutate();
  };

  // Function to parse AI coaching response into structured sections
  const parseCoachingResponse = (content: string) => {
    const sections = {
      feedback: '',
      modelAnswer: '',
      learningTip: ''
    };

    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('1. **Feedback**:') || trimmed.includes('**Feedback**')) {
        currentSection = 'feedback';
        sections.feedback = trimmed.replace(/^\d+\.\s*\*\*Feedback\*\*:\s*/, '');
      } else if (trimmed.startsWith('2. **Model Answer**:') || trimmed.includes('**Model Answer**')) {
        currentSection = 'modelAnswer';
        sections.modelAnswer = trimmed.replace(/^\d+\.\s*\*\*Model Answer\*\*:\s*/, '');
      } else if (trimmed.startsWith('3. **Learning Tip**:') || trimmed.includes('**Learning Tip**')) {
        currentSection = 'learningTip';
        sections.learningTip = trimmed.replace(/^\d+\.\s*\*\*Learning Tip\*\*:\s*/, '');
      } else if (trimmed && currentSection) {
        sections[currentSection as keyof typeof sections] += (sections[currentSection as keyof typeof sections] ? ' ' : '') + trimmed;
      }
    }

    return sections;
  };

  // Component to render formatted AI coaching response
  const CoachingMessage = ({ content }: { content: string }) => {
    const sections = parseCoachingResponse(content);
    
    return (
      <div className="space-y-4">
        {sections.feedback && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-sm text-blue-900">Feedback</h4>
            </div>
            <p className="text-sm text-blue-800">{sections.feedback}</p>
          </div>
        )}
        
        {sections.modelAnswer && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-sm text-green-900">Model Answer</h4>
            </div>
            <p className="text-sm text-green-800">{sections.modelAnswer}</p>
          </div>
        )}
        
        {sections.learningTip && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <h4 className="font-semibold text-sm text-amber-900">Learning Tip</h4>
            </div>
            <p className="text-sm text-amber-800">{sections.learningTip}</p>
          </div>
        )}
        

      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section with Visual Elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 rounded-3xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Practice</h1>
                <p className="text-lg text-emerald-700 font-medium">Clinical Scenario Simulation</p>
              </div>
            </div>
            
            <p className="text-xl text-gray-700 leading-relaxed">
              Master patient care through interactive simulations with AI-powered coaching. 
              Build clinical confidence in real-world scenarios.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white/70 rounded-full px-4 py-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Real-time AI feedback</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 rounded-full px-4 py-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Multi-stage interactions</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 rounded-full px-4 py-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">SOAP documentation</span>
              </div>
            </div>
          </div>
          
          <div className="lg:justify-self-end">
            <img 
              src={clinicalSimulationImage} 
              alt="Clinical pharmacy simulation interface" 
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Clinical Process Overview */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">4-Stage Clinical Decision Process</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow our structured approach to clinical decision-making, designed around Singapore's competency standards.
          </p>
        </div>
        
        <div className="mb-8">
          <img 
            src={decisionProcessImage} 
            alt="Clinical decision making process visualization" 
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sessionStages.map((stage, index) => (
            <div key={stage.id} className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {stage.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{stage.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{stage.objective}</p>
                <p className="text-xs text-gray-500">{stage.guidance}</p>
              </div>
              {index < sessionStages.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6">{/* Content wrapper for remaining sections */}

      {!currentSession ? (
        // Scenario Selection
        <div className="space-y-6">
          {/* Filtering and Search Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filter & Search Clinical Scenarios</span>
              </CardTitle>
              <CardDescription>
                Find scenarios by therapeutic area, practice setting, case complexity, or search terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search scenarios by title, patient background, or clinical presentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label className="text-sm font-medium">Therapeutic Area</Label>
                  <Select value={therapeuticAreaFilter} onValueChange={setTherapeuticAreaFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      {constants?.therapeuticAreas && Object.entries(constants.therapeuticAreas).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{Array.isArray(value) ? key : String(value)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Practice Setting</Label>
                  <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Settings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Settings</SelectItem>
                      <SelectItem value="hospital">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4" />
                          <span>Hospital</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="community">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>Community</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Case Type</Label>
                  <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="acute">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span>Acute</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="chronic">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>Chronic</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="complex">Complex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Difficulty</Label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>Beginner</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title A-Z</SelectItem>
                      <SelectItem value="therapeuticArea">Therapeutic Area</SelectItem>
                      <SelectItem value="practiceArea">Practice Setting</SelectItem>
                      <SelectItem value="difficulty">Difficulty Level</SelectItem>
                      <SelectItem value="caseType">Case Type</SelectItem>
                      <SelectItem value="patientAge">Patient Age</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setTherapeuticAreaFilter("all");
                      setPracticeAreaFilter("all");
                      setCaseTypeFilter("all");
                      setDifficultyFilter("all");
                      setSortBy("title");
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
                <span>
                  Showing {filteredAndSortedScenarios.length} of {Array.isArray(allScenarios) ? allScenarios.length : 0} scenarios
                </span>
                {(searchTerm || therapeuticAreaFilter !== "all" || practiceAreaFilter !== "all" || 
                  caseTypeFilter !== "all" || difficultyFilter !== "all") && (
                  <Badge variant="outline">Filters Active</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scenarios Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Chat Simulations</CardTitle>
              <CardDescription>
                Choose a patient case to start an interactive conversation focused on meeting clinical objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scenariosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAndSortedScenarios && filteredAndSortedScenarios.length > 0 ? filteredAndSortedScenarios.map((scenario: any) => (
                    <Card key={scenario.id} className="hover:shadow-xl transition-all duration-200 group border-2 border-gray-200 hover:border-emerald-300 bg-white">
                      <CardHeader className="pb-4 space-y-4 bg-gradient-to-br from-gray-50 to-emerald-50/30 border-b border-gray-100">
                        {/* Title and Difficulty */}
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors flex-1 pr-3">
                            {scenario.title}
                          </h3>
                          <Badge className={`text-xs font-bold px-3 py-1.5 shadow-sm ${
                            scenario.difficulty === 'beginner' ? 'bg-emerald-600 text-white' :
                            scenario.difficulty === 'intermediate' ? 'bg-amber-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {scenario.difficulty}
                          </Badge>
                        </div>
                        
                        {/* Category Tags - Enhanced */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs font-semibold bg-blue-600 text-white border-0 px-3 py-1">
                            {scenario.therapeuticArea.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs font-semibold border-0 px-3 py-1 ${
                            scenario.practiceArea === 'hospital' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-green-600 text-white'
                          }`}>
                            {scenario.practiceArea === 'hospital' ? 'Hospital' : 'Community'}
                          </Badge>
                          {scenario.caseType === 'acute' && (
                            <Badge variant="secondary" className="text-xs font-semibold bg-orange-600 text-white border-0 px-3 py-1">
                              Acute Case
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-5 p-6">
                        {/* Patient Information */}
                        <div className="bg-gradient-to-r from-slate-700 to-gray-800 p-4 rounded-xl shadow-sm">
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="w-5 h-5 text-white" />
                            <span className="font-bold text-white">Patient:</span>
                            <span className="text-gray-100 font-medium">{scenario.patientGender}, {scenario.patientAge} years old</span>
                          </div>
                        </div>
                        
                        {/* Clinical Description */}
                        <div className="space-y-3">
                          <p className="text-sm text-gray-800 leading-relaxed font-medium bg-gray-50 p-3 rounded-lg border-l-4 border-emerald-500">
                            {scenario.clinicalPresentation}
                          </p>
                        </div>
                        
                        {/* Action Button */}
                        <div className="pt-3">
                          <Button 
                            onClick={() => startScenario(scenario)}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 text-sm shadow-lg hover:shadow-xl transition-all"
                            disabled={createSessionMutation.isPending}
                          >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Start Patient Conversation
                          </Button>
                        </div>
                        
                        {/* Session Info - Enhanced */}
                        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg text-xs">
                          <div className="flex items-center space-x-2 text-gray-700 font-medium">
                            <Target className="w-4 h-4 text-emerald-600" />
                            <span>4 Clinical Stages</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-700 font-medium">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span>{scenario.professionalActivity}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-8 col-span-full">
                      <p className="text-gray-500">No scenarios match your filters. Try adjusting your search criteria.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Interactive Chat Simulation Interface
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient Chat Interface - Main Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Session Progress & Objectives */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span>Chat with {selectedScenario?.patientGender === 'Male' ? 'Mr.' : 'Ms.'} Patient</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      Stage {getCurrentStageNumber()}/4
                    </Badge>
                    <Badge className="text-xs bg-green-600 text-white">
                      {getCurrentStageTitle()}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(getCurrentStageNumber() / 4) * 100}%` }}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-900 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Current Objective: {getCurrentObjective()}
                  </h4>
                  <p className="text-xs text-blue-700">{getCurrentGuidance()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Chat Messages Area */}
            <Card className="min-h-[500px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Patient Conversation</CardTitle>
                <CardDescription>
                  Have a natural conversation to gather information and provide pharmaceutical care
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages Display */}
                <div className="flex-1 space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-green-600 text-white'
                            : message.role === 'patient'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : message.role === 'patient' ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            <Stethoscope className="w-4 h-4" />
                          )}
                          <span className="font-medium text-sm">
                            {message.role === 'user' ? 'You' : message.role === 'patient' ? 'Patient' : 'AI Coach'}
                          </span>
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {message.role === 'coach' ? (
                          <CoachingMessage content={message.content} />
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-blue-100 text-blue-900 border border-blue-200 rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium text-sm">Patient</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your response to the patient..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !currentMessage.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Patient Information Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Patient Profile */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Patient Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Age</span>
                    <span className="text-sm">{selectedScenario?.patientAge} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Gender</span>
                    <span className="text-sm">{selectedScenario?.patientGender}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Area</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedScenario?.therapeuticArea}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Setting</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedScenario?.practiceArea}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-xs text-gray-800">Initial Presentation</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{selectedScenario?.clinicalPresentation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Session Stages */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Session Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessionStages.map((stage, index) => (
                    <div key={stage.id} className={`flex items-center space-x-3 p-2 rounded-lg ${
                      index + 1 === getCurrentStageNumber() 
                        ? 'bg-green-50 border border-green-200' 
                        : index + 1 < getCurrentStageNumber() 
                        ? 'bg-gray-50 border border-gray-200' 
                        : 'bg-white border border-gray-100'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index + 1 === getCurrentStageNumber()
                          ? 'bg-green-600 text-white'
                          : index + 1 < getCurrentStageNumber()
                          ? 'bg-gray-400 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`text-xs font-medium ${
                        index + 1 === getCurrentStageNumber()
                          ? 'text-green-800'
                          : index + 1 < getCurrentStageNumber()
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`}>
                        {stage.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Session Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setShowSessionNotes(!showSessionNotes)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {showSessionNotes ? 'Hide' : 'Show'} Session Notes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={getCoachingTip}
                  disabled={!currentSession || isLoading}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Get Coaching Tip
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={endSession}
                >
                  <X className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </CardContent>
            </Card>

            {/* Session Notes - Conditional Display */}
            {showSessionNotes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Session Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm text-blue-900 mb-2">Scenario Information</h4>
                    <div className="text-xs text-blue-800 space-y-1">
                      <p><strong>Patient:</strong> {selectedScenario?.patientGender} {selectedScenario?.patientAge} years old</p>
                      <p><strong>Setting:</strong> {selectedScenario?.practiceArea === 'hospital' ? 'Hospital' : 'Community Pharmacy'}</p>
                      <p><strong>Therapeutic Area:</strong> {selectedScenario?.therapeuticArea}</p>
                      <p><strong>Background:</strong> {selectedScenario?.patientBackground}</p>
                      <p><strong>Presentation:</strong> {selectedScenario?.clinicalPresentation}</p>
                      {selectedScenario?.medicationHistory && (
                        <p><strong>Medication History:</strong> {selectedScenario.medicationHistory}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm text-green-900 mb-2">Learning Objectives</h4>
                    <div className="text-xs text-green-800">
                      {selectedScenario?.keyLearningOutcomes ? (
                        <ul className="list-disc list-inside space-y-1">
                          {selectedScenario.keyLearningOutcomes.map((outcome: string, index: number) => (
                            <li key={index}>{outcome}</li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Conduct thorough patient history taking</li>
                          <li>Perform clinical assessment and therapeutic planning</li>
                          <li>Demonstrate effective patient counseling</li>
                          <li>Apply clinical knowledge to real-world scenarios</li>
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm text-amber-900 mb-2">Session Progress</h4>
                    <div className="text-xs text-amber-800 space-y-1">
                      <p><strong>Current Stage:</strong> {getCurrentStageTitle()}</p>
                      <p><strong>Messages Exchanged:</strong> {messages.length}</p>
                      <p><strong>Coaching Tips Received:</strong> {messages.filter(m => m.isCoachingTip).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
      </div> {/* Close px-6 wrapper */}
    </div>
  );
}