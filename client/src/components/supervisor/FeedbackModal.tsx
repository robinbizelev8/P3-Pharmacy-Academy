import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { TraineeAssignmentWithDetails } from "@shared/schema";

interface FeedbackModalProps {
  trainee: TraineeAssignmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export function FeedbackModal({ trainee, isOpen, onClose, onSubmitSuccess }: FeedbackModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    feedbackType: 'general_review',
    overallRating: '',
    clinicalKnowledgeRating: '',
    communicationRating: '',
    professionalismRating: '',
    writtenFeedback: '',
    strengths: '',
    improvementAreas: '',
    recommendations: '',
    actionItems: '',
    nextReviewDate: '',
  });

  const traineeName = `${trainee?.trainee?.firstName || ''} ${trainee?.trainee?.lastName || ''}`.trim() || 'Unknown Trainee';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.overallRating) errors.push('Overall rating is required');
    if (!formData.clinicalKnowledgeRating) errors.push('Clinical knowledge rating is required');
    if (!formData.communicationRating) errors.push('Communication rating is required');
    if (!formData.professionalismRating) errors.push('Professionalism rating is required');
    if (!formData.writtenFeedback.trim()) errors.push('Written feedback is required');
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setSubmitError(errors.join(', '));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/supervisor/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          traineeId: trainee.traineeId,
          feedbackType: formData.feedbackType,
          overallRating: parseFloat(formData.overallRating),
          clinicalKnowledgeRating: parseFloat(formData.clinicalKnowledgeRating),
          communicationRating: parseFloat(formData.communicationRating),
          professionalismRating: parseFloat(formData.professionalismRating),
          writtenFeedback: formData.writtenFeedback,
          strengths: formData.strengths ? formData.strengths.split(',').map(s => s.trim()) : [],
          improvementAreas: formData.improvementAreas ? formData.improvementAreas.split(',').map(s => s.trim()) : [],
          recommendations: formData.recommendations,
          actionItems: formData.actionItems ? formData.actionItems.split(',').map(s => s.trim()) : [],
          nextReviewDate: formData.nextReviewDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      // Success - close modal and trigger refresh
      onSubmitSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        feedbackType: 'general_review',
        overallRating: '',
        clinicalKnowledgeRating: '',
        communicationRating: '',
        professionalismRating: '',
        writtenFeedback: '',
        strengths: '',
        improvementAreas: '',
        recommendations: '',
        actionItems: '',
        nextReviewDate: '',
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingOptions = [
    { value: '1', label: '1 - Needs Significant Improvement' },
    { value: '2', label: '2 - Below Expectations' },
    { value: '3', label: '3 - Meets Expectations' },
    { value: '4', label: '4 - Above Expectations' },
    { value: '5', label: '5 - Excellent' },
  ];

  const feedbackTypeOptions = [
    { value: 'general_review', label: 'General Review' },
    { value: 'session_review', label: 'Session Review' },
    { value: 'competency_assessment', label: 'Competency Assessment' },
    { value: 'progress_check', label: 'Progress Check' },
    { value: 'final_evaluation', label: 'Final Evaluation' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
            Provide Feedback for {traineeName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trainee Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{traineeName}</h3>
                  <p className="text-sm text-gray-600">{trainee?.trainee?.email}</p>
                  {trainee?.trainee?.institution && (
                    <p className="text-sm text-gray-600">{trainee.trainee.institution}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    Assigned: {new Date(trainee?.assignedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Type */}
          <div className="space-y-2">
            <Label htmlFor="feedbackType">Feedback Type</Label>
            <Select 
              value={formData.feedbackType} 
              onValueChange={(value) => handleInputChange('feedbackType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Rating Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="space-y-3">
              <Label className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Overall Performance *
              </Label>
              <Select 
                value={formData.overallRating} 
                onValueChange={(value) => handleInputChange('overallRating', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clinical Knowledge */}
            <div className="space-y-3">
              <Label className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                Clinical Knowledge *
              </Label>
              <Select 
                value={formData.clinicalKnowledgeRating} 
                onValueChange={(value) => handleInputChange('clinicalKnowledgeRating', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Communication */}
            <div className="space-y-3">
              <Label className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                Communication Skills *
              </Label>
              <Select 
                value={formData.communicationRating} 
                onValueChange={(value) => handleInputChange('communicationRating', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Professionalism */}
            <div className="space-y-3">
              <Label className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
                Professionalism *
              </Label>
              <Select 
                value={formData.professionalismRating} 
                onValueChange={(value) => handleInputChange('professionalismRating', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Written Feedback */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="writtenFeedback">Overall Feedback *</Label>
              <Textarea
                id="writtenFeedback"
                placeholder="Provide detailed feedback on the trainee's performance, including specific examples and observations..."
                value={formData.writtenFeedback}
                onChange={(e) => handleInputChange('writtenFeedback', e.target.value)}
                rows={4}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strengths">Strengths (comma-separated)</Label>
                <Textarea
                  id="strengths"
                  placeholder="e.g., Strong clinical reasoning, Good patient communication, Attention to detail..."
                  value={formData.strengths}
                  onChange={(e) => handleInputChange('strengths', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvementAreas">Areas for Improvement (comma-separated)</Label>
                <Textarea
                  id="improvementAreas"
                  placeholder="e.g., Drug interaction knowledge, Time management, Documentation skills..."
                  value={formData.improvementAreas}
                  onChange={(e) => handleInputChange('improvementAreas', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                placeholder="Specific recommendations for continued learning and development..."
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionItems">Action Items (comma-separated)</Label>
              <Textarea
                id="actionItems"
                placeholder="e.g., Review cardiovascular medications, Practice patient counseling, Complete additional scenarios..."
                value={formData.actionItems}
                onChange={(e) => handleInputChange('actionItems', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextReviewDate" className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                Next Review Date
              </Label>
              <Input
                id="nextReviewDate"
                type="date"
                value={formData.nextReviewDate}
                onChange={(e) => handleInputChange('nextReviewDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Error Display */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}