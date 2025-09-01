import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  User, 
  Star, 
  Calendar,
  Send,
  MessageCircle,
  Clock,
  CheckCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Smartphone
} from "lucide-react";

interface MobileFeedbackCardProps {
  feedback: {
    id: string;
    supervisorId: string;
    traineeId: string;
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
    createdAt: string;
    scenarioTitle?: string;
    supervisor?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    trainee?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    studentResponse?: {
      id: string;
      responseText: string;
      createdAt: string;
    };
  };
  onSubmitResponse?: (feedbackId: string, responseText: string) => Promise<void>;
  userRole: 'student' | 'supervisor';
}

export function MobileFeedbackCard({ feedback, onSubmitResponse, userRole }: MobileFeedbackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !onSubmitResponse) return;

    setIsSubmitting(true);
    try {
      await onSubmitResponse(feedback.id, responseText.trim());
      setResponseText('');
      setShowResponseForm(false);
    } catch (error) {
      console.error('Failed to submit response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayName = userRole === 'student' 
    ? `${feedback.supervisor?.firstName || ''} ${feedback.supervisor?.lastName || ''}`.trim() || 'Supervisor'
    : `${feedback.trainee?.firstName || ''} ${feedback.trainee?.lastName || ''}`.trim() || 'Student';

  return (
    <Card className="w-full bg-white shadow-sm border-l-4 border-l-blue-500 mb-4">
      {/* Mobile Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{displayName}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {feedback.feedbackType.replace('_', ' ').toUpperCase()}
                </Badge>
                {feedback.studentResponse ? (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200 px-2 py-0.5">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Responded
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 px-2 py-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Action Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 p-2"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Quick Info Row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(feedback.createdAt)}
          </div>
          {feedback.overallRating && (
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-400 mr-1" />
              {feedback.overallRating}/5
            </div>
          )}
        </div>
      </CardHeader>

      {/* Expandable Content */}
      {isExpanded && (
        <CardContent className="pt-0">
          {/* Scenario Context */}
          {feedback.scenarioTitle && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center text-sm font-medium text-blue-800 mb-1">
                <Eye className="w-4 h-4 mr-2" />
                Scenario Context
              </div>
              <p className="text-blue-700 text-sm">{feedback.scenarioTitle}</p>
            </div>
          )}

          {/* Ratings Grid - Mobile Optimized */}
          {(feedback.clinicalKnowledgeRating || feedback.communicationRating || feedback.professionalismRating) && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Performance Ratings</h4>
              <div className="space-y-2">
                {feedback.clinicalKnowledgeRating && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Clinical Knowledge</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < feedback.clinicalKnowledgeRating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm font-medium ml-2">{feedback.clinicalKnowledgeRating}/5</span>
                    </div>
                  </div>
                )}
                
                {feedback.communicationRating && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Communication</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < feedback.communicationRating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm font-medium ml-2">{feedback.communicationRating}/5</span>
                    </div>
                  </div>
                )}
                
                {feedback.professionalismRating && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Professionalism</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < feedback.professionalismRating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm font-medium ml-2">{feedback.professionalismRating}/5</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Feedback Content */}
          {feedback.writtenFeedback && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                {userRole === 'student' ? 'Feedback from Supervisor' : 'Your Feedback'}
              </h4>
              <div className="bg-white p-3 rounded-lg border text-sm text-gray-700 leading-relaxed">
                {feedback.writtenFeedback}
              </div>
            </div>
          )}

          {/* Feedback Categories - Mobile Stack */}
          <div className="space-y-3 mb-4">
            {feedback.strengths && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800 mb-2 text-sm">💪 Strengths</h5>
                <p className="text-green-700 text-sm leading-relaxed">{feedback.strengths}</p>
              </div>
            )}
            
            {feedback.improvementAreas && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <h5 className="font-medium text-orange-800 mb-2 text-sm">🎯 Areas for Improvement</h5>
                <p className="text-orange-700 text-sm leading-relaxed">{feedback.improvementAreas}</p>
              </div>
            )}
            
            {feedback.recommendations && (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-800 mb-2 text-sm">💡 Recommendations</h5>
                <p className="text-purple-700 text-sm leading-relaxed">{feedback.recommendations}</p>
              </div>
            )}
          </div>

          {/* Action Items */}
          {feedback.actionItems && feedback.actionItems.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-800 mb-2 text-sm">📋 Action Items</h5>
              <ul className="space-y-1">
                {feedback.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Student Response Section */}
          {feedback.studentResponse && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2 text-indigo-600" />
                Student Response
              </h4>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-800">Response:</span>
                  <span className="text-xs text-indigo-600">
                    {formatDate(feedback.studentResponse.createdAt)}
                  </span>
                </div>
                <p className="text-indigo-700 text-sm leading-relaxed">
                  {feedback.studentResponse.responseText}
                </p>
              </div>
            </div>
          )}

          {/* Mobile Response Interface */}
          {userRole === 'student' && !feedback.studentResponse && onSubmitResponse && (
            <div className="space-y-3">
              {!showResponseForm ? (
                <Button 
                  onClick={() => setShowResponseForm(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Respond to Feedback
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Textarea
                      placeholder="Share your thoughts, questions, or action plan regarding this feedback..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="min-h-[120px] resize-none text-sm p-4 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                      maxLength={1000}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {responseText.length}/1000
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setShowResponseForm(false);
                        setResponseText('');
                      }}
                      variant="outline"
                      className="flex-1 py-3"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitResponse}
                      disabled={!responseText.trim() || isSubmitting}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3"
                    >
                      {isSubmitting ? (
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
          )}
        </CardContent>
      )}
    </Card>
  );
}