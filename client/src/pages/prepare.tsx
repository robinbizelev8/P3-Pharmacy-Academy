import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, BookOpen, Target, Clock, Brain, Play, Award, TrendingUp, FileText, AlertCircle, Users, Building2, GraduationCap, MessageCircle, Bot, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { AIResponseFormatter } from "@/components/AIResponseFormatter";

// Module 1: Prepare - Foundation Building
export default function PreparePage() {
  const [selectedTherapeuticArea, setSelectedTherapeuticArea] = useState<string>("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [assessmentComplete, setAssessmentComplete] = useState<boolean>(false);
  const [selectedProfessionalActivity, setSelectedProfessionalActivity] = useState<string>("");
  const [showAssessmentSimulation, setShowAssessmentSimulation] = useState<boolean>(false);
  const [assessmentMessages, setAssessmentMessages] = useState<any[]>([]);
  const [assessmentInput, setAssessmentInput] = useState<string>("");
  const [assessmentLoading, setAssessmentLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Fetch pharmacy constants for dropdowns
  const { data: constants } = useQuery({
    queryKey: ["/api/pharmacy/constants"]
  }) as { data: any };

  // Fetch user's existing assessments
  const { data: userAssessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/pharmacy/assessments"]
  }) as { data: any[], isLoading: boolean };

  // Fetch learning resources based on selections
  const { data: learningResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/pharmacy/resources", selectedTherapeuticArea, selectedPracticeArea],
    enabled: !!selectedTherapeuticArea && !!selectedPracticeArea
  }) as { data: any[], isLoading: boolean };

  // Fetch user's learning progress
  const { data: learningProgress } = useQuery({
    queryKey: ["/api/pharmacy/progress"]
  }) as { data: any[] };

  // Create competency assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      const response = await apiRequest('POST', '/api/pharmacy/assessments', assessmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/assessments"] });
      setAssessmentComplete(true);
      setCurrentStep(4);
    }
  });

  // Update learning progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: any) => {
      const response = await apiRequest('POST', '/api/pharmacy/progress', progressData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/progress"] });
    }
  });

  // Handle sending assessment messages to AI
  const handleSendAssessmentMessage = async () => {
    if (!assessmentInput.trim() || assessmentLoading) return;

    const userMessage = {
      content: assessmentInput.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setAssessmentMessages(prev => [...prev, userMessage]);
    setAssessmentInput("");
    setAssessmentLoading(true);

    try {
      // Create a competency assessment session if this is the first message
      if (assessmentMessages.length === 0) {
        // Start the assessment conversation
        const prompt = `User's first response in competency assessment for ${selectedTherapeuticArea} in ${selectedPracticeArea} practice: "${userMessage.content}". Please provide coaching feedback and ask follow-up questions to evaluate their competency level.`;
        
        const response = await apiRequest('POST', '/api/pharmacy/ai-coaching', {
          message: prompt,
          therapeuticArea: selectedTherapeuticArea,
          practiceArea: selectedPracticeArea,
          professionalActivity: selectedProfessionalActivity,
          language: 'en'
        });
        
        const data = await response.json();
        
        const aiMessage = {
          content: data.response || "Thank you for sharing. Let me ask you about specific scenarios to better understand your competency level...",
          isUser: false,
          timestamp: new Date().toISOString()
        };

        setAssessmentMessages(prev => [...prev, aiMessage]);
      } else {
        // Continue the conversation
        const conversationHistory = assessmentMessages.map(msg => 
          `${msg.isUser ? 'Student' : 'AI Preceptor'}: ${msg.content}`
        ).join('\n');
        
        const prompt = `Conversation history:\n${conversationHistory}\nStudent: ${userMessage.content}\n\nAs an AI pharmacy preceptor, continue the competency assessment conversation. Provide specific feedback and ask targeted questions to evaluate their knowledge gaps and learning needs.`;
        
        const response = await apiRequest('POST', '/api/pharmacy/ai-coaching', {
          message: prompt,
          therapeuticArea: selectedTherapeuticArea,
          practiceArea: selectedPracticeArea,
          professionalActivity: selectedProfessionalActivity,
          language: 'en'
        });
        
        const data = await response.json();
        
        const aiMessage = {
          content: data.response || "I understand. Let's explore this further to identify your learning priorities...",
          isUser: false,
          timestamp: new Date().toISOString()
        };

        setAssessmentMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Failed to send assessment message:', error);
      const errorMessage = {
        content: "I apologize, but I'm having trouble processing your response right now. Please try again or continue with the assessment.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setAssessmentMessages(prev => [...prev, errorMessage]);
    } finally {
      setAssessmentLoading(false);
    }
  };

  const competencyAreas = [
    { id: "PA1", name: "Professional Practice", description: "Ethics, regulations, and pharmacy law", fullDescription: "Develop and implement a care plan for patients with acute and chronic conditions", icon: FileText },
    { id: "PA2", name: "Patient Safety", description: "Medication safety and adverse drug reactions", fullDescription: "Accurate supply of health products with safety considerations", icon: AlertCircle },
    { id: "PA3", name: "Clinical Assessment", description: "Patient assessment and pharmaceutical care", fullDescription: "Educate patients on appropriate use of health products", icon: Users },
    { id: "PA4", name: "Therapeutic Management", description: "Drug therapy optimization and monitoring", fullDescription: "Respond to drug information or health product enquiry", icon: Brain }
  ];

  const prepareSteps = [
    { id: 1, title: "Foundation Assessment", description: "Evaluate current competency levels", icon: GraduationCap },
    { id: 2, title: "Area Selection", description: "Choose therapeutic area focus", icon: Target },
    { id: 3, title: "Practice Setting", description: "Select hospital or community", icon: Building2 },
    { id: 4, title: "Learning Resources", description: "Access personalized content", icon: BookOpen },
    { id: 5, title: "Learning Objectives", description: "Set SMART goals", icon: TrendingUp },
    { id: 6, title: "Progress Planning", description: "Create milestone timeline", icon: Award }
  ];

  const startCompetencyAssessment = () => {
    if (!selectedTherapeuticArea || !selectedPracticeArea || !selectedProfessionalActivity) {
      alert("Please complete all selections before starting assessment");
      return;
    }

    // Mock assessment data - in real implementation, this would be from a detailed assessment form
    const assessmentData = {
      professionalActivity: selectedProfessionalActivity,
      therapeuticArea: selectedTherapeuticArea,
      practiceArea: selectedPracticeArea,
      currentLevel: 2, // Mock current supervision level
      targetLevel: 4,  // Target independence level
      competencyScore: Math.floor(Math.random() * 40) + 40, // Mock score 40-80
      knowledgeGaps: ["drug interactions", "patient counseling", "clinical monitoring"],
      learningObjectives: [
        `Master ${selectedTherapeuticArea} therapeutic protocols`,
        `Develop ${selectedPracticeArea} practice competency`,
        `Progress from supervision level 2 to 4`
      ]
    };

    createAssessmentMutation.mutate(assessmentData);
  };

  const markResourceProgress = (resourceId: string, progressData: any) => {
    if (!resourceId) {
      console.error('Resource ID is required for progress tracking');
      return;
    }
    
    updateProgressMutation.mutate({
      resourceId,
      progressStatus: progressData.progressStatus || 'in_progress',
      timeSpent: progressData.timeSpent || 0,
      completionPercentage: progressData.completionPercentage || 10,
      lastAccessedAt: new Date().toISOString()
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prepare</h1>
              <p className="text-lg text-gray-600">Pre-registration Training Foundation Building</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Estimated Duration</p>
            <p className="text-lg font-semibold text-gray-900">2-3 hours per therapeutic area</p>
          </div>
        </div>
        
        {/* Step Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Learning Journey Progress</h3>
            <span className="text-sm text-gray-500">Step {currentStep} of 6</span>
          </div>
          <div className="grid grid-cols-6 gap-2 mb-2">
            {prepareSteps.map((step) => (
              <div 
                key={step.id} 
                className={`h-2 rounded-full transition-colors ${
                  step.id <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="grid grid-cols-6 gap-2 text-xs text-gray-600">
            {prepareSteps.map((step) => (
              <div key={step.id} className="text-center">
                <div className={`p-2 rounded ${step.id === currentStep ? 'bg-blue-50 text-blue-700' : ''}`}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Singapore Pre-registration Training Program</AlertTitle>
          <AlertDescription className="text-blue-800">
            This module provides guided learning aligned with Singapore's pharmacy competency framework for the 30-week pre-registration period. 
            Build your foundation across all 7 therapeutic areas through structured coaching and evidence-based resources.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="assessment" className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4" />
            <span>Learning</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Resources</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Progress</span>
          </TabsTrigger>
          <TabsTrigger value="objectives" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Objectives</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Portfolio</span>
          </TabsTrigger>
        </TabsList>

        {/* Learning Tab - Step 1: Guided Foundation Learning */}
        <TabsContent value="assessment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Therapeutic Area Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Select Therapeutic Area</span>
                </CardTitle>
                <CardDescription>
                  Choose from 7 core therapeutic areas for Pre-registration training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTherapeuticArea} onValueChange={(value) => {
                  setSelectedTherapeuticArea(value);
                  setCurrentStep(2);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select therapeutic area" />
                  </SelectTrigger>
                  <SelectContent>
                    {constants?.therapeuticAreas && Object.entries(constants.therapeuticAreas).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTherapeuticArea && (
                  <div className="grid grid-cols-2 gap-2">
                    {constants?.practiceAreas && Object.entries(constants.practiceAreas).map(([key, value]) => (
                      <Button
                        key={key}
                        variant={selectedPracticeArea === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedPracticeArea(key);
                          setCurrentStep(3);
                        }}
                        className="justify-start"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                )}

                {selectedTherapeuticArea && selectedPracticeArea && (
                  <div className="space-y-3">
                    <Select value={selectedProfessionalActivity} onValueChange={setSelectedProfessionalActivity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Professional Activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {constants?.professionalActivities && Object.entries(constants.professionalActivities).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {key}: {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={startCompetencyAssessment}
                      className="w-full"
                      disabled={!selectedProfessionalActivity || createAssessmentMutation.isPending}
                    >
                      {createAssessmentMutation.isPending ? "Loading..." : "Begin Guided Learning"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Your Progress</span>
                </CardTitle>
                <CardDescription>
                  Guided learning progress across therapeutic areas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userAssessments && userAssessments.length > 0 ? (
                  userAssessments.slice(0, 4).map((assessment: any) => (
                    <div key={assessment.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{assessment.therapeuticArea}</span>
                        <Badge variant="outline">Level {assessment.currentLevel}/{assessment.targetLevel}</Badge>
                      </div>
                      <Progress value={assessment.competencyScore} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>Begin your first guided learning session to see progress</p>
                  </div>
                )}
                {userAssessments && userAssessments.length > 0 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View Detailed Progress
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Interactive Competency Assessment Simulation */}
          {assessmentComplete && !showAssessmentSimulation && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Interactive Competency Assessment</h3>
                <Badge className="bg-blue-100 text-blue-800">Ready to Start</Badge>
              </div>
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span>AI-Powered Clinical Coaching Session</span>
                  </CardTitle>
                  <CardDescription>
                    Engage in a personalized simulation to assess your competency level and receive real-time coaching feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                    <h4 className="font-medium text-sm mb-2">What you'll experience:</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>AI evaluates your current supervision level (typically Level 2-3)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Interactive dialogue to identify knowledge gaps and learning priorities</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Generates personalized learning objectives for Singapore pharmacy practice</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Creates baseline for progress tracking throughout your pre-registration training</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Estimated time: 10-15 minutes</span>
                      </span>
                    </div>
                    <Button onClick={() => setShowAssessmentSimulation(true)} className="bg-blue-600 hover:bg-blue-700">
                      Start Assessment Simulation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Assessment Simulation Chat Interface */}
          {showAssessmentSimulation && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Competency Assessment Simulation</h3>
                  <p className="text-sm text-gray-600">AI Clinical Coaching Session - Singapore Pre-registration Training</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAssessmentSimulation(false)}
                >
                  Exit Simulation
                </Button>
              </div>
              
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">AI Preceptor - Singapore Pharmacy Academy</span>
                    <Badge variant="secondary" className="ml-auto">
                      {constants?.therapeuticAreas?.[selectedTherapeuticArea]} • {constants?.practiceAreas?.[selectedPracticeArea]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Chat Messages Area */}
                  <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                    {assessmentMessages.length === 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-blue-900 mb-1">AI Clinical Preceptor</div>
                            <div className="text-sm text-blue-800">
                              <strong>Clinical Assessment: {constants?.therapeuticAreas?.[selectedTherapeuticArea]} • {constants?.practiceAreas?.[selectedPracticeArea]} Practice</strong>
                              <br/><br/>
                              {(() => {
                                const getScenario = (therapeutic: string, practice: string) => {
                                  const scenarios = {
                                    cardiovascular: {
                                      hospital: "A 72-year-old patient is admitted with acute heart failure. The physician prescribes furosemide 40mg BD IV and asks you to review their existing medications: amlodipine 5mg daily, metoprolol 25mg BD, and atorvastatin 20mg daily.",
                                      community: "A 58-year-old patient presents with a new prescription for lisinopril 10mg daily for hypertension. They're currently taking amlodipine 5mg daily and mention occasional dizziness."
                                    },
                                    gastrointestinal: {
                                      hospital: "A 65-year-old patient presents with a prescription for omeprazole 20mg daily for GERD, alongside existing medications: warfarin 5mg daily and metformin 500mg BD.",
                                      community: "A 45-year-old patient requests advice about their chronic constipation. They're taking tramadol 50mg QID for chronic pain and ask about laxative options."
                                    },
                                    respiratory: {
                                      hospital: "A COPD patient is prescribed prednisolone 30mg daily for 5 days following an exacerbation. Their current medications include salbutamol inhaler PRN and tiotropium 18mcg daily.",
                                      community: "A patient with asthma presents with a prescription for fluticasone/salmeterol 25/125 inhaler. They mention their current salbutamol inhaler isn't helping much lately."
                                    },
                                    renal: {
                                      hospital: "A CKD Stage 3 patient (eGFR 45) is prescribed metformin 500mg BD for diabetes. Their other medications include ramipril 5mg daily and furosemide 20mg daily.",
                                      community: "A patient with mild kidney impairment presents with a prescription for ibuprofen 400mg TDS for joint pain. Their creatinine is elevated at 150 μmol/L."
                                    },
                                    endocrine: {
                                      hospital: "A newly diagnosed Type 2 diabetic patient is started on metformin 500mg BD. They're also taking atenolol 50mg daily for hypertension and ask about hypoglycemia risks.",
                                      community: "A patient with well-controlled diabetes on metformin 1g BD presents with a prescription for prednisolone 20mg daily for a skin condition."
                                    },
                                    neurological: {
                                      hospital: "A patient with epilepsy is admitted and prescribed phenytoin 300mg daily. Their current medications include carbamazepine 200mg BD and they mention breakthrough seizures.",
                                      community: "A patient with migraine presents with a prescription for sumatriptan 50mg tablets. They're currently taking propranolol 40mg BD for prevention."
                                    },
                                    dermatological: {
                                      hospital: "A patient with severe eczema is prescribed topical betamethasone 0.1% cream and oral prednisolone 20mg daily. They mention using multiple over-the-counter creams without success.",
                                      community: "A patient presents with a prescription for clindamycin 1% gel for acne. They're currently using benzoyl peroxide 5% wash and ask about combining treatments."
                                    }
                                  };
                                  
                                  return scenarios[therapeutic]?.[practice] || scenarios.gastrointestinal.community;
                                };
                                
                                return getScenario(selectedTherapeuticArea, selectedPracticeArea);
                              })()}
                              <br/><br/>
                              What are your immediate considerations for this patient, and what counseling points would you prioritize?
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {assessmentMessages.map((message: any, index: number) => (
                      <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${
                          message.isUser 
                            ? 'bg-blue-600 text-white rounded-lg rounded-br-none' 
                            : 'bg-white border rounded-lg rounded-bl-none'
                        } p-3`}>
                          {!message.isUser && (
                            <div className="flex items-center space-x-2 mb-2">
                              <Bot className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-medium text-gray-600">AI Preceptor</span>
                            </div>
                          )}
                          <div className={`text-sm leading-relaxed ${message.isUser ? 'text-white' : 'text-gray-800'}`}>
                            {message.isUser ? (
                              message.content
                            ) : (
                              <AIResponseFormatter content={message.content} />
                            )}
                          </div>
                          <div className={`text-xs mt-1 ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {assessmentLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border rounded-lg rounded-bl-none p-3 max-w-[80%]">
                          <div className="flex items-center space-x-2 mb-2">
                            <Bot className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-gray-600">AI Preceptor</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span>Analyzing your response...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <div className="border-t bg-white p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={assessmentInput}
                        onChange={(e) => setAssessmentInput(e.target.value)}
                        placeholder="Share your experience and learning needs..."
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendAssessmentMessage()}
                      />
                      <Button 
                        onClick={handleSendAssessmentMessage}
                        disabled={!assessmentInput.trim() || assessmentLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Press Enter to send • This simulation helps determine your competency level and learning objectives
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Professional Activities Grid - After Simulation */}
          {assessmentComplete && !showAssessmentSimulation && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Professional Activities Assessment</h3>
                <Badge className="bg-green-100 text-green-800">Assessment Complete</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {competencyAreas.map((area) => {
                  const IconComponent = area.icon;
                  return (
                    <Card key={area.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-sm">{area.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{area.description}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Level 2 → 4
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Resources Tab - Step 4: Learning Resources */}
        <TabsContent value="resources" className="space-y-6">
          {!selectedTherapeuticArea || !selectedPracticeArea ? (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-900">Selection Required</AlertTitle>
              <AlertDescription className="text-yellow-800">
                Please complete your therapeutic area and practice setting selection in the Assessment tab first.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    Learning Resources: {constants?.therapeuticAreas?.[selectedTherapeuticArea]} ({constants?.practiceAreas?.[selectedPracticeArea]})
                  </h3>
                  <p className="text-sm text-gray-600">Evidence-based learning materials curated for your selected focus area</p>
                </div>
                <Badge className="capitalize">{selectedTherapeuticArea} • {selectedPracticeArea}</Badge>
              </div>

              {resourcesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : learningResources && learningResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learningResources.map((resource: any) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{resource.title}</CardTitle>
                            <CardDescription className="text-sm">{resource.description}</CardDescription>
                          </div>
                          <Badge variant="outline" className="capitalize text-xs">
                            {resource.resourceType}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{resource.estimatedDuration} min</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Brain className="w-4 h-4" />
                            <span>Level {resource.difficultyLevel}</span>
                          </span>
                        </div>
                        <Separator />
                        <div className="text-sm text-gray-600">
                          {resource.content || resource.description}
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge className="text-xs capitalize">{resource.professionalActivity}</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(resource.url || resource.contentUrl, '_blank')}
                            className="text-xs"
                            disabled={!resource.url && !resource.contentUrl}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            View Resource
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Available</h3>
                    <p className="text-gray-600">
                      Resources for {selectedTherapeuticArea} in {selectedPracticeArea} practice are being prepared.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Progress Tab - Step 5: Progress Tracking */}
        <TabsContent value="progress" className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Learning Progress Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{userAssessments?.length || 0}</div>
                  <div className="text-sm text-gray-600">Assessments Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{learningProgress?.length || 0}</div>
                  <div className="text-sm text-gray-600">Resources Accessed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {learningProgress?.filter((p: any) => p.completionPercentage === 100).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Resources Completed</div>
                </CardContent>
              </Card>
            </div>

            {learningProgress && learningProgress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Learning Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {learningProgress.slice(0, 5).map((progress: any) => (
                      <div key={progress.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium text-sm">
                            Resource ID: {progress.resourceId.substring(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-600">
                            Status: <span className="capitalize">{progress.progressStatus.replace('_', ' ')}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <Progress value={progress.completionPercentage} className="w-16 h-2" />
                          <p className="text-xs text-gray-600 mt-1">{progress.completionPercentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Objectives Tab - Step 5: Learning Objectives */}
        <TabsContent value="objectives" className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">SMART Learning Objectives</h3>
            
            {userAssessments && userAssessments.length > 0 ? (
              <div className="space-y-4">
                {userAssessments.map((assessment: any) => (
                  <Card key={assessment.id}>
                    <CardHeader>
                      <CardTitle className="capitalize text-base">
                        {assessment.therapeuticArea} - {assessment.professionalActivity}
                      </CardTitle>
                      <CardDescription>
                        Current Level {assessment.currentLevel} → Target Level {assessment.targetLevel}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Learning Objectives:</h4>
                          <ul className="space-y-1">
                            {assessment.learningObjectives?.map((objective: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium text-sm mb-2">Knowledge Gaps to Address:</h4>
                          <div className="flex flex-wrap gap-1">
                            {assessment.knowledgeGaps?.map((gap: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {gap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Learning Objectives Set</h3>
                  <p className="text-gray-600">Complete your competency assessment to generate personalized learning objectives.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Portfolio Tab - Step 6: Portfolio Development */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Portfolio Development</h3>
              <Badge variant="outline">Pre-registration Training</Badge>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Award className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Portfolio Requirements</AlertTitle>
              <AlertDescription className="text-blue-800">
                Complete 14 prescription counseling records across all therapeutic areas for your pre-registration portfolio.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assessment Portfolio</CardTitle>
                  <CardDescription>Competency assessments and evaluations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed Assessments</span>
                      <span className="font-medium">{userAssessments?.length || 0}/7</span>
                    </div>
                    <Progress value={(userAssessments?.length || 0) * 14.3} className="h-2" />
                    <p className="text-xs text-gray-600 mt-2">
                      Complete assessments across all 7 therapeutic areas
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Learning Evidence</CardTitle>
                  <CardDescription>Resources completed and documented</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Resources Completed</span>
                      <span className="font-medium">
                        {learningProgress?.filter((p: any) => p.completionPercentage === 100).length || 0}
                      </span>
                    </div>
                    <Progress value={learningProgress?.length ? (learningProgress.filter((p: any) => p.completionPercentage === 100).length / learningProgress.length) * 100 : 0} className="h-2" />
                    <p className="text-xs text-gray-600 mt-2">
                      Document your learning journey with completed resources
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}