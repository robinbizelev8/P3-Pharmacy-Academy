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
import { CheckCircle, BookOpen, Target, Clock, Brain, Play, Award, TrendingUp, FileText, AlertCircle, Users, Building2, GraduationCap, Heart, Pill, Stethoscope } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Module 1: Prepare - Foundation Building
export default function PreparePage() {
  const [selectedTherapeuticArea, setSelectedTherapeuticArea] = useState<string>("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [assessmentComplete, setAssessmentComplete] = useState<boolean>(false);
  const [selectedProfessionalActivity, setSelectedProfessionalActivity] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch pharmacy constants for dropdowns
  const { data: constants } = useQuery({
    queryKey: ["/api/pharmacy/constants"]
  });

  // Fetch user's existing assessments
  const { data: userAssessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/pharmacy/assessments"],
    enabled: !!selectedTherapeuticArea
  });

  // Fetch learning resources based on selections
  const { data: learningResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/pharmacy/resources", selectedTherapeuticArea, selectedPracticeArea],
    enabled: !!selectedTherapeuticArea && !!selectedPracticeArea
  });

  // Fetch user's learning progress
  const { data: learningProgress } = useQuery({
    queryKey: ["/api/pharmacy/progress"]
  });

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

  const therapeuticAreas = [
    { value: "cardiovascular", label: "Cardiovascular", icon: Heart, color: "bg-red-100 text-red-700" },
    { value: "respiratory", label: "Respiratory", icon: Brain, color: "bg-blue-100 text-blue-700" },
    { value: "endocrine", label: "Endocrine", icon: Pill, color: "bg-green-100 text-green-700" },
    { value: "gastrointestinal", label: "Gastrointestinal", icon: Stethoscope, color: "bg-orange-100 text-orange-700" },
    { value: "renal", label: "Renal", icon: Brain, color: "bg-purple-100 text-purple-700" },
    { value: "neurological", label: "Neurological", icon: Brain, color: "bg-indigo-100 text-indigo-700" },
    { value: "dermatological", label: "Dermatological", icon: Pill, color: "bg-pink-100 text-pink-700" }
  ];

  const practiceAreas = [
    { value: "hospital", label: "Hospital Acute Care" },
    { value: "community", label: "Community Pharmacy" }
  ];

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
    updateProgressMutation.mutate({
      resourceId,
      ...progressData
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
              <h1 className="text-3xl font-bold text-gray-900">Module 1: Prepare</h1>
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
            This module aligns with Singapore's pharmacy competency framework for the 30-week pre-registration period. 
            Complete assessments across all 7 therapeutic areas to build your foundation for supervised practice.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="assessment" className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4" />
            <span>Assessment</span>
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

        {/* Assessment Tab - Step 1: Foundation Assessment */}
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
                <Select value={selectedTherapeuticArea} onValueChange={setSelectedTherapeuticArea}>
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
                      {createAssessmentMutation.isPending ? "Creating Assessment..." : "Start Competency Assessment"}
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
                  Foundation building progress across therapeutic areas
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
                    <p>Complete your first assessment to see progress</p>
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

          {/* Professional Activities Grid */}
          {assessmentComplete && (
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

        {/* Self-Assessment Tab */}
        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competency Self-Assessment</CardTitle>
              <CardDescription>
                Evaluate your baseline competency against PA1-PA4 for direct patient care
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {competencyAreas.map((competency) => (
                <div key={competency.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{competency.id}: {competency.name}</h4>
                      <p className="text-sm text-gray-600">{competency.description}</p>
                    </div>
                    <Badge variant={competency.progress > 70 ? "default" : "secondary"}>
                      {competency.progress}%
                    </Badge>
                  </div>
                  <Progress value={competency.progress} className="h-3" />
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Retake Assessment
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Resources Tab */}
        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Guidelines</CardTitle>
                <CardDescription>Evidence-based treatment protocols</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Hypertension Management Guidelines
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    COPD Treatment Protocols
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Diabetes Care Standards
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drug Monographs</CardTitle>
                <CardDescription>Comprehensive medication information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <Pill className="w-4 h-4 mr-2" />
                    ACE Inhibitors & ARBs
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Pill className="w-4 h-4 mr-2" />
                    Bronchodilators & Corticosteroids
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Pill className="w-4 h-4 mr-2" />
                    Antidiabetic Agents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Learning Objectives Tab */}
        <TabsContent value="objectives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Learning Objectives</CardTitle>
              <CardDescription>
                Goals based on competency gaps and supervision level targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-700">Strengths to Maintain</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Strong knowledge of pharmacy law and ethics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Good understanding of medication safety principles</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-orange-700">Areas for Improvement</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      <span>Clinical assessment and patient counseling skills</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      <span>Complex therapeutic decision-making</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                <p className="text-sm text-blue-800">
                  Complete foundation building in cardiovascular and respiratory therapeutic areas to achieve Level 3 supervision requirements.
                </p>
                <Button className="mt-3" size="sm">
                  Create Learning Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}