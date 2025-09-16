import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAllTrainees, useAssignTrainee, useUnassignTrainee } from "@/hooks/use-supervisor-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Search,
  UserPlus,
  UserMinus,
  Building2,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface TraineeWithStatus {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  institution?: string;
  assignmentStatus: {
    supervisorId: string;
    assignedAt: string;
    institution: string;
    isAssignedToMe: boolean;
  } | null;
}

interface ManageTraineesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentChange?: () => void;
}

export function ManageTraineesModal({ isOpen, onClose, onAssignmentChange }: ManageTraineesModalProps) {
  const { user } = useAuth();
  
  // Use the hooks - only fetch when modal is open
  const { data: trainees = [], isLoading, error: queryError, refetch } = useAllTrainees(user?.id, isOpen);
  const assignTraineeMutation = useAssignTrainee();
  const unassignTraineeMutation = useUnassignTrainee();
  
  const [filteredTrainees, setFilteredTrainees] = useState<TraineeWithStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'assign' | 'unassign';
    trainee: TraineeWithStatus | null;
  }>({ isOpen: false, type: 'assign', trainee: null });

  // Filter trainees based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTrainees(trainees);
    } else {
      const filtered = trainees.filter((trainee: TraineeWithStatus) => 
        `${trainee.firstName} ${trainee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.institution?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTrainees(filtered);
    }
  }, [searchTerm, trainees]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to fetch trainees');
    } else {
      setError(null);
    }
  }, [queryError]);

  const handleAssignTrainee = async (trainee: TraineeWithStatus) => {
    try {
      setError(null);

      await assignTraineeMutation.mutateAsync({
        traineeId: trainee.id,
        institution: trainee.institution
      });

      onAssignmentChange?.();
      setConfirmDialog({ isOpen: false, type: 'assign', trainee: null });

    } catch (error) {
      console.error('Error assigning trainee:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign trainee');
    }
  };

  const handleUnassignTrainee = async (trainee: TraineeWithStatus) => {
    try {
      setError(null);

      await unassignTraineeMutation.mutateAsync({
        traineeId: trainee.id
      });

      onAssignmentChange?.();
      setConfirmDialog({ isOpen: false, type: 'unassign', trainee: null });

    } catch (error) {
      console.error('Error unassigning trainee:', error);
      setError(error instanceof Error ? error.message : 'Failed to unassign trainee');
    }
  };

  const openConfirmDialog = (type: 'assign' | 'unassign', trainee: TraineeWithStatus) => {
    setConfirmDialog({ isOpen: true, type, trainee });
  };

  const myTrainees = filteredTrainees.filter(t => t.assignmentStatus?.isAssignedToMe);
  const availableTrainees = filteredTrainees.filter(t => !t.assignmentStatus);
  const assignedToOthers = filteredTrainees.filter(t => t.assignmentStatus && !t.assignmentStatus.isAssignedToMe);

  const getTraineeDisplayName = (trainee: TraineeWithStatus) => 
    `${trainee.firstName || ''} ${trainee.lastName || ''}`.trim() || 'Unknown Trainee';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Users className="w-6 h-6 mr-3 text-blue-600" />
              Manage Trainees
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Search Bar */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Trainees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading trainees...</span>
              </div>
            ) : (
              <Tabs defaultValue="available" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="available">
                    Available ({availableTrainees.length})
                  </TabsTrigger>
                  <TabsTrigger value="my-trainees">
                    My Trainees ({myTrainees.length})
                  </TabsTrigger>
                  <TabsTrigger value="assigned-others">
                    Assigned to Others ({assignedToOthers.length})
                  </TabsTrigger>
                </TabsList>

                {/* Available Trainees */}
                <TabsContent value="available" className="space-y-4">
                  {availableTrainees.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableTrainees.map((trainee) => (
                        <TraineeCard
                          key={trainee.id}
                          trainee={trainee}
                          actionType="assign"
                          onAction={() => openConfirmDialog('assign', trainee)}
                          isLoading={assignTraineeMutation.isPending && confirmDialog.trainee?.id === trainee.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No available trainees found</p>
                      <p className="text-sm text-gray-400">All trainees are currently assigned to supervisors</p>
                    </div>
                  )}
                </TabsContent>

                {/* My Trainees */}
                <TabsContent value="my-trainees" className="space-y-4">
                  {myTrainees.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myTrainees.map((trainee) => (
                        <TraineeCard
                          key={trainee.id}
                          trainee={trainee}
                          actionType="unassign"
                          onAction={() => openConfirmDialog('unassign', trainee)}
                          isLoading={unassignTraineeMutation.isPending && confirmDialog.trainee?.id === trainee.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No trainees assigned to you</p>
                      <p className="text-sm text-gray-400">Go to Available tab to assign trainees</p>
                    </div>
                  )}
                </TabsContent>

                {/* Assigned to Others */}
                <TabsContent value="assigned-others" className="space-y-4">
                  {assignedToOthers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignedToOthers.map((trainee) => (
                        <TraineeCard
                          key={trainee.id}
                          trainee={trainee}
                          actionType="view-only"
                          onAction={() => {}}
                          isLoading={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No trainees assigned to other supervisors</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => 
        !open && setConfirmDialog({ isOpen: false, type: 'assign', trainee: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'assign' ? 'Assign Trainee' : 'Unassign Trainee'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'assign' ? (
                <>
                  Are you sure you want to assign <strong>{confirmDialog.trainee ? getTraineeDisplayName(confirmDialog.trainee) : ''}</strong> to your supervision?
                  <br /><br />
                  You will be responsible for their training progress and providing feedback.
                </>
              ) : (
                <>
                  Are you sure you want to unassign <strong>{confirmDialog.trainee ? getTraineeDisplayName(confirmDialog.trainee) : ''}</strong> from your supervision?
                  <br /><br />
                  <span className="text-red-600 font-medium">Warning:</span> This will remove them from your supervision and they will need to be reassigned to continue their training.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={assignTraineeMutation.isPending || unassignTraineeMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.trainee) {
                  if (confirmDialog.type === 'assign') {
                    handleAssignTrainee(confirmDialog.trainee);
                  } else {
                    handleUnassignTrainee(confirmDialog.trainee);
                  }
                }
              }}
              disabled={assignTraineeMutation.isPending || unassignTraineeMutation.isPending}
              className={confirmDialog.type === 'unassign' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {(assignTraineeMutation.isPending || unassignTraineeMutation.isPending) ? 'Processing...' : confirmDialog.type === 'assign' ? 'Assign' : 'Unassign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Trainee Card Component
interface TraineeCardProps {
  trainee: TraineeWithStatus;
  actionType: 'assign' | 'unassign' | 'view-only';
  onAction: () => void;
  isLoading: boolean;
}

function TraineeCard({ trainee, actionType, onAction, isLoading }: TraineeCardProps) {
  const displayName = `${trainee.firstName || ''} ${trainee.lastName || ''}`.trim() || 'Unknown Trainee';
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{displayName}</h4>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-3 h-3 mr-1" />
                {trainee.email}
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          {trainee.assignmentStatus ? (
            <Badge 
              variant={trainee.assignmentStatus.isAssignedToMe ? "default" : "secondary"}
              className="text-xs"
            >
              {trainee.assignmentStatus.isAssignedToMe ? 'My Trainee' : 'Assigned'}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Available
            </Badge>
          )}
        </div>

        {/* Institution */}
        {trainee.institution && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Building2 className="w-3 h-3 mr-1" />
            {trainee.institution}
          </div>
        )}

        {/* Assignment Details */}
        {trainee.assignmentStatus && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar className="w-3 h-3 mr-1" />
            Assigned: {new Date(trainee.assignmentStatus.assignedAt).toLocaleDateString()}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-3">
          {actionType === 'assign' && (
            <Button
              size="sm"
              onClick={onAction}
              disabled={isLoading}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isLoading ? 'Assigning...' : 'Assign to Me'}
            </Button>
          )}
          
          {actionType === 'unassign' && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAction}
              disabled={isLoading}
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              {isLoading ? 'Unassigning...' : 'Unassign'}
            </Button>
          )}

          {actionType === 'view-only' && (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="w-full"
            >
              <Clock className="w-4 h-4 mr-2" />
              Assigned to Another
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}