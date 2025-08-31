import { useState } from "react";
import { useTraineeProgress } from "@/hooks/use-supervisor-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  Target,
} from "lucide-react";
import type { TraineeAssignmentWithDetails } from "@shared/schema";

interface TraineeProgressModalProps {
  trainee: TraineeAssignmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function TraineeProgressModal({ trainee, isOpen, onClose }: TraineeProgressModalProps) {
  const { data: progressData, isLoading, error } = useTraineeProgress(trainee?.traineeId);
  
  const traineeName = `${trainee?.trainee?.firstName || ''} ${trainee?.trainee?.lastName || ''}`.trim() || 'Unknown Trainee';

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading progress data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Error Loading Progress
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Unable to load progress data for {traineeName}.</p>
            <p className="text-sm text-red-600 mt-2">{error.message}</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const modules = progressData?.modules || {};
  const competencyProgression = progressData?.competencyProgression || {};
  const recentSessions = progressData?.recentSessions || [];
  const totalSessions = progressData?.totalSessionsCompleted || 0;
  const averageScore = progressData?.averageScore || 0;
  const strengthsWeaknesses = progressData?.strengthsWeaknesses || { strengths: [], improvements: [] };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
            {traineeName} - Progress Overview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-blue-600">{totalSessions}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-green-600">{averageScore}%</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Institution</p>
                    <p className="text-sm font-medium">{trainee?.trainee?.institution || trainee?.institution || 'Not specified'}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="modules" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="competencies">Competencies</TabsTrigger>
              <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            {/* Modules Progress */}
            <TabsContent value="modules" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(modules).map(([moduleName, moduleData]: [string, any]) => (
                  <Card key={moduleName}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg capitalize flex items-center">
                        {moduleName === 'prepare' && <Target className="w-5 h-5 mr-2 text-blue-500" />}
                        {moduleName === 'practice' && <BookOpen className="w-5 h-5 mr-2 text-green-500" />}
                        {moduleName === 'perform' && <Award className="w-5 h-5 mr-2 text-purple-500" />}
                        {moduleName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{moduleData.progressPercentage}%</span>
                        </div>
                        <Progress value={moduleData.progressPercentage} className="h-2" />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Sessions: {moduleData.completedSessions}/{moduleData.totalSessions}</span>
                          <span>Avg: {moduleData.averageScore}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Competencies Progress */}
            <TabsContent value="competencies" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(competencyProgression).map(([competency, data]: [string, any]) => (
                  <Card key={competency}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{competency}</h4>
                        <Badge variant={data.averageScore >= 70 ? "default" : "secondary"}>
                          {data.averageScore}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Progress value={data.averageScore} className="h-2" />
                        <p className="text-sm text-gray-600">
                          {data.sessions} sessions completed
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recent Sessions */}
            <TabsContent value="sessions" className="space-y-4">
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.slice(0, 10).map((session: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{session.title || `Session ${index + 1}`}</h4>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(session.date || session.createdAt).toLocaleDateString()}
                              <span className="ml-4">Module: {session.module || 'Unknown'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={session.status === 'completed' ? "default" : "secondary"}>
                              {session.status || 'Unknown'}
                            </Badge>
                            {session.score && (
                              <div className="text-right">
                                <p className="font-semibold">{session.score}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No recent sessions found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Performance Insights */}
            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {strengthsWeaknesses.strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {strengthsWeaknesses.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 text-sm">No specific strengths identified yet. Complete more sessions to get detailed insights.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Areas for Improvement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-yellow-600">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {strengthsWeaknesses.improvements.length > 0 ? (
                      <ul className="space-y-2">
                        {strengthsWeaknesses.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 text-sm">No specific areas for improvement identified yet. Complete more sessions to get detailed insights.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => {
              // TODO: Implement export functionality
              alert('Export functionality coming soon!');
            }}>
              Export Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}