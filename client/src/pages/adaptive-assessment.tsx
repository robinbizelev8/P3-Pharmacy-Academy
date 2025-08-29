import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  BookOpen,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface AssessmentQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'short_answer' | 'clinical_scenario';
  options?: string[];
  competencyArea: 'PA1' | 'PA2' | 'PA3' | 'PA4';
  therapeuticArea: string;
  difficulty: number; // 1-10 scale
  hints?: string[];
  timeLimit?: number;
}

interface AdaptiveSession {
  id: string;
  title: string;
  currentQuestion: number;
  totalQuestions: number;
  questions: AssessmentQuestion[];
  userAnswers: { [key: string]: string };
  competencyScores: { [key: string]: number };
  adaptiveLevel: number;
  timeRemaining: number;
  status: 'active' | 'paused' | 'completed';
}

export default function AdaptiveAssessmentPage() {
  const [match, params] = useRoute("/perform/adaptive-assessment/:sessionId");
  const sessionId = params?.sessionId;
  
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery<AdaptiveSession>({
    queryKey: ["/api/adaptive-assessment", sessionId],
    enabled: !!sessionId,
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (answerData: {
      questionId: string;
      answer: string;
      confidenceLevel: number;
      timeSpent: number;
      hintsUsed: number;
    }) => apiRequest("POST", `/api/adaptive-assessment/${sessionId}/answer`, answerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adaptive-assessment", sessionId] });
      setCurrentAnswer("");
      setShowHint(false);
      setConfidenceLevel(3);
    }
  });

  // Timer countdown
  useEffect(() => {
    if (session?.timeRemaining && session.status === 'active') {
      setTimeLeft(session.timeRemaining);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session]);

  if (!match || !sessionId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Assessment Session Not Found</h1>
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
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">Session Loading...</h1>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentQuestion];
  
  if (!currentQuestion) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">Question not found...</h1>
        </div>
      </div>
    );
  }
  const progress = ((session.currentQuestion + 1) / session.totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return "text-green-600";
    if (level <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return "Foundation";
    if (level <= 6) return "Intermediate";
    if (level <= 8) return "Advanced";
    return "Expert";
  };

  const handleSubmitAnswer = () => {
    const questionStartTime = Date.now() - (session.timeRemaining - timeLeft) * 1000;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      answer: currentAnswer,
      confidenceLevel,
      timeSpent,
      hintsUsed: showHint ? 1 : 0
    });
  };

  if (session.status === 'completed') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <CheckCircle className="h-8 w-8 text-green-600" />
              Assessment Completed!
            </CardTitle>
            <CardDescription>
              Your adaptive assessment has been completed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Results Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Performance Summary</h3>
                {Object.entries(session.competencyScores).map(([competency, score]) => (
                  <div key={competency} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{competency}</span>
                      <span>{Math.round(score as number)}%</span>
                    </div>
                    <Progress value={score as number} className="h-2" />
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Assessment Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Questions Answered:</span>
                    <span>{session.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Final Adaptive Level:</span>
                    <Badge variant="outline">{getDifficultyLabel(session.adaptiveLevel)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Taken:</span>
                    <span>{formatTime(session.timeRemaining)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Link to={`/perform/assessment-report/${sessionId}`}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Detailed Report
                </Button>
              </Link>
              <Link to="/perform">
                <Button variant="outline">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
          <p className="text-gray-600">Adaptive Assessment - Question {session.currentQuestion + 1} of {session.totalQuestions}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <Badge variant="outline" className={getDifficultyColor(session.adaptiveLevel)}>
            <Brain className="h-3 w-3 mr-1" />
            {getDifficultyLabel(session.adaptiveLevel)}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Assessment Progress</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Current Question */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Question {session.currentQuestion + 1}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{currentQuestion.competencyArea}</Badge>
              <Badge variant="secondary">{currentQuestion.therapeuticArea}</Badge>
              <Badge variant="outline" className={getDifficultyColor(currentQuestion.difficulty)}>
                Level {currentQuestion.difficulty}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed">{currentQuestion.questionText}</p>
          </div>

          {/* Answer Input */}
          <div className="space-y-4">
            {currentQuestion.questionType === 'multiple_choice' && currentQuestion.options ? (
              <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="answer">Your Answer</Label>
                <Textarea
                  id="answer"
                  placeholder="Provide your detailed response..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            )}

            {/* Confidence Level */}
            <div className="space-y-3">
              <Label>Confidence Level</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Low</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setConfidenceLevel(level)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        confidenceLevel >= level 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">High</span>
              </div>
            </div>
          </div>

          {/* Hints Section */}
          {currentQuestion.hints && currentQuestion.hints.length > 0 && (
            <div className="border-t pt-4">
              {!showHint ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Show Hint
                </Button>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">Hint</h4>
                      <p className="text-sm text-yellow-700">{currentQuestion.hints[0]}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline"
              disabled={session.currentQuestion === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline">
                Save Progress
              </Button>
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || submitAnswerMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitAnswerMutation.isPending ? "Submitting..." : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Performance Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Real-time Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(session.competencyScores).map(([competency, score]) => (
              <div key={competency} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{Math.round(score as number)}%</div>
                <div className="text-sm text-gray-600">{competency}</div>
                <div className="mt-1">
                  <Progress value={score as number} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}