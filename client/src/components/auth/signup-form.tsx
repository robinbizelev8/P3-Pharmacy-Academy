import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, CheckCircle } from "lucide-react";
import { GoogleAuthButton } from "./google-auth-button";
import { USER_ROLES, THERAPEUTIC_AREAS } from "@shared/schema";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['student', 'supervisor', 'admin']).default('student'),
  institution: z.string().optional(),
  licenseNumber: z.string().optional(),
  specializations: z.array(z.string()).default([]),
  yearsExperience: z.number().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  isLoading?: boolean;
}

export function SignupForm({ onSuccess, onSwitchToLogin, isLoading = false }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('student');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'student',
      specializations: [],
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          yearsExperience: data.yearsExperience ? Number(data.yearsExperience) : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Registration successful
      setSuccess('Account created successfully! Please check your email for verification instructions.');
      onSuccess?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/google';
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setValue('role', role as 'student' | 'supervisor' | 'admin');
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];
    
    return {
      strength,
      label: labels[Math.min(strength - 1, 4)] || '',
      color: colors[Math.min(strength - 1, 4)] || ''
    };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="text-gray-600 mt-2">Join the P³ Pharmacy Academy community</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <GoogleAuthButton 
        onClick={handleGoogleSignup}
        disabled={isLoading || isSubmitting}
        variant="signup"
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or create account with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                placeholder="First name"
                className="pl-10"
                {...register("firstName")}
                disabled={isLoading || isSubmitting}
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="lastName"
                placeholder="Last name"
                className="pl-10"
                {...register("lastName")}
                disabled={isLoading || isSubmitting}
              />
            </div>
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              {...register("email")}
              disabled={isLoading || isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Account Type</Label>
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(USER_ROLES).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {(selectedRole === 'supervisor' || selectedRole === 'admin') && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              Additional Information Required for {USER_ROLES[selectedRole as keyof typeof USER_ROLES]}
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="institution">Institution/Pharmacy</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="institution"
                  placeholder="Your institution or pharmacy name"
                  className="pl-10"
                  {...register("institution")}
                  disabled={isLoading || isSubmitting}
                />
              </div>
            </div>

            {selectedRole === 'supervisor' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Pharmacy License Number</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="Your pharmacy license number"
                    {...register("licenseNumber")}
                    disabled={isLoading || isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Years of pharmacy experience"
                    {...register("yearsExperience", { valueAsNumber: true })}
                    disabled={isLoading || isSubmitting}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="pl-10 pr-10"
              {...register("password")}
              disabled={isLoading || isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
              disabled={isLoading || isSubmitting}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {password && (
            <div className="space-y-1">
              <div className={`text-xs ${passwordStrength.color}`}>
                Password strength: {passwordStrength.label}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    passwordStrength.strength <= 2 ? 'bg-red-500' :
                    passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                    passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="pl-10 pr-10"
              {...register("confirmPassword")}
              disabled={isLoading || isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
              disabled={isLoading || isSubmitting}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-500 font-medium"
            disabled={isLoading || isSubmitting}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}