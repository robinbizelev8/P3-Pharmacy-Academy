import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  User, 
  Star, 
  Calendar,
  ArrowLeft,
  Send,
  MessageCircle,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye
} from "lucide-react";

interface StudentResponse {
  id: string;
  feedbackId: string;
  studentId: string;
  responseText: string;
  createdAt: string;
}

interface FeedbackWithResponse {
  id: string;
  supervisorId: string;
  traineeId: string;
  sessionId?: string;
  feedbackType: string;
  overallRating?: number;
  clinicalKnowledgeRating?: number;
  communicationRating?: number;
  professionalismRating?: number;
  writtenFeedback?: string;
  strengths?: string;
  improvementAreas?: string;
  recommendations?: string;
  actionItems?: string[];
  nextReviewDate?: string;
  createdAt: string;
  scenarioTitle?: string;
  supervisor?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  trainee?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  studentResponse?: StudentResponse;
}

interface StudentResponsesViewProps {
  supervisorId: string;
}

export function StudentResponsesView({ supervisorId }: StudentResponsesViewProps) {
  const [feedbackWithResponses, setFeedbackWithResponses] = useState<FeedbackWithResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [supervisorReply, setSupervisorReply] = useState<{[key: string]: string}>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'responded' | 'pending'>('all');

  useEffect(() => {
    fetchFeedbackWithResponses();
  }, [supervisorId]);

  const fetchFeedbackWithResponses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/supervisor/feedback/${supervisorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }
      
      const data = await response.json();
      setFeedbackWithResponses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async (feedbackId: string) => {
    const replyText = supervisorReply[feedbackId]?.trim();
    if (!replyText) return;

    setSubmittingReply(feedbackId);
    
    try {
      const response = await fetch('/api/supervisor/feedback/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          feedbackId,
          replyText
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      // Clear the reply text and refresh data
      setSupervisorReply(prev => ({ ...prev, [feedbackId]: '' }));
      await fetchFeedbackWithResponses();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit reply');
    } finally {
      setSubmittingReply(null);
    }
  };

  const filteredFeedback = feedbackWithResponses.filter(feedback => {
    if (filterType === 'all') return true;
    if (filterType === 'responded') return feedback.studentResponse;
    if (filterType === 'pending') return !feedback.studentResponse;
    return true;
  });

  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    // Prioritize feedback with student responses
    if (a.studentResponse && !b.studentResponse) return -1;
    if (!a.studentResponse && b.studentResponse) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter feedback:</span>
            </div>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All Feedback', count: feedbackWithResponses.length },
                { value: 'responded', label: 'With Responses', count: feedbackWithResponses.filter(f => f.studentResponse).length },
                { value: 'pending', label: 'Pending Response', count: feedbackWithResponses.filter(f => !f.studentResponse).length }
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={filterType === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter.value as any)}
                  className="text-xs"
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filter.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      {sortedFeedback.length > 0 ? (
        <div className="space-y-6">
          {sortedFeedback.map((feedback) => (
            <Card key={feedback.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          {feedback.trainee?.firstName && feedback.trainee?.lastName 
                            ? `${feedback.trainee.firstName} ${feedback.trainee.lastName}`
                            : 'Student'}
                        </h3>
                        <p className="text-sm text-blue-700">{feedback.trainee?.email}</p>
                        {feedback.overallRating && (
                          <div className="flex items-center space-x-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < feedback.overallRating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-2">
                              ({feedback.overallRating}/5)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {feedback.feedbackType.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {feedback.studentResponse ? (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Student Responded
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Awaiting Response
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scenario context */}
                  {feedback.scenarioTitle && (
                    <div className="mb-4 p-3 bg-white/60 rounded-md border border-blue-100">
                      <p className="text-sm font-medium text-blue-800 flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Scenario: {feedback.scenarioTitle}
                      </p>
                    </div>
                  )}
                </div>

                {/* Original Feedback Content */}
                <div className="p-6 border-b bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                    Your Original Feedback
                  </h4>
                  
                  <div className="space-y-4">
                    {feedback.writtenFeedback && (
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-gray-700 leading-relaxed">{feedback.writtenFeedback}</p>
                      </div>
                    )}

                    {(feedback.strengths || feedback.improvementAreas || feedback.recommendations) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {feedback.strengths && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <h5 className="font-medium text-green-800 mb-2">Strengths</h5>
                            <p className="text-green-700 text-sm">{feedback.strengths}</p>
                          </div>
                        )}
                        {feedback.improvementAreas && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <h5 className="font-medium text-orange-800 mb-2">Improvement Areas</h5>
                            <p className="text-orange-700 text-sm">{feedback.improvementAreas}</p>
                          </div>
                        )}
                        {feedback.recommendations && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <h5 className="font-medium text-purple-800 mb-2">Recommendations</h5>
                            <p className="text-purple-700 text-sm">{feedback.recommendations}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Response Section */}
                {feedback.studentResponse ? (
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2 text-indigo-600" />
                      Student Response
                    </h4>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-800">Student replied:</span>
                        <span className="text-xs text-indigo-600">
                          {new Date(feedback.studentResponse.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-indigo-700 leading-relaxed">
                        {feedback.studentResponse.responseText}
                      </p>
                    </div>

                    {/* Supervisor Reply Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Your Reply:</label>
                      <Textarea
                        placeholder="Respond to the student's feedback response..."
                        value={supervisorReply[feedback.id] || ''}
                        onChange={(e) => setSupervisorReply(prev => ({ 
                          ...prev, 
                          [feedback.id]: e.target.value 
                        }))}
                        className="min-h-[100px] resize-none"
                        maxLength={1000}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {(supervisorReply[feedback.id] || '').length}/1000 characters
                        </span>
                        <Button
                          onClick={() => handleSubmitReply(feedback.id)}
                          disabled={!supervisorReply[feedback.id]?.trim() || submittingReply === feedback.id}
                          size="sm"
                        >
                          {submittingReply === feedback.id ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 border-t">
                    <div className="text-center py-4">
                      <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Waiting for student response...</p>
                      <p className="text-gray-500 text-xs">The student will be notified to review your feedback</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Available</h3>
            <p className="text-gray-600 mb-4">
              {filterType === 'all' 
                ? "You haven't provided any feedback yet. Start by reviewing trainee sessions and providing feedback."
                : filterType === 'responded'
                ? "No students have responded to your feedback yet."
                : "No feedback is pending student responses."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}