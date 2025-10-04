import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  useOrganizationScenarios,
  useCreateScenario,
  useUpdateScenario,
  useDeleteScenario,
} from "@/hooks/use-org-admin-data";
import { OrgAdminNav } from "@/components/org-admin/OrgAdminNav";
import {
  FlaskConical,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  BookOpen,
  Activity,
  Award,
} from "lucide-react";

const MODULES = [
  { value: "prepare", label: "Prepare", icon: BookOpen, color: "bg-blue-100 text-blue-800" },
  { value: "practice", label: "Practice", icon: Activity, color: "bg-green-100 text-green-800" },
  { value: "perform", label: "Perform", icon: Award, color: "bg-purple-100 text-purple-800" },
];

const THERAPEUTIC_AREAS = [
  { value: "cardiovascular", label: "Cardiovascular" },
  { value: "gastrointestinal", label: "Gastrointestinal" },
  { value: "renal", label: "Renal" },
  { value: "endocrine", label: "Endocrine" },
  { value: "respiratory", label: "Respiratory" },
  { value: "dermatological", label: "Dermatological" },
  { value: "neurological", label: "Neurological" },
];

const PRACTICE_AREAS = [
  { value: "hospital", label: "Hospital" },
  { value: "community", label: "Community" },
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function OrgAdminScenarios() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Filters state
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>("all");

  // Create/Edit modal state
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [scenarioModule, setScenarioModule] = useState("");
  const [scenarioTherapeuticArea, setScenarioTherapeuticArea] = useState("");
  const [scenarioPracticeArea, setScenarioPracticeArea] = useState("");
  const [scenarioDifficulty, setScenarioDifficulty] = useState("");
  const [scenarioContent, setScenarioContent] = useState("");

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<any>(null);

  // Fetch scenarios with filters
  const { data: scenariosData, isLoading } = useOrganizationScenarios({
    module: moduleFilter !== "all" ? moduleFilter : undefined,
    search: search || undefined,
  });

  const createMutation = useCreateScenario();
  const updateMutation = useUpdateScenario();
  const deleteMutation = useDeleteScenario();

  // Redirect if not org admin
  if (user?.role !== 'org_admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access scenario management.
            </p>
            <Button onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scenarios = scenariosData?.scenarios || [];

  // Filter scenarios by therapeutic area (client-side filtering)
  const filteredScenarios = therapeuticAreaFilter === "all"
    ? scenarios
    : scenarios.filter((s: any) => s.therapeuticArea === therapeuticAreaFilter);

  const openCreateModal = () => {
    setEditingScenario(null);
    setScenarioTitle("");
    setScenarioDescription("");
    setScenarioModule("");
    setScenarioTherapeuticArea("");
    setScenarioPracticeArea("");
    setScenarioDifficulty("");
    setScenarioContent("");
    setScenarioModalOpen(true);
  };

  const openEditModal = (scenario: any) => {
    setEditingScenario(scenario);
    setScenarioTitle(scenario.title || "");
    setScenarioDescription(scenario.description || "");
    setScenarioModule(scenario.module || "");
    setScenarioTherapeuticArea(scenario.therapeuticArea || "");
    setScenarioPracticeArea(scenario.practiceArea || "");
    setScenarioDifficulty(scenario.difficulty || "");
    setScenarioContent(scenario.content || "");
    setScenarioModalOpen(true);
  };

  const handleScenarioSubmit = async () => {
    if (!scenarioTitle.trim() || !scenarioModule || !scenarioTherapeuticArea) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide title, module, and therapeutic area.",
        variant: "destructive",
      });
      return;
    }

    try {
      const scenarioData = {
        title: scenarioTitle,
        description: scenarioDescription,
        module: scenarioModule,
        therapeuticArea: scenarioTherapeuticArea,
        practiceArea: scenarioPracticeArea,
        difficulty: scenarioDifficulty,
        content: scenarioContent,
      };

      if (editingScenario) {
        await updateMutation.mutateAsync({
          scenarioId: editingScenario.id,
          data: scenarioData,
        });
        toast({
          title: "Scenario Updated",
          description: `${scenarioTitle} has been updated successfully.`,
        });
      } else {
        await createMutation.mutateAsync(scenarioData);
        toast({
          title: "Scenario Created",
          description: `${scenarioTitle} has been created successfully.`,
        });
      }

      setScenarioModalOpen(false);
    } catch (error: any) {
      toast({
        title: editingScenario ? "Update Failed" : "Creation Failed",
        description: error.message || "Failed to save scenario.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScenario = async () => {
    if (!scenarioToDelete) return;

    try {
      await deleteMutation.mutateAsync({ scenarioId: scenarioToDelete.id });
      toast({
        title: "Scenario Deleted",
        description: `${scenarioToDelete.title} has been deleted.`,
      });
      setDeleteDialogOpen(false);
      setScenarioToDelete(null);
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete scenario.",
        variant: "destructive",
      });
    }
  };

  const getModuleInfo = (module: string) => {
    return MODULES.find(m => m.value === module) || MODULES[0];
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    };
    return (
      <Badge variant="outline" className={colors[difficulty] || "bg-gray-100 text-gray-800"}>
        {difficulty}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">P³ Pharmacy Academy</h1>
              <span className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                Organization Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName || 'Admin'} {user?.lastName || ''}
              </span>
              <button
                onClick={async () => {
                  const { logout } = await import('@/lib/auth-logout');
                  await logout();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-navigation */}
      <OrgAdminNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Scenario Manager</h2>
            <p className="text-gray-600 mt-1">
              Create and manage clinical scenarios for all modules
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Scenario
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search scenarios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {MODULES.map((module) => (
                    <SelectItem key={module.value} value={module.value}>
                      {module.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={therapeuticAreaFilter} onValueChange={setTherapeuticAreaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Therapeutic Areas</SelectItem>
                  {THERAPEUTIC_AREAS.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Scenarios Grid */}
        <div>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading scenarios...
            </div>
          ) : filteredScenarios.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No scenarios found</p>
                <Button onClick={openCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Scenario
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((scenario: any) => {
                const moduleInfo = getModuleInfo(scenario.module);
                const ModuleIcon = moduleInfo.icon;

                return (
                  <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${moduleInfo.color}`}>
                            <ModuleIcon className="h-4 w-4" />
                          </div>
                          <Badge variant="outline" className={moduleInfo.color}>
                            {moduleInfo.label}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(scenario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setScenarioToDelete(scenario);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{scenario.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {scenario.description || "No description available"}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Therapeutic Area</span>
                          <Badge variant="outline">
                            {THERAPEUTIC_AREAS.find(a => a.value === scenario.therapeuticArea)?.label || scenario.therapeuticArea}
                          </Badge>
                        </div>
                        {scenario.practiceArea && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Practice Area</span>
                            <Badge variant="outline">
                              {PRACTICE_AREAS.find(a => a.value === scenario.practiceArea)?.label || scenario.practiceArea}
                            </Badge>
                          </div>
                        )}
                        {scenario.difficulty && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Difficulty</span>
                            {getDifficultyBadge(scenario.difficulty)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Scenario Modal */}
      <Dialog open={scenarioModalOpen} onOpenChange={setScenarioModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingScenario ? "Edit Scenario" : "Create New Scenario"}
            </DialogTitle>
            <DialogDescription>
              {editingScenario
                ? "Update the scenario details below."
                : "Create a new clinical scenario for your organization."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="scenario-title">Title *</Label>
              <Input
                id="scenario-title"
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                placeholder="Enter scenario title"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="scenario-description">Description</Label>
              <Textarea
                id="scenario-description"
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                placeholder="Enter scenario description"
                rows={3}
              />
            </div>

            {/* Module */}
            <div>
              <Label htmlFor="scenario-module">Module *</Label>
              <Select value={scenarioModule} onValueChange={setScenarioModule}>
                <SelectTrigger id="scenario-module">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {MODULES.map((module) => (
                    <SelectItem key={module.value} value={module.value}>
                      {module.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Therapeutic Area */}
            <div>
              <Label htmlFor="scenario-therapeutic-area">Therapeutic Area *</Label>
              <Select value={scenarioTherapeuticArea} onValueChange={setScenarioTherapeuticArea}>
                <SelectTrigger id="scenario-therapeutic-area">
                  <SelectValue placeholder="Select therapeutic area" />
                </SelectTrigger>
                <SelectContent>
                  {THERAPEUTIC_AREAS.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Practice Area */}
            <div>
              <Label htmlFor="scenario-practice-area">Practice Area</Label>
              <Select value={scenarioPracticeArea} onValueChange={setScenarioPracticeArea}>
                <SelectTrigger id="scenario-practice-area">
                  <SelectValue placeholder="Select practice area (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {PRACTICE_AREAS.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div>
              <Label htmlFor="scenario-difficulty">Difficulty Level</Label>
              <Select value={scenarioDifficulty} onValueChange={setScenarioDifficulty}>
                <SelectTrigger id="scenario-difficulty">
                  <SelectValue placeholder="Select difficulty (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="scenario-content">Scenario Content</Label>
              <Textarea
                id="scenario-content"
                value={scenarioContent}
                onChange={(e) => setScenarioContent(e.target.value)}
                placeholder="Enter the scenario content, patient case, or instructions..."
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScenarioModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScenarioSubmit}
              disabled={
                !scenarioTitle.trim() ||
                !scenarioModule ||
                !scenarioTherapeuticArea ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingScenario
                ? "Update Scenario"
                : "Create Scenario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scenarioToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteScenario}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Scenario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
