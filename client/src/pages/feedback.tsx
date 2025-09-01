import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useStudentFeedback } from "@/hooks/use-student-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MobileFeedbackList } from "@/components/mobile/MobileFeedbackList";
import { 
  MessageSquare, 
  User, 
  Star, 
  Target, 
  CheckCircle, 
  TrendingUp, 
  Brain,
  Calendar,
  ArrowLeft,
  Filter,
  Send,
  MessageCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { Link } from "wouter";

interface FeedbackResponse {
  id: string;
  feedbackId: string;
  studentId: string;
  responseText: string;
  createdAt: string;
}

interface ExtendedFeedback {
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
  studentResponse?: FeedbackResponse;
}

export default function FeedbackPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: supervisorFeedback = [], isLoading: isFeedbackLoading, refetch } = useStudentFeedback(user?.id);
  
  const [filterType, setFilterType] = useState<'all' | 'session_review' | 'assessment' | 'general'>('all');
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<{[key: string]: string}>({});
  const [submittingResponse, setSubmittingResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not a student
  if (!isAuthenticated || user?.role !== 'student') {
    const redirectUrl = user?.role === 'supervisor' ? '/supervisor/dashboard' : 
                       user?.role === 'admin' ? '/admin/dashboard' : '/';
    window.location.href = redirectUrl;
    return null;
  }

  const filteredFeedback = filterType === 'all' 
    ? supervisorFeedback 
    : supervisorFeedback.filter((f: ExtendedFeedback) => f.feedbackType === filterType);

  const sortedFeedback = [...filteredFeedback].sort((a: ExtendedFeedback, b: ExtendedFeedback) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSubmitResponse = async (feedbackId: string) => {
    if (!responseText[feedbackId]?.trim()) return;

    setSubmittingResponse(feedbackId);
    setError(null);

    try {
      const response = await fetch('/api/student/feedback/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          feedbackId,
          responseText: responseText[feedbackId].trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      // Clear the response text and refresh feedback
      setResponseText(prev => ({ ...prev, [feedbackId]: '' }));
      await refetch();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit response');
    } finally {
      setSubmittingResponse(null);
    }
  };

  if (isFeedbackLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Supervisor Feedback</h1>
              <p className="text-gray-600 mt-1">
                Review all feedback from your supervisors and engage in meaningful dialogue
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="px-3 py-1">
                {sortedFeedback.length} feedback items
              </Badge>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Filter Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter by type:</span>
              </div>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All Feedback', count: supervisorFeedback.length },
                  { value: 'session_review', label: 'Session Reviews', count: supervisorFeedback.filter((f: ExtendedFeedback) => f.feedbackType === 'session_review').length },
                  { value: 'assessment', label: 'Assessments', count: supervisorFeedback.filter((f: ExtendedFeedback) => f.feedbackType === 'assessment').length },
                  { value: 'general', label: 'General', count: supervisorFeedback.filter((f: ExtendedFeedback) => f.feedbackType === 'general').length }
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

        {/* Mobile/Desktop Responsive Feedback List */}
        {isMobile ? (
          <MobileFeedbackList
            feedbackItems={sortedFeedback}
            userRole="student"
            isLoading={isFeedbackLoading}
            onRefresh={refetch}
            onSubmitResponse={handleSubmitResponse}
          />
        ) : (
          /* Desktop Feedback List */
          sortedFeedback.length > 0 ? (
            <div className="space-y-6">
              {sortedFeedback.map((feedback: ExtendedFeedback) => (
              <Card key={feedback.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                    {/* Header with supervisor info and rating */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">
                            {feedback.supervisor?.firstName && feedback.supervisor?.lastName 
                              ? `${feedback.supervisor.firstName} ${feedback.supervisor.lastName}`
                              : 'Supervisor'}
                          </h3>
                          <div className="flex items-center space-x-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < (feedback.overallRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-2">
                              ({feedback.overallRating || 'No rating'}/5)
                            </span>
                          </div>
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
                          {feedback.studentResponse && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                              Responded
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Scenario context if available */}
                    {(feedback.scenarioTitle || feedback.sessionId) && (
                      <div className="mb-4 p-3 bg-white/60 rounded-md border border-blue-100">
                        <p className="text-sm font-medium text-blue-800 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Context: {feedback.scenarioTitle || `Session #${feedback.sessionId}`}
                        </p>
                      </div>
                    )}

                    {/* Detailed ratings if available */}
                    {(feedback.clinicalKnowledgeRating || feedback.communicationRating || feedback.professionalismRating) && (
                      <div className="mb-4 p-3 bg-white/60 rounded-md border border-blue-100">
                        <h4 className="font-medium text-gray-800 mb-3 text-sm">Detailed Assessment:</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {feedback.clinicalKnowledgeRating && (
                            <div className="text-center">
                              <p className="text-xs text-gray-600 mb-1">Clinical Knowledge</p>
                              <div className="flex items-center justify-center space-x-1">
                                <p className="font-semibold text-blue-600">{feedback.clinicalKnowledgeRating}</p>
                                <span className="text-gray-400 text-sm">/5</span>
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < feedback.clinicalKnowledgeRating! ? 'text-blue-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {feedback.communicationRating && (
                            <div className="text-center">
                              <p className="text-xs text-gray-600 mb-1">Communication</p>
                              <div className="flex items-center justify-center space-x-1">
                                <p className="font-semibold text-green-600">{feedback.communicationRating}</p>
                                <span className="text-gray-400 text-sm">/5</span>
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < feedback.communicationRating! ? 'text-green-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {feedback.professionalismRating && (
                            <div className="text-center">
                              <p className="text-xs text-gray-600 mb-1">Professionalism</p>
                              <div className="flex items-center justify-center space-x-1">
                                <p className="font-semibold text-purple-600">{feedback.professionalismRating}</p>
                                <span className="text-gray-400 text-sm">/5</span>
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < feedback.professionalismRating! ? 'text-purple-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Main feedback content */}
                  <div className="p-6 space-y-6">
                    {feedback.writtenFeedback && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                          Feedback
                        </h4>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border">
                          {feedback.writtenFeedback}
                        </p>
                      </div>
                    )}

                    {feedback.strengths && (
                      <div>
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Strengths
                        </h4>
                        <p className="text-green-700 bg-green-50 p-4 rounded-lg border border-green-200 leading-relaxed">
                          {feedback.strengths}
                        </p>
                      </div>
                    )}

                    {feedback.improvementAreas && (
                      <div>
                        <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Areas for Improvement
                        </h4>
                        <p className="text-orange-700 bg-orange-50 p-4 rounded-lg border border-orange-200 leading-relaxed">
                          {feedback.improvementAreas}
                        </p>
                      </div>
                    )}
                  
                    {feedback.recommendations && (
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          Recommendations
                        </h4>
                        <p className="text-purple-700 bg-purple-50 p-4 rounded-lg border border-purple-200 leading-relaxed">
                          {feedback.recommendations}
                        </p>
                      </div>
                    )}
                  
                    {feedback.actionItems && feedback.actionItems.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Action Items
                        </h4>
                        <ul className="space-y-3">
                          {feedback.actionItems.map((item: string, index: number) => (
                            <li key={index} className="flex items-start bg-gray-50 p-3 rounded-lg border">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Student response section */}
                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2 text-indigo-600" />
                        Your Response
                      </h4>
                      
                      {feedback.studentResponse ? (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-indigo-800">You responded:</span>
                            <span className="text-xs text-indigo-600">
                              {new Date(feedback.studentResponse.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-indigo-700 leading-relaxed">
                            {feedback.studentResponse.responseText}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Share your thoughts, questions, or reflections on this feedback..."
                            value={responseText[feedback.id] || ''}
                            onChange={(e) => setResponseText(prev => ({ 
                              ...prev, 
                              [feedback.id]: e.target.value 
                            }))}
                            className="min-h-[100px] resize-none"
                            maxLength={1000}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {(responseText[feedback.id] || '').length}/1000 characters
                            </span>
                            <Button
                              onClick={() => handleSubmitResponse(feedback.id)}
                              disabled={!responseText[feedback.id]?.trim() || submittingResponse === feedback.id}
                              size="sm"
                            >
                              {submittingResponse === feedback.id ? (
                                <>
                                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Response
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {feedback.nextReviewDate && (
                      <div className="border-t pt-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Next review scheduled for: {new Date(feedback.nextReviewDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Yet</h3>
                <p className="text-gray-600 mb-4">
                  {filterType === 'all' 
                    ? "You haven't received any supervisor feedback yet. Complete scenarios and assessments to receive personalized feedback."
                    : `No ${filterType.replace('_', ' ')} feedback found. Try selecting a different filter.`
                  }
                </p>
                <Button variant="outline" asChild>
                  <Link href="/practice">
                    Start Practicing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}