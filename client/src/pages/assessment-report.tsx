import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  Target, 
  TrendingUp,
  FileText,
  Download,
  ArrowLeft,
  Lightbulb,
  Star
} from "lucide-react";
import { Link } from "wouter";

interface AssessmentQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'short_answer' | 'clinical_scenario';
  userAnswer: string;
  modelAnswer: string;
  isCorrect: boolean;
  partialScore: number;
  maxScore: number;
  competencyArea: 'PA1' | 'PA2' | 'PA3' | 'PA4';
  therapeuticArea: string;
  feedback: string;
  learningTip: string;
  improvementSuggestion: string;
}

interface AssessmentReport {
  assessmentId: string;
  title: string;
  completedAt: string;
  overallScore: number;
  maxScore: number;
  percentage: number;
  competencyBreakdown: {
    PA1: { score: number; maxScore: number; questions: number };
    PA2: { score: number; maxScore: number; questions: number };
    PA3: { score: number; maxScore: number; questions: number };
    PA4: { score: number; maxScore: number; questions: number };
  };
  questions: AssessmentQuestion[];
  strengths: string[];
  areasForImprovement: string[];
  nextSteps: string[];
  estimatedStudyTime: number;
}

export default function AssessmentReportPage() {
  const [match, params] = useRoute("/perform/assessment-report/:assessmentId");
  const assessmentId = params?.assessmentId;

  const { data: report, isLoading } = useQuery<AssessmentReport>({
    queryKey: ["/api/perform/assessment-report", assessmentId],
    enabled: !!assessmentId
  });

  const [activeTab, setActiveTab] = useState("overview");

  if (!match || !assessmentId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Assessment Not Found</h1>
          <p className="text-gray-600 mt-2">The requested assessment report could not be found.</p>
          <Link to="/perform">
            <Button className="mt-4">Return to Perform Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">No Report Available</h1>
          <p className="text-gray-500 mt-2">This assessment has not been analyzed yet.</p>
          <Link to="/perform">
            <Button className="mt-4">Return to Perform Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 70) return "secondary";
    return "destructive";
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/perform">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Report</h1>
            <p className="text-gray-600">{report.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Overall Score Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(report.percentage)}`}>
                {report.percentage}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
              <Badge variant={getScoreBadgeVariant(report.percentage)} className="mt-2">
                {report.percentage >= 80 ? "Excellent" : report.percentage >= 70 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {report.overallScore}/{report.maxScore}
              </div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {report.questions.length}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(report.estimatedStudyTime)}h
              </div>
              <div className="text-sm text-gray-600">Est. Study Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competency">Competency Analysis</TabsTrigger>
          <TabsTrigger value="questions">Question Review</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Competency Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Competency Area Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(report.competencyBreakdown).map(([pa, data]: [string, { score: number; maxScore: number; questions: number }]) => (
                  <div key={pa} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{pa}</span>
                      <span className="text-sm text-gray-600">
                        {data.score}/{data.maxScore} ({Math.round((data.score / data.maxScore) * 100)}%)
                      </span>
                    </div>
                    <Progress value={(data.score / data.maxScore) * 100} className="h-2" />
                    <div className="text-xs text-gray-500">{data.questions} questions</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths & Improvements */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.areasForImprovement.map((area: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Competency Analysis Tab */}
        <TabsContent value="competency" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {Object.entries(report.competencyBreakdown).map(([pa, data]: [string, { score: number; maxScore: number; questions: number }]) => (
              <Card key={pa}>
                <CardHeader>
                  <CardTitle>{pa} - Professional Activity</CardTitle>
                  <CardDescription>
                    {pa === 'PA1' && 'Clinical Care & Patient Assessment'}
                    {pa === 'PA2' && 'Medicine Supply & Safety'}
                    {pa === 'PA3' && 'Patient Education & Counseling'}
                    {pa === 'PA4' && 'Drug Information & Research'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {Math.round((data.score / data.maxScore) * 100)}%
                      </span>
                      <Badge variant={getScoreBadgeVariant((data.score / data.maxScore) * 100)}>
                        {data.score}/{data.maxScore} points
                      </Badge>
                    </div>
                    <Progress value={(data.score / data.maxScore) * 100} className="h-3" />
                    
                    {/* Questions in this competency */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Questions in this area:</h4>
                      {report.questions
                        .filter((q: AssessmentQuestion) => q.competencyArea === pa)
                        .map((question: AssessmentQuestion, index: number) => (
                          <div key={question.id} className="flex items-center gap-2 text-xs">
                            {question.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="truncate">
                              Q{index + 1}: {question.questionText.substring(0, 60)}...
                            </span>
                            <span className="font-medium">
                              {question.partialScore}/{question.maxScore}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Question Review Tab */}
        <TabsContent value="questions" className="space-y-6">
          {report.questions.map((question: AssessmentQuestion, index: number) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{question.competencyArea}</Badge>
                    <Badge variant="outline">{question.therapeuticArea}</Badge>
                    {question.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Question:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{question.questionText}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-red-700">Your Answer:</h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded border border-red-200">
                      {question.userAnswer}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-green-700">Model Answer:</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded border border-green-200">
                      {question.modelAnswer}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      Feedback:
                    </h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded">{question.feedback}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      Learning Tip:
                    </h4>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded">{question.learningTip}</p>
                  </div>

                  {question.improvementSuggestion && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        Improvement Suggestion:
                      </h4>
                      <p className="text-gray-700 bg-purple-50 p-3 rounded">{question.improvementSuggestion}</p>
                    </div>
                  )}
                </div>

                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Score: {question.partialScore}/{question.maxScore}</span>
                  <span className="text-gray-600">Question Type: {question.questionType.replace('_', ' ')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Next Steps for Improvement
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.nextSteps.map((step: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Study Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Estimated total study time:</span>
                    <span className="font-medium">{Math.round(report.estimatedStudyTime)} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommended sessions per week:</span>
                    <span className="font-medium">3-4 sessions</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target completion date:</span>
                    <span className="font-medium">
                      {new Date(Date.now() + report.estimatedStudyTime * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Practice Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to="/practice">
                    <Button className="w-full" variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Targeted Practice
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Review Study Materials
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Take Another Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}