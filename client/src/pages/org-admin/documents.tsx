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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  useOrganizationDocuments,
  useUploadDocument,
  useDeleteDocument,
} from "@/hooks/use-org-admin-data";
import { OrgAdminNav } from "@/components/org-admin/OrgAdminNav";
import {
  FileUp,
  Upload,
  Search,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  ArrowLeft,
  File,
  FileText,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

const PROFESSIONAL_ACTIVITIES = [
  { value: "PA1", label: "PA1 - Pharmaceutical Care" },
  { value: "PA2", label: "PA2 - Medicines Information" },
  { value: "PA3", label: "PA3 - Medicines Management" },
  { value: "PA4", label: "PA4 - Professional Practice" },
];

const DOCUMENT_CATEGORIES = [
  { value: "guidelines", label: "Guidelines" },
  { value: "protocols", label: "Protocols" },
  { value: "forms", label: "Forms" },
  { value: "training_materials", label: "Training Materials" },
];

export default function OrgAdminDocuments() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [selectedTherapeuticAreas, setSelectedTherapeuticAreas] = useState<string[]>([]);
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState<string[]>([]);
  const [selectedProfessionalActivities, setSelectedProfessionalActivities] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Document details modal
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentDetailsOpen, setDocumentDetailsOpen] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);

  // Fetch documents with filters
  const { data: documentsData, isLoading } = useOrganizationDocuments({
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    search: search || undefined,
  });

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  // Redirect if not org admin
  if (user?.role !== 'org_admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access document management.
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

  const documents = documentsData?.documents || [];

  // File handling
  const handleFileSelect = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, DOCX, XLSX, or PPTX files only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, "")); // Set default title from filename
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !uploadTitle.trim() || !uploadCategory) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide a file, title, and category.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      formData.append('category', uploadCategory);
      formData.append('therapeuticAreas', JSON.stringify(selectedTherapeuticAreas));
      formData.append('practiceAreas', JSON.stringify(selectedPracticeAreas));
      formData.append('professionalActivities', JSON.stringify(selectedProfessionalActivities));

      await uploadMutation.mutateAsync(formData);

      toast({
        title: "Document Uploaded",
        description: `${uploadTitle} has been uploaded successfully.`,
      });

      // Reset form
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setUploadCategory("");
      setSelectedTherapeuticAreas([]);
      setSelectedPracticeAreas([]);
      setSelectedProfessionalActivities([]);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      await deleteMutation.mutateAsync({ documentId: documentToDelete.id });
      toast({
        title: "Document Deleted",
        description: `${documentToDelete.title} has been deleted.`,
      });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <File className="h-4 w-4 text-red-600" />;
    if (fileType.includes('word')) return <FileText className="h-4 w-4 text-blue-600" />;
    if (fileType.includes('sheet')) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    if (fileType.includes('presentation')) return <Presentation className="h-4 w-4 text-orange-600" />;
    return <File className="h-4 w-4 text-gray-600" />;
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      guidelines: "bg-blue-100 text-blue-800",
      protocols: "bg-purple-100 text-purple-800",
      forms: "bg-green-100 text-green-800",
      training_materials: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge variant="outline" className={colors[category] || "bg-gray-100 text-gray-800"}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
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
            <h2 className="text-3xl font-bold text-gray-900">Document Manager</h2>
            <p className="text-gray-600 mt-1">
              Upload and manage knowledge base documents for simulations
            </p>
          </div>
          <Button onClick={() => setUploadModalOpen(true)}>
            <FileUp className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No documents found</p>
                <Button onClick={() => setUploadModalOpen(true)}>
                  <FileUp className="w-4 h-4 mr-2" />
                  Upload First Document
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>File Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc: any) => (
                      <TableRow
                        key={doc.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setDocumentDetailsOpen(true);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getFileIcon(doc.fileType)}
                            <span className="font-medium">{doc.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {doc.fileType?.split('/').pop()?.toUpperCase() || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatFileSize(doc.fileSize || 0)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {doc.uploadedBy || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {doc.uploadedAt
                            ? formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })
                            : 'Unknown'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDocument(doc);
                                  setDocumentDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (doc.fileUrl) {
                                    window.open(doc.fileUrl, '_blank');
                                  }
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDocumentToDelete(doc);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Upload Document Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to the knowledge base for simulations. Supported formats: PDF, DOCX, XLSX, PPTX (max 10MB)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    {getFileIcon(selectedFile.type)}
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-700 mb-1">
                      Drag and drop your file here, or
                    </p>
                    <label className="inline-block">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.xlsx,.pptx"
                        onChange={handleFileInputChange}
                      />
                      <Button type="button" variant="outline" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, XLSX, or PPTX (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="upload-title">Title *</Label>
              <Input
                id="upload-title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="upload-description">Description</Label>
              <Textarea
                id="upload-description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Enter document description (optional)"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="upload-category">Category *</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger id="upload-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Therapeutic Areas */}
            <div>
              <Label>Therapeutic Areas</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {THERAPEUTIC_AREAS.map((area) => (
                  <label
                    key={area.value}
                    className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTherapeuticAreas.includes(area.value)}
                      onChange={() =>
                        toggleArrayItem(
                          selectedTherapeuticAreas,
                          setSelectedTherapeuticAreas,
                          area.value
                        )
                      }
                      className="rounded"
                    />
                    <span className="text-sm">{area.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Practice Areas */}
            <div>
              <Label>Practice Areas</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PRACTICE_AREAS.map((area) => (
                  <label
                    key={area.value}
                    className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPracticeAreas.includes(area.value)}
                      onChange={() =>
                        toggleArrayItem(
                          selectedPracticeAreas,
                          setSelectedPracticeAreas,
                          area.value
                        )
                      }
                      className="rounded"
                    />
                    <span className="text-sm">{area.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Professional Activities */}
            <div>
              <Label>Professional Activities</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PROFESSIONAL_ACTIVITIES.map((activity) => (
                  <label
                    key={activity.value}
                    className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProfessionalActivities.includes(activity.value)}
                      onChange={() =>
                        toggleArrayItem(
                          selectedProfessionalActivities,
                          setSelectedProfessionalActivities,
                          activity.value
                        )
                      }
                      className="rounded"
                    />
                    <span className="text-sm">{activity.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={!selectedFile || !uploadTitle.trim() || !uploadCategory || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Details Modal */}
      <Dialog open={documentDetailsOpen} onOpenChange={setDocumentDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedDocument.fileType)}
                <div>
                  <h3 className="font-semibold text-lg">{selectedDocument.title}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedDocument.fileType?.split('/').pop()?.toUpperCase()} •{' '}
                    {formatFileSize(selectedDocument.fileSize || 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Category</p>
                  <p className="font-medium mt-1">{getCategoryBadge(selectedDocument.category)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Uploaded By</p>
                  <p className="font-medium mt-1">{selectedDocument.uploadedBy || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Upload Date</p>
                  <p className="font-medium mt-1">
                    {selectedDocument.uploadedAt
                      ? new Date(selectedDocument.uploadedAt).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Downloads</p>
                  <p className="font-medium mt-1">{selectedDocument.downloadCount || 0}</p>
                </div>
              </div>

              {selectedDocument.description && (
                <div>
                  <p className="text-gray-600 text-sm mb-1">Description</p>
                  <p className="text-sm">{selectedDocument.description}</p>
                </div>
              )}

              {selectedDocument.therapeuticAreas && selectedDocument.therapeuticAreas.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">Therapeutic Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.therapeuticAreas.map((area: string) => (
                      <Badge key={area} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedDocument.practiceAreas && selectedDocument.practiceAreas.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">Practice Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.practiceAreas.map((area: string) => (
                      <Badge key={area} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedDocument.professionalActivities && selectedDocument.professionalActivities.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">Professional Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.professionalActivities.map((activity: string) => (
                      <Badge key={activity} variant="outline">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentDetailsOpen(false)}>
              Close
            </Button>
            {selectedDocument?.fileUrl && (
              <Button onClick={() => window.open(selectedDocument.fileUrl, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
