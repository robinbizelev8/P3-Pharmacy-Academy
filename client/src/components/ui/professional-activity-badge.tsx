import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Stethoscope,
  ShieldCheck, 
  GraduationCap,
  HelpCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

// Professional Activities definitions based on Singapore Pharmacy Council requirements
export const PROFESSIONAL_ACTIVITIES = {
  PA1: {
    title: "Clinical Care Planning",
    shortTitle: "Care Plans", 
    description: "Develop and implement a care plan",
    detailedDescription: "Develop comprehensive pharmaceutical care plans by assessing patient medication needs, identifying drug therapy problems, and creating evidence-based treatment recommendations in collaboration with healthcare teams.",
    examples: [
      "Medication therapy management",
      "Drug therapy problem identification", 
      "Clinical assessment and monitoring",
      "Collaborative care planning with doctors"
    ],
    icon: Stethoscope,
    color: "blue" as const
  },
  PA2: {
    title: "Medication Supply & Safety",
    shortTitle: "Supply & Safety",
    description: "Accurate supply of health products", 
    detailedDescription: "Ensure safe, accurate, and legal supply of medicines and health products through proper dispensing practices, inventory management, and quality assurance procedures.",
    examples: [
      "Prescription dispensing and verification",
      "Inventory management and storage",
      "Quality assurance procedures", 
      "Legal compliance and documentation"
    ],
    icon: ShieldCheck,
    color: "green" as const
  },
  PA3: {
    title: "Patient Education & Counseling", 
    shortTitle: "Patient Education",
    description: "Educate patients on appropriate use of health products",
    detailedDescription: "Provide comprehensive patient education and counseling on proper medication use, potential side effects, interactions, and adherence strategies to optimize therapeutic outcomes.",
    examples: [
      "Medication counseling sessions",
      "Patient education materials",
      "Adherence counseling and support",
      "Side effect management guidance"
    ],
    icon: GraduationCap,
    color: "purple" as const
  },
  PA4: {
    title: "Drug Information Services",
    shortTitle: "Drug Information", 
    description: "Respond to drug information or health product enquiry",
    detailedDescription: "Provide evidence-based drug information and clinical expertise to healthcare professionals, patients, and caregivers through comprehensive literature review and clinical knowledge application.",
    examples: [
      "Clinical literature reviews",
      "Drug interaction assessments",
      "Evidence-based recommendations",
      "Professional consultations"
    ],
    icon: FileText,
    color: "orange" as const
  }
} as const;

export type ProfessionalActivityCode = keyof typeof PROFESSIONAL_ACTIVITIES;

interface ProfessionalActivityBadgeProps {
  code: ProfessionalActivityCode;
  variant?: "default" | "secondary" | "outline" | "destructive";
  size?: "sm" | "default" | "lg";
  showDescription?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const colorVariants = {
  blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  green: "bg-green-100 text-green-800 hover:bg-green-200", 
  purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  orange: "bg-orange-100 text-orange-800 hover:bg-orange-200"
};

export function ProfessionalActivityBadge({
  code,
  variant = "default",
  size = "default",
  showDescription = false,
  showTooltip = true,
  className
}: ProfessionalActivityBadgeProps) {
  const activity = PROFESSIONAL_ACTIVITIES[code];
  const IconComponent = activity.icon;
  
  if (!activity) {
    return (
      <Badge variant="secondary" className={className}>
        {code}
      </Badge>
    );
  }

  const badgeContent = (
    <Badge 
      variant={variant}
      className={cn(
        colorVariants[activity.color],
        "flex items-center gap-1.5 font-medium",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "lg" && "text-sm px-3 py-1.5", 
        className
      )}
    >
      <IconComponent className={cn(
        size === "sm" && "h-3 w-3",
        size === "default" && "h-4 w-4",  
        size === "lg" && "h-5 w-5"
      )} />
      <span>
        {code} {showDescription && `- ${activity.shortTitle}`}
      </span>
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs p-4 bg-white border shadow-lg"
          side="top"
          align="start"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-gray-700" />
              <div>
                <h4 className="font-semibold text-gray-900">{code} - {activity.title}</h4>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-sm text-gray-700 mb-2">{activity.detailedDescription}</p>
            </div>
            
            <div className="border-t pt-3">
              <h5 className="text-xs font-medium text-gray-900 mb-1">Examples:</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                {activity.examples.map((example, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Utility component for showing all PA activities in a grid
export function ProfessionalActivitiesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(PROFESSIONAL_ACTIVITIES).map(([code, activity]) => {
        const IconComponent = activity.icon;
        return (
          <div key={code} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                colorVariants[activity.color]
              )}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {code} - {activity.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{activity.detailedDescription}</p>
                <div className="space-y-1">
                  {activity.examples.slice(0, 2).map((example, index) => (
                    <p key={index} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="text-gray-400">•</span>
                      {example}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to get PA activity info
export function getProfessionalActivity(code: ProfessionalActivityCode) {
  return PROFESSIONAL_ACTIVITIES[code];
}