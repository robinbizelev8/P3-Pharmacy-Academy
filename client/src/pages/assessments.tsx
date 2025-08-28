import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  Brain, 
  Target, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Award,
  ChevronRight,
  FileCheck
} from "lucide-react";

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock assessment data - in real app, this would come from API
  const assessmentData = {
    recentAssessments: [
      {
        id: "demo-assessment-id",
        title: "PA1-PA4 Competency Assessment",
        type: "Comprehensive",
        score: 85,
        maxScore: 100,
        completedAt: "2024-01-15",
        status: "completed"
      },
      {
        id: "adaptive-demo",
        title: "Adaptive Clinical Scenarios",
        type: "Adaptive",
        score: 78,
        maxScore: 100,
        completedAt: "2024-01-12",
        status: "completed"
      }
    ],
    stats: {
      totalAssessments: 12,
      averageScore: 81.5,
      completionRate: 94,
      improvementTrend: "+12%"
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-3xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Assessments</h1>
                <p className="text-lg text-blue-700 font-medium">Competency Evaluation & Reports</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Comprehensive assessment management with detailed analytics, adaptive testing, and Singapore pharmacy competency tracking.
            </p>
          </div>
          
          <div className="lg:text-right">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg mb-6">
              <Target className="w-12 h-12 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gray-900">{assessmentData.stats.totalAssessments}</div>
              <div className="text-sm text-gray-600">Total Assessments</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-50">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white font-medium">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <FileText className="h-10 w-10 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-green-900 mb-2">Latest Assessment Report</h3>
                <p className="text-sm text-green-700 mb-4">View your most recent performance analysis</p>
                <Link to="/perform/assessment-report/demo-assessment-id">
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-full" data-testid="button-view-latest-report">
                    <FileText className="h-4 w-4 mr-2" />
                    View Latest Report
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
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full" data-testid="button-create-new-assessment">
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
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full" data-testid="button-start-adaptive">
                    <Brain className="h-4 w-4 mr-2" />
                    Start Adaptive
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">{assessmentData.stats.averageScore}%</p>
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
                  <p className="text-2xl font-bold text-green-600">{assessmentData.stats.completionRate}%</p>
                </div>
                <div className="ml-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                  <p className="text-2xl font-bold text-purple-600">{assessmentData.stats.totalAssessments}</p>
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
                  <p className="text-2xl font-bold text-emerald-600">{assessmentData.stats.improvementTrend}</p>
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
                {assessmentData.recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{assessment.title}</h4>
                        <p className="text-sm text-gray-500">{assessment.type} • {assessment.completedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{assessment.score}/{assessment.maxScore}</p>
                        <Badge variant={assessment.score >= 80 ? "default" : "secondary"} className="text-xs">
                          {assessment.score >= 80 ? "Excellent" : "Good"}
                        </Badge>
                      </div>
                      <Link to={`/perform/assessment-report/${assessment.id}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Reports</CardTitle>
              <CardDescription>Detailed performance analysis and competency tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Comprehensive Report</h3>
                        <p className="text-sm text-gray-500">Full assessment analysis</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Available</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    View detailed question-by-question analysis, competency breakdown, and personalized recommendations.
                  </p>
                  <Link to="/perform/assessment-report/demo-assessment-id">
                    <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-comprehensive-report">
                      <FileText className="h-4 w-4 mr-2" />
                      View Comprehensive Report
                    </Button>
                  </Link>
                </div>

                <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Adaptive Analysis</h3>
                        <p className="text-sm text-gray-500">AI-powered insights</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Try Now</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Experience adaptive difficulty with real-time performance tracking and confidence analysis.
                  </p>
                  <Link to="/perform/adaptive-assessment/demo-session-123">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-adaptive-analysis">
                      <Brain className="h-4 w-4 mr-2" />
                      Try Adaptive Assessment
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Assessment</CardTitle>
              <CardDescription>Design custom assessments with AI-powered features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Plus className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Creator</h3>
                <p className="text-gray-600 mb-6">
                  Create custom competency assessments with therapeutic area targeting, difficulty adjustment, and Singapore pharmacy standards alignment.
                </p>
                <Link to="/perform/create-assessment">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="lg" data-testid="button-go-to-creator">
                    <Plus className="h-5 w-5 mr-2" />
                    Go to Assessment Creator
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}