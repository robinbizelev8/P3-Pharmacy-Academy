import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Building2, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  Stethoscope
} from "lucide-react";
import { THERAPEUTIC_AREAS } from "@shared/schema";

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  institution: z.string().optional(),
  licenseNumber: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
  specializations: z.array(z.string()).default([]),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      institution: user?.institution || "",
      licenseNumber: user?.licenseNumber || "",
      yearsExperience: user?.yearsExperience || undefined,
      specializations: user?.specializations || [],
    },
  });

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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  const onSubmit = async (data: ProfileUpdateData) => {
    try {
      setIsSubmitting(true);
      setMessage(null);

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          yearsExperience: data.yearsExperience ? Number(data.yearsExperience) : undefined,
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Profile update failed');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'An error occurred during profile update' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    // Reset form to original values
    setValue('firstName', user?.firstName || "");
    setValue('lastName', user?.lastName || "");
    setValue('institution', user?.institution || "");
    setValue('licenseNumber', user?.licenseNumber || "");
    setValue('yearsExperience', user?.yearsExperience || undefined);
    setValue('specializations', user?.specializations || []);
  };

  const toggleSpecialization = (area: string) => {
    const currentSpecs = watch('specializations') || [];
    if (currentSpecs.includes(area)) {
      setValue('specializations', currentSpecs.filter(s => s !== area));
    } else {
      setValue('specializations', [...currentSpecs, area]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <User className="w-8 h-8 mr-3 text-blue-600" />
                My Profile
              </h1>
              <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
            </div>
            
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            )}
          </div>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? 
              <CheckCircle className="h-4 w-4 text-green-600" /> : 
              <AlertCircle className="h-4 w-4 text-red-600" />
            }
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  
                  <div className="flex items-center justify-center mt-2 mb-4">
                    <Badge variant="outline" className="capitalize flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>{user?.role}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </div>
                    
                    {user?.institution && (
                      <div className="flex items-center justify-center space-x-2">
                        <Building2 className="w-4 h-4" />
                        <span>{user.institution}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(user?.createdAt || '').toLocaleDateString()}</span>
                    </div>

                    {user?.lastLoginAt && (
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Last login {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {user?.role === 'supervisor' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span className="font-medium">Supervisor Status</span>
                      </div>
                      <Badge variant={user.supervisorCertified ? "default" : "secondary"}>
                        {user.supervisorCertified ? "Certified" : "Pending Approval"}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Profile Information</span>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        size="sm"
                        disabled={isSubmitting}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Professional Information */}
                  {user?.role !== 'student' && (
                    <>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="institution">Institution</Label>
                            <Input
                              id="institution"
                              {...register("institution")}
                              placeholder="Hospital or pharmacy name"
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50" : ""}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="licenseNumber">License Number</Label>
                              <Input
                                id="licenseNumber"
                                {...register("licenseNumber")}
                                placeholder="Professional license number"
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="yearsExperience">Years of Experience</Label>
                              <Input
                                id="yearsExperience"
                                type="number"
                                min="0"
                                max="50"
                                {...register("yearsExperience", { valueAsNumber: true })}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-gray-50" : ""}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Specializations */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
                          Therapeutic Area Specializations
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Select your areas of expertise to be matched with appropriate trainees.
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(THERAPEUTIC_AREAS).map(([key, label]) => {
                            const isSelected = (watch('specializations') || []).includes(key);
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => isEditing && toggleSpecialization(key)}
                                disabled={!isEditing}
                                className={`p-3 text-sm rounded-xl border-2 transition-all duration-200 text-left ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
                              >
                                <span className="font-medium">{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Account Status */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Email Verified</p>
                          <p className="text-sm text-gray-600">Your email address verification status</p>
                        </div>
                        <Badge variant={user?.emailVerified ? "default" : "secondary"}>
                          {user?.emailVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Account Type</p>
                          <p className="text-sm text-gray-600">Your current user role</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {user?.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}