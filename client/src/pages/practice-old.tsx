import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Stethoscope, 
  User, 
  Clock, 
  Activity, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Brain,
  Heart,
  AlertCircle,
  Play,
  Pause,
  Filter,
  Search,
  MapPin,
  Building2,
  Zap,
  CalendarDays,
  GraduationCap,
  TrendingUp
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

// Module 2: Practice - Clinical Scenario Simulation
export default function PracticePage() {
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [userResponse, setUserResponse] = useState("");
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  
  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState("all");
  const [practiceAreaFilter, setPracticeAreaFilter] = useState("all");
  const [caseTypeFilter, setCaseTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");

  // Fetch practice scenarios
  const { data: allScenarios, isLoading } = useQuery({
    queryKey: ["/api/pharmacy/scenarios", { module: "practice" }]
  });

  // Fetch pharmacy constants for filtering
  const { data: constants } = useQuery({
    queryKey: ["/api/pharmacy/constants"]
  }) as { data: any };

  // Filter and sort scenarios
  const filteredAndSortedScenarios = useMemo(() => {
    if (!allScenarios) return [];
    
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

    // Sort scenarios
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "therapeuticArea":
          return a.therapeuticArea.localeCompare(b.therapeuticArea);
        case "practiceArea":
          return a.practiceArea.localeCompare(b.practiceArea);
        case "difficulty":
          const difficultyOrder = { "beginner": 1, "intermediate": 2, "advanced": 3 };
          return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        case "caseType":
          return a.caseType.localeCompare(b.caseType);
        case "patientAge":
          return a.patientAge - b.patientAge;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allScenarios, searchTerm, therapeuticAreaFilter, practiceAreaFilter, caseTypeFilter, difficultyFilter, sortBy]);

  // Create new practice session
  const createSessionMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      const response = await fetch('/api/pharmacy/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          scenarioId,
          module: 'practice',
          therapeuticArea: selectedScenario?.therapeuticArea,
          practiceArea: selectedScenario?.practiceArea,
          sessionLanguage: 'en'
        })
      });
      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      setCurrentStage(1);
      setSessionMessages([]);
    }
  });

  // Submit user response
  const submitResponseMutation = useMutation({
    mutationFn: async ({ sessionId, message, stageNumber }: any) => {
      const response = await fetch(`/api/pharmacy/sessions/${sessionId}/ai-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userMessage: message,
          messageCategory: getStageCategory(stageNumber),
          stageNumber
        })
      });
      if (!response.ok) throw new Error('Failed to submit response');
      return response.json();
    },
    onSuccess: (data) => {
      setSessionMessages(prev => [...prev, 
        { type: 'user', content: userResponse, stage: currentStage },
        { type: 'ai', content: data.message.content, stage: currentStage }
      ]);
      setUserResponse("");
      if (currentStage < 10) {
        setCurrentStage(prev => prev + 1);
      }
    }
  });

  const getStageCategory = (stage: number) => {
    if (stage <= 3) return "patient_history";
    if (stage <= 5) return "clinical_assessment";
    if (stage <= 7) return "therapeutic_planning";
    return "patient_counseling";
  };

  const getStageTitle = (stage: number) => {
    if (stage <= 3) return "Patient History Taking";
    if (stage <= 5) return "Clinical Assessment";
    if (stage <= 7) return "Therapeutic Planning";
    return "Patient Counseling";
  };

  const startScenario = (scenario: any) => {
    setSelectedScenario(scenario);
    createSessionMutation.mutate(scenario.id);
  };

  const submitResponse = () => {
    if (!userResponse.trim() || !currentSession) return;
    
    submitResponseMutation.mutate({
      sessionId: currentSession.id,
      message: userResponse,
      stageNumber: currentStage
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Module 2: Practice</h1>
            <p className="text-lg text-gray-600">Clinical Scenario Simulation</p>
          </div>
        </div>
        <p className="text-gray-700 max-w-3xl">
          Apply clinical knowledge through realistic patient case management. 
          Interactive clinical decision-making with real-time AI feedback.
        </p>
      </div>

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
                        <SelectItem key={key} value={key}>{value}</SelectItem>
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
                  Showing {filteredAndSortedScenarios.length} of {allScenarios?.length || 0} scenarios
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
              <CardTitle>Clinical Scenarios</CardTitle>
              <CardDescription>
                Choose a patient case to practice clinical decision-making and therapeutic reasoning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedScenarios && filteredAndSortedScenarios.length > 0 ? filteredAndSortedScenarios.map((scenario: any) => (
                    <Card key={scenario.id} className="hover:shadow-md transition-all duration-200 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <CardTitle className="text-base leading-tight group-hover:text-green-600 transition-colors">
                              {scenario.title}
                            </CardTitle>
                            <div className="flex items-center flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs capitalize bg-blue-50 border-blue-200 text-blue-700">
                                {scenario.therapeuticArea}
                              </Badge>
                              <Badge variant="outline" className={`text-xs capitalize ${
                                scenario.practiceArea === 'hospital' 
                                  ? 'bg-red-50 border-red-200 text-red-700' 
                                  : 'bg-green-50 border-green-200 text-green-700'
                              }`}>
                                <div className="flex items-center space-x-1">
                                  {scenario.practiceArea === 'hospital' ? 
                                    <Building2 className="w-3 h-3" /> : 
                                    <MapPin className="w-3 h-3" />
                                  }
                                  <span>{scenario.practiceArea}</span>
                                </div>
                              </Badge>
                              <Badge variant="outline" className={`text-xs capitalize ${
                                scenario.caseType === 'acute' 
                                  ? 'bg-orange-50 border-orange-200 text-orange-700' 
                                  : 'bg-purple-50 border-purple-200 text-purple-700'
                              }`}>
                                <div className="flex items-center space-x-1">
                                  {scenario.caseType === 'acute' ? 
                                    <Zap className="w-3 h-3" /> : 
                                    <CalendarDays className="w-3 h-3" />
                                  }
                                  <span>{scenario.caseType}</span>
                                </div>
                              </Badge>
                            </div>
                          </div>
                          <Badge className={`text-xs ${
                            scenario.difficulty === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                            scenario.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {scenario.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span><strong>Patient:</strong> {scenario.patientGender}, {scenario.patientAge} years old</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Activity className="w-4 h-4 text-gray-500" />
                            <span>{scenario.professionalActivity}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>45-60 minutes</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {scenario.patientBackground}
                        </p>
                        
                        <Button 
                          onClick={() => startScenario(scenario)}
                          className="w-full"
                          disabled={createSessionMutation.isPending}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Clinical Scenario
                        </Button>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No practice scenarios available. Please check back later.</p>
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
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <h4 className="font-medium text-sm text-blue-900 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Current Objective: {getCurrentObjective()}
                  </h4>
                  <p className="text-xs text-blue-700">{getCurrentGuidance()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Chat Messages Area */}
            <Card className="min-h-[400px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Patient Conversation</CardTitle>
                <CardDescription>
                  Have a natural conversation to gather information and provide care
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
                        <p className="text-sm">{message.content}</p>
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
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Get Coaching Tip
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => endSession()}
                >
                  <X className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </CardContent>
            </Card>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stage {currentStage} of 10</span>
                    <span>{Math.round((currentStage / 10) * 100)}%</span>
                  </div>
                  <Progress value={(currentStage / 10) * 100} className="h-2" />
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center space-x-2 ${currentStage <= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {currentStage <= 3 ? <Activity className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    <span>Patient History Taking</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${currentStage > 3 && currentStage <= 5 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {currentStage > 3 && currentStage <= 5 ? <Activity className="w-3 h-3" /> : currentStage > 5 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>Clinical Assessment</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${currentStage > 5 && currentStage <= 7 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {currentStage > 5 && currentStage <= 7 ? <Activity className="w-3 h-3" /> : currentStage > 7 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>Therapeutic Planning</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${currentStage > 7 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {currentStage > 7 ? <Activity className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>Patient Counseling</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Interaction Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>{getStageTitle(currentStage)}</span>
                </CardTitle>
                <CardDescription>
                  Stage {currentStage}: Interact with the clinical scenario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages Display */}
                <div className="min-h-[300px] max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4">
                  {sessionMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          Stage {message.stage}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {submitResponseMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="text-sm">AI analyzing your response...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="space-y-3">
                  <Label htmlFor="response">Your Clinical Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Describe your clinical assessment, therapeutic decisions, or patient counseling approach..."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    rows={4}
                    disabled={submitResponseMutation.isPending}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Characters: {userResponse.length}/1000
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => setCurrentSession(null)}
                        variant="outline"
                        size="sm"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Session
                      </Button>
                      <Button 
                        onClick={submitResponse}
                        disabled={!userResponse.trim() || submitResponseMutation.isPending}
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Submit Response
                      </Button>
                    </div>
                  </div>
                </div>

                {currentStage === 10 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Scenario completed! Your clinical decisions and patient interactions have been recorded.
                      Review your performance and SOAP documentation in the next section.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}