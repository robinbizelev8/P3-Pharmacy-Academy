import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Brain, 
  Target, 
  Clock, 
  Users, 
  Zap, 
  Settings,
  Plus,
  ArrowLeft,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const assessmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assessmentType: z.enum(["diagnostic", "formative", "summative", "competency"]),
  targetCompetencies: z.array(z.enum(["PA1", "PA2", "PA3", "PA4"])).min(1, "Select at least one competency"),
  therapeuticAreas: z.array(z.string()).min(1, "Select at least one therapeutic area"),
  difficulty: z.enum(["foundation", "intermediate", "advanced", "expert"]),
  duration: z.number().min(15).max(180),
  passingScore: z.number().min(50).max(100),
  adaptiveScoring: z.boolean(),
  aiPoweredFeedback: z.boolean(),
  scenarioCount: z.number().min(1).max(20)
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

export default function AssessmentCreatorPage() {
  const [activeTab, setActiveTab] = useState("basics");
  const [previewMode, setPreviewMode] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: "",
      description: "",
      assessmentType: "formative",
      targetCompetencies: [],
      therapeuticAreas: [],
      difficulty: "intermediate",
      duration: 60,
      passingScore: 70,
      adaptiveScoring: true,
      aiPoweredFeedback: true,
      scenarioCount: 5
    }
  });

  const createAssessmentMutation = useMutation({
    mutationFn: (data: AssessmentFormData) => apiRequest("/api/assessments", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
    }
  });

  const onSubmit = (data: AssessmentFormData) => {
    createAssessmentMutation.mutate(data);
  };

  const therapeuticAreaOptions = [
    "Cardiovascular", "Endocrine", "Gastrointestinal", "Respiratory", 
    "Neurological", "Dermatological", "Renal", "Infectious Diseases",
    "Mental Health", "Oncology", "Pediatrics", "Geriatrics"
  ];

  const competencyDescriptions = {
    PA1: "Clinical Care & Patient Assessment - Direct patient care, clinical decision-making, therapeutic monitoring",
    PA2: "Medicine Supply & Safety - Dispensing, inventory management, medication safety protocols",
    PA3: "Patient Education & Counseling - Patient communication, medication counseling, health promotion",
    PA4: "Drug Information & Research - Literature evaluation, evidence-based practice, clinical research"
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/perform">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Perform
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Assessment</h1>
            <p className="text-gray-600">Design comprehensive competency assessments for Singapore pharmacy training</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createAssessmentMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createAssessmentMutation.isPending ? "Creating..." : "Create Assessment"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Assessment Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">{form.watch("title") || "Untitled Assessment"}</h2>
                <p className="text-gray-600 mt-1">{form.watch("description") || "No description provided"}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Assessment Type:</span>
                    <Badge variant="outline">{form.watch("assessmentType")}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Difficulty:</span>
                    <Badge variant="secondary">{form.watch("difficulty")}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">{form.watch("duration")} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Passing Score:</span>
                    <span className="text-sm">{form.watch("passingScore")}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Target Competencies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.watch("targetCompetencies").map(comp => (
                        <Badge key={comp} variant="outline">{comp}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Therapeutic Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.watch("therapeuticAreas").slice(0, 3).map(area => (
                        <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                      ))}
                      {form.watch("therapeuticAreas").length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{form.watch("therapeuticAreas").length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">AI-Powered Feedback:</span>
                  <Badge variant={form.watch("aiPoweredFeedback") ? "default" : "secondary"}>
                    {form.watch("aiPoweredFeedback") ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Adaptive Scoring:</span>
                  <Badge variant={form.watch("adaptiveScoring") ? "default" : "secondary"}>
                    {form.watch("adaptiveScoring") ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Form Mode */
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="competencies">Competencies</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              </TabsList>

              {/* Basics Tab */}
              <TabsContent value="basics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Information</CardTitle>
                    <CardDescription>
                      Define the basic details and purpose of your assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assessment Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Cardiovascular Competency Assessment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the assessment objectives, target audience, and learning outcomes..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="assessmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assessment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select assessment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="diagnostic">Diagnostic - Identify knowledge gaps</SelectItem>
                                <SelectItem value="formative">Formative - Track learning progress</SelectItem>
                                <SelectItem value="summative">Summative - Evaluate final competency</SelectItem>
                                <SelectItem value="competency">Competency - SPC certification readiness</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="foundation">Foundation - Basic concepts</SelectItem>
                                <SelectItem value="intermediate">Intermediate - Applied knowledge</SelectItem>
                                <SelectItem value="advanced">Advanced - Complex scenarios</SelectItem>
                                <SelectItem value="expert">Expert - Professional practice</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="15" 
                                max="180" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passingScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passing Score (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="50" 
                                max="100" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Competencies Tab */}
              <TabsContent value="competencies" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Target Competencies</CardTitle>
                    <CardDescription>
                      Select the Singapore Pharmacy Council professional activities to assess
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="targetCompetencies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Activities (PA1-PA4)</FormLabel>
                          <div className="space-y-3">
                            {Object.entries(competencyDescriptions).map(([pa, description]) => (
                              <div key={pa} className="border rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    id={pa}
                                    checked={field.value.includes(pa as any)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        field.onChange([...field.value, pa]);
                                      } else {
                                        field.onChange(field.value.filter(item => item !== pa));
                                      }
                                    }}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <label htmlFor={pa} className="font-medium cursor-pointer">
                                      {pa}
                                    </label>
                                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Therapeutic Areas</CardTitle>
                    <CardDescription>
                      Select the clinical areas to include in assessment scenarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="therapeuticAreas"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid md:grid-cols-2 gap-3">
                            {therapeuticAreaOptions.map(area => (
                              <div key={area} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={area}
                                  checked={field.value.includes(area)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, area]);
                                    } else {
                                      field.onChange(field.value.filter(item => item !== area));
                                    }
                                  }}
                                />
                                <label htmlFor={area} className="text-sm cursor-pointer">
                                  {area}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Advanced Features
                    </CardTitle>
                    <CardDescription>
                      Configure AI-powered capabilities and adaptive assessment features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="aiPoweredFeedback"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between border rounded-lg p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center gap-2">
                                <Brain className="h-4 w-4 text-purple-600" />
                                AI-Powered Feedback
                              </FormLabel>
                              <p className="text-sm text-gray-600">
                                Generate personalized feedback using Singapore clinical guidelines and best practices
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adaptiveScoring"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between border rounded-lg p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-orange-600" />
                                Adaptive Scoring
                              </FormLabel>
                              <p className="text-sm text-gray-600">
                                Adjust question difficulty based on performance and provide partial credit
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Assessment Intelligence Features</h4>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium text-sm">Smart Recommendations</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            AI suggests next learning steps based on performance patterns
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">Progress Analytics</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Track competency development over time with detailed insights
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scenarios Tab */}
              <TabsContent value="scenarios" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Scenario Configuration</CardTitle>
                    <CardDescription>
                      Configure the clinical scenarios and question types for your assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="scenarioCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Scenarios</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <Slider
                                value={[field.value]}
                                onValueChange={([value]) => field.onChange(value)}
                                min={1}
                                max={20}
                                step={1}
                                className="w-full"
                              />
                              <div className="text-sm text-gray-600 text-center">
                                {field.value} scenario{field.value !== 1 ? 's' : ''} 
                                ({Math.round(field.value * form.watch("duration") / 5)} minutes estimated)
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h4 className="font-medium">Scenario Types</h4>
                      
                      <div className="grid gap-3">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Patient Consultation</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Interactive patient scenarios with symptoms assessment and treatment recommendations
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="font-medium">Clinical Decision Making</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Complex cases requiring critical thinking and application of Singapore guidelines
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Knowledge Application</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Application of theoretical knowledge to practical pharmacy situations
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      )}
    </div>
  );
}