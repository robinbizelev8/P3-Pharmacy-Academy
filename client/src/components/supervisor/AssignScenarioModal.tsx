import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import type { TraineeAssignmentWithDetails } from "@shared/schema";

interface AssignScenarioModalProps {
  trainee: TraineeAssignmentWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onAssignSuccess?: () => void;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  module: string;
  therapeuticArea: string;
  difficulty: string;
  estimatedDuration: string;
  competencies: string[];
}

export function AssignScenarioModal({ trainee, isOpen, onClose, onAssignSuccess }: AssignScenarioModalProps) {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    scenarioId: '',
    dueDate: '',
    priorityLevel: 'medium',
    assignmentInstructions: '',
    learningObjectives: '',
    assessmentCriteria: '',
    completionRequired: true,
  });

  const traineeName = `${trainee?.trainee?.firstName || ''} ${trainee?.trainee?.lastName || ''}`.trim() || 'Unknown Trainee';

  // Fetch available scenarios
  useEffect(() => {
    if (isOpen) {
      fetchScenarios();
    }
  }, [isOpen]);

  const fetchScenarios = async () => {
    try {
      setIsLoadingScenarios(true);
      const response = await fetch('/api/pharmacy/scenarios', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch scenarios');
      }
      
      const data = await response.json();
      setScenarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      setScenarios([]);
    } finally {
      setIsLoadingScenarios(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.scenarioId) errors.push('Please select a scenario');
    if (!formData.dueDate) errors.push('Due date is required');
    if (!formData.learningObjectives.trim()) errors.push('Learning objectives are required');
    
    // Check that due date is in the future
    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      errors.push('Due date must be in the future');
    }
    
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
      const response = await fetch('/api/supervisor/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          scenarioId: formData.scenarioId,
          targetTraineeId: trainee.traineeId,
          assignmentInstructions: formData.assignmentInstructions,
          dueDate: formData.dueDate,
          priorityLevel: formData.priorityLevel,
          learningObjectives: formData.learningObjectives.split(',').map(s => s.trim()),
          assessmentCriteria: formData.assessmentCriteria,
          completionRequired: formData.completionRequired,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign scenario');
      }

      // Success - close modal and trigger refresh
      onAssignSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        scenarioId: '',
        dueDate: '',
        priorityLevel: 'medium',
        assignmentInstructions: '',
        learningObjectives: '',
        assessmentCriteria: '',
        completionRequired: true,
      });

    } catch (error) {
      console.error('Error assigning scenario:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to assign scenario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedScenario = scenarios.find(s => s.id === formData.scenarioId);
  
  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' },
  ];

  // Set minimum date to tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Target className="w-6 h-6 mr-3 text-purple-600" />
            Assign Scenario to {traineeName}
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

          {/* Scenario Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scenarioId">Select Scenario *</Label>
              {isLoadingScenarios ? (
                <div className="flex items-center p-4 border rounded-md">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                  <span>Loading scenarios...</span>
                </div>
              ) : (
                <Select 
                  value={formData.scenarioId} 
                  onValueChange={(value) => handleInputChange('scenarioId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a scenario to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map(scenario => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{scenario.title}</span>
                          <span className="text-xs text-gray-500">
                            {scenario.module} • {scenario.therapeuticArea} • {scenario.difficulty}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Selected Scenario Details */}
            {selectedScenario && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                    Scenario Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{selectedScenario.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedScenario.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{selectedScenario.module}</Badge>
                    <Badge variant="outline">{selectedScenario.therapeuticArea}</Badge>
                    <Badge variant="outline">{selectedScenario.difficulty} difficulty</Badge>
                    {selectedScenario.estimatedDuration && (
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {selectedScenario.estimatedDuration}
                      </Badge>
                    )}
                  </div>
                  {selectedScenario.competencies && selectedScenario.competencies.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Competencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedScenario.competencies.map((comp, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Assignment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                Due Date *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                min={minDateString}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorityLevel" className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Priority Level
              </Label>
              <Select 
                value={formData.priorityLevel} 
                onValueChange={(value) => handleInputChange('priorityLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-2">
            <Label htmlFor="learningObjectives">Learning Objectives *</Label>
            <Textarea
              id="learningObjectives"
              placeholder="Enter specific learning objectives for this assignment (comma-separated)&#10;e.g., Demonstrate drug interaction analysis, Apply clinical reasoning to patient case, Improve medication counseling skills..."
              value={formData.learningObjectives}
              onChange={(e) => handleInputChange('learningObjectives', e.target.value)}
              rows={3}
            />
          </div>

          {/* Assignment Instructions */}
          <div className="space-y-2">
            <Label htmlFor="assignmentInstructions">Special Instructions</Label>
            <Textarea
              id="assignmentInstructions"
              placeholder="Provide any specific instructions or guidance for completing this scenario..."
              value={formData.assignmentInstructions}
              onChange={(e) => handleInputChange('assignmentInstructions', e.target.value)}
              rows={3}
            />
          </div>

          {/* Assessment Criteria */}
          <div className="space-y-2">
            <Label htmlFor="assessmentCriteria">Assessment Criteria</Label>
            <Textarea
              id="assessmentCriteria"
              placeholder="Define how the trainee's performance will be evaluated..."
              value={formData.assessmentCriteria}
              onChange={(e) => handleInputChange('assessmentCriteria', e.target.value)}
              rows={2}
            />
          </div>

          {/* Completion Required */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completionRequired"
              checked={formData.completionRequired}
              onCheckedChange={(checked) => handleInputChange('completionRequired', !!checked)}
            />
            <Label htmlFor="completionRequired" className="flex items-center cursor-pointer">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Completion Required
            </Label>
          </div>

          {/* Error Display */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingScenarios}>
              {isSubmitting ? 'Assigning...' : 'Assign Scenario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}